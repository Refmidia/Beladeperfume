import { writeFileSync, mkdirSync } from "node:fs";
import { SUPPLIER_CATALOG_LINES } from "../src/db/supplier-catalog";

/** Gera data/bela_de_perfume_catalogo.csv a partir do catálogo embutido (58 linhas). */
function inferBrand(name: string): string {
  const n = name.replace(/\s*\(qualquer cor\)/i, "").trim();
  if (/^(Yara|Asad|Fakhar|Khamrah|Odyssey|Atheeri|Nebras|Angham|Shagaf|Dalal|Najdia|Maahir|Opulent|Asool|Luantee|No\.2)/i.test(n))
    return "Lattafa";
  if (/^Xerjoff/i.test(n)) return "Xerjoff";
  if (/^Club de Nuit/i.test(n)) return "Armaf";
  if (/^212|^CK|^Bleu de Chanel|^Hermès|^Phantom|^La Vie|^Good Girl|^Libre|^Valentino|^Si Preto|^Prada|^Maison Paris/i.test(n))
    return "Designer";
  if (/^Hawas|^Veneno|^Vulcan|^Musamam|^Sabah|^Bon Bon|^Silver Scent|^Ater Wesal|^9 PM|^Afif|^Pistachio|^Historic|^Ferrari/i.test(n))
    return "Árabe / importado";
  return "A confirmar";
}

function inferVolume(name: string): string {
  const m = name.match(/(\d+)\s*ml/i);
  return m ? m[1]! : "";
}

const rows = SUPPLIER_CATALOG_LINES.split("\n")
  .map((l) => l.trim())
  .filter(Boolean)
  .map((line) => {
    const [nome, custo, sugerida] = line.split(";").map((p) => p.trim());
    const marca = inferBrand(nome!);
    const vol = inferVolume(nome!);
    return `${nome};${marca};${vol};${custo};${sugerida}`;
  });

const header = "nome_fornecedor;marca;volume_ml;custo_brl;venda_sugerida_fornecedor";
const body = "\uFEFF" + [header, ...rows].join("\n") + "\n";
mkdirSync("data", { recursive: true });
writeFileSync("data/bela_de_perfume_catalogo.csv", body, "utf8");
console.log(`Gerado data/bela_de_perfume_catalogo.csv (${rows.length} perfumes).`);
