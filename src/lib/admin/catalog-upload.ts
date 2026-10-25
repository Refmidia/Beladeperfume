import { publishCatalogWebp } from "@/lib/storage/catalog";
import { MAX_UPLOAD_BYTES, validateImage } from "@/lib/storage/image";
import { env } from "@/lib/env";

export function catalogUploadErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message === "STORAGE_CLOUD") {
    return "Configure armazenamento na nuvem (R2/S3) na Vercel — STORAGE_ADAPTER=s3.";
  }
  if (message === "Storage upload failed.") {
    return "Falha ao gravar no R2. Confira token e bucket (S3_* na Vercel).";
  }
  if (message) return message;
  return env.STORAGE_ADAPTER === "s3"
    ? "Não foi possível enviar a foto para o R2."
    : "Não foi possível enviar a foto.";
}

export async function uploadCatalogBytes(
  bytes: Uint8Array,
  mime: string,
  catalogSlug: string,
) {
  if (!bytes.length || bytes.length > MAX_UPLOAD_BYTES)
    throw new Error("Choose an image under 5 MB.");
  const webp = await validateImage(bytes, mime || "image/webp");
  return publishCatalogWebp(webp, catalogSlug.trim());
}
