import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, type orders as ordersTable } from "@/db/schema";
import {
  createCardInvoicePayment,
  createPixPayment,
  ensureAsaasCustomer,
  normalizeCpfCnpj,
} from "@/lib/payments/asaas/pix";

type Buyer = {
  name: string;
  phone: string;
  email?: string | null;
  cpfCnpj: string;
};

async function customerForBuyer(buyer: Buyer) {
  return ensureAsaasCustomer({
    name: buyer.name,
    phone: buyer.phone,
    email: buyer.email,
    cpfCnpj: normalizeCpfCnpj(buyer.cpfCnpj),
  });
}

export async function attachAsaasPaymentToOrder(
  order: typeof ordersTable.$inferSelect,
  buyer: Buyer,
  paymentMethod: "bkash" | "nagad",
) {
  const customer = await customerForBuyer(buyer);
  const payment =
    paymentMethod === "bkash"
      ? await createPixPayment({ customerId: customer.id, order })
      : await createCardInvoicePayment({ customerId: customer.id, order });
  await db
    .update(orders)
    .set({ paymentTxnId: payment.id, updatedAt: new Date() })
    .where(eq(orders.id, order.id));
  return payment.id;
}

/** @deprecated use attachAsaasPaymentToOrder */
export async function attachAsaasPixToOrder(
  order: typeof ordersTable.$inferSelect,
  buyer: Buyer,
) {
  return attachAsaasPaymentToOrder(order, buyer, "bkash");
}
