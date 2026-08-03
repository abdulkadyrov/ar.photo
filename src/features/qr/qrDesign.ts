import { z } from "zod";
import type { Json } from "../../shared/api/database.types";
import type { QrStyle, QrStylePreset } from "../../entities/ar-item/model";
import { getPublicRuntimeConfig } from "../../shared/config/env";

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/);
const qrStyleSchema = z
  .object({
    preset: z.enum(["white", "transparent", "brand"]),
    foreground: hexColor,
    background: z.union([hexColor, z.literal("transparent")]),
    quietZone: z.number().int().min(4).max(8),
    logo: z.boolean(),
    logoScale: z.number().min(0.08).max(0.2),
  })
  .strict();

export const qrStylePresets: Record<QrStylePreset, QrStyle> = {
  white: {
    preset: "white",
    foreground: "#0B0F14",
    background: "#FFFFFF",
    quietZone: 4,
    logo: false,
    logoScale: 0.12,
  },
  transparent: {
    preset: "transparent",
    foreground: "#0B0F14",
    background: "transparent",
    quietZone: 4,
    logo: false,
    logoScale: 0.12,
  },
  brand: {
    preset: "brand",
    foreground: "#4B35D2",
    background: "#FFFFFF",
    quietZone: 4,
    logo: true,
    logoScale: 0.12,
  },
};

export const defaultQrStyle = qrStylePresets.white;

export const brandLogoDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#6C5CFF"/><path d="M18 18h12v5H23v7h-5V18Zm16 0h12v12h-5v-7h-7v-5ZM18 34h5v7h7v5H18V34Zm23 0h5v12H34v-5h7v-7Z" fill="white"/></svg>',
)}`;

export type QrValidation = {
  valid: boolean;
  contrastRatio: number;
  issues: string[];
};

export function parseQrStyle(value: Json): QrStyle {
  const parsed = qrStyleSchema.safeParse(value);
  return parsed.success ? parsed.data : defaultQrStyle;
}

export function validateQrDesign(style: QrStyle): QrValidation {
  const parsed = qrStyleSchema.safeParse(style);
  if (!parsed.success) return { valid: false, contrastRatio: 0, issues: ["Некорректные параметры QR"] };

  const effectiveBackground = style.background === "transparent" ? "#FFFFFF" : style.background;
  const contrastRatio = contrast(style.foreground, effectiveBackground);
  const issues: string[] = [];
  if (style.quietZone < 4) issues.push("Quiet zone должен быть не меньше 4 модулей");
  if (contrastRatio < 4.5) issues.push("Недостаточный контраст QR");
  if (style.logo && style.logoScale > 0.2) issues.push("Логотип перекрывает слишком большую часть QR");
  return { valid: issues.length === 0, contrastRatio, issues };
}

export function resolvePublicBaseUrl() {
  const config = getPublicRuntimeConfig();
  const configured = config.publicAppUrl ?? new URL(import.meta.env.BASE_URL, window.location.origin).toString();
  return normalizePublicBaseUrl(configured, config.authMode === "demo");
}

export function normalizePublicBaseUrl(value: string, allowLocalHttp = false) {
  const parsed = new URL(value);
  const localHttp =
    allowLocalHttp && parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname);
  if (
    (parsed.protocol !== "https:" && !localHttp) ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error("Публичный адрес должен использовать HTTPS без query/hash/credentials");
  }
  const pathname = parsed.pathname.replace(/\/+$/, "");
  return `${parsed.origin}${pathname}`;
}

export function buildPublicArUrl(publicBaseUrl: string, publicSlug: string, allowLocalHttp = false) {
  if (!/^[a-f0-9]{36}$/.test(publicSlug)) throw new Error("Некорректный публичный slug");
  return `${normalizePublicBaseUrl(publicBaseUrl, allowLocalHttp)}/ar/${publicSlug}`;
}

export function validatePublicQrUrl(publicUrl: string, internalItemId?: string) {
  const issues: string[] = [];
  try {
    const parsed = new URL(publicUrl);
    if (parsed.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(parsed.hostname)) {
      issues.push("Публичная ссылка должна использовать HTTPS");
    }
    if (parsed.username || parsed.password || parsed.search || parsed.hash) issues.push("Ссылка содержит лишние данные");
    if (!/\/ar\/[a-f0-9]{36}$/.test(parsed.pathname)) issues.push("Ссылка не соответствует публичному AR route");
    if (internalItemId && publicUrl.includes(internalItemId)) issues.push("Ссылка раскрывает внутренний ID");
    if (/token=|signature=|storage\//i.test(publicUrl)) issues.push("Ссылка содержит временный media credential");
  } catch {
    issues.push("Публичная ссылка некорректна");
  }
  return { valid: issues.length === 0, issues };
}

export function qrDownloadName(title: string, version: number, extension: "svg" | "png") {
  const safeTitle = title
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
  return `${safeTitle || "ar-photo"}-qr-v${version}.${extension}`;
}

function contrast(first: string, second: string) {
  const light = Math.max(luminance(first), luminance(second));
  const dark = Math.min(luminance(first), luminance(second));
  return (light + 0.05) / (dark + 0.05);
}

function luminance(color: string) {
  const channels = [1, 3, 5].map((offset) => Number.parseInt(color.slice(offset, offset + 2), 16) / 255);
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}
