export type StaleUpload = {
  id: string;
  storage_bucket: string;
  storage_path: string;
};

export function groupByBucket(sessions: StaleUpload[]) {
  const batches = new Map<string, StaleUpload[]>();
  for (const session of sessions) {
    const batch = batches.get(session.storage_bucket) ?? [];
    batch.push(session);
    batches.set(session.storage_bucket, batch);
  }
  return batches;
}

export function secureEqual(provided: string, expected: string) {
  const left = new TextEncoder().encode(provided);
  const right = new TextEncoder().encode(expected);
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}
