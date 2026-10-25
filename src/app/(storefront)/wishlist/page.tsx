import { notFound } from "next/navigation";
import { WishlistPage } from "@/components/storefront/wishlist";
import { RecentlyViewed } from "@/components/storefront/recently-viewed";
import { Breadcrumbs } from "@/components/storefront/ui";
import { storeConfig } from "../../../../store.config";

import { copy } from "@/lib/storefront/copy";
export const metadata = { title: copy.meta.wishlist, robots: { index: false, follow: true } };

export default function Page() {
  if (!storeConfig.features.wishlist) notFound();
  return (
    <div className="store-width listing-page wishlist-page">
      <Breadcrumbs items={[[copy.common.home, "/"], [copy.wishlist.title]]} />
      <WishlistPage />
      {storeConfig.features.recentlyViewed && <RecentlyViewed />}
    </div>
  );
}
