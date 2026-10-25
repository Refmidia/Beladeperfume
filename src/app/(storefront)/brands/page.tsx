import { Breadcrumbs } from "@/components/storefront/ui";
import { BrandIndex } from "@/components/storefront/brand-index";
import { getNavigation } from "@/lib/catalog/content";
import { copy } from "@/lib/storefront/copy";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(copy.meta.brands, "/brands");
export default async function Brands() {
  const { brands } = await getNavigation();
  return (
    <div className="store-width brand-page">
      <Breadcrumbs items={[[copy.common.home, "/"], [copy.common.brands]]} />
      <header className="listing-header">
        <div>
          <h1>{copy.homepage.fragranceHouses}</h1>
          <p className="listing-description">{copy.listing.houses(brands.length)}</p>
        </div>
      </header>
      <BrandIndex brands={brands} />
    </div>
  );
}
