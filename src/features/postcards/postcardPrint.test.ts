// @vitest-environment node
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createCanvas, loadImage } from "canvas";
import jsQR from "jsqr";
import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import {
  createPostcardPrintHtml,
  createPostcardZip,
  createShopActivationInsertHtml,
  MAX_POSTCARD_EXPORT_COUNT,
  paintPostcard,
  POSTCARD_PRINT_HEIGHT,
  POSTCARD_PRINT_WIDTH,
  POSTCARD_QR,
  postcardPublicUrl,
  postcardQrDataUrl,
  withPostcardPrintDensity,
} from "./postcardPrint";
import { getPostcardTemplate, postcardTemplateCatalog } from "./postcardTemplates";

const token = "00112233445566778899aabbccddeeff";

async function paintedCard(templateCode = "new-year", publicToken = token) {
  const canvas = createCanvas(POSTCARD_PRINT_WIDTH, POSTCARD_PRINT_HEIGHT);
  const art = createCanvas(POSTCARD_PRINT_WIDTH, POSTCARD_PRINT_HEIGHT);
  const artContext = art.getContext("2d");
  artContext.fillStyle = "#f9ecd1";
  artContext.fillRect(0, 0, art.width, art.height);
  const qr = await loadImage(await postcardQrDataUrl(publicToken));
  paintPostcard(
    canvas.getContext("2d") as unknown as CanvasRenderingContext2D,
    art as unknown as CanvasImageSource,
    qr as unknown as CanvasImageSource,
    getPostcardTemplate(templateCode),
    publicToken,
  );
  const png = await withPostcardPrintDensity(
    new Blob([new Uint8Array(canvas.toBuffer("image/png"))], { type: "image/png" }),
  );
  return { canvas, png };
}

function pngChunks(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const chunks: { type: string; data: Uint8Array }[] = [];
  for (let offset = 8; offset + 12 <= bytes.length;) {
    const size = view.getUint32(offset);
    chunks.push({
      type: new TextDecoder().decode(bytes.slice(offset + 4, offset + 8)),
      data: bytes.slice(offset + 8, offset + 8 + size),
    });
    offset += size + 12;
  }
  return chunks;
}

describe("postcard printing", () => {
  it("ships nine versioned approved artworks and bounded frame rectangles", () => {
    const provenance = JSON.parse(readFileSync("public/postcards/provenance.json", "utf8")) as {
      assets: { code: string; file: string; sha256: string }[];
    };
    expect(postcardTemplateCatalog).toHaveLength(9);
    for (const template of postcardTemplateCatalog) {
      expect(template.frame.x).toBeGreaterThan(0);
      expect(template.frame.y).toBeGreaterThan(0);
      expect(template.frame.x + template.frame.width).toBeLessThan(1);
      expect(template.frame.y + template.frame.height).toBeLessThan(0.81);
      const artifact = provenance.assets.find((a) => a.code === template.code)!;
      const bytes = readFileSync(`public/${template.imagePath}`);
      expect(bytes.subarray(0, 4).toString()).toBe("RIFF");
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(artifact.sha256);
    }
  });

  it("decodes the real QR from a full-size composed print for every template", async () => {
    for (const [index, template] of postcardTemplateCatalog.entries()) {
      const publicToken = `${index}`.repeat(32);
      const { canvas } = await paintedCard(template.code, publicToken);
      const image = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
      expect(jsQR(image.data, image.width, image.height)?.data).toBe(postcardPublicUrl(publicToken));
      const quiet = canvas.getContext("2d").getImageData(POSTCARD_QR.x, POSTCARD_QR.y, 1, 1).data;
      expect(Array.from(quiet)).toEqual([255, 255, 255, 255]);
    }
  }, 30_000);

  it("writes one correct physical-density chunk without changing PNG image data", async () => {
    const { png } = await paintedCard();
    const chunks = pngChunks(new Uint8Array(await png.arrayBuffer()));
    const physical = chunks.filter((c) => c.type === "pHYs");
    expect(physical).toHaveLength(1);
    const view = new DataView(physical[0].data.buffer);
    expect(view.getUint32(0)).toBe(12000);
    expect(view.getUint32(4)).toBe(12000);
    expect(view.getUint8(8)).toBe(1);
    const repeat = await withPostcardPrintDensity(png);
    expect(new Uint8Array(await repeat.arrayBuffer())).toEqual(new Uint8Array(await png.arrayBuffer()));
  });

  it("exports exact stored canonical PNG bytes and explicit physical print dimensions", async () => {
    const { png } = await paintedCard();
    const cards = [{ publicToken: token, blob: png }];
    const zipBlob = await createPostcardZip("new-year", cards);
    const zip = await JSZip.loadAsync(await zipBlob.arrayBuffer());
    const saved = await zip.file(`new-year-v1-${token}.png`)!.async("uint8array");
    expect(saved).toEqual(new Uint8Array(await png.arrayBuffer()));
    const photoHtml = await (await createPostcardPrintHtml("new-year", cards)).text();
    expect(photoHtml).toContain("size:100mm 150mm");
    expect(photoHtml).toContain("width:100mm;height:150mm");
    expect(photoHtml).toContain("data:image/png;base64,");
    const a4Html = await (await createPostcardPrintHtml("new-year", cards, "a4")).text();
    expect(a4Html).toContain("size:A4 portrait");
  });

  it("rejects duplicate IDs, bad tokens and oversized export selections", async () => {
    const { png } = await paintedCard();
    const card = { publicToken: token, blob: png };
    await expect(createPostcardZip("new-year", [card, card])).rejects.toThrow("повторяется");
    await expect(createPostcardZip("new-year", new Array(MAX_POSTCARD_EXPORT_COUNT + 1).fill(card))).rejects.toThrow(
      "от 1 до 20",
    );
    expect(() => postcardPublicUrl("../../other")).toThrow("Некорректный номер");
  });

  it("prints four-digit PINs with leading zeros and keeps legacy inserts compatible", async () => {
    const html = await createShopActivationInsertHtml("Shop", "0042", 2).text();
    expect(html.match(/class="code">0042</g)).toHaveLength(2);
    expect(html).not.toContain("/card/");
    expect(() => createShopActivationInsertHtml("Shop", "42")).toThrow();
    expect(() => createShopActivationInsertHtml("Shop", "12a4")).toThrow();
  });

  it("keeps shared shop activation codes on separate escaped inserts", async () => {
    const html = await createShopActivationInsertHtml('<script>alert("x")</script>', "ABCDEF123456", 3).text();
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain('<script>alert("x")</script>');
    expect(html.match(/ABCD · EF12 · 3456/g)).toHaveLength(3);
    expect(html).not.toContain("/card/");
  });
});
