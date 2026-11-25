export type PostcardFrame = Readonly<{ x: number; y: number; width: number; height: number }>;

export type PostcardPrintTemplate = Readonly<{
  code: string;
  version: 1;
  name: string;
  imagePath: string;
  frame: PostcardFrame;
  ink: string;
}>;

// Normalized inner picture rectangles are inset from decorative borders/corners.
// These bounds describe artwork v1 only. Printed cards retain their stored marker.
export const postcardTemplateCatalog: readonly PostcardPrintTemplate[] = [
  {
    code: "new-year",
    version: 1,
    name: "Новый год",
    imagePath: "postcards/new-year-v1.webp",
    frame: { x: 0.09, y: 0.27, width: 0.82, height: 0.455 },
    ink: "#173a24",
  },
  {
    code: "eid",
    version: 1,
    name: "Ид аль-Фитр",
    imagePath: "postcards/eid-v1.webp",
    frame: { x: 0.1, y: 0.285, width: 0.8, height: 0.46 },
    ink: "#173a24",
  },
  {
    code: "march-8",
    version: 1,
    name: "8 Марта",
    imagePath: "postcards/march-8-v1.webp",
    frame: { x: 0.09, y: 0.19, width: 0.82, height: 0.59 },
    ink: "#a52d47",
  },
  {
    code: "autumn-ball",
    version: 1,
    name: "Осенний бал",
    imagePath: "postcards/autumn-ball-v1.webp",
    frame: { x: 0.09, y: 0.186, width: 0.82, height: 0.56 },
    ink: "#fff0c1",
  },
  {
    code: "best-friend",
    version: 1,
    name: "День рождения ЛП",
    imagePath: "postcards/best-friend-v1.webp",
    frame: { x: 0.08, y: 0.255, width: 0.84, height: 0.47 },
    ink: "#a52d37",
  },
  {
    code: "brother-vip",
    version: 1,
    name: "День рождения друга / брата · VIP",
    imagePath: "postcards/brother-vip-v1.webp",
    frame: { x: 0.1, y: 0.295, width: 0.8, height: 0.45 },
    ink: "#173a24",
  },
];

export function getPostcardTemplate(code: string): PostcardPrintTemplate {
  const template = postcardTemplateCatalog.find((candidate) => candidate.code === code);
  if (!template) throw new Error("Шаблон открытки недоступен. Обновите страницу.");
  return template;
}

export function postcardTemplateImageUrl(templateOrCode: PostcardPrintTemplate | string) {
  const template = typeof templateOrCode === "string" ? getPostcardTemplate(templateOrCode) : templateOrCode;
  return `${import.meta.env.BASE_URL}${template.imagePath}`;
}
