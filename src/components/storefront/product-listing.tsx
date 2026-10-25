import Link from "next/link";
import { ChevronLeft, ChevronRight, SearchX, X } from "lucide-react";
import { queryCatalog, getFacets } from "@/lib/catalog/query";
import { catalogHref, label, type SearchParams } from "@/lib/catalog/params";
import { formatMoney } from "@/lib/money";
import { ProductCard } from "./product-card";
import { Filters, MobileFilters, SortSelect } from "./filters";
import { copy } from "@/lib/storefront/copy";
import { Breadcrumbs } from "./ui";
/**
 * Shared catalog page: /products, /brands/[slug], /c/[slug] and /search.
 * Filters live in the URL, so every state is linkable and server-rendered.
 */
export async function ProductListing({
  title,
  description,
  path,
  searchParams,
  scope = {},
  hero,
  crumbs = [[copy.common.home, "/"], [title]],
}: {
  title: string;
  description?: string | null;
  path: string;
  searchParams: SearchParams;
  scope?: Record<string, unknown>;
  hero?: React.ReactNode;
  crumbs?: [string, string?][];
}) {
  const [result, facets] = await Promise.all([
    queryCatalog(searchParams, { scope }),
    getFacets(searchParams, scope),
  ]);
  const active = Object.entries(result.params)
    .filter(
      ([key, value]) =>
        !["q", "sort", "page"].includes(key) &&
        value !== undefined &&
        value !== false &&
        (Array.isArray(value) ? value.length > 0 : true),
    )
    .map(([key, value]) => [key, Array.isArray(value) ? value : String(value)] as [string, string | string[]]);
  const clear = catalogHref(path, { q: searchParams.q, sort: searchParams.sort });
  const chip = (key: string, item: string) =>
    key === "inStock"
      ? copy.filters.inStock
      : key === "deal"
        ? copy.filters.onSale
        : key === "new"
          ? copy.filters.newArrivals
          : ["minPrice", "maxPrice"].includes(key)
            ? `${key === "minPrice" ? copy.filters.from : copy.filters.upTo} ${formatMoney(Number(item))}`
            : label(facets[key]?.find((o) => o.value === item)?.label ?? item);
  // Phones get one-tap toggles beside Filters and Sort (a scrolling chip row, app-shell.css).
  const genders = (result.params.gender ?? []) as string[];
  const quick = [
    ...(["inStock", "deal", "new"] as const)
      .filter((key) => scope[key] === undefined)
      .map((key) => ({
        key,
        text: key === "inStock" ? copy.filters.inStock : key === "deal" ? copy.filters.onSale : copy.filters.new,
        on: !!result.params[key],
        href: catalogHref(path, searchParams, { [key]: result.params[key] ? undefined : "true", page: undefined }),
      })),
    ...(scope.gender === undefined
      ? (["men", "women", "unisex"] as const).map((g) => ({
          key: g,
          text: label(g),
          on: genders.includes(g),
          href: catalogHref(path, searchParams, {
            gender: genders.includes(g) ? genders.filter((x) => x !== g) : [...genders, g],
            page: undefined,
          }),
        }))
      : []),
  ];
  const pages = Array.from({ length: result.pages }, (_, i) => i + 1).filter(
    (page) => page === 1 || page === result.pages || Math.abs(page - result.page) <= 1,
  );
  return (
    <div className="store-width listing-page">
      <Breadcrumbs items={crumbs} />
      <header className="listing-header">
        <div>
          <h1>{title}</h1>
          {description && <p className="listing-description">{description}</p>}
        </div>
        {hero && <div className="listing-hero">{hero}</div>}
      </header>
      <div className="listing-layout">
        <Filters facets={facets} />
        <div className="listing-main">
          <div className="listing-toolbar">
            <MobileFilters facets={facets} />
            <p className="listing-count">
              <strong>{result.total}</strong> {copy.listing.fragrance(result.total)}
            </p>
            <SortSelect value={searchParams.sort ? result.params.sort : ((scope.sort as string) ?? "newest")} />
            <div className="quick-filters">
              {quick.map((q) => (
                <Link key={q.key} href={q.href} scroll={false} className="chip" data-on={q.on || undefined} aria-label={`${q.on ? copy.filters.removeFilter : copy.filters.filter}: ${q.text}`}>
                  {q.text}
                </Link>
              ))}
            </div>
          </div>
          {active.length > 0 && (
            <div className="active-filters" aria-label={copy.filters.active}>
              {active.flatMap(([key, value]) =>
                (Array.isArray(value) ? value : [value]).map((item) => (
                  <Link
                    key={`${key}-${item}`}
                    scroll={false}
                    className="chip removable"
                    href={catalogHref(path, searchParams, {
                      [key]: Array.isArray(value) ? value.filter((v) => v !== item) : undefined,
                      page: undefined,
                    })}
                    aria-label={`${copy.filters.removeFilter}: ${chip(key, item)}`}
                  >
                    {chip(key, item)} <X size={13} aria-hidden />
                  </Link>
                )),
              )}
              <Link href={clear} scroll={false} className="text-link">
                {copy.filters.clearAll}
              </Link>
            </div>
          )}
          {result.items.length ? (
            <div className="product-grid">
              {result.items.map((p, index) => (
                <ProductCard key={p.id} product={p} priority={index < 3} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="icon-tile lg">
                <SearchX size={22} aria-hidden />
              </span>
              <h2>{copy.listing.noResults}</h2>
              <p>
                {searchParams.gender?.length
                  ? copy.listing.noResultsGenderHint
                  : copy.listing.noResultsHint}
              </p>
              <Link href={clear} className="button">
                {copy.listing.clearFilters}
              </Link>
            </div>
          )}
          {result.pages > 1 && (
            <nav className="pagination" aria-label={copy.listing.pagination}>
              {result.page > 1 ? (
                <Link className="button icon" aria-label={copy.listing.previous} href={catalogHref(path, searchParams, { page: result.page - 1 })}>
                  <ChevronLeft size={16} />
                </Link>
              ) : (
                <span className="button icon" aria-disabled>
                  <ChevronLeft size={16} />
                </span>
              )}
              {pages.map((page, i) => (
                <span key={page} className="pagination-item">
                  {i > 0 && page - pages[i - 1] > 1 && <span className="pagination-gap">…</span>}
                  <Link
                    className="button icon"
                    aria-current={page === result.page ? "page" : undefined}
                    href={catalogHref(path, searchParams, { page })}
                  >
                    {page}
                  </Link>
                </span>
              ))}
              {result.page < result.pages ? (
                <Link className="button icon" aria-label={copy.listing.next} href={catalogHref(path, searchParams, { page: result.page + 1 })}>
                  <ChevronRight size={16} />
                </Link>
              ) : (
                <span className="button icon" aria-disabled>
                  <ChevronRight size={16} />
                </span>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
