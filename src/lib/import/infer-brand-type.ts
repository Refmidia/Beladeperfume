import type { brands } from "@/db/schema";

type BrandType = (typeof brands.$inferInsert)["brandType"];

/** Slugs conhecidos do catálogo Bela (marca_provavel). */
const BY_SLUG: Record<string, BrandType> = {
  afnan: "arabian",
  "al-rehab": "arabian",
  anfar: "arabian",
  armaf: "arabian",
  lattafa: "arabian",
  rasasi: "arabian",
  "french-avenue": "arabian",

  "calvin-klein": "designer",
  "carolina-herrera": "designer",
  chanel: "designer",
  ferrari: "designer",
  "giorgio-armani": "designer",
  hermes: "designer",
  "jacques-bogart": "designer",
  lancome: "designer",
  prada: "designer",
  rabanne: "designer",
  valentino: "designer",
  "yves-saint-laurent": "designer",

  xerjoff: "niche",

  "catalogo-fornecedor": "local",
  "marca-pendente": "local",
};

/** Nomes exibidos que podem divergir do slug. */
const BY_NAME: Record<string, BrandType> = {
  "catálogo fornecedor": "local",
  "marca pendente": "local",
  hermès: "designer",
};

function normalizeKey(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/** Classifica a casa perfumista para vitrine e filtros (não assume árabe por padrão). */
export function inferBrandType(brandName: string, slug?: string): BrandType {
  const slugKey = slug?.trim().toLowerCase();
  if (slugKey && BY_SLUG[slugKey]) return BY_SLUG[slugKey];

  const nameKey = normalizeKey(brandName);
  if (BY_NAME[nameKey]) return BY_NAME[nameKey];

  for (const [key, type] of Object.entries(BY_SLUG)) {
    if (nameKey === key.replace(/-/g, " ")) return type;
  }

  // Novas marcas do CSV: preferir designer ocidental se o nome for conhecido.
  if (
    /^(chanel|prada|valentino|armani|lancome|lancôme|hermes|hermès|calvin klein|carolina herrera|yves saint laurent|jacques bogart|rabanne|paco rabanne|ferrari|xerjoff)\b/.test(
      nameKey,
    )
  ) {
    return nameKey.includes("xerjoff") ? "niche" : "designer";
  }
  if (/^(afnan|lattafa|armaf|rasasi|anfar|al rehab|french avenue)\b/.test(nameKey)) {
    return "arabian";
  }
  if (/pendente|fornecedor|catálogo|catalogo/.test(nameKey)) {
    return "local";
  }

  return "niche";
}
