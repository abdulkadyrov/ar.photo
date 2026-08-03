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

export function retentionDays(value: string | undefined) {
  const parsed = Number(value ?? "365");
  return Number.isInteger(parsed) ? Math.max(30, Math.min(730, parsed)) : 365;
}

export function batchLimit(value: string | null) {
  const parsed = Number(value ?? "5000");
  return Number.isInteger(parsed) ? Math.max(1, Math.min(10000, parsed)) : 5000;
}
