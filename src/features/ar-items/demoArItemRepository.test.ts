import { describe, expect, it, vi } from "vitest";
import type { MediaAsset } from "../../entities/ar-item/model";
import type { MediaRepository } from "../media/mediaRepository";
import { createDemoArItemRepository, type DemoArItemStore } from "./demoArItemRepository";

const accountId = "20000000-0000-4000-8000-000000000001";
const projectId = "50000000-0000-4000-8000-000000000001";
const groupId = "60000000-0000-4000-8000-000000000001";

const asset = (id: string, kind: "marker" | "video", version = 1): MediaAsset => ({
  id,
  account_id: accountId,
  project_id: projectId,
  group_id: groupId,
  ar_item_id: null,
  kind,
  storage_bucket: kind === "marker" ? "markers-private" : "videos-private",
  storage_path: `accounts/${accountId}/projects/${projectId}/groups/${groupId}/${id}`,
  original_file_name: `${kind}.${kind === "marker" ? "jpg" : "mp4"}`,
  mime_type: kind === "marker" ? "image/jpeg" : "video/mp4",
  size_bytes: 1024,
  sha256: "a".repeat(64),
  version,
  metadata: kind === "marker" ? { width: 1200, height: 800 } : { durationSeconds: 10 },
  created_by: "10000000-0000-4000-8000-000000000010",
  created_at: "2026-08-03T00:00:00.000Z",
  deleted_at: null,
});

const marker = asset("83000000-0000-4000-8000-000000000001", "marker");
const replacementMarker = asset("83000000-0000-4000-8000-000000000003", "marker", 2);
const video = asset("83000000-0000-4000-8000-000000000002", "video");

const createFixture = () => {
  let state: ReturnType<DemoArItemStore["read"]> = { items: [], jobs: [], qrCodes: [] };
  let timestamp = Date.parse("2026-08-03T00:00:00.000Z");
  const store: DemoArItemStore = {
    read: () => structuredClone(state),
    write: (next) => {
      state = structuredClone(next);
    },
  };
  const mediaRepository: MediaRepository = {
    upload: vi.fn(() => Promise.reject(new Error("not used"))),
    listAssets: vi.fn(() => Promise.resolve([marker, replacementMarker, video])),
    getAssetUrl: vi.fn(() => Promise.resolve("blob:test")),
  };
  return {
    repository: createDemoArItemRepository(store, mediaRepository, () => timestamp),
    advance: (milliseconds: number) => {
      timestamp += milliseconds;
    },
  };
};

const draftInput = {
  projectId,
  groupId,
  title: "Портрет Алексея",
  description: "Видео для выпускного альбома",
  requestId: "84000000-0000-4000-8000-000000000001",
};

const prepareInput = {
  markerAssetId: marker.id,
  videoAssetId: video.id,
  autoplay: true,
  loopVideo: true,
  markerLostBehavior: "pause_hide" as const,
  audioDefault: "muted" as const,
  fallbackEnabled: true,
};

describe("demo AR item repository", () => {
  it("creates an idempotent draft", async () => {
    const { repository } = createFixture();

    const first = await repository.createDraft(accountId, draftInput);
    const duplicate = await repository.createDraft(accountId, draftInput);

    expect(duplicate.id).toBe(first.id);
    await expect(repository.listItems(accountId, projectId, groupId)).resolves.toHaveLength(1);
  });

  it("updates draft copy without creating another item", async () => {
    const { repository } = createFixture();
    const draft = await repository.createDraft(accountId, draftInput);

    await expect(
      repository.updateDraft(accountId, draft.id, "Новый заголовок", "Новое описание"),
    ).resolves.toMatchObject({
      id: draft.id,
      title: "Новый заголовок",
      description: "Новое описание",
    });
    await expect(repository.listItems(accountId, projectId, groupId)).resolves.toHaveLength(1);
  });

  it("runs one deduplicated four-job processing revision to ready", async () => {
    const { repository, advance } = createFixture();
    const draft = await repository.createDraft(accountId, draftInput);

    await repository.prepare(accountId, draft.id, prepareInput);
    const initialJobs = await repository.listJobs(accountId, draft.id);
    expect(initialJobs).toHaveLength(4);
    expect(initialJobs.filter((job) => job.status === "running")).toHaveLength(2);

    advance(1_000);
    await expect(repository.getItem(accountId, draft.id)).resolves.toMatchObject({
      status: "ready",
      tracking_status: "ready",
      marker_quality_score: 86,
    });
    expect((await repository.listJobs(accountId, draft.id)).every((job) => job.status === "succeeded")).toBe(true);

    await repository.prepare(accountId, draft.id, prepareInput);
    expect(await repository.listJobs(accountId, draft.id)).toHaveLength(4);
  });

  it("creates a new revision only when media changes", async () => {
    const { repository, advance } = createFixture();
    const draft = await repository.createDraft(accountId, draftInput);
    await repository.prepare(accountId, draft.id, prepareInput);
    advance(1_000);
    await repository.getItem(accountId, draft.id);

    const replacement = await repository.prepare(accountId, draft.id, {
      ...prepareInput,
      markerAssetId: replacementMarker.id,
    });

    expect(replacement.version).toBe(2);
    expect(replacement.marker_quality_score).toBeNull();
    expect(await repository.listJobs(accountId, draft.id)).toHaveLength(8);
  });

  it("requires group-scoped marker and video assets", async () => {
    const { repository } = createFixture();
    const draft = await repository.createDraft(accountId, draftInput);

    await expect(
      repository.prepare(accountId, draft.id, { ...prepareInput, videoAssetId: crypto.randomUUID() }),
    ).rejects.toMatchObject({ code: "not_found" });
  });

  it("publishes idempotently, revokes and rotates a public QR capability", async () => {
    const { repository, advance } = createFixture();
    const draft = await repository.createDraft(accountId, draftInput);
    await repository.prepare(accountId, draft.id, prepareInput);
    advance(1_000);
    await repository.getItem(accountId, draft.id);

    const published = await repository.publish(accountId, draft.id, "http://localhost:4173/ar.photo/");
    const repeated = await repository.publish(accountId, draft.id, "http://localhost:4173/ar.photo/");
    expect(repeated.id).toBe(published.id);
    expect(published.public_url).toMatch(/^http:\/\/localhost:4173\/ar\.photo\/ar\/[a-f0-9]{36}$/);
    expect(await repository.getQrCode(accountId, draft.id)).toMatchObject({ version: 1 });
    await expect(repository.getItem(accountId, draft.id)).resolves.toMatchObject({
      status: "published",
      visibility: "public",
    });

    const oldUrl = published.public_url;
    const rotated = await repository.rotatePublicSlug(accountId, draft.id, "http://localhost:4173/ar.photo/");
    expect(rotated.public_url).not.toBe(oldUrl);
    expect(rotated.version).toBe(2);

    const styled = await repository.updateQrStyle(accountId, draft.id, {
      preset: "brand",
      foreground: "#4B35D2",
      background: "#FFFFFF",
      quietZone: 4,
      logo: true,
      logoScale: 0.12,
    });
    expect(styled).toMatchObject({ version: 3, style: { preset: "brand", quietZone: 4 } });

    await repository.unpublish(accountId, draft.id);
    await expect(repository.getItem(accountId, draft.id)).resolves.toMatchObject({
      status: "ready",
      visibility: "private",
      published_at: null,
    });
    expect(await repository.getQrCode(accountId, draft.id)).not.toBeNull();
  });

  it("publishes several photo-video pairs behind the root QR", async () => {
    const { repository, advance } = createFixture();
    const root = await repository.createDraft(accountId, draftInput);
    const child = await repository.createDraft(accountId, {
      ...draftInput,
      requestId: "84000000-0000-4000-8000-000000000002",
      title: "Портрет Алексея · фото 2",
      bundleRootItemId: root.id,
    });
    expect(child.qr_bundle_id).toBe(root.qr_bundle_id);

    await repository.prepare(accountId, root.id, prepareInput);
    await repository.prepare(accountId, child.id, prepareInput);
    advance(1_000);
    await Promise.all([repository.getItem(accountId, root.id), repository.getItem(accountId, child.id)]);

    const qr = await repository.publishBundle(accountId, root.id, "http://localhost:4173/ar.photo/");
    expect(qr.ar_item_id).toBe(root.id);
    await expect(repository.getItem(accountId, child.id)).resolves.toMatchObject({ status: "published" });
    await expect(repository.getQrCode(accountId, child.id)).resolves.toBeNull();
  });
});
