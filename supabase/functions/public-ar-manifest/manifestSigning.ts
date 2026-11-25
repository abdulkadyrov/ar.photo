import type { PublicManifestSource, SignedManifestAssets } from "./manifest.ts";

type Signer = {
  from(bucket: string): {
    createSignedUrls(
      paths: string[],
      ttl: number,
    ): Promise<{
      data: { error: string | null; path: string | null; signedUrl: string | null }[] | null;
      error: unknown;
    }>;
  };
};

// One storage request per bucket instead of three requests per photograph.
// Authorization remains in the authoritative publication RPC before this call.
export async function signManifestAssets(
  storage: Signer,
  sources: PublicManifestSource[],
  ttl: number,
): Promise<SignedManifestAssets[]> {
  if (!sources.length || sources.length > 50) throw new Error("Invalid album size");
  const groups = new Map<string, Set<string>>();
  for (const source of sources)
    for (const [bucket, path] of [
      [source.tracking_bucket, source.tracking_path],
      [source.video_bucket, source.video_path],
      [source.poster_bucket, source.poster_path],
    ]) {
      if (!groups.has(bucket)) groups.set(bucket, new Set());
      groups.get(bucket)!.add(path);
    }
  const urls = new Map<string, string>();
  await Promise.all(
    [...groups].map(async ([bucket, paths]) => {
      const result = await storage.from(bucket).createSignedUrls([...paths], ttl);
      if (result.error || !result.data) throw new Error("Album assets unavailable");
      for (const entry of result.data) {
        if (entry.error || !entry.path || !entry.signedUrl || !paths.has(entry.path))
          throw new Error("Album asset unavailable");
        urls.set(`${bucket}\0${entry.path}`, entry.signedUrl);
      }
    }),
  );
  const get = (bucket: string, path: string) => {
    const url = urls.get(`${bucket}\0${path}`);
    if (!url) throw new Error("Missing album asset");
    return url;
  };
  return sources.map((source) => ({
    trackingAssetUrl: get(source.tracking_bucket, source.tracking_path),
    videoUrl: get(source.video_bucket, source.video_path),
    posterUrl: get(source.poster_bucket, source.poster_path),
  }));
}
