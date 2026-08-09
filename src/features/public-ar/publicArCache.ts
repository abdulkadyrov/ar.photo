import { publicArTargets, type PublicArManifest } from "./publicManifest";

const CACHE_DB = "ar-photo-public-viewer";
const CACHE_STORE = "projects";
const CACHE_VERSION = 2;
const memoryCache = new Map<string, CachedPublicArProject>();

export type CachedPublicArProject = {
  version: 2;
  publicSlug: string;
  fingerprint: string;
  savedAt: string;
  targets: CachedPublicArTarget[];
};

export type CachedPublicArTarget = {
  poster: Blob;
  video: Blob;
  trackingAsset: Blob;
};

export type MaterializedPublicArProject = {
  manifest: PublicArManifest;
  dispose(): void;
};

export function publicArAssetFingerprint(manifest: PublicArManifest) {
  const targetParts = publicArTargets(manifest).flatMap((target) => [
    target.targetId,
    target.marker.width,
    target.marker.height,
    stableAssetPath(target.assets.posterUrl),
    stableAssetPath(target.assets.videoUrl),
    stableAssetPath(target.assets.trackingAssetUrl),
  ]);
  return [manifest.version, ...targetParts].join("|");
}

export async function loadCachedPublicArProject(
  publicSlug: string,
  manifest: PublicArManifest,
): Promise<CachedPublicArProject | null> {
  const inMemory = memoryCache.get(publicSlug);
  if (inMemory?.fingerprint === publicArAssetFingerprint(manifest)) return inMemory;
  if (typeof indexedDB === "undefined") return null;
  try {
    const cached = await readRecord(publicSlug);
    if (!cached || cached.version !== CACHE_VERSION || cached.fingerprint !== publicArAssetFingerprint(manifest))
      return null;
    if (
      !Array.isArray(cached.targets) ||
      cached.targets.length !== publicArTargets(manifest).length ||
      cached.targets.some(
        (target) => !isUsableBlob(target.poster) || !isUsableBlob(target.video) || !isUsableBlob(target.trackingAsset),
      )
    ) {
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

export async function cachePublicArProject(
  publicSlug: string,
  manifest: PublicArManifest,
  onStep: (step: 1 | 2 | 3 | 4) => void,
  signal?: AbortSignal,
): Promise<CachedPublicArProject> {
  const targets = publicArTargets(manifest);
  onStep(1);
  const posters = await Promise.all(
    targets.map((target) => fetchAsset(target.assets.posterUrl, signal, 30 * 1024 * 1024)),
  );
  onStep(2);
  const videos = await Promise.all(
    targets.map((target) => fetchAsset(target.assets.videoUrl, signal, 500 * 1024 * 1024)),
  );
  onStep(3);
  const trackingAssets = await Promise.all(
    targets.map((target) => fetchAsset(target.assets.trackingAssetUrl, signal, 10 * 1024 * 1024)),
  );
  onStep(4);

  const record: CachedPublicArProject = {
    version: CACHE_VERSION,
    publicSlug,
    fingerprint: publicArAssetFingerprint(manifest),
    savedAt: new Date().toISOString(),
    targets: targets.map((_, index) => ({
      poster: posters[index],
      video: videos[index],
      trackingAsset: trackingAssets[index],
    })),
  };
  memoryCache.set(publicSlug, record);
  if (typeof indexedDB !== "undefined") {
    try {
      await writeRecord(record);
    } catch {
      // Private browsing and storage pressure can reject IndexedDB writes.
      // The in-memory record still lets the current AR session continue.
    }
  }
  return record;
}

export function materializeCachedPublicArProject(
  manifest: PublicArManifest,
  cached: CachedPublicArProject,
): MaterializedPublicArProject {
  const objectUrls = cached.targets.map((target) => ({
    posterUrl: URL.createObjectURL(target.poster),
    videoUrl: URL.createObjectURL(target.video),
    trackingAssetUrl: URL.createObjectURL(target.trackingAsset),
  }));
  const targets = publicArTargets(manifest).map((target, index) => ({ ...target, assets: objectUrls[index] }));
  const primary = targets[0];
  return {
    manifest: {
      ...manifest,
      marker: primary.marker,
      behavior: primary.behavior,
      fallbackEnabled: primary.fallbackEnabled,
      assets: primary.assets,
      ...(manifest.version === 2 ? { targets } : {}),
      signedUrlsExpireAt: new Date(Date.now() + 24 * 60 * 60 * 1_000).toISOString(),
    },
    dispose() {
      for (const urls of objectUrls) {
        URL.revokeObjectURL(urls.posterUrl);
        URL.revokeObjectURL(urls.videoUrl);
        URL.revokeObjectURL(urls.trackingAssetUrl);
      }
    },
  };
}

async function fetchAsset(url: string, signal: AbortSignal | undefined, maxBytes: number) {
  const response = await fetch(url, { cache: "no-store", credentials: "omit", signal });
  if (!response.ok) throw new DOMException("AR asset unavailable", "NetworkError");
  const declaredSize = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredSize) && declaredSize > maxBytes) {
    throw new DOMException("AR asset is too large", "QuotaExceededError");
  }
  const blob = await response.blob();
  if (!isUsableBlob(blob) || blob.size > maxBytes) {
    throw new DOMException("AR asset is invalid", "DataError");
  }
  return blob;
}

function stableAssetPath(value: string) {
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch {
    return value.split("?")[0] ?? value;
  }
}

function isUsableBlob(value: unknown): value is Blob {
  return Boolean(
    value &&
    typeof value === "object" &&
    typeof (value as Blob).size === "number" &&
    (value as Blob).size > 0 &&
    typeof (value as Blob).slice === "function",
  );
}

function openCacheDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(CACHE_DB, CACHE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(CACHE_STORE)) database.createObjectStore(CACHE_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open AR cache"));
  });
}

async function readRecord(publicSlug: string) {
  const database = await openCacheDb();
  try {
    return await new Promise<CachedPublicArProject | undefined>((resolve, reject) => {
      const request = database.transaction(CACHE_STORE, "readonly").objectStore(CACHE_STORE).get(publicSlug);
      request.onsuccess = () => resolve(request.result as CachedPublicArProject | undefined);
      request.onerror = () => reject(request.error ?? new Error("Unable to read AR cache"));
    });
  } finally {
    database.close();
  }
}

async function writeRecord(record: CachedPublicArProject) {
  const database = await openCacheDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(CACHE_STORE, "readwrite");
      transaction.objectStore(CACHE_STORE).put(record, record.publicSlug);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Unable to write AR cache"));
      transaction.onabort = () => reject(transaction.error ?? new Error("AR cache write aborted"));
    });
  } finally {
    database.close();
  }
}
