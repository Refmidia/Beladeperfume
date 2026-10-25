import { CartPage } from "@/components/storefront/cart";
import { copy } from "@/lib/storefront/copy";
export const metadata = { title: copy.metaPages.yourBag, robots: { index: false, follow: false } };
export default function Page() { return <CartPage />; }
