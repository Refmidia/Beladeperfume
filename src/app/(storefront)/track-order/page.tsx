import { TrackingPage } from "@/components/storefront/order-tracking";
import { copy } from "@/lib/storefront/copy";
export const metadata = { title: copy.meta.trackOrder, robots: { index: false, follow: false } };
export default function Page() { return <TrackingPage />; }
