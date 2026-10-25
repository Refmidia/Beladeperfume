import { ProductListing } from "@/components/storefront/product-listing";
import { pageMetadata } from "@/lib/seo";
import type { SearchParams } from "@/lib/catalog/params";
import { copy } from "@/lib/storefront/copy";
export const metadata = pageMetadata(copy.metaPages.allFragrances, "/products");
export default async function Products({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <ProductListing
      title={copy.metaPages.allFragrances}
      path="/products"
      searchParams={await searchParams}
    />
  );
}
