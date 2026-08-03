import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MediaAsset, PreparedMedia } from "../../entities/media/model";
import { DemoMediaRepository, type DemoMediaStore } from "./demoMediaRepository";

describe("demo media repository", () => {
  let assets: MediaAsset[];
  let repository: DemoMediaRepository;

  beforeEach(() => {
    assets = [];
    const store: DemoMediaStore = {
      read: () => assets,
      write: (nextAssets) => {
        assets = nextAssets;
      },
    };
    repository = new DemoMediaRepository(store);
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:demo-media"),
    });
  });

  it("reports progress and stores an idempotent finalized asset", async () => {
    const progress: number[] = [];
    const controller = new AbortController();
    const first = await repository.upload(
      input,
      prepared,
      (value) => progress.push(value.uploadedBytes),
      controller.signal,
    );
    const repeated = await repository.upload(input, prepared, () => undefined, controller.signal);

    expect(progress.at(-1)).toBe(prepared.file.size);
    expect(first.id).toBe(repeated.id);
    expect(await repository.listAssets(input.accountId, input.projectId, input.groupId)).toHaveLength(1);
  });

  it("stops without persisting an asset when cancelled", async () => {
    const controller = new AbortController();
    const upload = repository.upload(input, prepared, () => undefined, controller.signal);
    controller.abort();

    await expect(upload).rejects.toMatchObject({ name: "AbortError" });
    expect(assets).toHaveLength(0);
  });
});

const input = {
  accountId: "20000000-0000-4000-8000-000000000001",
  projectId: "30000000-0000-4000-8000-000000000001",
  groupId: "40000000-0000-4000-8000-000000000001",
  kind: "marker" as const,
  file: new File(["marker"], "marker.png", { type: "image/png" }),
  requestId: "50000000-0000-4000-8000-000000000001",
};

const prepared: PreparedMedia = {
  kind: "marker",
  file: input.file,
  sha256: "a".repeat(64),
  metadata: {
    width: 640,
    height: 480,
    exifStripped: true,
    optimization: {
      strategy: "adaptive-image",
      originalWidth: 640,
      originalHeight: 480,
      originalBytes: 4,
      uploadBytes: 4,
      savedBytes: 0,
      reductionPercent: 0,
      optimized: false,
    },
  },
};
