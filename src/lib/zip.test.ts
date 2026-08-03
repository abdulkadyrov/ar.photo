import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import type { StoreSnapshot } from "../types";
import { createProjectExportZip, parseImportZip } from "./zip";

const timestamp = "2026-08-03T06:00:00.000Z";

function snapshot(): StoreSnapshot {
  return {
    projects: [
      { id: "project_one", name: "Выпускной", createdAt: timestamp },
      { id: "project_other", name: "Чужой локальный проект", createdAt: timestamp },
    ],
    classes: [
      { id: "class_one", projectId: "project_one", name: "11А" },
      { id: "class_other", projectId: "project_other", name: "9Б" },
    ],
    students: [
      { id: "student_one", classId: "class_one", firstName: "Иван", lastName: "Иванов" },
      { id: "student_other", classId: "class_other", firstName: "Анна", lastName: "Смирнова" },
    ],
    livePhotos: [
      {
        id: "live_one",
        studentId: "student_one",
        imageId: "image_one",
        videoId: "video_one",
        qrCode: "https://example.test/ar/public_one",
        createdAt: timestamp,
      },
    ],
    media: [
      { id: "image_one", type: "image", fileName: "marker.jpg", blobId: "blob_image_one" },
      { id: "video_one", type: "video", fileName: "clip.mp4", blobId: "blob_video_one" },
      { id: "image_other", type: "image", fileName: "other.jpg", blobId: "blob_image_other" },
    ],
    mediaBlobs: [
      { id: "blob_image_one", blob: new Blob(["safe-image"]) },
      { id: "blob_video_one", blob: new Blob(["safe-video"]) },
      { id: "blob_image_other", blob: new Blob(["must-not-export"]) },
    ],
  };
}

async function asFile(blob: Blob, name = "project.zip") {
  return new File([await blob.arrayBuffer()], name, { type: "application/zip" });
}

describe("secure ZIP import/export", () => {
  it("exports only the selected project and verifies every media checksum", async () => {
    const exported = await createProjectExportZip(snapshot(), "project_one");
    const imported = await parseImportZip(await asFile(exported));

    expect(imported.data.projects.map((item) => item.id)).toEqual(["project_one"]);
    expect(imported.data.classes.map((item) => item.id)).toEqual(["class_one"]);
    expect(imported.data.media.map((item) => item.id)).toEqual(["image_one", "video_one"]);
    expect(imported.blobs).toHaveLength(2);
    expect(imported.summary).toMatchObject({ projects: 1, classes: 1, students: 1, livePhotos: 1, media: 2 });
  });

  it("rejects media tampering before returning import data", async () => {
    const exported = await createProjectExportZip(snapshot(), "project_one");
    const zip = await JSZip.loadAsync(exported);
    zip.file("media/blob_image_one", "tampered");
    const tampered = await zip.generateAsync({ type: "blob" });

    await expect(parseImportZip(await asFile(tampered))).rejects.toThrow(/Checksum|Размер/);
  });

  it("rejects traversal paths even when JSZip sanitizes their visible name", async () => {
    const zip = new JSZip();
    zip.file("../outside.txt", "unsafe");
    const file = await asFile(await zip.generateAsync({ type: "blob" }));

    await expect(parseImportZip(file)).rejects.toThrow(/небезопасный|Недопустимый|allowlist/);
  });

  it("rejects legacy unversioned manifests", async () => {
    const zip = new JSZip();
    zip.file("school-ar-photo.json", JSON.stringify(snapshot()));
    const file = await asFile(await zip.generateAsync({ type: "blob" }));

    await expect(parseImportZip(file)).rejects.toThrow();
  });
});
