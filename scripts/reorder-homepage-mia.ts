/**
 * Reordena seções da home no estilo Mia de Parfum (lojas já seedadas).
 * Uso: npx tsx scripts/reorder-homepage-mia.ts
 */
import "../src/db/load-env";
import { asc, eq } from "drizzle-orm";
import { db, closeDb } from "@/db";
import { homepageSections } from "@/db/schema";

const order: { match: (title: string | null, type: string) => boolean; sortOrder: number }[] = [
  { match: (_, type) => type === "hero", sortOrder: 0 },
  { match: (title, type) => type === "product_carousel" && /vendid|destaque|featured|alta/i.test(title ?? ""), sortOrder: 1 },
  { match: (_, type) => type === "category_tiles", sortOrder: 2 },
  { match: (_, type) => type === "value_props", sortOrder: 3 },
  { match: (title, type) => type === "product_carousel" && /oferta|deal/i.test(title ?? ""), sortOrder: 4 },
  { match: (_, type) => type === "event_cards", sortOrder: 5 },
  { match: (_, type) => type === "brand_strip", sortOrder: 6 },
  { match: (_, type) => type === "collection_banner", sortOrder: 7 },
  { match: (title, type) => type === "product_carousel" && /lanç|new/i.test(title ?? ""), sortOrder: 8 },
];

async function main() {
  const rows = await db.select().from(homepageSections).orderBy(asc(homepageSections.sortOrder));
  for (const row of rows) {
    const rule =
      order.find((r) => r.match(row.title, row.type)) ??
      { sortOrder: 20 + row.sortOrder };
    await db
      .update(homepageSections)
      .set({ sortOrder: rule.sortOrder, updatedAt: new Date() })
      .where(eq(homepageSections.id, row.id));
    if (row.type === "product_carousel" && row.title && !/vendid|mais/i.test(row.title)) {
      if (/destaque|featured|alta/i.test(row.title)) {
        await db
          .update(homepageSections)
          .set({ title: "Mais vendidos", updatedAt: new Date() })
          .where(eq(homepageSections.id, row.id));
      }
    }
    if (row.type === "value_props" && row.title) {
      await db
        .update(homepageSections)
        .set({ title: "Por que a Bela de Perfume", updatedAt: new Date() })
        .where(eq(homepageSections.id, row.id));
    }
  }
  console.log("Homepage reordenada (layout inspirado em Mia de Parfum). Recarregue a vitrine.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(closeDb);
