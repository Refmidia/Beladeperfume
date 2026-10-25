/**
 * Resolve /catalog/… paths to the public CDN (R2). Safe for client bundles:
 * NEXT_PUBLIC_CATALOG_CDN is injected at build from S3_PUBLIC_URL (next.config).
 */
export function resolveCatalogImageUrl(
  src: string | null | undefined,
): string | undefined {
  if (!src) return undefined;
  if (/^https?:\/\//i.test(src)) return src;
  const cdn = process.env.NEXT_PUBLIC_CATALOG_CDN?.replace(/\/$/, "");
  if (cdn && src.startsWith("/catalog/")) return `${cdn}${src}`;
  return src;
}

/** Persist full CDN URLs when storage is remote (server-only callers). */
export function absolutizeCatalogImageUrl(
  src: string,
  publicBase: string | undefined,
): string {
  const trimmed = src.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = publicBase?.replace(/\/$/, "");
  if (base && trimmed.startsWith("/catalog/")) return `${base}${trimmed}`;
  return trimmed;
}
