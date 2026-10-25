ALTER TABLE "product_variants" DROP CONSTRAINT IF EXISTS "variants_size_check";--> statement-breakpoint
ALTER TABLE "product_variants" ALTER COLUMN "size_ml" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "variants_size_check" CHECK ("size_ml" IS NULL OR "size_ml" > 0);
