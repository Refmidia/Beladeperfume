import { CheckoutPage } from "@/components/storefront/checkout";
import { copy } from "@/lib/storefront/copy";
export const metadata = { title: copy.meta.checkout, robots: { index: false, follow: false } };
export default function Page() { return <CheckoutPage />; }
