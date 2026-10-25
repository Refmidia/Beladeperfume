import Link from "next/link";
import { connection } from "next/server";
import { copy } from "@/lib/storefront/copy";
import { storeConfig } from "../../store.config";
export default async function NotFound() {
  // Rendered per request so its scripts get the CSP nonce (src/proxy.ts).
  await connection();
  return (
    <main className="store-width empty-state">
      <Link href="/" className="store-logo">
        {storeConfig.store.name}
      </Link>
      <h1>{copy.errors.pageNotFound}</h1>
      <p>{copy.errors.pageNotFoundHint}</p>
      <Link href="/products" className="button primary">
        {copy.footer.allFragrances}
      </Link>
    </main>
  );
}
