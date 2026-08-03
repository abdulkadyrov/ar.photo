import type { MarkerMetadata, MediaKind, PreparedMedia, VideoMetadata } from "../../entities/media/model";

const databaseName = "ar-photo-upload-queue";
const databaseVersion = 1;
const storeName = "prepared-media";
const ownerIndex = "owner-id";

export type PreparedUploadQueueItem = {
  id: string;
  ownerId: string;
  accountId: string;
  projectId: string;
  groupId: string;
  requestId: string;
  prepared: PreparedMedia;
  createdAt: number;
};

type StoredUploadQueueItem = Omit<PreparedUploadQueueItem, "prepared"> & {
  kind: MediaKind;
  sha256: string;
  metadata: MarkerMetadata | VideoMetadata;
  file: Blob;
  fileName: string;
  fileType: string;
  fileLastModified: number;
};

export class UploadQueueStorageError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "UploadQueueStorageError";
  }
}

export async function persistPreparedUpload(item: PreparedUploadQueueItem) {
  await assertStorageCapacity(item.prepared.file.size);
  if ("storage" in navigator && typeof navigator.storage.persist === "function") {
    await navigator.storage.persist().catch(() => false);
  }
  const stored: StoredUploadQueueItem = {
    id: item.id,
    ownerId: item.ownerId,
    accountId: item.accountId,
    projectId: item.projectId,
    groupId: item.groupId,
    requestId: item.requestId,
    createdAt: item.createdAt,
    kind: item.prepared.kind,
    sha256: item.prepared.sha256,
    metadata: item.prepared.metadata,
    file: item.prepared.file,
    fileName: item.prepared.file.name,
    fileType: item.prepared.file.type,
    fileLastModified: item.prepared.file.lastModified,
  };
  const database = await openUploadQueue();
  try {
    await transactionRequest(database, "readwrite", (store) => store.put(stored));
  } catch (error) {
    throw new UploadQueueStorageError("Не удалось сохранить файл в локальной очереди IndexedDB", error);
  } finally {
    database.close();
  }
}

export async function listPreparedUploads(ownerId: string): Promise<PreparedUploadQueueItem[]> {
  const database = await openUploadQueue();
  try {
    const stored = await transactionRequest<StoredUploadQueueItem[]>(database, "readonly", (store) =>
      store.index(ownerIndex).getAll(ownerId),
    );
    return stored
      .sort((left, right) => left.createdAt - right.createdAt)
      .map((item) => {
        const file = new File([item.file], item.fileName, {
          type: item.fileType,
          lastModified: item.fileLastModified,
        });
        const prepared =
          item.kind === "marker"
            ? ({ file, kind: "marker", sha256: item.sha256, metadata: item.metadata as MarkerMetadata } as const)
            : ({ file, kind: "video", sha256: item.sha256, metadata: item.metadata as VideoMetadata } as const);
        return {
          id: item.id,
          ownerId: item.ownerId,
          accountId: item.accountId,
          projectId: item.projectId,
          groupId: item.groupId,
          requestId: item.requestId,
          prepared,
          createdAt: item.createdAt,
        };
      });
  } finally {
    database.close();
  }
}

export async function removePreparedUpload(id: string) {
  const database = await openUploadQueue();
  try {
    await transactionRequest(database, "readwrite", (store) => store.delete(id));
  } finally {
    database.close();
  }
}

function openUploadQueue() {
  if (!("indexedDB" in globalThis)) {
    return Promise.reject(new UploadQueueStorageError("IndexedDB недоступен в этом браузере"));
  }
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion);
    request.onupgradeneeded = () => {
      const database = request.result;
      const store = database.objectStoreNames.contains(storeName)
        ? request.transaction!.objectStore(storeName)
        : database.createObjectStore(storeName, { keyPath: "id" });
      if (!store.indexNames.contains(ownerIndex)) store.createIndex(ownerIndex, "ownerId", { unique: false });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new UploadQueueStorageError("Не удалось открыть локальную очередь", request.error));
    request.onblocked = () => reject(new UploadQueueStorageError("Обновление локальной очереди заблокировано"));
  });
}

function transactionRequest<T = IDBValidKey>(
  database: IDBDatabase,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
) {
  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const request = run(transaction.objectStore(storeName));
    let result: T;
    request.onsuccess = () => {
      result = request.result;
    };
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => resolve(result);
    transaction.onabort = () => reject(transaction.error);
    transaction.onerror = () => reject(transaction.error);
  });
}

async function assertStorageCapacity(requiredBytes: number) {
  if (!("storage" in navigator) || typeof navigator.storage.estimate !== "function") return;
  const { quota, usage } = await navigator.storage.estimate();
  if (quota === undefined || usage === undefined) return;
  const safetyMargin = Math.max(8 * 1024 * 1024, Math.round(quota * 0.05));
  if (requiredBytes + safetyMargin > quota - usage) {
    throw new UploadQueueStorageError("Недостаточно места на устройстве для локальной очереди загрузки");
  }
}
