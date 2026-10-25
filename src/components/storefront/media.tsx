import Image from "next/image";
import { resolveCatalogImageUrl } from "@/lib/storage/image-url";

export function Media({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "(max-width: 640px) 50vw, 25vw",
}: {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const resolved = resolveCatalogImageUrl(src) ?? src;
  return (
    <div className={`media ${className}`}>
      {resolved ? (
        <Image
          src={resolved}
          alt={alt}
          fill
          sizes={sizes}
          // Next 16 deprecates `priority`; eager + high fetch priority is the
          // recommended LCP treatment and survives viewport-dependent LCPs.
          loading={priority ? "eager" : undefined}
          fetchPriority={priority ? "high" : undefined}
          // Demo sandbox uploads (sbx-…) exist only for the visitor's own requests.
          unoptimized={
            resolved.endsWith(".svg") ||
            resolved.startsWith("http") ||
            resolved.startsWith("/uploads/") ||
            resolved.startsWith("/hero/") ||
            resolved.startsWith("/catalog/")
          }
        />
      ) : (
        <span className="media-fallback">Image unavailable</span>
      )}
    </div>
  );
}
