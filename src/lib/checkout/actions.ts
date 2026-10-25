"use server";
import { demoWriteRefused } from "@/lib/demo/session";
import { after } from "next/server";
import { cookies, headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { checkoutSchema, trackingSchema } from "./schema";
import { createOrder, CheckoutError } from "./create-order";
import { clientIp, takeRateLimit } from "@/lib/rate-limit";
import { notifyNewOrder } from "@/lib/notify";
import { getPublicOrder } from "@/lib/orders/public-order";
import { asaasEnabled } from "@/lib/payments/adapter";
import { attachAsaasPaymentToOrder } from "@/lib/payments/sync-asaas-order";
import { AsaasError } from "@/lib/payments/asaas/client";
export async function placeOrder(input: unknown) {
  if (await demoWriteRefused(await headers()))
    return { error: "This is a demo store. Start your own demo store (Try the admin, at the top) to place orders." };
  if (!(await takeRateLimit("checkout-ip", clientIp(await headers()), 20)))
    return {
      error: "Too many attempts. Please wait 15 minutes before trying again.",
    };
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success)
    return {
      error: "Check the highlighted fields.",
      fields: parsed.error.flatten().fieldErrors,
    };
  if (!(await takeRateLimit("checkout-phone", parsed.data.phone, 5)))
    return {
      error:
        "Too many attempts for this phone. Please wait 15 minutes or call the store.",
    };
  try {
    const result = await createOrder(parsed.data);
    async function grantConfirmationAccess() {
      (await cookies()).set("attar-order", result.order.id, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600,
        path: "/order/confirmed",
      });
    }
    const asaasMethod = parsed.data.paymentMethod;
    const needsAsaasCharge =
      asaasEnabled() &&
      (asaasMethod === "bkash" || asaasMethod === "nagad") &&
      !result.order.paymentTxnId;
    if (needsAsaasCharge) {
      try {
        await attachAsaasPaymentToOrder(
          result.order,
          {
            name: parsed.data.name,
            phone: parsed.data.phone,
            email: parsed.data.email,
            cpfCnpj: parsed.data.cpfCnpj ?? "",
          },
          asaasMethod,
        );
        const [fresh] = await db
          .select()
          .from(orders)
          .where(eq(orders.id, result.order.id))
          .limit(1);
        if (fresh) result.order = fresh;
      } catch (error) {
        const hint =
          error instanceof AsaasError
            ? error.message
            : asaasMethod === "bkash"
              ? "Não foi possível gerar o PIX."
              : "Não foi possível abrir o pagamento com cartão.";
        return {
          error: `${hint} Tente de novo em instantes ou ligue para a loja.`,
        };
      }
    }
    await grantConfirmationAccess();
    if (result.created)
      after(async () => {
        try {
          const items = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, result.order.id));
          await notifyNewOrder({ order: result.order, items });
        } catch {
          console.error(
            "Order notification could not be prepared. The order is saved.",
          );
        }
      });
    return { orderNumber: result.order.orderNumber };
  } catch (error) {
    return {
      error:
        error instanceof CheckoutError
          ? error.message
          : "We couldn't finish your order. Your bag is saved. Please try again.",
    };
  }
}
/** Cookie da confirmação: polling leve até o webhook marcar pagamento. */
export async function getOrderPaymentStatusForConfirmation(orderNumber: string) {
  if (!(await takeRateLimit("checkout-ip", clientIp(await headers()), 60)))
    return { error: "Muitas tentativas. Aguarde um momento." as const };
  const token = (await cookies()).get("attar-order")?.value;
  if (!token) return { error: "Sessão expirada." as const };
  const [record] = await db
    .select({
      paymentVerified: orders.paymentVerified,
      paymentTxnId: orders.paymentTxnId,
    })
    .from(orders)
    .where(and(eq(orders.id, token), eq(orders.orderNumber, orderNumber)))
    .limit(1);
  if (!record) return { error: "Pedido não encontrado." as const };
  return {
    paymentVerified: record.paymentVerified,
    hasCharge: Boolean(record.paymentTxnId),
  };
}

export async function trackOrder(input: unknown) {
  if (!(await takeRateLimit("tracking-ip", clientIp(await headers()), 30)))
    return { error: "Too many lookups. Please wait 15 minutes." };
  const parsed = trackingSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!(await takeRateLimit("tracking-phone", parsed.data.phone, 10)))
    return { error: "Too many lookups. Please wait 15 minutes." };
  try {
    const order = await getPublicOrder(
      parsed.data.orderNumber,
      parsed.data.phone,
    );
    return order
      ? { order }
      : {
          error:
            "No matching order. Check both the order number and phone number.",
        };
  } catch {
    return { error: "We couldn't look up your order. Please try again." };
  }
}
