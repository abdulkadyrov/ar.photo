import JSZip from "jszip";
import type { AppData, ARClass, ARStudent, LivePhoto, Media, MediaBlob, StoreSnapshot } from "../types";
import { slugify } from "./id";

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

export async function exportClassZip(snapshot: StoreSnapshot, arClass: ARClass) {
  const zip = new JSZip();
  const classStudents = snapshot.students.filter((student) => student.classId === arClass.id);
  const blobById = new Map(snapshot.mediaBlobs.map((item) => [item.id, item.blob]));
  const mediaById = new Map(snapshot.media.map((item) => [item.id, item]));

  for (const student of classStudents) {
    const livePhoto = snapshot.livePhotos.find((item) => item.studentId === student.id);
    if (!livePhoto) continue;
    const folderName = `${slugify(student.lastName)}_${slugify(student.firstName)}`;
    const folder = zip.folder(`students/${folderName}`);
    if (!folder) continue;
    const image = mediaById.get(livePhoto.imageId);
    const video = mediaById.get(livePhoto.videoId);
    if (image) folder.file(image.fileName, blobById.get(image.blobId) ?? "");
    if (video) folder.file(video.fileName, blobById.get(video.blobId) ?? "");
    folder.file("qr.png", await qrPngBlob(livePhoto.qrCode));
    folder.file("livephoto.json", JSON.stringify({ student, livePhoto, image, video }, null, 2));
  }

  zip.file("school-ar-photo.json", JSON.stringify(toAppData(snapshot), null, 2));
  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, `${slugify(arClass.name)}_live_photos.zip`);
}

export async function exportProjectZip(snapshot: StoreSnapshot, projectId: string) {
  const zip = new JSZip();
  zip.file("school-ar-photo.json", JSON.stringify(toAppData(snapshot), null, 2));
  for (const mediaBlob of snapshot.mediaBlobs) {
    zip.file(`media/${mediaBlob.id}`, mediaBlob.blob);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, `school_ar_photo_${projectId}.zip`);
}

export async function parseImportZip(file: File): Promise<{ data: AppData; blobs: MediaBlob[] }> {
  const zip = await JSZip.loadAsync(file);
  const manifest = zip.file("school-ar-photo.json");
  if (!manifest) throw new Error("ZIP не содержит school-ar-photo.json");
  const data = JSON.parse(await manifest.async("string")) as AppData;
  const blobs: MediaBlob[] = [];
  for (const media of data.media) {
    const entry = zip.file(`media/${media.blobId}`);
    if (entry) blobs.push({ id: media.blobId, blob: await entry.async("blob") });
  }
  return { data, blobs };
}

function toAppData(snapshot: StoreSnapshot): AppData {
  return {
    projects: snapshot.projects,
    classes: snapshot.classes,
    students: snapshot.students,
    livePhotos: snapshot.livePhotos,
    media: snapshot.media,
  };
}

export function getClassStats(snapshot: StoreSnapshot, arClass: ARClass) {
  const students = snapshot.students.filter((student) => student.classId === arClass.id);
  const livePhotos = snapshot.livePhotos.filter((photo) => students.some((student) => student.id === photo.studentId));
  return { students: students.length, livePhotos: livePhotos.length };
}
