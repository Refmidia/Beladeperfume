/**
 * Importação idempotente do catálogo Bela (CSV UTF-8 BOM, `;`).
 * Rascunho, estoque 0, sem fotos; não sobrescreve produtos com lockCatalogFields.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { count, eq } from "drizzle-orm";
import { db } from "./index";
import { brands, products, productVariants } from "./schema";
import { slugify } from "../lib/slug";
import { applyCostToVariantPricing } from "../lib/pricing/apply";
import {
  DEFAULT_MARKUP_CARD_PERCENT,
  DEFAULT_MARKUP_PIX_PERCENT,
  supplierReaisToMinor,
} from "../lib/pricing/supplier";
import {
  csvContentHash,
  parseBelaCatalogCsv,
  type BelaCatalogCsvRow,
  type ImportPreviewReport,
  type ImportPreviewRow,
} from "../lib/import/bela-catalog-csv";
import { inferBrandType } from "../lib/import/infer-brand-type";
import { inferSupplierGender } from "../lib/import/infer-gender";
import { readSupplierMeta } from "../lib/import/publish-guards";

const DEFAULT_CSV = join(process.cwd(), "data", "bela_de_perfume_catalogo.csv");
const PENDING_BRAND_SLUG = "marca-pendente";
const PENDING_BRAND_NAME = "Marca pendente";

export function loadBelaCatalogCsv(filePath = DEFAULT_CSV): string {
  return readFileSync(filePath, "utf8");
}

const brandCache = new Map<string, string>();

async function ensureBrandByName(name: string | null) {
  const label = name?.trim() || PENDING_BRAND_NAME;
  const slug = name?.trim() ? slugify(name) : PENDING_BRAND_SLUG;
  const cached = brandCache.get(slug);
  if (cached) return cached;
  const brandType = inferBrandType(label, slug);
  const existing = await db.query.brands.findFirst({ where: eq(brands.slug, slug) });
  if (existing) {
    if (existing.brandType !== brandType && slug !== PENDING_BRAND_SLUG) {
      await db
        .update(brands)
        .set({ brandType, updatedAt: new Date() })
        .where(eq(brands.id, existing.id));
    }
    brandCache.set(slug, existing.id);
    return existing.id;
  }
  const [created] = await db
    .insert(brands)
    .values({
      name: label,
      slug,
      brandType,
      description: name?.trim()
        ? `Marca importada do catálogo fornecedor (${label}).`
        : "Marca a confirmar antes de publicar na vitrine.",
      isFeatured: false,
    })
    .returning();
  brandCache.set(slug, created.id);
  return created.id;
}

function productMetaFromRow(row: BelaCatalogCsvRow) {
  return {
    supplierDisplayName: row.supplierName,
    colorVariantsPending: row.colorVariantsPending,
    brandPending: row.brandPending,
    volumePending: row.volumePending,
    versionPending: row.versionPending,
    duplicateReview: row.duplicateReview,
    duplicateReviewGroup: row.duplicateReviewGroup,
    supplierObservacao: row.observacao || undefined,
    supplierStatus: row.status || undefined,
    supplierSuggestedReais: row.suggestedBrl ?? undefined,
    importCsvHash: undefined as string | undefined,
  };
}

function variantPricing(row: BelaCatalogCsvRow) {
  const costMinor = supplierReaisToMinor(row.costBrl);
  const suggestedMinor = row.suggestedBrl != null ? supplierReaisToMinor(row.suggestedBrl) : null;
  return applyCostToVariantPricing({
    costPrice: costMinor,
    markupPixPercent: DEFAULT_MARKUP_PIX_PERCENT,
    markupCardPercent: DEFAULT_MARKUP_CARD_PERCENT,
    price: 0,
    retailPrice: 0,
    cardPrice: 0,
    supplierSuggestedPrice: suggestedMinor,
  });
}

function sizeLabelFor(row: BelaCatalogCsvRow) {
  if (row.volumeMl != null) return `${row.volumeMl} ml`;
  return "Volume a confirmar";
}

export async function previewBelaCatalogImport(
  csvRaw: string,
): Promise<ImportPreviewReport> {
  const { rows, issues } = parseBelaCatalogCsv(csvRaw);
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warn");
  const previewRows: ImportPreviewRow[] = [];

  for (const row of rows) {
    const existing = await db.query.products.findFirst({
      where: eq(products.supplierImportKey, row.importKey),
    });
    if (!existing) {
      previewRows.push({ ...row, action: "create" });
      continue;
    }
    const meta = readSupplierMeta(existing.meta as Record<string, unknown>);
    if (meta.lockCatalogFields) {
      previewRows.push({
        ...row,
        action: "skip",
        note: "Edição manual protegida (lockCatalogFields).",
      });
      continue;
    }
    previewRows.push({ ...row, action: "update" });
  }

  return {
    hash: csvContentHash(csvRaw),
    total: rows.length,
    creates: previewRows.filter((r) => r.action === "create").length,
    updates: previewRows.filter((r) => r.action === "update").length,
    skips: previewRows.filter((r) => r.action === "skip").length,
    errors,
    warnings,
    rows: previewRows,
  };
}

export type ImportRunResult = {
  created: number;
  updated: number;
  skipped: number;
  total: number;
  errors: ImportPreviewReport["errors"];
  warnings: ImportPreviewReport["warnings"];
};

export async function runSupplierCatalogImport(options?: {
  csvPath?: string;
  dryRun?: boolean;
}): Promise<ImportRunResult> {
  brandCache.clear();
  const csvRaw = loadBelaCatalogCsv(options?.csvPath);
  const preview = await previewBelaCatalogImport(csvRaw);
  if (preview.errors.length) {
    return {
      created: 0,
      updated: 0,
      skipped: 0,
      total: preview.total,
      errors: preview.errors,
      warnings: preview.warnings,
    };
  }
  if (options?.dryRun) {
    return {
      created: preview.creates,
      updated: preview.updates,
      skipped: preview.skips,
      total: preview.total,
      errors: preview.errors,
      warnings: preview.warnings,
    };
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const hash = preview.hash;

  for (const row of preview.rows) {
    if (row.action === "skip") {
      skipped++;
      continue;
    }

    const brandId = await ensureBrandByName(row.brandPending ? null : row.brandName);
    const priced = variantPricing(row);
    const costMinor = supplierReaisToMinor(row.costBrl);
    const slug = slugify(row.importKey);
    const sku = `BDP-${row.importKey}`.slice(0, 120);
    const meta = { ...productMetaFromRow(row), importCsvHash: hash };

    const existing = await db.query.products.findFirst({
      where: eq(products.supplierImportKey, row.importKey),
      with: { variants: true },
    });

    if (existing) {
      await db
        .update(products)
        .set({
          name: row.supplierName,
          slug,
          brandId,
          gender: inferSupplierGender(row.supplierName),
          description:
            existing.description || "Cadastro importado — aguardando revisão e fotos.",
          isActive: false,
          meta: { ...(existing.meta as Record<string, unknown>), ...meta },
          updatedAt: new Date(),
        })
        .where(eq(products.id, existing.id));
      const variant = existing.variants[0];
      if (variant) {
        await db
          .update(productVariants)
          .set({
            costPrice: costMinor,
            supplierSuggestedPrice: row.suggestedBrl != null ? supplierReaisToMinor(row.suggestedBrl) : null,
            price: priced.price,
            cardPrice: priced.cardPrice,
            retailPrice: priced.retailPrice,
            sizeMl: row.volumeMl,
            sizeLabel: sizeLabelFor(row),
            stockQuantity: 0,
            isActive: false,
            updatedAt: new Date(),
          })
          .where(eq(productVariants.id, variant.id));
      }
      updated++;
      continue;
    }

    const [product] = await db
      .insert(products)
      .values({
        name: row.supplierName,
        slug,
        brandId,
        description: "Cadastro importado — aguardando revisão, fotos e publicação.",
        gender: inferSupplierGender(row.supplierName),
        concentration: "edp",
        packaging: "standard",
        isActive: false,
        isFeatured: false,
        supplierImportKey: row.importKey,
        meta,
      })
      .returning();

    await db.insert(productVariants).values({
      productId: product.id,
      sku,
      sizeMl: row.volumeMl,
      sizeLabel: sizeLabelFor(row),
      costPrice: costMinor,
      supplierSuggestedPrice: row.suggestedBrl != null ? supplierReaisToMinor(row.suggestedBrl) : null,
      markupPixPercent: DEFAULT_MARKUP_PIX_PERCENT,
      markupCardPercent: DEFAULT_MARKUP_CARD_PERCENT,
      price: priced.price,
      cardPrice: priced.cardPrice,
      retailPrice: priced.retailPrice,
      stockQuantity: 0,
      isDefault: true,
      isActive: false,
    });
    created++;
  }

  return {
    created,
    updated,
    skipped,
    total: preview.total,
    errors: preview.errors,
    warnings: preview.warnings,
  };
}

export async function replaceCatalogWithSupplier(options?: { csvPath?: string }) {
  const [{ n: deleted }] = await db.select({ n: count() }).from(products);
  if (deleted) await db.delete(products);
  const imported = await runSupplierCatalogImport(options);
  return { deleted, ...imported };
}
