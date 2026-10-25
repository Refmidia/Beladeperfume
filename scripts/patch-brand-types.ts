/**
 * Corrige brand_type no Neon após importação (antes tudo ficava "arabian").
 * Uso: node --import tsx scripts/patch-brand-types.ts
 */
import "../src/db/load-env";
import { eq } from "drizzle-orm";
import { db, closeDb } from "../src/db";
import { brands } from "../src/db/schema";
import { inferBrandType } from "../src/lib/import/infer-brand-type";

async function main() {
  const rows = await db.select().from(brands);
  let updated = 0;
  for (const row of rows) {
    const next = inferBrandType(row.name, row.slug);
    if (row.brandType === next) continue;
    await db
      .update(brands)
      .set({ brandType: next, updatedAt: new Date() })
      .where(eq(brands.id, row.id));
    console.log(`${row.name}: ${row.brandType} → ${next}`);
    updated++;
  }
  console.log(`Marcas atualizadas: ${updated}/${rows.length}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(closeDb);
