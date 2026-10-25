/** Heurística leve para vitrine Masculino/Feminino (catálogo fornecedor). */
export function inferSupplierGender(name: string): "men" | "women" | "unisex" {
  const n = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (
    /feminino|good girl|\blibre\b|la vie est belle|si preto|prada feminino|bon bon|angham|yara (candy|rose|pink|branco)/.test(
      n,
    )
  ) {
    return "women";
  }

  if (
    /\buomo\b|vip black|asad|hawas|phantom|bleu de chanel|9 pm|club de nuit|silver scent|scuderia|\bck\b|212 red|212 vip|khamrah|nebras|fakhar|musamam|odyssey|historic|xerjoff|no\.2 men|maahir|opulent|atheeri|najdia|dalal|valentino uomo/.test(
      n,
    )
  ) {
    return "men";
  }

  return "unisex";
}
