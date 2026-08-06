import type { PublicArManifest } from "./publicManifest";

const CACHE_DB = "ar-photo-public-viewer";
const CACHE_STORE = "projects";
const CACHE_VERSION = 1;
const memoryCache = new Map<string, CachedPublicArProject>();

export type CachedPublicArProject = {
  version: 1;
  publicSlug: string;
  fingerprint: string;
  savedAt: string;
  poster: Blob;
  video: Blob;
  trackingAsset: Blob;
};

export type MaterializedPublicArProject = {
  manifest: PublicArManifest;
  dispose(): void;
};

export function publicArAssetFingerprint(manifest: PublicArManifest) {
  const assetPaths = [
    stableAssetPath(manifest.assets.posterUrl),
    stableAssetPath(manifest.assets.videoUrl),
    stableAssetPath(manifest.assets.trackingAssetUrl),
  ];
  return [manifest.version, manifest.marker.width, manifest.marker.height, ...assetPaths].join("|");
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
    if (!cached || cached.fingerprint !== publicArAssetFingerprint(manifest)) return null;
    if (!isUsableBlob(cached.poster) || !isUsableBlob(cached.video) || !isUsableBlob(cached.trackingAsset)) {
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
  onStep(1);
  const poster = await fetchAsset(manifest.assets.posterUrl, signal, 30 * 1024 * 1024);
  onStep(2);
  const video = await fetchAsset(manifest.assets.videoUrl, signal, 500 * 1024 * 1024);
  onStep(3);
  const trackingAsset = await fetchAsset(manifest.assets.trackingAssetUrl, signal, 10 * 1024 * 1024);
  onStep(4);

  const record: CachedPublicArProject = {
    version: CACHE_VERSION,
    publicSlug,
    fingerprint: publicArAssetFingerprint(manifest),
    savedAt: new Date().toISOString(),
    poster,
    video,
    trackingAsset,
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
  const posterUrl = URL.createObjectURL(cached.poster);
  const videoUrl = URL.createObjectURL(cached.video);
  const trackingAssetUrl = URL.createObjectURL(cached.trackingAsset);
  return {
    manifest: {
      ...manifest,
      assets: { posterUrl, videoUrl, trackingAssetUrl },
      signedUrlsExpireAt: new Date(Date.now() + 24 * 60 * 60 * 1_000).toISOString(),
    },
    dispose() {
      URL.revokeObjectURL(posterUrl);
      URL.revokeObjectURL(videoUrl);
      URL.revokeObjectURL(trackingAssetUrl);
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
