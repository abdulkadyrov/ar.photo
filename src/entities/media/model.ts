import type { Json, Tables } from "../../shared/api/database.types";

export type MediaKind = "marker" | "video";
export type MediaAsset = Tables<"media_assets">;
export type UploadSession = Tables<"upload_sessions">;

export type MarkerMetadata = {
  width: number;
  height: number;
  exifStripped: true;
  optimization: MediaOptimizationMetadata & {
    strategy: "adaptive-image";
    originalWidth: number;
    originalHeight: number;
  };
};

export type VideoMetadata = {
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  videoCodec: "h264" | "source";
  audioCodec: "aac" | "none" | "source";
  serverTranscodeRequired?: boolean;
  sourceVideoCodec?: string;
  sourceAudioCodec?: string | null;
  optimization: MediaOptimizationMetadata & {
    strategy: "source-kept" | "webcodecs-h264" | "server-transcode";
  };
};

export type MediaOptimizationMetadata = {
  originalBytes: number;
  uploadBytes: number;
  savedBytes: number;
  reductionPercent: number;
  optimized: boolean;
};

export type PreparedMedia =
  | { file: File; kind: "marker"; sha256: string; metadata: MarkerMetadata }
  | { file: File; kind: "video"; sha256: string; metadata: VideoMetadata };

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
