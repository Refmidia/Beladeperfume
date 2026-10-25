"use server";
import { and, eq, inArray, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "@/lib/zod";
import { db } from "@/db";
import * as s from "@/db/schema";
import { requireAdmin } from "./session";
import {
  couponSchema,
  entitySchemas,
  idListSchema,
  idSchema,
  validationFailure,
  type ActionResult,
  type Entity,
} from "./schema";
import { saveProductRecord } from "./catalog";
import { transitionOrder } from "@/lib/orders/transitions";
import { notifyTestPing } from "@/lib/notify";
import { env } from "@/lib/env";
import { hasDeliveredPurchase } from "@/lib/reviews/server";
import { storeConfig } from "../../../store.config";
import { adminCopy as copy } from "./copy";
import { takeRateLimit } from "@/lib/rate-limit";
import {
  catalogUploadErrorMessage,
  uploadCatalogBytes,
} from "./catalog-upload";
import { MAX_UPLOAD_BYTES } from "@/lib/storage/image";

export async function uploadCatalogImageAction(
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!(await takeRateLimit("upload", user.id, 60)))
    return { ok: false, message: "Muitos envios. Tente de novo em alguns minutos." };
  const file = formData.get("file");
  const catalogSlug = formData.get("catalogSlug");
  if (!(file instanceof Blob) || typeof catalogSlug !== "string" || !catalogSlug.trim())
    return invalidRequest;
  if (file.size > MAX_UPLOAD_BYTES + 65536)
    return { ok: false, message: "Use uma imagem de até 5 MB." };
  try {
    const url = await uploadCatalogBytes(
      new Uint8Array(await file.arrayBuffer()),
      file.type || "image/webp",
      catalogSlug,
    );
    return { ok: true, message: copy.productEditor.catalogUploadOk, url };
  } catch (error) {
    return { ok: false, message: catalogUploadErrorMessage(error) };
  }
}

const tables = {
  brands: s.brands,
  notes: s.notes,
  collections: s.collections,
  banners: s.banners,
  homepage: s.homepageSections,
  pages: s.staticPages,
  customers: s.customers,
};
const invalidRequest: ActionResult = { ok: false, message: copy.messages.invalidRequest };
const knownSaveErrors: Record<string, string> = {
  "Product not found.": copy.messages.productNotFound,
  "A variant does not belong to this product.": copy.messages.variantWrongProduct,
  "Stock changed while you were editing. Reload before saving.": copy.messages.stockChanged,
  "A removed variant belongs to an open order. Keep it until the order is closed.":
    copy.messages.variantOpenOrder,
};
/** Server Action arguments are client-controlled, typed signatures notwithstanding. */
const validId = (id: unknown): id is string => idSchema.safeParse(id).success;
function refresh() {
  revalidatePath("/", "layout");
}
function failure(error: unknown): ActionResult {
  if (error instanceof z.ZodError) return validationFailure(error);
  const message = error instanceof Error ? error.message : "";
  // Driver errors include SQL and values; return a safe message instead.
  if (knownSaveErrors[message]) return { ok: false, message: knownSaveErrors[message] };
  return {
    ok: false,
    message:
      /^(Product not found|A variant|Stock changed|A removed|Order not found|Invalid order|Insufficient stock|Cannot confirm|An ordered|A cancellation|Courier name|A transition)/.test(
        message,
      )
        ? message
        : copy.messages.saveFailedDuplicate,
  };
}
export async function saveProduct(
  id: string | undefined,
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  if (id !== undefined && !validId(id)) return invalidRequest;
  try {
    const saved = await saveProductRecord(id, input);
    refresh();
    return { ok: true, message: copy.messages.productSaved, id: saved };
  } catch (error) {
    return failure(error);
  }
}
export async function saveEntity(
  entity: Entity,
  id: string | undefined,
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  if (!Object.hasOwn(entitySchemas, entity))
    return { ok: false, message: copy.messages.unknownEditor };
  if (id !== undefined && !validId(id)) return invalidRequest;
  const parsed = entitySchemas[entity].safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  try {
    let saved: string | undefined;
    switch (entity) {
      case "brands": {
        const values = entitySchemas.brands.parse(input);
        const rows = id
          ? await db
              .update(s.brands)
              .set(values)
              .where(eq(s.brands.id, id))
              .returning({ id: s.brands.id })
          : await db
              .insert(s.brands)
              .values(values)
              .returning({ id: s.brands.id });
        saved = rows[0]?.id;
        break;
      }
      case "notes": {
        const values = entitySchemas.notes.parse(input);
        const rows = id
          ? await db
              .update(s.notes)
              .set(values)
              .where(eq(s.notes.id, id))
              .returning({ id: s.notes.id })
          : await db
              .insert(s.notes)
              .values(values)
              .returning({ id: s.notes.id });
        saved = rows[0]?.id;
        break;
      }
      case "collections": {
        const values = entitySchemas.collections.parse(input);
        const rows = id
          ? await db
              .update(s.collections)
              .set(values)
              .where(eq(s.collections.id, id))
              .returning({ id: s.collections.id })
          : await db
              .insert(s.collections)
              .values(values)
              .returning({ id: s.collections.id });
        saved = rows[0]?.id;
        break;
      }
      case "banners": {
        const values = entitySchemas.banners.parse(input);
        const rows = id
          ? await db
              .update(s.banners)
              .set(values)
              .where(eq(s.banners.id, id))
              .returning({ id: s.banners.id })
          : await db
              .insert(s.banners)
              .values(values)
              .returning({ id: s.banners.id });
        saved = rows[0]?.id;
        break;
      }
      case "homepage": {
        const values = entitySchemas.homepage.parse(input);
        const rows = id
          ? await db
              .update(s.homepageSections)
              .set(values)
              .where(eq(s.homepageSections.id, id))
              .returning({ id: s.homepageSections.id })
          : await db
              .insert(s.homepageSections)
              .values(values)
              .returning({ id: s.homepageSections.id });
        saved = rows[0]?.id;
        break;
      }
      case "pages": {
        const values = entitySchemas.pages.parse(input);
        const rows = id
          ? await db
              .update(s.staticPages)
              .set(values)
              .where(eq(s.staticPages.id, id))
              .returning({ id: s.staticPages.id })
          : await db
              .insert(s.staticPages)
              .values(values)
              .returning({ id: s.staticPages.id });
        saved = rows[0]?.id;
        break;
      }
      case "customers": {
        const values = entitySchemas.customers.parse(input);
        const rows = id
          ? await db
              .update(s.customers)
              .set(values)
              .where(eq(s.customers.id, id))
              .returning({ id: s.customers.id })
          : [];
        saved = rows[0]?.id;
        break;
      }
    }
    if (!saved) return { ok: false, message: copy.messages.recordNotFound };
    refresh();
    return { ok: true, message: copy.messages.saved, id: saved };
  } catch (error) {
    return failure(error);
  }
}
export async function deleteEntity(
  entity: Entity,
  id: string,
): Promise<ActionResult> {
  await requireAdmin();
  if (!Object.hasOwn(tables, entity) || entity === "customers")
    return { ok: false, message: copy.messages.cannotDelete };
  if (!validId(id)) return invalidRequest;
  try {
    const table = tables[entity];
    await db.delete(table).where(eq(table.id, id));
    refresh();
    return { ok: true, message: copy.messages.deleted };
  } catch {
    return {
      ok: false,
      message:
        "This record is still used by products. Remove those links or deactivate the products first.",
    };
  }
}
export async function productFlags(
  ids: string[],
  flags: { isActive?: boolean; isFeatured?: boolean },
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = z
    .object({
      ids: idListSchema.max(100),
      flags: z.object({
        isActive: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
      }),
    })
    .safeParse({ ids, flags });
  if (!parsed.success) return validationFailure(parsed.error);
  if (parsed.data.flags.isActive === true) {
    const { canPublishProduct, publishBlockReasons } = await import("@/lib/import/publish-guards");
    const rows = await db.query.products.findMany({
      where: inArray(s.products.id, parsed.data.ids),
      with: { variants: true },
    });
    for (const product of rows) {
      if (!canPublishProduct(product, product.variants)) {
        return {
          ok: false,
          message: `${product.name}: ${publishBlockReasons(product, product.variants).join(" ")}`,
        };
      }
    }
  }
  await db
    .update(s.products)
    .set(parsed.data.flags)
    .where(inArray(s.products.id, parsed.data.ids));
  refresh();
  return { ok: true, message: copy.messages.productsUpdated };
}
export async function deactivateBrand(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!validId(id)) return invalidRequest;
  await db
    .update(s.products)
    .set({ isActive: false })
    .where(eq(s.products.brandId, id));
  refresh();
  return { ok: true, message: copy.messages.brandDeactivated };
}
export async function reorder(
  entity: "homepage" | "banners",
  ids: string[],
): Promise<ActionResult> {
  await requireAdmin();
  if (
    !["homepage", "banners"].includes(entity) ||
    !z.array(idSchema).max(200).safeParse(ids).success ||
    new Set(ids).size !== ids.length
  )
    return { ok: false, message: copy.messages.invalidOrder };
  const table = tables[entity];
  await db.transaction(async (tx) => {
    for (const [sortOrder, id] of ids.entries())
      await tx.update(table).set({ sortOrder }).where(eq(table.id, id));
  });
  refresh();
  return { ok: true, message: copy.messages.orderSaved };
}
export async function updateOrder(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!validId(id)) return invalidRequest;
  const schema = z.object({
    kind: z.enum(["transition", "note", "call_logged", "payment"]),
    status: z.enum(s.orderStatus.enumValues).optional(),
    message: z.string().trim().max(5000).optional(),
    cancelledReason: z.string().trim().max(1000).optional(),
    courierName: z.string().trim().max(120).optional(),
    trackingId: z.string().trim().max(160).optional(),
    paymentVerified: z.boolean().optional(),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  try {
    const value = parsed.data;
    if (value.kind === "transition") {
      if (!value.status) return { ok: false, message: copy.messages.chooseStatus };
      await transitionOrder(id, value.status, {
        ...value,
        actor: admin.id,
        message: [
          value.message,
          value.paymentVerified ? "Payment verified." : "",
          value.cancelledReason,
          value.courierName &&
            `Courier: ${value.courierName}. Tracking: ${value.trackingId}`,
        ]
          .filter(Boolean)
          .join(" "),
      });
    } else {
      if (value.kind !== "payment" && !value.message)
        return { ok: false, message: copy.messages.noteOrCallRequired };
      await db.transaction(async (tx) => {
        const [order] = await tx
          .select()
          .from(s.orders)
          .where(eq(s.orders.id, id))
          .for("update");
        if (!order) throw new Error("Order not found.");
        if (value.kind === "payment") {
          if (order.paymentVerified) return;
          await tx
            .update(s.orders)
            .set({ paymentVerified: true })
            .where(
              and(eq(s.orders.id, id), eq(s.orders.paymentVerified, false)),
            );
        }
        await tx
          .insert(s.orderEvents)
          .values({
            orderId: id,
            actor: admin.id,
            type:
              value.kind === "payment"
                ? "system"
                : value.kind === "call_logged"
                  ? "call_logged"
                  : "note",
            message:
              value.kind === "payment" ? "Payment verified." : value.message,
          });
      });
    }
    refresh();
    return { ok: true, message: copy.messages.orderUpdated };
  } catch (error) {
    return failure(error);
  }
}
export async function testNotification(): Promise<ActionResult> {
  await requireAdmin();
  if (env.DEMO_MODE) return { ok: false, message: copy.messages.demoNotifyOff };
  const ok = await notifyTestPing();
  return {
    ok,
    message: ok
      ? "Test notification sent."
      : "Notification failed. Check provider settings.",
  };
}

const couponsOff: ActionResult = { ok: false, message: copy.messages.couponsOff };
export async function saveCoupon(id: string | undefined, input: unknown): Promise<ActionResult> {
  await requireAdmin();
  if (!storeConfig.features.coupons) return couponsOff;
  if (id !== undefined && !validId(id)) return invalidRequest;
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const values = parsed.data;
  try {
    const [clash] = await db
      .select({ id: s.coupons.id })
      .from(s.coupons)
      .where(and(eq(s.coupons.code, values.code), id ? ne(s.coupons.id, id) : undefined));
    if (clash)
      return {
        ok: false,
        message: copy.messages.checkFields,
        errors: { code: "Another coupon already uses this code." },
      };
    const rows = id
      ? await db.update(s.coupons).set(values).where(eq(s.coupons.id, id)).returning({ id: s.coupons.id })
      : await db.insert(s.coupons).values(values).returning({ id: s.coupons.id });
    if (!rows[0]) return { ok: false, message: copy.messages.couponNotFound };
    refresh();
    return { ok: true, message: id ? "Coupon saved." : `Coupon ${values.code} created.`, id: rows[0].id };
  } catch (error) {
    return failure(error);
  }
}
export async function setCouponActive(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();
  if (!storeConfig.features.coupons) return couponsOff;
  if (!validId(id) || typeof isActive !== "boolean") return invalidRequest;
  const rows = await db.update(s.coupons).set({ isActive }).where(eq(s.coupons.id, id)).returning({ code: s.coupons.code });
  if (!rows[0]) return { ok: false, message: copy.messages.couponNotFound };
  refresh();
  return { ok: true, message: `${rows[0].code} ${isActive ? "switched on" : "switched off"}.` };
}
export async function deleteCoupon(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!storeConfig.features.coupons) return couponsOff;
  if (!validId(id)) return invalidRequest;
  // Orders keep their own copy of the code and discount, so history is unaffected.
  await db.delete(s.coupons).where(eq(s.coupons.id, id));
  refresh();
  return { ok: true, message: copy.messages.couponDeleted };
}

const reviewsOff: ActionResult = { ok: false, message: copy.messages.reviewsOff };
export async function moderateReviews(
  ids: string[],
  status: "approved" | "rejected" | "pending",
): Promise<ActionResult> {
  await requireAdmin();
  if (!storeConfig.features.reviews) return reviewsOff;
  const parsed = z.object({ ids: idListSchema, status: z.enum(["approved", "rejected", "pending"]) }).safeParse({ ids, status });
  if (!parsed.success) return { ok: false, message: copy.messages.selectReview };
  const rows = await db.transaction(async (tx) => {
    const selected = await tx.select().from(s.reviews).where(inArray(s.reviews.id, parsed.data.ids));
    for (const review of selected) {
      // Re-check on approval: the order may have been delivered after the review arrived.
      const verifiedPurchase =
        parsed.data.status === "approved"
          ? await hasDeliveredPurchase(review.customerPhone, review.productId, tx)
          : review.verifiedPurchase;
      await tx.update(s.reviews).set({ status: parsed.data.status, verifiedPurchase }).where(eq(s.reviews.id, review.id));
    }
    return selected.length;
  });
  if (!rows) return { ok: false, message: copy.messages.reviewsGone };
  refresh();
  const noun = rows === 1 ? "Review" : `${rows} reviews`;
  return {
    ok: true,
    message: `${noun} ${parsed.data.status === "approved" ? "approved and published" : parsed.data.status === "rejected" ? "rejected" : "moved back to pending"}.`,
  };
}
export async function importSupplierCatalog(): Promise<ActionResult> {
  await requireAdmin();
  try {
    const { runSupplierCatalogImport } = await import("../../db/import-supplier-catalog");
    const r = await runSupplierCatalogImport();
    if (r.errors.length) {
      return {
        ok: false,
        message: `Importação abortada: ${r.errors[0]?.message ?? "erro no CSV"}.`,
      };
    }
    refresh();
    const warn =
      r.warnings.length > 0 ? ` ${r.warnings.length} aviso(s) no relatório (veja logs).` : "";
    return {
      ok: true,
      message: `Catálogo importado: ${r.created} novos, ${r.updated} atualizados, ${r.skipped} ignorados (${r.total} linhas). Rascunho, estoque 0.${warn}`,
    };
  } catch (error) {
    return failure(error);
  }
}

export async function recalculateAllPricing(): Promise<ActionResult> {
  await requireAdmin();
  try {
    const { applyCostToVariantPricing } = await import("@/lib/pricing/apply");
    const rows = await db.select().from(s.productVariants);
    let count = 0;
    for (const v of rows) {
      if (v.costPrice == null) continue;
      const priced = applyCostToVariantPricing({
        costPrice: v.costPrice,
        markupPixPercent: v.markupPixPercent,
        markupCardPercent: v.markupCardPercent,
        price: v.price,
        retailPrice: v.retailPrice,
        cardPrice: v.cardPrice,
      });
      await db
        .update(s.productVariants)
        .set({
          price: priced.price,
          cardPrice: priced.cardPrice,
          retailPrice: priced.retailPrice,
          updatedAt: new Date(),
        })
        .where(eq(s.productVariants.id, v.id));
      count++;
    }
    refresh();
    return { ok: true, message: `Preços recalculados em ${count} variantes.` };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteReviews(ids: string[]): Promise<ActionResult> {
  await requireAdmin();
  if (!storeConfig.features.reviews) return reviewsOff;
  const parsed = idListSchema.safeParse(ids);
  if (!parsed.success) return { ok: false, message: copy.messages.selectReview };
  const rows = await db.delete(s.reviews).where(inArray(s.reviews.id, parsed.data)).returning({ id: s.reviews.id });
  refresh();
  return { ok: true, message: rows.length === 1 ? "Review deleted." : `${rows.length} reviews deleted.` };
}
