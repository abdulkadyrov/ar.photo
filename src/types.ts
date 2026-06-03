export type ARProject = {
  id: string;
  name: string;
  createdAt: string;
};

export type ARClass = {
  id: string;
  projectId: string;
  name: string;
};

export type ARStudent = {
  id: string;
  classId: string;
  firstName: string;
  lastName: string;
};

export type LivePhoto = {
  id: string;
  studentId: string;
  imageId: string;
  videoId: string;
  qrCode: string;
  createdAt: string;
};

export type Media = {
  id: string;
  type: "image" | "video";
  fileName: string;
  blobId: string;
};

export type MediaBlob = {
  id: string;
  blob: Blob;
};

export type AppData = {
  projects: ARProject[];
  classes: ARClass[];
  students: ARStudent[];
  livePhotos: LivePhoto[];
  media: Media[];
};

export type StoreSnapshot = AppData & {
  mediaBlobs: MediaBlob[];
};
