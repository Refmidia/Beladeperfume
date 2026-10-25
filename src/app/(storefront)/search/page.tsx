import { ProductListing } from "@/components/storefront/product-listing";
import { SearchForm } from "@/components/storefront/shell-controls";
import { parseCatalogParams, type SearchParams } from "@/lib/catalog/params";
import { copy } from "@/lib/storefront/copy";
import { pageMetadata } from "@/lib/seo";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q } = parseCatalogParams(await searchParams);
  return {
    ...pageMetadata(q ? copy.searchPage.metaQuery(q) : copy.meta.search, "/search"),
    robots: { index: false, follow: true },
  };
}
export default async function Search({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const raw = await searchParams,
    { q } = parseCatalogParams(raw);
  return (
    <>
      <div className="store-width search-page-form">
        <SearchForm className="page-search" />
      </div>
      <ProductListing
        title={q ? copy.searchPage.resultsFor(q) : copy.searchPage.title}
        path="/search"
        searchParams={raw}
      />
    </>
  );
}
