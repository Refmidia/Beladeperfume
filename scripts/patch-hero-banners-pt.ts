/**
 * Atualiza textos dos banners hero no banco (admin → Banners).
 * Uso: npx tsx scripts/patch-hero-banners-pt.ts
 */
import "../src/db/load-env";
import { asc, eq } from "drizzle-orm";
import { db, closeDb } from "@/db";
import { banners } from "@/db/schema";
import { homepageHeroSlides } from "@/lib/storefront/copy";

async function main() {
  const heroes = await db
    .select()
    .from(banners)
    .where(eq(banners.placement, "hero"))
    .orderBy(asc(banners.sortOrder));
  for (let i = 0; i < heroes.length; i++) {
    const preset = homepageHeroSlides[i];
    if (!preset) break;
    await db
      .update(banners)
      .set({
        title: preset.title,
        subtitle: preset.subtitle,
        ctaLabel: preset.ctaLabel,
        href: heroes[i].href ?? preset.href,
        updatedAt: new Date(),
      })
      .where(eq(banners.id, heroes[i].id));
  }
  console.log(`Atualizados ${Math.min(heroes.length, homepageHeroSlides.length)} slide(s) hero em português.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(closeDb);
