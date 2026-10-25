import "../src/db/load-env";
import { eq } from "drizzle-orm";
import { db, closeDb } from "../src/db";
import { products } from "../src/db/schema";
import { inferSupplierGender } from "../src/lib/import/infer-gender";

async function main() {
  const rows = await db.select({ id: products.id, name: products.name }).from(products);
  let updated = 0;
  for (const row of rows) {
    const gender = inferSupplierGender(row.name);
    await db.update(products).set({ gender, updatedAt: new Date() }).where(eq(products.id, row.id));
    updated++;
  }
  console.log(`Gênero atualizado em ${updated} produtos.`);
}

main()
  .then(() => closeDb())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
