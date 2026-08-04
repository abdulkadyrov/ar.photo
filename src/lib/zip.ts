import JSZip from "jszip";
import { z } from "zod";
import type { AppData, ARClass, MediaBlob, StoreSnapshot } from "../types";
import { slugify } from "./id";

const EXPORT_VERSION = 1;
const MAX_ARCHIVE_BYTES = 128 * 1024 * 1024;
const MAX_MANIFEST_BYTES = 4 * 1024 * 1024;
const MAX_MEDIA_BYTES = 256 * 1024 * 1024;
const MAX_TOTAL_UNCOMPRESSED_BYTES = 512 * 1024 * 1024;
const MAX_MEDIA_ENTRIES = 1_000;
const idSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9_-]+$/);
const labelSchema = z
  .string()
  .min(1)
  .max(200)
  .refine((value) => value.trim() === value, "Лишние пробелы");
const fileNameSchema = z
  .string()
  .min(1)
  .max(255)
  .refine((value) => !/[\\/\0]/.test(value) && value !== "." && value !== "..", "Недопустимое имя файла");

const appDataSchema = z
  .object({
    projects: z
      .array(z.object({ id: idSchema, name: labelSchema, createdAt: z.string().datetime({ offset: true }) }).strict())
      .max(1_000),
    classes: z.array(z.object({ id: idSchema, projectId: idSchema, name: labelSchema }).strict()).max(5_000),
    students: z
      .array(z.object({ id: idSchema, classId: idSchema, firstName: labelSchema, lastName: labelSchema }).strict())
      .max(50_000),
    livePhotos: z
      .array(
        z
          .object({
            id: idSchema,
            studentId: idSchema,
            imageId: idSchema,
            videoId: idSchema,
            trackingId: idSchema.optional(),
            qrCode: z
              .string()
              .min(1)
              .max(2_048)
              .refine((value) => [...value].every((character) => character.charCodeAt(0) >= 32)),
            createdAt: z.string().datetime({ offset: true }),
          })
          .strict(),
      )
      .max(50_000),
    media: z
      .array(
        z
          .object({
            id: idSchema,
            type: z.enum(["image", "video", "tracking"]),
            fileName: fileNameSchema,
            blobId: idSchema,
          })
          .strict(),
      )
      .max(MAX_MEDIA_ENTRIES),
  })
  .strict();

const projectExportSchema = z
  .object({
    schemaVersion: z.literal(EXPORT_VERSION),
    kind: z.literal("ar-photo-project"),
    exportedAt: z.string().datetime({ offset: true }),
    data: appDataSchema,
    media: z
      .array(
        z
          .object({
            id: idSchema,
            path: z.string().min(1).max(180),
            size: z.number().int().nonnegative().max(MAX_MEDIA_BYTES),
            sha256: z.string().regex(/^[a-f0-9]{64}$/),
          })
          .strict(),
      )
      .max(MAX_MEDIA_ENTRIES),
  })
  .strict();

type ImportSummary = {
  projects: number;
  classes: number;
  students: number;
  livePhotos: number;
  media: number;
  bytes: number;
};

type SizedZipEntry = {
  name: string;
  dir: boolean;
  unsafeOriginalName?: string;
  _data?: { uncompressedSize?: number; compressedSize?: number };
  async(type: "string"): Promise<string>;
  async(type: "uint8array"): Promise<Uint8Array>;
};

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

async function qrPngBlob(qrCode: string) {
  const { toDataURL } = await import("qrcode");
  const dataUrl = await toDataURL(qrCode, { margin: 1, width: 960, color: { dark: "#111827", light: "#00000000" } });
  const response = await fetch(dataUrl);
  return response.blob();
}

function safeExportFileName(value: string, fallback: string) {
  const base =
    value
      .split(/[\\/]/)
      .pop()
      ?.replace(/[^\p{L}\p{N}._-]+/gu, "_") ?? "";
  return base && base !== "." && base !== ".." ? base.slice(0, 120) : fallback;
}

export async function exportClassZip(snapshot: StoreSnapshot, arClass: ARClass) {
  const zip = new JSZip();
  const data = dataForClass(snapshot, arClass);
  const blobById = new Map(snapshot.mediaBlobs.map((item) => [item.id, item.blob]));
  const mediaById = new Map(data.media.map((item) => [item.id, item]));

  for (const student of data.students) {
    const livePhoto = data.livePhotos.find((item) => item.studentId === student.id);
    if (!livePhoto) continue;
    const folderName = `${slugify(student.lastName)}_${slugify(student.firstName)}`;
    const folder = zip.folder(`students/${folderName}`);
    if (!folder) continue;
    const image = mediaById.get(livePhoto.imageId);
    const video = mediaById.get(livePhoto.videoId);
    const tracking = livePhoto.trackingId ? mediaById.get(livePhoto.trackingId) : undefined;
    if (image) folder.file(safeExportFileName(image.fileName, `${image.id}.jpg`), blobById.get(image.blobId) ?? "");
    if (video) folder.file(safeExportFileName(video.fileName, `${video.id}.mp4`), blobById.get(video.blobId) ?? "");
    if (tracking)
      folder.file(safeExportFileName(tracking.fileName, `${tracking.id}.mind`), blobById.get(tracking.blobId) ?? "");
    folder.file("qr.png", await qrPngBlob(livePhoto.qrCode));
    folder.file("livephoto.json", JSON.stringify({ student, livePhoto, image, video }, null, 2));
  }

  zip.file(
    "class-export.json",
    JSON.stringify(
      { schemaVersion: EXPORT_VERSION, kind: "ar-photo-class-delivery", exportedAt: new Date().toISOString(), data },
      null,
      2,
    ),
  );
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
  downloadBlob(blob, `${slugify(arClass.name)}_live_photos.zip`);
}

export async function createProjectExportZip(snapshot: StoreSnapshot, projectId: string) {
  const data = dataForProject(snapshot, projectId);
  validateAppData(data);
  const requiredBlobIds = new Set(data.media.map((item) => item.blobId));
  const blobById = new Map(
    snapshot.mediaBlobs.filter((item) => requiredBlobIds.has(item.id)).map((item) => [item.id, item.blob]),
  );
  if (blobById.size !== requiredBlobIds.size) throw new Error("Экспорт остановлен: часть media blobs отсутствует");

  const media = await Promise.all(
    data.media.map(async (item) => {
      const blob = blobById.get(item.blobId)!;
      return { id: item.blobId, path: `media/${item.blobId}`, size: blob.size, sha256: await sha256(blob) };
    }),
  );
  const manifest = projectExportSchema.parse({
    schemaVersion: EXPORT_VERSION,
    kind: "ar-photo-project",
    exportedAt: new Date().toISOString(),
    data,
    media,
  });
  const zip = new JSZip();
  zip.file("school-ar-photo.json", JSON.stringify(manifest, null, 2));
  for (const item of media) zip.file(item.path, blobById.get(item.id)!);
  return zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
}

export async function exportProjectZip(snapshot: StoreSnapshot, projectId: string) {
  downloadBlob(await createProjectExportZip(snapshot, projectId), `ar_photo_${projectId}.zip`);
}

export async function parseImportZip(
  file: File,
): Promise<{ data: AppData; blobs: MediaBlob[]; summary: ImportSummary }> {
  if (file.size > MAX_ARCHIVE_BYTES) throw new Error("ZIP превышает безопасный лимит 128 МБ");
  const zip = await JSZip.loadAsync(file, { checkCRC32: true, createFolders: false });
  const entries = Object.values(zip.files) as SizedZipEntry[];
  if (entries.length > MAX_MEDIA_ENTRIES + 2) throw new Error("ZIP содержит слишком много файлов");

  let totalUncompressed = 0;
  for (const entry of entries) {
    validateZipPath(entry);
    const size = entry._data?.uncompressedSize;
    if (!entry.dir && (!Number.isSafeInteger(size) || size! < 0))
      throw new Error(`ZIP не сообщает размер ${entry.name}`);
    totalUncompressed += size ?? 0;
    if (totalUncompressed > MAX_TOTAL_UNCOMPRESSED_BYTES)
      throw new Error("ZIP распаковывается больше безопасного лимита 512 МБ");
  }

  const manifestEntry = zip.file("school-ar-photo.json") as SizedZipEntry | null;
  if (!manifestEntry) throw new Error("ZIP не содержит school-ar-photo.json");
  if ((manifestEntry._data?.uncompressedSize ?? 0) > MAX_MANIFEST_BYTES) throw new Error("Manifest превышает 4 МБ");

  let rawManifest: unknown;
  try {
    rawManifest = JSON.parse(await manifestEntry.async("string"));
  } catch {
    throw new Error("Manifest содержит некорректный JSON");
  }
  const manifest = projectExportSchema.parse(rawManifest);
  validateAppData(manifest.data);
  validateManifestMedia(manifest);

  const allowedPaths = new Set(["school-ar-photo.json", "media/", ...manifest.media.map((item) => item.path)]);
  const unknownEntry = entries.find((entry) => !allowedPaths.has(entry.name));
  if (unknownEntry) throw new Error(`ZIP содержит неожиданный файл: ${unknownEntry.name}`);

  const mediaByBlobId = new Map(manifest.data.media.map((item) => [item.blobId, item]));
  const blobs: MediaBlob[] = [];
  let verifiedBytes = 0;
  for (const item of manifest.media) {
    const entry = zip.file(item.path) as SizedZipEntry | null;
    if (!entry) throw new Error(`ZIP не содержит ${item.path}`);
    if (entry._data?.uncompressedSize !== item.size) throw new Error(`Размер ${item.path} не совпадает с manifest`);
    const bytes = await entry.async("uint8array");
    if (bytes.byteLength !== item.size || (await sha256(bytes)) !== item.sha256) {
      throw new Error(`Checksum ${item.path} не совпадает с manifest`);
    }
    verifiedBytes += bytes.byteLength;
    const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    const media = mediaByBlobId.get(item.id);
    blobs.push({
      id: item.id,
      blob: new Blob([arrayBuffer], {
        type:
          media?.type === "image"
            ? "image/*"
            : media?.type === "video"
              ? "video/*"
              : "application/octet-stream",
      }),
    });
  }

  return {
    data: manifest.data,
    blobs,
    summary: {
      projects: manifest.data.projects.length,
      classes: manifest.data.classes.length,
      students: manifest.data.students.length,
      livePhotos: manifest.data.livePhotos.length,
      media: manifest.data.media.length,
      bytes: verifiedBytes,
    },
  };
}

function validateZipPath(entry: SizedZipEntry) {
  if (entry.unsafeOriginalName && entry.unsafeOriginalName !== entry.name)
    throw new Error("ZIP содержит небезопасный исходный путь");
  if (entry.name.includes("\\") || entry.name.startsWith("/") || entry.name.includes("\0")) {
    throw new Error(`Недопустимый ZIP path: ${entry.name}`);
  }
  const segments = entry.name.split("/").filter(Boolean);
  if (segments.some((segment) => segment === "." || segment === ".."))
    throw new Error(`Недопустимый ZIP path: ${entry.name}`);
  if (
    entry.name !== "school-ar-photo.json" &&
    entry.name !== "media/" &&
    !/^media\/[A-Za-z0-9_-]{1,128}$/.test(entry.name)
  ) {
    throw new Error(`ZIP path не входит в allowlist: ${entry.name}`);
  }
}

function validateManifestMedia(manifest: z.infer<typeof projectExportSchema>) {
  const referenced = manifest.data.media.map((item) => item.blobId);
  assertUnique(referenced, "media blob id");
  assertUnique(
    manifest.media.map((item) => item.id),
    "manifest media id",
  );
  const metadataIds = new Set(manifest.media.map((item) => item.id));
  if (referenced.some((id) => !metadataIds.has(id)) || metadataIds.size !== referenced.length) {
    throw new Error("Manifest media metadata не совпадает с AppData");
  }
  for (const item of manifest.media) {
    if (item.path !== `media/${item.id}`) throw new Error("Manifest media path не соответствует id");
  }
}

function validateAppData(data: AppData) {
  assertUnique(
    data.projects.map((item) => item.id),
    "project id",
  );
  assertUnique(
    data.classes.map((item) => item.id),
    "class id",
  );
  assertUnique(
    data.students.map((item) => item.id),
    "student id",
  );
  assertUnique(
    data.livePhotos.map((item) => item.id),
    "live photo id",
  );
  assertUnique(
    data.media.map((item) => item.id),
    "media id",
  );
  assertUnique(
    data.media.map((item) => item.blobId),
    "media blob id",
  );

  const projects = new Set(data.projects.map((item) => item.id));
  const classes = new Set(data.classes.map((item) => item.id));
  const students = new Set(data.students.map((item) => item.id));
  const media = new Map(data.media.map((item) => [item.id, item]));
  if (data.classes.some((item) => !projects.has(item.projectId)))
    throw new Error("Class ссылается на неизвестный project");
  if (data.students.some((item) => !classes.has(item.classId)))
    throw new Error("Student ссылается на неизвестный class");
  for (const item of data.livePhotos) {
    if (!students.has(item.studentId)) throw new Error("Live photo ссылается на неизвестного student");
    if (media.get(item.imageId)?.type !== "image" || media.get(item.videoId)?.type !== "video") {
      throw new Error("Live photo содержит неверные image/video references");
    }
    if (item.trackingId && media.get(item.trackingId)?.type !== "tracking") {
      throw new Error("Live photo содержит неверный tracking reference");
    }
  }
}

function assertUnique(values: string[], label: string) {
  if (new Set(values).size !== values.length) throw new Error(`Найден повторяющийся ${label}`);
}

async function sha256(value: Blob | Uint8Array) {
  const bytes =
    value instanceof Blob
      ? await value.arrayBuffer()
      : value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
  const digest = await crypto.subtle.digest("SHA-256", bytes as ArrayBuffer);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function dataForProject(snapshot: StoreSnapshot, projectId: string): AppData {
  const projects = snapshot.projects.filter((item) => item.id === projectId);
  if (!projects.length) throw new Error("Проект для экспорта не найден");
  const projectIds = new Set(projects.map((item) => item.id));
  const classes = snapshot.classes.filter((item) => projectIds.has(item.projectId));
  return dataForRelations(snapshot, projects, classes);
}

function dataForClass(snapshot: StoreSnapshot, arClass: ARClass): AppData {
  const projects = snapshot.projects.filter((item) => item.id === arClass.projectId);
  return dataForRelations(snapshot, projects, [arClass]);
}

function dataForRelations(
  snapshot: StoreSnapshot,
  projects: AppData["projects"],
  classes: AppData["classes"],
): AppData {
  const classIds = new Set(classes.map((item) => item.id));
  const students = snapshot.students.filter((item) => classIds.has(item.classId));
  const studentIds = new Set(students.map((item) => item.id));
  const livePhotos = snapshot.livePhotos.filter((item) => studentIds.has(item.studentId));
  const mediaIds = new Set(
    livePhotos.flatMap((item) =>
      item.trackingId ? [item.imageId, item.videoId, item.trackingId] : [item.imageId, item.videoId],
    ),
  );
  const media = snapshot.media.filter((item) => mediaIds.has(item.id));
  return { projects, classes, students, livePhotos, media };
}

export function getClassStats(snapshot: StoreSnapshot, arClass: ARClass) {
  const students = snapshot.students.filter((student) => student.classId === arClass.id);
  const livePhotos = snapshot.livePhotos.filter((photo) => students.some((student) => student.id === photo.studentId));
  return { students: students.length, livePhotos: livePhotos.length };
}
