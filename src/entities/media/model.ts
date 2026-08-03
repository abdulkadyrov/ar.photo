import type { Json, Tables } from "../../shared/api/database.types";

export type MediaKind = "marker" | "video";
export type MediaAsset = Tables<"media_assets">;
export type UploadSession = Tables<"upload_sessions">;

export type MarkerMetadata = {
  width: number;
  height: number;
  exifStripped: true;
};

export type VideoMetadata = {
  width: number;
  height: number;
  durationSeconds: number;
  videoCodec: "h264";
  audioCodec: "aac" | "none";
};

export type PreparedMedia = {
  file: File;
  kind: MediaKind;
  sha256: string;
  metadata: MarkerMetadata | VideoMetadata;
};

export type BeginMediaUploadInput = {
  accountId: string;
  projectId: string;
  groupId: string;
  kind: MediaKind;
  file: File;
  requestId: string;
};

export type FinalizeMediaUploadInput = {
  sessionId: string;
  sha256: string;
  metadata: Json;
};

export type UploadProgress = {
  uploadedBytes: number;
  totalBytes: number;
};
