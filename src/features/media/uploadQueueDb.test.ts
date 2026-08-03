import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import type { PreparedMedia } from "../../entities/media/model";
import { listPreparedUploads, persistPreparedUpload, removePreparedUpload } from "./uploadQueueDb";

const prepared: PreparedMedia = {
  kind: "marker",
  file: new File(["optimized"], "marker.optimized.webp", { type: "image/webp", lastModified: 123 }),
  sha256: "a".repeat(64),
  metadata: {
    width: 1200,
    height: 800,
    exifStripped: true,
    optimization: {
      strategy: "adaptive-image",
      originalWidth: 2400,
      originalHeight: 1600,
      originalBytes: 18,
      uploadBytes: 9,
      savedBytes: 9,
      reductionPercent: 50,
      optimized: true,
    },
  },
};

describe("IndexedDB upload queue", () => {
  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase("ar-photo-upload-queue");
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
      request.onblocked = () => resolve();
    });
  });

  it("restores a prepared File for only its owner and removes it after upload", async () => {
    await persistPreparedUpload({
      id: "queue-1",
      ownerId: "owner-1",
      accountId: "account-1",
      projectId: "project-1",
      groupId: "group-1",
      requestId: "request-1",
      prepared,
      createdAt: 1,
    });

    expect(await listPreparedUploads("owner-2")).toEqual([]);
    const restored = await listPreparedUploads("owner-1");
    expect(restored).toHaveLength(1);
    expect(restored[0].prepared.file).toBeInstanceOf(File);
    expect(restored[0].prepared.file.name).toBe("marker.optimized.webp");
    expect(restored[0].prepared.metadata.optimization.savedBytes).toBe(9);

    await removePreparedUpload("queue-1");
    expect(await listPreparedUploads("owner-1")).toEqual([]);
  });
});
