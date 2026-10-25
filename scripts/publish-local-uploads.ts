/**
 * Imagens enviadas no admin ficam em .data/uploads (local).
 * Na Vercel elas não existem — este script copia para public/hero e atualiza o banco.
 *
 * Uso: node --import tsx scripts/publish-local-uploads.ts
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { eq, like } from "drizzle-orm";
import "../src/db/load-env";
import { db, closeDb } from "../src/db";
import { banners, productImages } from "../src/db/schema";

const UPLOADS_DIR = join(process.cwd(), ".data", "uploads");
const PUBLIC_HERO = join(process.cwd(), "public", "hero");
const PUBLIC_CATALOG = join(process.cwd(), "public", "catalog");

function localKeyFromUrl(url: string) {
  const m = url.match(/^\/uploads\/([a-zA-Z0-9-]+\.webp)$/);
  return m?.[1] ?? null;
}

function publishKey(key: string, destBaseName: string, folder: "hero" | "catalog") {
  const src = join(UPLOADS_DIR, key);
  if (!existsSync(src)) {
    console.warn(`Arquivo local ausente: ${src}`);
    return null;
  }
  const dir = folder === "hero" ? PUBLIC_HERO : PUBLIC_CATALOG;
  mkdirSync(dir, { recursive: true });
  const destName = `${destBaseName}.webp`;
  const dest = join(dir, destName);
  copyFileSync(src, dest);
  return folder === "hero" ? `/hero/${destName}` : `/catalog/${destName}`;
}

async function main() {
  let updated = 0;
  const heroRows = await db
    .select()
    .from(banners)
    .where(like(banners.imageUrl, "/uploads/%"));
  for (const [index, row] of heroRows.entries()) {
    const key = localKeyFromUrl(row.imageUrl ?? "");
    if (!key) continue;
    const slug = row.placement === "hero" ? `home-hero-${index + 1}` : `banner-${row.id.slice(0, 8)}`;
    const publicUrl = publishKey(key, slug, "hero");
    if (!publicUrl) continue;
    await db
      .update(banners)
      .set({ imageUrl: publicUrl, updatedAt: new Date() })
      .where(eq(banners.id, row.id));
    console.log(`Banner ${row.title}: ${row.imageUrl} → ${publicUrl}`);
    updated++;
  }

  const imageRows = await db
    .select()
    .from(productImages)
    .where(like(productImages.url, "/uploads/%"));
  for (const row of imageRows) {
    const key = localKeyFromUrl(row.url);
    if (!key) continue;
    const publicUrl = publishKey(key, `product-${row.productId.slice(0, 8)}`, "catalog");
    if (!publicUrl) continue;
    await db.update(productImages).set({ url: publicUrl }).where(eq(productImages.id, row.id));
    console.log(`Produto ${row.productId}: ${publicUrl}`);
    updated++;
  }

  console.log(
    `Publicados: ${updated} imagem(ns) em public/hero ou public/catalog + URLs no Neon. Faça deploy na Vercel.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(closeDb);
