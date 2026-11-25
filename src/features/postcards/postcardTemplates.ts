export const postcardTemplateCodes = [
  "new-year",
  "eid",
  "march-8",
  "autumn-ball",
  "best-friend",
  "brother-vip",
  "love-meadow",
  "love-moon",
  "milka-gift",
] as const;
export type PostcardTemplateCode = (typeof postcardTemplateCodes)[number];
export type PostcardTemplateCategory = "Любовь" | "Праздники" | "День рождения" | "Подарки";

export type PostcardFrame = Readonly<{ x: number; y: number; width: number; height: number }>;

export type PostcardPrintTemplate = Readonly<{
  code: PostcardTemplateCode;
  version: 1;
  name: string;
  imagePath: string;
  category: PostcardTemplateCategory;
  caption: string;
  searchTerms?: string;
  frame: PostcardFrame;
  ink: string;
}>;

// Normalized inner picture rectangles are inset from decorative borders/corners.
// These bounds describe artwork v1 only. Printed cards retain their stored marker.
export const postcardTemplateCatalog: readonly PostcardPrintTemplate[] = [
  {
    code: "milka-gift",
    version: 1,
    name: "Подарочная корзинка · Milka",
    imagePath: "postcards/milka-gift-v1.webp",
    category: "Подарки",
    caption: "Маленький подарок. Большие чувства.",
    searchTerms: "milka милка шоколад сладкий корзина корзинка подарок сиреневый нежность",
    frame: { x: 0.085, y: 0.255, width: 0.83, height: 0.4 },
    ink: "#fff5e9",
  },
  {
    code: "love-meadow",
    version: 1,
    name: "Любовь — закатное поле",
    imagePath: "postcards/love-meadow-v1.webp",
    category: "Любовь",
    caption: "…идти к счастью вместе.",
    searchTerms: "love is любовь пара поле закат свадьба никах",
    frame: { x: 0.068, y: 0.169, width: 0.863, height: 0.621 },
    ink: "#4d2b11",
  },
  {
    code: "love-moon",
    version: 1,
    name: "Любовь — под луной",
    imagePath: "postcards/love-moon-v1.webp",
    category: "Любовь",
    caption: "…быть светом друг для друга.",
    searchTerms: "love is любовь пара луна ночь moon свадьба никах",
    frame: { x: 0.08, y: 0.156, width: 0.84, height: 0.608 },
    ink: "#f8edd4",
  },

  {
    code: "new-year",
    version: 1,
    name: "Новый год",
    imagePath: "postcards/new-year-v1.webp",
    category: "Праздники",
    caption: "Новогоднее поздравление",
    searchTerms: "зима елка декабрь",
    frame: { x: 0.09, y: 0.27, width: 0.82, height: 0.455 },
    ink: "#173a24",
  },
  {
    code: "eid",
    version: 1,
    name: "Ид аль-Фитр",
    imagePath: "postcards/eid-v1.webp",
    category: "Праздники",
    caption: "Пусть дом будет полон мира и тепла",
    searchTerms: "ураза байрам ид аль фитр Eid",
    frame: { x: 0.1, y: 0.285, width: 0.8, height: 0.46 },
    ink: "#173a24",
  },
  {
    code: "march-8",
    version: 1,
    name: "8 Марта",
    imagePath: "postcards/march-8-v1.webp",
    category: "Праздники",
    caption: "С весенним праздником",
    searchTerms: "весна цветы женщина",
    frame: { x: 0.09, y: 0.19, width: 0.82, height: 0.59 },
    ink: "#a52d47",
  },
  {
    code: "autumn-ball",
    version: 1,
    name: "Осенний бал",
    imagePath: "postcards/autumn-ball-v1.webp",
    category: "Праздники",
    caption: "Осенние воспоминания",
    searchTerms: "осень школьный бал",
    frame: { x: 0.09, y: 0.186, width: 0.82, height: 0.56 },
    ink: "#fff0c1",
  },
  {
    code: "best-friend",
    version: 1,
    name: "День рождения ЛП",
    imagePath: "postcards/best-friend-v1.webp",
    category: "День рождения",
    caption: "Поздравление лучшей подруге",
    searchTerms: "лп дружба подруга",
    frame: { x: 0.08, y: 0.255, width: 0.84, height: 0.47 },
    ink: "#a52d37",
  },
  {
    code: "brother-vip",
    version: 1,
    name: "День рождения друга / брата · VIP",
    imagePath: "postcards/brother-vip-v1.webp",
    category: "День рождения",
    caption: "Особенное поздравление другу или брату",
    searchTerms: "мужчина брат vip",
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

export function postcardTemplateThumbnailUrl(templateOrCode: PostcardPrintTemplate | string) {
  const template = typeof templateOrCode === "string" ? getPostcardTemplate(templateOrCode) : templateOrCode;
  return `${import.meta.env.BASE_URL}postcards/previews/${template.code}-v${template.version}.webp`;
}
