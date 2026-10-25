/** Rótulos de catálogo em português (sem Zod — seguro para componentes client). */
export const labels: Record<string, string> = {
  men: "Masculino",
  women: "Feminino",
  unisex: "Unissex",
  edt: "EDT",
  edp: "EDP",
  parfum: "Parfum",
  extrait: "Extrait",
  edc: "Colônia (EDC)",
  oil: "Óleo perfumado",
  attar: "Attar",
  standard: "Padrão",
  tester: "Provador",
  sample: "Amostra",
  mini: "Mini",
  gift_set: "Kit presente",
  "under-50": "Até 50 ml",
  "50-99": "50–99 ml",
  "100-plus": "100 ml ou mais",
  designer: "Designer",
  niche: "Nicho",
  arabian: "Árabe",
  celebrity: "Celebridade",
  local: "Brasileira",
  citrus: "Cítrico",
  floral: "Floral",
  woody: "Amadeirado",
  oriental: "Oriental",
  fresh: "Fresco",
  spicy: "Especiado",
  sweet: "Doce",
  musky: "Almiscarado",
  green: "Verde",
  aquatic: "Aquático",
  pending: "Aguardando confirmação",
  confirmed: "Confirmado",
  packed: "Embalado",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
  returned: "Devolvido",
};
export function label(value: string) {
  return (
    labels[value] ??
    value.replaceAll("_", " ").replace(/^./, (c) => c.toUpperCase())
  );
}
