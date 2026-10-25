/** Linhas NOME;CUSTO_REAIS;VENDA_SUGERIDA_REAIS — catálogo Bela de Perfume. */
export const SUPPLIER_CATALOG_LINES = `
Yara Candy;160;229
Yara Rose;160;229
Yara Branco;160;229
Yara Pink;160;229
Asad Preto;160;229
Asad Elixir;180;259
Asad Bourbon;180;259
Sabah;200;289
Veneno (qualquer cor);220;319
Vulcan (qualquer cor);220;319
Hawas (qualquer cor);280;399
Musamam;310;449
Shagaf;150;219
Bon Bon;200;289
Angham;200;289
Club de Nuit (qualquer cor);190;279
Nebras Elixir;210;299
Atheeri (Abelha);280;399
212 VIP Black;280;399
212 Red;220;319
CK;220;319
Ater Wesal;240;349
9 PM (qualquer cor);240;349
Silver Scent;220;319
Prada Feminino;220;319
Good Girl;250;359
Libre;220;319
Hermès;400;569
Bleu de Chanel;390;549
Phantom;220;319
La Vie Est Belle;220;319
Afif Pavão;350;499
Fakhar Lattafa Gold;200;289
Fakhar Lattafa Branco;200;289
Fakhar Lattafa Preto;200;289
Ferrari Scuderia;320;459
Odyssey Candee;200;289
Odyssey Mandarin Sky;200;289
Odyssey Artisto;200;289
Historic Olmeda;220;319
Historic Doria;220;319
Historic Sahara;220;319
Khamrah Lattafa;280;399
Najdia;250;359
Dalal;350;499
Valentino Uomo;220;319
Si Preto e Vermelho;220;319
Maison Paris 200 ml;450;649
Xerjoff Overdose;900;1290
Xerjoff Opera;900;1290
Xerjoff Coro;900;1290
Pistachio Anfar;220;319
No.2 Men 80 ml;250;359
Luantee 100 ml;250;359
Asool Verde 100 ml;220;319
Opulent Musk 100 ml;250;359
Opulent Oud 100 ml;250;359
Maahir 100 ml;200;289
`.trim();

export type SupplierCatalogRow = {
  name: string;
  costReais: number;
  suggestedReais: number;
  importKey: string;
  colorVariantsPending: boolean;
  sizeMl: number;
};

const SIZE_ML = /(\d+)\s*ml/i;

export function parseSupplierCatalog(raw: string): SupplierCatalogRow[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, cost, suggested] = line.split(";").map((p) => p.trim());
      if (!name || !cost || !suggested) throw new Error(`Invalid catalog line: ${line}`);
      const costReais = Number(cost);
      const suggestedReais = Number(suggested);
      if (!Number.isFinite(costReais) || !Number.isFinite(suggestedReais))
        throw new Error(`Invalid amounts: ${line}`);
      const colorVariantsPending = /\(qualquer cor\)/i.test(name);
      const sizeMatch = name.match(SIZE_ML);
      const sizeMl = sizeMatch ? Number(sizeMatch[1]) : 100;
      const importKey = name
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      return {
        name: name.replace(/\s*\(qualquer cor\)/i, "").trim(),
        costReais,
        suggestedReais,
        importKey,
        colorVariantsPending,
        sizeMl,
      };
    });
}
