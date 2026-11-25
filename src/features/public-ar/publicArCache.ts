import { publicArTargets, type PublicArManifest, type PublicArTarget } from "./publicManifest";

const CACHE_DB = "ar-photo-public-viewer";
const CACHE_STORE = "projects";
const ASSETS = "assets";
const METADATA = "assetMetadata";
const CACHE_VERSION = 3;
export const PUBLIC_AR_DISK_CACHE_BYTES = 1024 * 1024 * 1024;
const MEMORY_BYTES = 64 * 1024 * 1024;
const memoryAssets = new Map<string, Blob>();
let lastProject: CachedPublicArProject | undefined;
let writes: Promise<unknown> = Promise.resolve();

type AssetMetadata = { key: string; bytes: number; lastUsed: number };
export type CachedPublicArProject = {
  version: 2 | 3;
  publicSlug: string;
  fingerprint: string;
  savedAt: string;
  recognitionFingerprint?: string;
  targets: { trackingAsset: Blob; video?: Blob; poster?: Blob }[];
};
export type MaterializedPublicArProject = { manifest: PublicArManifest; dispose(): void };

export function refreshedPlaybackTarget(manifest: PublicArManifest, original: PublicArTarget) {
  // target-N is an order, not a durable identity: deleting another photograph
  // can renumber it. Never attach that other photograph's video to this anchor.
  return publicArTargets(manifest).find(
    (target) =>
      stableAssetPath(target.assets.trackingAssetUrl) === stableAssetPath(original.assets.trackingAssetUrl) &&
      target.marker.width === original.marker.width &&
      target.marker.height === original.marker.height &&
      JSON.stringify(target.videoViewport ?? null) === JSON.stringify(original.videoViewport ?? null),
  );
}

export function publicArAssetFingerprint(manifest: PublicArManifest) {
  return [
    manifest.version,
    ...publicArTargets(manifest).flatMap((target) => [
      target.targetId,
      target.marker.width,
      target.marker.height,
      stableAssetPath(target.assets.posterUrl),
      stableAssetPath(target.assets.videoUrl),
      stableAssetPath(target.assets.trackingAssetUrl),
    ]),
  ].join("|");
}

function recognitionFingerprint(manifest: PublicArManifest) {
  return publicArTargets(manifest)
    .map((target) =>
      [
        target.targetId,
        target.marker.width,
        target.marker.height,
        stableAssetPath(target.assets.trackingAssetUrl),
      ].join("|"),
    )
    .join("|");
}

export async function loadCachedPublicArProject(
  publicSlug: string,
  manifest: PublicArManifest,
): Promise<CachedPublicArProject | null> {
  const cached =
    lastProject?.publicSlug === publicSlug
      ? lastProject
      : await readValue<CachedPublicArProject>(CACHE_STORE, publicSlug);
  if (
    !cached ||
    ![2, 3].includes(cached.version) ||
    (cached.version === 3
      ? cached.recognitionFingerprint !== recognitionFingerprint(manifest)
      : cached.fingerprint !== publicArAssetFingerprint(manifest)) ||
    !Array.isArray(cached.targets) ||
    cached.targets.length !== publicArTargets(manifest).length ||
    cached.targets.some((target) => !isUsableBlob(target.trackingAsset))
  )
    return null;
  lastProject = cached;
  return cached;
}

// Bootstrap recognition only. Video and posters never block opening the camera.
export async function cachePublicArProject(
  publicSlug: string,
  manifest: PublicArManifest,
  onStep: (step: 1 | 2 | 3 | 4) => void,
  signal?: AbortSignal,
): Promise<CachedPublicArProject> {
  onStep(1);
  const targets = publicArTargets(manifest);
  const assets: Blob[] = Array(targets.length);
  const pending = new AbortController();
  const abort = () => pending.abort(signal?.reason);
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) abort();
  let cursor = 0,
    completed = 0,
    totalBytes = 0;
  try {
    await Promise.all(
      Array.from({ length: Math.min(3, targets.length) }, async () => {
        while (cursor < targets.length) {
          const index = cursor++;
          pending.signal.throwIfAborted();
          assets[index] = await cachedAsset(targets[index].assets.trackingAssetUrl, 10 * 1024 * 1024, pending.signal);
          totalBytes += assets[index].size;
          if (totalBytes > 64 * 1024 * 1024)
            throw new DOMException("Album recognition data exceeds the device budget", "QuotaExceededError");
          completed++;
          onStep(Math.min(3, 1 + Math.floor((completed / targets.length) * 2)) as 1 | 2 | 3);
        }
      }),
    );
  } catch (error) {
    pending.abort(error);
    throw error;
  } finally {
    signal?.removeEventListener("abort", abort);
  }
  const record: CachedPublicArProject = {
    version: 3,
    publicSlug,
    fingerprint: publicArAssetFingerprint(manifest),
    savedAt: new Date().toISOString(),
    recognitionFingerprint: recognitionFingerprint(manifest),
    targets: assets.map((trackingAsset) => ({ trackingAsset })),
  };
  signal?.throwIfAborted();
  const previousProject = lastProject?.publicSlug;
  lastProject = record;
  await writeValues([CACHE_STORE], (tx) => {
    const store = tx.objectStore(CACHE_STORE);
    store.put(record, publicSlug);
    const keys = store.getAllKeys();
    keys.onsuccess = () =>
      keys.result.forEach((key) => {
        if (key !== publicSlug && key !== previousProject) store.delete(key);
      });
  }).catch(() => undefined);
  onStep(4);
  return record;
}

export async function loadPublicArVideo(
  url: string,
  signal?: AbortSignal,
  legacyBlob?: Blob,
  onCacheUnavailable?: () => void,
) {
  signal?.throwIfAborted();
  if (legacyBlob && isUsableBlob(legacyBlob)) {
    if (!(await saveAsset(stableAssetPath(url), legacyBlob))) onCacheUnavailable?.();
    signal?.throwIfAborted();
    return legacyBlob;
  }
  return cachedAsset(url, 500 * 1024 * 1024, signal, onCacheUnavailable);
}

export function materializeCachedPublicArProject(
  manifest: PublicArManifest,
  cached: CachedPublicArProject,
): MaterializedPublicArProject {
  const urls = cached.targets.map((target) => URL.createObjectURL(target.trackingAsset));
  const targets = publicArTargets(manifest).map((target, index) => ({
    ...target,
    assets: { ...target.assets, trackingAssetUrl: urls[index] },
  }));
  return {
    manifest: { ...manifest, assets: targets[0].assets, ...(manifest.version === 2 ? { targets } : {}) },
    dispose() {
      urls.forEach((url) => URL.revokeObjectURL(url));
    },
  };
}

async function cachedAsset(url: string, maxBytes: number, signal?: AbortSignal, onCacheUnavailable?: () => void) {
  const key = stableAssetPath(url);
  const cached = memoryAssets.get(key) ?? (await readValue<Blob>(ASSETS, key));
  signal?.throwIfAborted();
  if (cached && isUsableBlob(cached) && cached.size <= maxBytes) {
    remember(key, cached);
    const touch = writes
      .catch(() => undefined)
      .then(async () => {
        const metadata = await readValue<AssetMetadata>(METADATA, key);
        if (metadata)
          await writeValues([METADATA], (tx) => tx.objectStore(METADATA).put({ ...metadata, lastUsed: Date.now() }));
      });
    writes = touch;
    void touch.catch(() => undefined);
    return cached;
  }
  const response = await fetch(url, { cache: "no-store", credentials: "omit", signal });
  if (!response.ok)
    throw Object.assign(new DOMException("AR asset unavailable", "NetworkError"), { status: response.status });
  if (Number(response.headers.get("content-length")) > maxBytes)
    throw new DOMException("AR asset is too large", "QuotaExceededError");
  const reader = response.body?.getReader();
  // Stream through a bounded native Blob builder rather than retaining every
  // downloaded chunk in a JavaScript array alongside the completed video.
  let bytes = 0;
  const blob = reader
    ? await new Response(
        new ReadableStream<Uint8Array>({
          async pull(controller) {
            try {
              signal?.throwIfAborted();
              const result = await reader.read();
              if (result.done) {
                controller.close();
                return;
              }
              bytes += result.value.byteLength;
              if (bytes > maxBytes) throw new DOMException("AR asset is too large", "QuotaExceededError");
              controller.enqueue(result.value);
            } catch (error) {
              await reader.cancel().catch(() => undefined);
              controller.error(error);
            }
          },
          cancel() {
            return reader.cancel();
          },
        }),
        { headers: { "content-type": response.headers.get("content-type") ?? "application/octet-stream" } },
      ).blob()
    : await response.blob();
  signal?.throwIfAborted();
  if (!isUsableBlob(blob) || blob.size > maxBytes) throw new DOMException("AR asset is invalid", "DataError");
  if (!(await saveAsset(key, blob))) onCacheUnavailable?.();
  signal?.throwIfAborted();
  return blob;
}

function remember(key: string, blob: Blob) {
  memoryAssets.delete(key);
  memoryAssets.set(key, blob);
  let bytes = [...memoryAssets.values()].reduce((sum, value) => sum + value.size, 0);
  for (const [oldKey, oldBlob] of memoryAssets) {
    if (memoryAssets.size <= 2 && bytes <= MEMORY_BYTES) break;
    memoryAssets.delete(oldKey);
    bytes -= oldBlob.size;
  }
}

async function saveAsset(key: string, blob: Blob) {
  remember(key, blob);
  const job = writes
    .catch(() => undefined)
    .then(async () => {
      const metadata = (await readAllMetadata()).sort((a, b) => a.lastUsed - b.lastUsed);
      let bytes = metadata.filter((m) => m.key !== key).reduce((sum, m) => sum + m.bytes, 0) + blob.size;
      const victims: string[] = [];
      for (const item of metadata) {
        if (bytes <= PUBLIC_AR_DISK_CACHE_BYTES) break;
        if (item.key !== key) {
          victims.push(item.key);
          bytes -= item.bytes;
        }
      }
      const put = (remove: string[]) =>
        writeValues([ASSETS, METADATA], (tx) => {
          for (const victim of remove) {
            tx.objectStore(ASSETS).delete(victim);
            tx.objectStore(METADATA).delete(victim);
          }
          tx.objectStore(ASSETS).put(blob, key);
          tx.objectStore(METADATA).put({ key, bytes: blob.size, lastUsed: Date.now() } satisfies AssetMetadata);
        });
      try {
        await put(victims);
        return true;
      } catch (error) {
        if (!(error instanceof DOMException) || error.name !== "QuotaExceededError") return false;
        // Browser quota can be lower than our budget. Evict only this app's oldest
        // assets, in a committed transaction, before one bounded retry.
        let freed = 0;
        const remove = metadata
          .filter((m) => m.key !== key)
          .filter((m) => {
            if (freed >= blob.size) return false;
            freed += m.bytes;
            return true;
          })
          .map((m) => m.key);
        await writeValues([ASSETS, METADATA], (tx) => {
          remove.forEach((victim) => {
            tx.objectStore(ASSETS).delete(victim);
            tx.objectStore(METADATA).delete(victim);
          });
        }).catch(() => undefined);
        try {
          await put([]);
          return true;
        } catch {
          return false;
        }
      }
    });
  writes = job;
  return job;
}

export function stableAssetPath(value: string) {
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
async function openCacheDb() {
  if (typeof indexedDB === "undefined") throw new DOMException("Device cache unavailable", "NotSupportedError");
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(CACHE_DB, CACHE_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CACHE_STORE)) db.createObjectStore(CACHE_STORE);
      if (!db.objectStoreNames.contains(ASSETS)) db.createObjectStore(ASSETS);
      if (!db.objectStoreNames.contains(METADATA)) db.createObjectStore(METADATA, { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new DOMException("Device cache busy", "InvalidStateError"));
  });
}
async function readValue<T>(store: string, key: string): Promise<T | undefined> {
  try {
    const db = await openCacheDb();
    try {
      return await new Promise<T | undefined>((resolve, reject) => {
        const request = db.transaction(store, "readonly").objectStore(store).get(key);
        request.onsuccess = () => resolve(request.result as T | undefined);
        request.onerror = () => reject(request.error);
      });
    } finally {
      db.close();
    }
  } catch {
    return undefined;
  }
}
async function readAllMetadata(): Promise<AssetMetadata[]> {
  try {
    const db = await openCacheDb();
    try {
      return await new Promise<AssetMetadata[]>((resolve, reject) => {
        const request = db.transaction(METADATA, "readonly").objectStore(METADATA).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } finally {
      db.close();
    }
  } catch {
    return [];
  }
}
async function writeValues(stores: string[], operation: (tx: IDBTransaction) => void) {
  const db = await openCacheDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(stores, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error ?? new DOMException("Device cache write aborted", "AbortError"));
      tx.onerror = () => reject(tx.error);
      operation(tx);
    });
  } finally {
    db.close();
  }
}
