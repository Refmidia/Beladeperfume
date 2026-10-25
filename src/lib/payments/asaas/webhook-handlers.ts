import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";

type AsaasWebhookEvent = {
  event?: string;
  payment?: { id?: string; externalReference?: string; status?: string };
};

const PAID = new Set([
  "PAYMENT_RECEIVED",
  "PAYMENT_CONFIRMED",
]);

/** Marca pagamento verificado; não confirma envio (loja ainda liga ao cliente). */
export async function handleAsaasWebhook(body: AsaasWebhookEvent) {
  if (!body.event || !PAID.has(body.event) || !body.payment?.id) return { handled: false };

  const paymentId = body.payment.id;
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.paymentTxnId, paymentId))
    .limit(1);

  if (!order) {
    if (body.payment.externalReference) {
      const [byRef] = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, body.payment.externalReference))
        .limit(1);
      if (byRef && !byRef.paymentVerified) {
        await db
          .update(orders)
          .set({ paymentVerified: true, paymentTxnId: paymentId, updatedAt: new Date() })
          .where(eq(orders.id, byRef.id));
        return { handled: true };
      }
    }
    return { handled: false };
  }

  if (order.paymentVerified) return { handled: true };

  await db
    .update(orders)
    .set({ paymentVerified: true, updatedAt: new Date() })
    .where(eq(orders.id, order.id));

  return { handled: true };
}
