import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { env } from "@/lib/env";
import { s3StorageAdapter } from "@/lib/storage/s3";

export function sanitizeCatalogSlug(raw: string) {
  const slug = raw
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "imagem";
}

function catalogKey(slug: string) {
  const safe = sanitizeCatalogSlug(slug);
  return `catalog/${safe}.webp`;
}

/** Public URL for a catalog WebP (S3 or /catalog on disk). */
export async function publishCatalogWebp(bytes: Uint8Array, slug: string) {
  const safe = sanitizeCatalogSlug(slug);
  const fileName = `${safe}.webp`;

  if (env.STORAGE_ADAPTER === "s3") {
    const key = catalogKey(safe);
    if (!/^catalog\/[a-z0-9-]+\.webp$/.test(key))
      throw new Error("Nome de arquivo inválido.");
    return s3StorageAdapter.putObject(bytes, key);
  }

  if (process.env.VERCEL) {
    throw new Error(
      "STORAGE_CLOUD",
    );
  }

  const dir = join(process.cwd(), "public", "catalog");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, fileName), bytes);
  return `/catalog/${fileName}`;
}
