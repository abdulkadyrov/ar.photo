import type { Database, Tables } from "../../shared/api/database.types";

export type ArItem = Tables<"ar_items">;
export type ProcessingJob = Tables<"processing_jobs">;
export type MediaAsset = Tables<"media_assets">;
export type QrCode = Tables<"qr_codes">;
export type MarkerLostBehavior = Database["public"]["Enums"]["marker_lost_behavior"];

export type QrStylePreset = "white" | "transparent" | "brand";
export type QrStyle = {
  preset: QrStylePreset;
  foreground: string;
  background: string;
  quietZone: number;
  logo: boolean;
  logoScale: number;
};

export type ArItemSettings = {
  autoplay: boolean;
  loopVideo: boolean;
  markerLostBehavior: MarkerLostBehavior;
  audioDefault: "muted" | "user_enabled";
  fallbackEnabled: boolean;
};

export type CreateArItemInput = {
  projectId: string;
  groupId: string;
  title: string;
  description: string;
  requestId: string;
};

export type PrepareArItemInput = ArItemSettings & {
  markerAssetId: string;
  videoAssetId: string;
};
