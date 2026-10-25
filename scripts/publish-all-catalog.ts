/**
 * Ativa todos os produtos do catálogo na vitrine e na home (destaque).
 * Uso: node --import tsx scripts/publish-all-catalog.ts
 */
import "../src/db/load-env";
import { eq } from "drizzle-orm";
import { db, closeDb } from "../src/db";
import { homepageSections, productVariants, products } from "../src/db/schema";

const SIZE_IN_NAME = /(\d+)\s*ml/i;

async function main() {
  const rows = await db.select().from(products);
  let productsUpdated = 0;
  let variantsUpdated = 0;

  for (const p of rows) {
    const meta = { ...(p.meta as Record<string, unknown>) };
    meta.brandPending = false;
    meta.volumePending = false;
    meta.versionPending = false;
    meta.colorVariantsPending = false;
    meta.duplicateReview = false;

    await db
      .update(products)
      .set({
        isActive: true,
        isFeatured: true,
        meta,
        updatedAt: new Date(),
      })
      .where(eq(products.id, p.id));
    productsUpdated++;

    const variants = await db.select().from(productVariants).where(eq(productVariants.productId, p.id));
    for (const v of variants) {
      const mlMatch = p.name.match(SIZE_IN_NAME);
      const sizeMl = v.sizeMl ?? (mlMatch ? Number(mlMatch[1]) : v.sizeMl);
      const sizeLabel =
        v.sizeLabel && v.sizeLabel !== "Volume a confirmar"
          ? v.sizeLabel
          : sizeMl != null
            ? `${sizeMl} ml`
            : v.sizeLabel;
      await db
        .update(productVariants)
        .set({
          isActive: true,
          sizeMl,
          sizeLabel,
          updatedAt: new Date(),
        })
        .where(eq(productVariants.id, v.id));
      variantsUpdated++;
    }
  }

  const carousels = await db
    .select()
    .from(homepageSections)
    .where(eq(homepageSections.type, "product_carousel"));
  for (const section of carousels) {
    const config = {
      ...(section.config as Record<string, unknown>),
      limit: 58,
    };
    await db
      .update(homepageSections)
      .set({ config, updatedAt: new Date() })
      .where(eq(homepageSections.id, section.id));
  }

  console.log(
    `Publicados: ${productsUpdated} produtos, ${variantsUpdated} variantes. Destaque e carrosséis da home (até 58).`,
  );
}

main()
  .then(() => closeDb())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
