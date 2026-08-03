import { describe, expect, it } from "vitest";
import { groupByBucket, secureEqual, type StaleUpload } from "./cleanup";

describe("stale upload cleanup helpers", () => {
  it("requires an exact scheduler secret", () => {
    const secret = "stage-four-cleanup-secret-32-bytes";
    expect(secureEqual(secret, secret)).toBe(true);
    expect(secureEqual(`${secret}x`, secret)).toBe(false);
    expect(secureEqual("", secret)).toBe(false);
  });

  it("batches only paths from the same private bucket", () => {
    const sessions: StaleUpload[] = [
      { id: "1", storage_bucket: "markers-private", storage_path: "accounts/1/marker.png" },
      { id: "2", storage_bucket: "videos-private", storage_path: "accounts/1/video.mp4" },
      { id: "3", storage_bucket: "markers-private", storage_path: "accounts/1/marker-2.png" },
    ];

    const batches = groupByBucket(sessions);
    expect(batches.get("markers-private")?.map((session) => session.id)).toEqual(["1", "3"]);
    expect(batches.get("videos-private")?.map((session) => session.id)).toEqual(["2"]);
  });
});
