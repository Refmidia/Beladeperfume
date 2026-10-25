ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "supplier_import_key" text;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "products_supplier_import_key_idx" ON "products" ("supplier_import_key");--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "supplier_suggested_price" integer;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "markup_pix_percent" integer DEFAULT 47 NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "markup_card_percent" integer DEFAULT 53 NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "card_price" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "made_to_order" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "made_to_order_days" integer;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "stock_reserved" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE "product_variants" SET "card_price" = "retail_price" WHERE "card_price" = 0 AND "retail_price" > 0;--> statement-breakpoint
ALTER TABLE "product_variants" DROP CONSTRAINT IF EXISTS "variants_reserved_check";--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "variants_reserved_check" CHECK ("stock_reserved" >= 0);--> statement-breakpoint
ALTER TABLE "product_variants" DROP CONSTRAINT IF EXISTS "variants_markup_check";--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "variants_markup_check" CHECK ("markup_pix_percent" >= 0 AND "markup_card_percent" >= 0);--> statement-breakpoint
ALTER TABLE "product_variants" DROP CONSTRAINT IF EXISTS "variants_card_price_check";--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "variants_card_price_check" CHECK ("card_price" >= 0);
