import { storeConfig as config } from "../../../store.config";

/** Grande SP: capital + região metropolitana comum em e-commerce. */
const GRANDE_SP_CITY_HINTS = [
  "sao paulo",
  "são paulo",
  "guarulhos",
  "osasco",
  "santo andre",
  "santo andré",
  "sao bernardo",
  "são bernardo",
  "sao caetano",
  "são caetano",
  "maua",
  "mauá",
  "diadema",
  "barueri",
  "carapicuiba",
  "carapicuíba",
  "taboao",
  "taboão",
  "embu",
  "cotia",
  "itapecerica",
  "ferraz",
  "franco da rocha",
  "itaqua",
  "jundiai",
  "jundiaí",
  "sorocaba",
  "campinas",
];

function normalizePlace(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

/** Escolhe a zona de frete a partir de cidade e CEP (sem dropdown). */
export function inferDeliveryZoneId(city: string, postalCode = "") {
  const cityNorm = normalizePlace(city);
  const cep = postalCode.replace(/\D/g, "");
  if (cep.length >= 8) {
    const prefix = Number(cep.slice(0, 5));
    if (prefix >= 1000 && prefix <= 19999) return "grande-sp";
  }
  if (GRANDE_SP_CITY_HINTS.some((hint) => cityNorm.includes(normalizePlace(hint)))) {
    return "grande-sp";
  }
  return config.checkout.deliveryZones.find((z) => z.id === "brasil")?.id
    ?? config.checkout.deliveryZones[0]?.id
    ?? "brasil";
}

export function deliveryZoneById(zoneId: string) {
  return config.checkout.deliveryZones.find((z) => z.id === zoneId);
}
