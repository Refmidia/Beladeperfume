import { createHash } from "node:crypto";
import { pricingFromCost, supplierReaisToMinor } from "@/lib/pricing/supplier";

/** Colunas aceitas (UTF-8 BOM, separador ;). */
const HEADER_ALIASES: Record<string, keyof BelaCatalogCsvRow> = {
  nome_fornecedor: "supplierName",
  nome: "supplierName",
  nome_original: "supplierName",
  marca: "brandName",
  marca_provavel: "brandName",
  volume_ml: "volumeMl",
  volume: "volumeMl",
  custo_brl: "costBrl",
  custo: "costBrl",
  preco_pix_47_brl: "pixBrl",
  preco_cartao_53_brl: "cardBrl",
  venda_sugerida_fornecedor: "suggestedBrl",
  venda_sugerida: "suggestedBrl",
  status: "status",
  observacao: "observacao",
};

export type BelaCatalogCsvRow = {
  /** Nome exatamente como veio do fornecedor (preservado). */
  supplierName: string;
  brandName: string;
  volumeMl: number | null;
  costBrl: number;
  pixBrl: number | null;
  cardBrl: number | null;
  suggestedBrl: number | null;
  status: string;
  observacao: string;
  importKey: string;
  colorVariantsPending: boolean;
  brandPending: boolean;
  volumePending: boolean;
  versionPending: boolean;
  duplicateReview: boolean;
  duplicateReviewGroup: string | null;
  lineNumber: number;
};

export type CsvParseIssue = {
  line: number;
  message: string;
  severity: "error" | "warn";
};

export type CsvParseResult = {
  rows: BelaCatalogCsvRow[];
  issues: CsvParseIssue[];
};

function stripBom(text: string) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** Separa por `;` respeitando aspas (observações com ponto e vírgula). */
export function splitSemicolonCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i]!;
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (c === ";" && !inQuotes) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur.trim());
  return out;
}

function parseMoney(raw: string, field: string, line: number, issues: CsvParseIssue[]): number | null {
  const t = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) {
    issues.push({ line, message: `${field} inválido: "${raw}"`, severity: "error" });
    return null;
  }
  return n;
}

function parseVolume(raw: string, line: number, issues: CsvParseIssue[]): number | null {
  const t = raw.trim();
  if (!t || /^null$/i.test(t) || t === "-") return null;
  const n = Number(t.replace(",", "."));
  if (!Number.isInteger(n) || n <= 0) {
    issues.push({ line, message: `volume_ml inválido: "${raw}"`, severity: "error" });
    return null;
  }
  return n;
}

function importKeyFromName(supplierName: string) {
  return supplierName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Famílias com variantes de cor/nome parecidas — revisão manual (ex.: linha Yara). */
function duplicateReviewGroup(supplierName: string): string | null {
  const base = supplierName.replace(/\s*\(qualquer cor\)/i, "").trim();
  if (/^yara\b/i.test(base)) return "yara-line";
  if (/^fakhar\b/i.test(base)) return "fakhar-lattafa-line";
  if (/^odyssey\b/i.test(base)) return "odyssey-line";
  if (/^historic\b/i.test(base)) return "historic-line";
  if (/^xerjoff\b/i.test(base)) return "xerjoff-line";
  return null;
}

function attachDuplicateFlags(rows: BelaCatalogCsvRow[]) {
  const groups = new Map<string, BelaCatalogCsvRow[]>();
  for (const row of rows) {
    if (!row.duplicateReviewGroup) continue;
    const list = groups.get(row.duplicateReviewGroup) ?? [];
    list.push(row);
    groups.set(row.duplicateReviewGroup, list);
  }
  for (const [, list] of groups) {
    if (list.length < 2) continue;
    for (const row of list) row.duplicateReview = true;
  }
}

function validateComputedPrices(row: BelaCatalogCsvRow, issues: CsvParseIssue[]) {
  const costMinor = supplierReaisToMinor(row.costBrl);
  const expected = pricingFromCost({ costMinor });
  const expectedPix = expected.pricePixMinor / 100;
  const expectedCard = expected.priceCardMinor / 100;
  const tol = 0.02;
  if (row.pixBrl != null && Math.abs(row.pixBrl - expectedPix) > tol) {
    issues.push({
      line: row.lineNumber,
      message: `preço Pix no CSV (${row.pixBrl}) difere do calculado (${expectedPix.toFixed(2)}).`,
      severity: "warn",
    });
  }
  if (row.cardBrl != null && Math.abs(row.cardBrl - expectedCard) > tol) {
    issues.push({
      line: row.lineNumber,
      message: `preço cartão no CSV (${row.cardBrl}) difere do calculado (${expectedCard.toFixed(2)}).`,
      severity: "warn",
    });
  }
}

export function parseBelaCatalogCsv(raw: string): CsvParseResult {
  const issues: CsvParseIssue[] = [];
  const text = stripBom(raw).replace(/\r\n/g, "\n").trim();
  if (!text) return { rows: [], issues: [{ line: 0, message: "Arquivo vazio.", severity: "error" }] };

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const headerCells = splitSemicolonCsvLine(lines[0]!).map((c) => c.trim().toLowerCase());
  const hasHeader = headerCells.some((h) => h in HEADER_ALIASES);
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const colIndex: Partial<Record<keyof BelaCatalogCsvRow, number>> = {};

  if (hasHeader) {
    headerCells.forEach((h, i) => {
      const key = HEADER_ALIASES[h];
      if (key) colIndex[key] = i;
    });
    if (colIndex.supplierName === undefined || colIndex.costBrl === undefined) {
      issues.push({
        line: 1,
        message: "Cabeçalho precisa incluir nome_fornecedor (ou nome) e custo_brl (ou custo).",
        severity: "error",
      });
      return { rows: [], issues };
    }
  }

  const rows: BelaCatalogCsvRow[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const lineNumber = hasHeader ? i + 2 : i + 1;
    const parts = splitSemicolonCsvLine(dataLines[i]!);
    let supplierName: string;
    let brandName: string;
    let volumeRaw: string;
    let costRaw: string;
    let suggestedRaw: string;
    let pixRaw: string;
    let cardRaw: string;
    let statusRaw: string;
    let observacaoRaw: string;

    if (hasHeader) {
      supplierName = parts[colIndex.supplierName!] ?? "";
      brandName = colIndex.brandName !== undefined ? (parts[colIndex.brandName] ?? "") : "";
      volumeRaw = colIndex.volumeMl !== undefined ? (parts[colIndex.volumeMl] ?? "") : "";
      costRaw = parts[colIndex.costBrl!] ?? "";
      suggestedRaw =
        colIndex.suggestedBrl !== undefined ? (parts[colIndex.suggestedBrl] ?? "") : "";
      pixRaw = colIndex.pixBrl !== undefined ? (parts[colIndex.pixBrl] ?? "") : "";
      cardRaw = colIndex.cardBrl !== undefined ? (parts[colIndex.cardBrl] ?? "") : "";
      statusRaw = colIndex.status !== undefined ? (parts[colIndex.status] ?? "") : "";
      observacaoRaw = colIndex.observacao !== undefined ? (parts[colIndex.observacao] ?? "") : "";
    } else {
      supplierName = parts[0] ?? "";
      costRaw = parts[1] ?? "";
      suggestedRaw = parts[2] ?? "";
      brandName = "";
      volumeRaw = "";
      pixRaw = "";
      cardRaw = "";
      statusRaw = "";
      observacaoRaw = "";
      const ml = supplierName.match(/(\d+)\s*ml/i);
      if (ml) volumeRaw = ml[1]!;
    }

    if (!supplierName) {
      issues.push({ line: lineNumber, message: "Nome do fornecedor ausente.", severity: "error" });
      continue;
    }

    const costBrl = parseMoney(costRaw, "custo_brl", lineNumber, issues);
    if (costBrl === null) continue;

    const suggestedBrl = suggestedRaw
      ? parseMoney(suggestedRaw, "venda_sugerida", lineNumber, issues)
      : null;
    const pixBrl = pixRaw ? parseMoney(pixRaw, "preco_pix_47_brl", lineNumber, issues) : null;
    const cardBrl = cardRaw ? parseMoney(cardRaw, "preco_cartao_53_brl", lineNumber, issues) : null;

    let volumeMl = parseVolume(volumeRaw, lineNumber, issues);
    if (volumeMl === null && !volumeRaw && !hasHeader) {
      const ml = supplierName.match(/(\d+)\s*ml/i);
      volumeMl = ml ? Number(ml[1]) : null;
    }

    const status = statusRaw.trim().toLowerCase();
    const colorVariantsPending = /\(qualquer cor\)/i.test(supplierName);
    const brandPending = !brandName.trim();
    const volumePending = volumeMl === null;
    const versionPending = status === "revisar" || /confirmar/i.test(observacaoRaw);

    const row: BelaCatalogCsvRow = {
      supplierName,
      brandName: brandName.trim(),
      volumeMl,
      costBrl,
      pixBrl,
      cardBrl,
      suggestedBrl,
      status,
      observacao: observacaoRaw.trim(),
      importKey: importKeyFromName(supplierName),
      colorVariantsPending,
      brandPending,
      volumePending,
      versionPending,
      duplicateReview: false,
      duplicateReviewGroup: duplicateReviewGroup(supplierName),
      lineNumber,
    };
    validateComputedPrices(row, issues);
    rows.push(row);
  }

  const keys = new Set<string>();
  for (const row of rows) {
    if (keys.has(row.importKey)) {
      issues.push({
        line: row.lineNumber,
        message: `Chave de importação duplicada (${row.importKey}).`,
        severity: "error",
      });
    }
    keys.add(row.importKey);
  }

  attachDuplicateFlags(rows);
  for (const row of rows) {
    if (row.duplicateReview) {
      issues.push({
        line: row.lineNumber,
        message: `Revisar manualmente: possível equivalência na família "${row.duplicateReviewGroup}".`,
        severity: "warn",
      });
    }
    if (row.colorVariantsPending) {
      issues.push({
        line: row.lineNumber,
        message: "Variantes de cor pendentes — cadastre cada cor antes de publicar.",
        severity: "warn",
      });
    }
  }

  return { rows, issues };
}

export function csvContentHash(raw: string) {
  return createHash("sha256").update(stripBom(raw)).digest("hex").slice(0, 16);
}

export type ImportPreviewRow = BelaCatalogCsvRow & {
  action: "create" | "update" | "skip";
  note?: string;
};

export type ImportPreviewReport = {
  hash: string;
  total: number;
  creates: number;
  updates: number;
  skips: number;
  errors: CsvParseIssue[];
  warnings: CsvParseIssue[];
  rows: ImportPreviewRow[];
};
