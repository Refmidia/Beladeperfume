import "../src/db/load-env";
import { like } from "drizzle-orm";
import { db, closeDb } from "../src/db";
import { productImages } from "../src/db/schema";

async function main() {
  const uploads = await db
    .select({ url: productImages.url, productId: productImages.productId })
    .from(productImages)
    .where(like(productImages.url, "%/uploads/%"));
  console.log(JSON.stringify(uploads, null, 2));
}

main().finally(closeDb);
