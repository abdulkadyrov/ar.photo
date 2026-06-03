import type { AppData, ARClass, ARProject, ARStudent, LivePhoto, Media, MediaBlob, StoreSnapshot } from "../types";

const DB_NAME = "school-ar-photo";
const DB_VERSION = 1;
const stores = ["projects", "classes", "students", "livePhotos", "media", "mediaBlobs"] as const;
type StoreName = (typeof stores)[number];

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const store of stores) {
        if (!db.objectStoreNames.contains(store)) db.createObjectStore(store, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function tx<T>(storeName: StoreName, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const request = action(transaction.objectStore(storeName));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function all<T>(storeName: StoreName) {
  return tx<T[]>(storeName, "readonly", (store) => store.getAll());
}

async function put<T extends { id: string }>(storeName: StoreName, value: T) {
  await tx<IDBValidKey>(storeName, "readwrite", (store) => store.put(value));
}

async function remove(storeName: StoreName, id: string) {
  await tx<undefined>(storeName, "readwrite", (store) => store.delete(id));
}

async function get<T>(storeName: StoreName, id: string) {
  return tx<T | undefined>(storeName, "readonly", (store) => store.get(id));
}

export async function loadData(): Promise<StoreSnapshot> {
  const [projects, classes, students, livePhotos, media, mediaBlobs] = await Promise.all([
    all<ARProject>("projects"),
    all<ARClass>("classes"),
    all<ARStudent>("students"),
    all<LivePhoto>("livePhotos"),
    all<Media>("media"),
    all<MediaBlob>("mediaBlobs"),
  ]);
  return { projects, classes, students, livePhotos, media, mediaBlobs };
}

export async function saveProject(project: ARProject) {
  await put("projects", project);
}

export async function saveClass(arClass: ARClass) {
  await put("classes", arClass);
}

export async function saveStudent(student: ARStudent) {
  await put("students", student);
}

export async function saveLivePhoto(livePhoto: LivePhoto) {
  await put("livePhotos", livePhoto);
}

export async function saveMedia(media: Media, blob: Blob) {
  await Promise.all([put("media", media), put("mediaBlobs", { id: media.blobId, blob })]);
}

export async function getMediaBlob(blobId: string) {
  const record = await get<MediaBlob>("mediaBlobs", blobId);
  return record?.blob;
}

export async function clearAll() {
  await Promise.all(stores.map((store) => tx<undefined>(store, "readwrite", (objectStore) => objectStore.clear())));
}

export async function importSnapshot(data: AppData, blobs: MediaBlob[]) {
  await Promise.all([
    ...data.projects.map((item) => put("projects", item)),
    ...data.classes.map((item) => put("classes", item)),
    ...data.students.map((item) => put("students", item)),
    ...data.livePhotos.map((item) => put("livePhotos", item)),
    ...data.media.map((item) => put("media", item)),
    ...blobs.map((item) => put("mediaBlobs", item)),
  ]);
}

export async function deleteProjectCascade(projectId: string) {
  const data = await loadData();
  const classIds = data.classes.filter((item) => item.projectId === projectId).map((item) => item.id);
  const studentIds = data.students.filter((item) => classIds.includes(item.classId)).map((item) => item.id);
  const livePhotos = data.livePhotos.filter((item) => studentIds.includes(item.studentId));
  const mediaIds = livePhotos.flatMap((item) => [item.imageId, item.videoId]);
  const media = data.media.filter((item) => mediaIds.includes(item.id));
  await Promise.all([
    remove("projects", projectId),
    ...classIds.map((id) => remove("classes", id)),
    ...studentIds.map((id) => remove("students", id)),
    ...livePhotos.map((item) => remove("livePhotos", item.id)),
    ...media.map((item) => remove("media", item.id)),
    ...media.map((item) => remove("mediaBlobs", item.blobId)),
  ]);
}
