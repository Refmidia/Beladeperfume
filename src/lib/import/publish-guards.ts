import type { products, productVariants } from "@/db/schema";

type Product = typeof products.$inferSelect;
type Variant = typeof productVariants.$inferSelect;

export type SupplierProductMeta = {
  supplierDisplayName?: string;
  colorVariantsPending?: boolean;
  brandPending?: boolean;
  volumePending?: boolean;
  versionPending?: boolean;
  duplicateReview?: boolean;
  duplicateReviewGroup?: string | null;
  supplierSuggestedReais?: number;
  lockCostPrice?: boolean;
  lockCatalogFields?: boolean;
};

export function readSupplierMeta(meta: Record<string, unknown>): SupplierProductMeta {
  return meta as SupplierProductMeta;
}

/** Impede publicação na vitrine enquanto houver pendências do catálogo. */
export function publishBlockReasons(
  product: Pick<Product, "meta" | "isActive">,
  variants: Pick<Variant, "sizeMl" | "isActive">[],
): string[] {
  const m = readSupplierMeta(product.meta as Record<string, unknown>);
  const reasons: string[] = [];
  if (m.brandPending) reasons.push("Marca pendente de confirmação.");
  if (m.volumePending || variants.some((v) => v.isActive && v.sizeMl == null))
    reasons.push("Volume (ml) pendente de confirmação.");
  if (m.versionPending) reasons.push("Versão pendente de confirmação.");
  if (m.colorVariantsPending)
    reasons.push("Variantes de cor ainda não identificadas.");
  if (m.duplicateReview)
    reasons.push("Revisão manual de possível duplicata pendente.");
  return reasons;
}

export function canPublishProduct(
  product: Pick<Product, "meta" | "isActive">,
  variants: Pick<Variant, "sizeMl" | "isActive">[],
): boolean {
  return publishBlockReasons(product, variants).length === 0;
}
