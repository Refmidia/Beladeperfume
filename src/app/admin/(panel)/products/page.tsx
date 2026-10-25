import Link from "next/link";
import { and, asc, count, desc, eq, ilike, sql } from "drizzle-orm";
import { db } from "@/db";
import { products, brands, productImages, productVariants } from "@/db/schema";
import { requireAdmin } from "@/lib/admin/session";
import { ProductList } from "@/components/admin/product-list";
import { PageHeader, Pagination } from "@/components/admin/ui";
import { Plus, Search, X } from "lucide-react";
import { storeConfig } from "../../../../../store.config";
import { adminCopy as t } from "@/lib/admin/copy";
import { SupplierPricingToolbar } from "@/components/admin/supplier-pricing-toolbar";
import { formatMoney } from "@/lib/money";
import { pricingFromCost } from "@/lib/pricing/supplier";
export default async function Products({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const p = await searchParams;
  const page = Math.max(1, Math.min(100000, Number(p.page) || 1));
  const q = (p.q ?? "").slice(0, 160);
  const stock = sql`coalesce((select sum(${productVariants.stockQuantity}) from ${productVariants} where ${productVariants.productId}=${products.id} and ${productVariants.isActive}=true),0)`;
  const reviewPending = sql`(
    coalesce((${products.meta}->>'brandPending')::boolean, false)
    or coalesce((${products.meta}->>'volumePending')::boolean, false)
    or coalesce((${products.meta}->>'versionPending')::boolean, false)
    or coalesce((${products.meta}->>'colorVariantsPending')::boolean, false)
    or coalesce((${products.meta}->>'duplicateReview')::boolean, false)
  )`;
  const where = and(
    q ? ilike(products.name, `%${q}%`) : undefined,
    p.brand ? eq(products.brandId, p.brand) : undefined,
    p.status === "active"
      ? eq(products.isActive, true)
      : p.status === "inactive"
        ? eq(products.isActive, false)
        : undefined,
    p.review === "pending" ? reviewPending : p.review === "ok" ? sql`not ${reviewPending}` : undefined,
    p.volume === "pending"
      ? sql`coalesce((${products.meta}->>'volumePending')::boolean, false)`
      : p.volume
        ? sql`exists (select 1 from ${productVariants} v where v.product_id = ${products.id} and v.size_ml = ${Number(p.volume)})`
        : undefined,
    p.stock === "low"
      ? sql`${stock} <= ${storeConfig.catalog.lowStockThreshold}`
      : p.stock === "out"
        ? sql`${stock}=0`
        : undefined,
  );
  const orderBy = p.sort === "name" ? asc(products.name) : desc(products.createdAt);
  const [rows, b, [total]] = await Promise.all([
    db.query.products.findMany({
      where,
      with: {
        brand: true,
        variants: true,
        images: { orderBy: asc(productImages.sortOrder), limit: 1 },
      },
      orderBy,
      limit: 25,
      offset: (page - 1) * 25,
    }),
    db.select().from(brands).orderBy(asc(brands.name)),
    db.select({ count: count() }).from(products).where(where),
  ]);
  const href = (n: number) =>
    `/admin/products?${new URLSearchParams({ ...Object.fromEntries(Object.entries(p).filter((e): e is [string, string] => Boolean(e[1]))), page: String(n) })}`;
  const filtered = Boolean(q || p.brand || p.status || p.stock || p.review || p.volume || p.sort);
  return (
    <>
      <PageHeader
        title={t.products.title}
        description={t.products.description(total.count, filtered)}
        actions={
          <Link className="admin-btn primary" href="/admin/products/new">
            <Plus size={16} /> {t.products.newProduct}
          </Link>
        }
      />
      <form className="admin-filters">
        <label className="admin-search-field">
          <Search size={16} aria-hidden />
          <input
            name="q"
            type="search"
            aria-label={t.common.search}
            placeholder={t.products.searchPlaceholder}
            defaultValue={q}
          />
        </label>
        <select name="brand" aria-label={t.products.brandFilter} defaultValue={p.brand ?? ""}>
          <option value="">{t.products.allBrands}</option>
          {b.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        <select name="status" aria-label={t.products.visibilityFilter} defaultValue={p.status ?? ""}>
          <option value="">{t.products.anyVisibility}</option>
          <option value="active">{t.products.visibilityVisible}</option>
          <option value="inactive">{t.products.visibilityHidden}</option>
        </select>
        <select name="stock" aria-label={t.products.stockFilter} defaultValue={p.stock ?? ""}>
          <option value="">{t.products.anyStock}</option>
          <option value="low">{t.products.stockLowFilter}</option>
          <option value="out">{t.products.stockOutFilter}</option>
        </select>
        <select name="review" aria-label="Revisão" defaultValue={p.review ?? ""}>
          <option value="">Qualquer revisão</option>
          <option value="pending">Revisão pendente</option>
          <option value="ok">Sem pendências</option>
        </select>
        <select name="volume" aria-label="Volume (ml)" defaultValue={p.volume ?? ""}>
          <option value="">Qualquer volume</option>
          <option value="pending">Volume a confirmar</option>
          <option value="100">100 ml</option>
          <option value="80">80 ml</option>
          <option value="200">200 ml</option>
        </select>
        <select name="sort" aria-label="Ordenar" defaultValue={p.sort ?? ""}>
          <option value="">Mais recentes</option>
          <option value="name">Nome (A–Z)</option>
        </select>
        <button className="admin-btn dark">{t.products.apply}</button>
        {filtered && (
          <Link className="admin-btn ghost" href="/admin/products">
            <X size={14} /> {t.products.clear}
          </Link>
        )}
      </form>
      <SupplierPricingToolbar />
      <ProductList
        key={JSON.stringify(p)}
        rows={rows.map((r) => {
          const meta = r.meta as Record<string, unknown>;
          const reviewPending =
            Boolean(meta.brandPending) ||
            Boolean(meta.volumePending) ||
            Boolean(meta.versionPending) ||
            Boolean(meta.colorVariantsPending) ||
            Boolean(meta.duplicateReview);
          const defaultVariant = r.variants.find((v) => v.isDefault) ?? r.variants[0];
          return {
          id: r.id,
          name: r.name,
          brand: r.brand.name,
          sizeMl: defaultVariant?.sizeMl ?? null,
          sizeLabel: defaultVariant?.sizeLabel ?? null,
          reviewPending,
          concentration: r.concentration,
          isActive: r.isActive,
          isFeatured: r.isFeatured,
          image: r.images[0]?.url ?? null,
          variants: r.variants.length,
          min:
            Math.min(...r.variants.map((v) => v.price), Infinity) === Infinity
              ? 0
              : Math.min(...r.variants.map((v) => v.price)),
          max: Math.max(0, ...r.variants.map((v) => v.price)),
          cost: r.variants[0]?.costPrice ?? null,
          pix: r.variants[0]?.price ?? 0,
          card: r.variants[0]?.cardPrice ?? r.variants[0]?.retailPrice ?? 0,
          suggested: r.variants[0]?.supplierSuggestedPrice ?? null,
          marginPix:
            r.variants[0]?.costPrice != null
              ? pricingFromCost({
                  costMinor: r.variants[0].costPrice!,
                  markupPixPercent: r.variants[0].markupPixPercent,
                }).grossMarginPixPercent
              : null,
          stock: r.variants
            .filter((v) => v.isActive)
            .reduce((sum, v) => sum + v.stockQuantity, 0),
        };
        })}
      />
      <Pagination
        page={page}
        pageSize={25}
        total={total.count}
        noun={t.products.paginationNoun}
        href={href}
      />
    </>
  );
}
