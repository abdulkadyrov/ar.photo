import { getPostcardTemplate, postcardTemplateImageUrl, type PostcardPrintTemplate } from "./postcardTemplates";

export const POSTCARD_PRINT_WIDTH = 1200;
export const POSTCARD_PRINT_HEIGHT = 1800;
export const POSTCARD_WIDTH_MM = 100;
export const POSTCARD_HEIGHT_MM = 150;
export const MAX_POSTCARD_EXPORT_COUNT = 20;
export const POSTCARD_QR = Object.freeze({ x: 948, y: 1512, size: 192, quietZoneModules: 4 });
export const POSTCARD_PUBLIC_BASE_URL = "https://khanzama.ru/ar.photo";

export type RenderedPostcard = { publicToken: string; blob: Blob };
export type PostcardPrintPageSize = "photo" | "a4";
const imagePromises = new Map<string, Promise<HTMLImageElement>>();
const MAX_EXPORT_BYTES = 120 * 1024 * 1024;

export function postcardPublicUrl(publicToken: string) {
  if (!/^[a-f0-9]{32}$/.test(publicToken)) throw new Error("Некорректный номер открытки.");
  return `${POSTCARD_PUBLIC_BASE_URL}/card/${publicToken}`;
}

function loadImage(url: string) {
  const cached = imagePromises.get(url);
  if (cached) return cached;
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => {
      imagePromises.delete(url);
      reject(new Error("Не удалось загрузить оформление открытки. Проверьте соединение и повторите."));
    };
    image.src = url;
  });
  // Only immutable artwork is cached, never a card QR or rendered private content.
  if (!url.startsWith("data:")) imagePromises.set(url, promise);
  return promise;
}

export async function postcardQrDataUrl(publicToken: string) {
  const { toDataURL } = await import("qrcode");
  return toDataURL(postcardPublicUrl(publicToken), {
    margin: POSTCARD_QR.quietZoneModules,
    width: POSTCARD_QR.size,
    color: { dark: "#000000", light: "#FFFFFF" },
  });
}

/** Shared composition used for the canonical print image and its stored AR marker. */
export function paintPostcard(
  context: CanvasRenderingContext2D,
  artwork: CanvasImageSource,
  qr: CanvasImageSource,
  template: PostcardPrintTemplate,
  publicToken: string,
) {
  getPostcardTemplate(template.code);
  postcardPublicUrl(publicToken);
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, POSTCARD_PRINT_WIDTH, POSTCARD_PRINT_HEIGHT);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(artwork, 0, 0, POSTCARD_PRINT_WIDTH, POSTCARD_PRINT_HEIGHT);
  context.imageSmoothingEnabled = false;
  context.drawImage(qr, POSTCARD_QR.x, POSTCARD_QR.y, POSTCARD_QR.size, POSTCARD_QR.size);
  // A quiet paper strip keeps the instruction/serial readable over floral edges.
  context.fillStyle = "#FFFFFF";
  context.fillRect(POSTCARD_QR.x, POSTCARD_QR.y + POSTCARD_QR.size, POSTCARD_QR.size, 66);
  context.fillStyle = "#222222";
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  const centerX = POSTCARD_QR.x + POSTCARD_QR.size / 2;
  context.font = "17px sans-serif";
  context.fillText("Добавьте видео", centerX, 1723, 215);
  context.font = "12px monospace";
  context.fillText(`PC-${publicToken.slice(0, 16)}`, centerX, 1743, 220);
  context.fillText(publicToken.slice(16), centerX, 1759, 220);
}

/** One immutable 1200×1800 PNG; manager uploads these exact bytes as the marker. */
export async function renderPostcard(templateCode: string, publicToken: string): Promise<Blob> {
  const template = getPostcardTemplate(templateCode);
  postcardPublicUrl(publicToken);
  const [artwork, qr] = await Promise.all([
    loadImage(postcardTemplateImageUrl(template)),
    postcardQrDataUrl(publicToken).then(loadImage),
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = POSTCARD_PRINT_WIDTH;
  canvas.height = POSTCARD_PRINT_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Браузер не поддерживает подготовку открыток к печати.");
  try {
    paintPostcard(context, artwork, qr, template, publicToken);
    const png = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Не удалось подготовить файл открытки."))),
        "image/png",
      ),
    );
    return withPostcardPrintDensity(png);
  } finally {
    canvas.width = 1;
    canvas.height = 1;
  }
}

export async function renderPostcardDataUrl(templateCode: string, publicToken: string) {
  return blobDataUrl(await renderPostcard(templateCode, publicToken));
}

async function blobDataUrl(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 32768) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
  }
  return `data:${blob.type};base64,${btoa(binary)}`;
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/** PNG physical density: 12000 pixels/m makes 1200×1800 exactly 100×150 mm. */
export async function withPostcardPrintDensity(png: Blob): Promise<Blob> {
  const source = new Uint8Array(await png.arrayBuffer());
  const view = new DataView(source.buffer);
  if (source.length < 33 || source[0] !== 137 || new TextDecoder().decode(source.slice(1, 4)) !== "PNG")
    throw new Error("Некорректный PNG открытки.");
  const physical = new Uint8Array(21);
  const metadata = new DataView(physical.buffer);
  metadata.setUint32(0, 9);
  physical.set(new TextEncoder().encode("pHYs"), 4);
  metadata.setUint32(8, 12000);
  metadata.setUint32(12, 12000);
  physical[16] = 1;
  metadata.setUint32(17, crc32(physical.slice(4, 17)));
  const chunks: BlobPart[] = [source.slice(0, 8)];
  let inserted = false;
  for (let offset = 8; offset + 12 <= source.length;) {
    const size = view.getUint32(offset);
    if (offset + size + 12 > source.length) throw new Error("Повреждённый PNG открытки.");
    const type = new TextDecoder().decode(source.slice(offset + 4, offset + 8));
    if (type !== "pHYs") chunks.push(source.slice(offset, offset + size + 12));
    if (type === "IHDR") {
      chunks.push(physical);
      inserted = true;
    }
    offset += size + 12;
  }
  if (!inserted) throw new Error("Некорректный PNG открытки.");
  return new Blob(chunks, { type: "image/png" });
}

function validateRenderedCards(templateCode: string, cards: readonly RenderedPostcard[]) {
  getPostcardTemplate(templateCode);
  if (!cards.length || cards.length > MAX_POSTCARD_EXPORT_COUNT)
    throw new Error(`Выберите от 1 до ${MAX_POSTCARD_EXPORT_COUNT} открыток для одной выгрузки.`);
  const tokens = new Set<string>();
  let total = 0;
  for (const card of cards) {
    postcardPublicUrl(card.publicToken);
    if (tokens.has(card.publicToken)) throw new Error("В выгрузке повторяется одна и та же открытка.");
    if (card.blob.type !== "image/png" || !card.blob.size) throw new Error("Печатный файл открытки недоступен.");
    tokens.add(card.publicToken);
    total += card.blob.size;
  }
  if (total > MAX_EXPORT_BYTES)
    throw new Error("Выбранные файлы слишком велики. Выгрузите меньше открыток за один раз.");
}

/** Accepts already stored canonical images; does not silently regenerate markers. */
export async function createPostcardZip(templateCode: string, cards: readonly RenderedPostcard[]) {
  validateRenderedCards(templateCode, cards);
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const card of cards) zip.file(`${templateCode}-v1-${card.publicToken}.png`, await card.blob.arrayBuffer());
  zip.file(
    "Печать.txt",
    "Открытки 100 × 150 мм. PNG 1200 × 1800 px, 304,8 dpi. Печатайте без изменения пропорций и без автоматического кадрирования. Каждый файл содержит собственный QR; не заменяйте его копией QR другой открытки. Код активации магазина выдаётся отдельно, на вкладыше.\n",
  );
  return zip.generateAsync({ type: "blob", compression: "STORE" });
}

/** Embed canonical PNG pixels losslessly at their physical print size. */
export async function createPostcardPdf(
  templateCode: string,
  cards: readonly RenderedPostcard[],
  pageSize: PostcardPrintPageSize = "photo",
  options: { signal?: AbortSignal; onProgress?: (done: number, total: number) => void } = {},
): Promise<Blob> {
  validateRenderedCards(templateCode, cards);
  if (pageSize !== "photo" && pageSize !== "a4") throw new Error("Неподдерживаемый формат печати.");
  const { PDFDocument, PrintScaling } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  pdf.setTitle("KHANZAMA postcards");
  pdf.catalog.getOrCreateViewerPreferences().setPrintScaling(PrintScaling.None);
  const mm = 72 / 25.4;
  const perPage = pageSize === "a4" ? 2 : 1;
  for (const [index, card] of cards.entries()) {
    options.signal?.throwIfAborted();
    const image = await pdf.embedPng(await card.blob.arrayBuffer());
    if (image.width !== POSTCARD_PRINT_WIDTH || image.height !== POSTCARD_PRINT_HEIGHT)
      throw new Error("Размер печатного изображения должен быть 1200 × 1800 пикселей.");
    const page =
      index % perPage === 0
        ? pdf.addPage(pageSize === "a4" ? [210 * mm, 297 * mm] : [100 * mm, 150 * mm])
        : pdf.getPage(pdf.getPageCount() - 1);
    page.drawImage(image, {
      x: pageSize === "a4" ? (5 + (index % 2) * 100) * mm : 0,
      y: pageSize === "a4" ? (297 - 5 - 150) * mm : 0,
      width: 100 * mm,
      height: 150 * mm,
    });
    options.onProgress?.(index + 1, cards.length);
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
  options.signal?.throwIfAborted();
  const bytes = await pdf.save();
  options.signal?.throwIfAborted();
  return new Blob([Uint8Array.from(bytes)], { type: "application/pdf" });
}

function escapeHtml(text: string) {
  return text.replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!,
  );
}

/** Same-origin object URLs avoid duplicating full-size PNGs as base64 in the print frame. */
export function createPostcardPrintFrameHtml(
  cards: readonly { publicToken: string; url: string }[],
  pageSize: PostcardPrintPageSize,
) {
  if (!cards.length || cards.length > MAX_POSTCARD_EXPORT_COUNT) throw new Error("Выберите открытки для печати.");
  if (pageSize !== "photo" && pageSize !== "a4") throw new Error("Неподдерживаемый формат печати.");
  const pictures = cards.map((card) => {
    postcardPublicUrl(card.publicToken);
    if (!card.url.startsWith(`blob:${window.location.origin}/`)) throw new Error("Печатное изображение недоступно.");
    return `<img src="${escapeHtml(card.url)}" width="1200" height="1800" alt="Открытка">`;
  });
  const perPage = pageSize === "a4" ? 2 : 1;
  const sheets: string[] = [];
  for (let index = 0; index < pictures.length; index += perPage)
    sheets.push(`<section>${pictures.slice(index, index + perPage).join("")}</section>`);
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>KHANZAMA — печать открыток</title><style>
@page{size:${pageSize === "a4" ? "A4 portrait" : "100mm 150mm"};margin:${pageSize === "a4" ? "5mm" : "0"}}
*{box-sizing:border-box}html,body{margin:0;padding:0;background:white}section{display:flex;width:${perPage * 100}mm;height:150mm;break-inside:avoid;break-after:page}section:last-child{break-after:auto}img{display:block;width:100mm;height:150mm;max-width:none;object-fit:fill;print-color-adjust:exact;-webkit-print-color-adjust:exact}
</style></head><body>${sheets.join("")}</body></html>`;
}

export async function createPostcardPrintHtml(
  templateCode: string,
  cards: readonly RenderedPostcard[],
  pageSize: PostcardPrintPageSize = "photo",
): Promise<Blob> {
  validateRenderedCards(templateCode, cards);
  if (pageSize !== "photo" && pageSize !== "a4") throw new Error("Неподдерживаемый формат печати.");
  const perSheet = pageSize === "a4" ? 2 : 1;
  const pictures: string[] = [];
  for (const card of cards)
    pictures.push(
      `<img width="1200" height="1800" src="${await blobDataUrl(card.blob)}" alt="Открытка ${card.publicToken}">`,
    );
  const sheets: string[] = [];
  for (let index = 0; index < pictures.length; index += perSheet)
    sheets.push(`<section class="sheet">${pictures.slice(index, index + perSheet).join("")}</section>`);
  const html = `<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Хан Зама — открытки 10 × 15 см</title><style>
*{box-sizing:border-box}body{margin:0;background:#f5f3f0;color:#24212b;font-family:Arial,sans-serif}.controls{padding:20px;max-width:900px;margin:auto}.controls p{line-height:1.6}button{padding:12px 18px;font:inherit;border:0;border-radius:8px;background:#6943e5;color:white;cursor:pointer}.sheet{display:grid;grid-template-columns:repeat(${perSheet},100mm);width:${perSheet * 100}mm;height:150mm;margin:20px auto;gap:0;background:white;break-inside:avoid;break-after:page}.sheet img{display:block;width:100mm;height:150mm;object-fit:fill;max-width:none}@page{size:${pageSize === "a4" ? "A4 portrait" : "100mm 150mm"};margin:${pageSize === "a4" ? "5mm" : "0"}}@media screen and (max-width:800px){.sheet{width:min(100mm,calc(100vw - 24px));height:auto;grid-template-columns:1fr}.sheet img{width:100%;height:auto}}@media print{body{background:white}.controls{display:none}.sheet{margin:0;print-color-adjust:exact;-webkit-print-color-adjust:exact}.sheet:last-child{break-after:auto}}
</style><main><div class="controls"><h1>${escapeHtml(getPostcardTemplate(templateCode).name)}</h1><p>${cards.length} открыток по 100 × 150 мм. ${pageSize === "a4" ? "На листе A4 по две открытки." : "Одна открытка на листе фотобумаги 10 × 15 см."} В диалоге печати выберите масштаб 100%, отключите колонтитулы и автоматическое кадрирование. Проверьте пробный отпечаток линейкой перед тиражом.</p><button type="button" onclick="window.print()">Печатать открытки</button></div>${sheets.join("")}</main></html>`;
  return new Blob([html], { type: "text/html;charset=utf-8" });
}

/** Separate shop insert. No code is baked into the public postcard or its QR. */
export function createShopActivationInsertHtml(shopName: string, activationCode: string, quantity = 10) {
  if (
    !/^(?:[0-9]{4}|[A-F0-9]{12})$/.test(activationCode) ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 100
  )
    throw new Error("Проверьте код магазина и количество вкладышей (1–100).");
  const insert = `<article><strong>Ваше видео — внутри открытки</strong><p>Отсканируйте QR на открытке, введите код и добавьте своё видео.</p><div class="code">${activationCode.match(/.{4}/g)!.join(" · ")}</div><small>${escapeHtml(shopName)} · Хан Зама</small><p class="hint">Передайте этот вкладыш вместе с открыткой её покупателю.</p></article>`;
  const html = `<!doctype html><html lang="ru"><meta charset="utf-8"><title>Коды активации — ${escapeHtml(shopName)}</title><style>body{font-family:Arial,sans-serif;margin:0;color:#222}.controls{padding:16px}button{padding:12px;font:inherit}.inserts{display:flex;flex-wrap:wrap;gap:4mm}article{box-sizing:border-box;width:62mm;min-height:68mm;border:1px dashed #aaa;padding:5mm;break-inside:avoid}strong{font-size:13pt}p{font-size:10pt;line-height:1.5}.code{font-size:15pt;font-weight:bold;margin:5mm 0;white-space:nowrap}small,.hint{font-size:8pt}@page{size:A4;margin:8mm}@media print{.controls{display:none}}</style><div class="controls"><p>Вкладыши для магазина «${escapeHtml(shopName)}». Код одинаковый на всех вкладышах этого магазина.</p><button type="button" onclick="window.print()">Печатать вкладыши</button></div><main class="inserts">${insert.repeat(quantity)}</main></html>`;
  return new Blob([html], { type: "text/html;charset=utf-8" });
}

export function downloadPostcardFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
