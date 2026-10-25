import { z } from "@/lib/zod";
import { isValidPhone, normalizePhone } from "@/lib/phone";
import { cartSchema } from "@/lib/cart/schema";
import { checkoutPaymentProvider } from "@/lib/payments/adapter";
import { normalizeCpfCnpj } from "@/lib/payments/asaas/pix";
import { storeConfig as config } from "../../../store.config";
const required = (max: number) =>
  z.string().trim().min(1, "Preencha este campo.").max(max);
export const checkoutSchema = z
  .object({
    name: required(120),
    phone: z
      .string()
      .max(30)
      .refine(
        isValidPhone,
        "Informe um celular válido com DDD, por exemplo (11) 99999-9999.",
      )
      .transform(normalizePhone),
    email: z.union([z.literal(""), z.email().max(254)]).optional(),
    line1: required(240),
    area: required(100),
    city: required(100),
    zoneId: required(80).refine(
      (id) => config.checkout.deliveryZones.some((zone) => zone.id === id),
      "Escolha a região de entrega.",
    ),
    paymentMethod: z
      .enum(["cod", "bkash", "nagad"])
      .refine(
        (key) => config.checkout.paymentMethods[key].enabled,
        "Escolha uma forma de pagamento disponível.",
      ),
    txnId: z.string().trim().max(80).optional(),
    cpfCnpj: z.string().trim().max(20).optional(),
    note: z.string().trim().max(1000).optional(),
    website: z.string().max(200).optional(),
    // The server re-validates the code; the expected discount guards against
    // charging a different amount than the shopper saw.
    couponCode: z.string().trim().max(80).optional(),
    couponDiscount: z.int().nonnegative().max(2_147_483_647).optional(),
    lines: cartSchema.refine((lines) => lines.length > 0, "Sua sacola está vazia."),
    requestId: z.uuid(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === "cod") return;
    const asaasOnline =
      checkoutPaymentProvider() === "asaas" &&
      (data.paymentMethod === "bkash" || data.paymentMethod === "nagad");
    if (asaasOnline) {
      const digits = normalizeCpfCnpj(data.cpfCnpj ?? "");
      if (digits.length !== 11 && digits.length !== 14) {
        ctx.addIssue({
          code: "custom",
          path: ["cpfCnpj"],
          message: "Informe CPF (11 dígitos) ou CNPJ (14 dígitos) para o pagamento online.",
        });
      }
      return;
    }
    if (!data.txnId?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["txnId"],
        message: "Informe o ID da transação do pagamento.",
      });
    }
  });
export type CheckoutInput = z.infer<typeof checkoutSchema>;
/**
 * Order totals. The free-delivery threshold is measured on what the shopper
 * pays for goods, i.e. after any coupon discount.
 */
export function deliveryTotals(subtotal: number, zoneId: string, discount = 0) {
  const zone = config.checkout.deliveryZones.find((zone) => zone.id === zoneId);
  if (!zone) throw new Error("Escolha a região de entrega.");
  const goods = subtotal - discount;
  const saving =
    config.checkout.freeDeliveryOver !== null &&
    goods >= config.checkout.freeDeliveryOver
      ? zone.fee
      : 0;
  return {
    fee: zone.fee - saving,
    saving,
    discount,
    total: goods + zone.fee - saving,
  };
}
export const trackingSchema = z.object({
  phone: z
    .string()
    .max(30)
    .refine(isValidPhone, "Informe um celular válido com DDD.")
    .transform(normalizePhone),
  orderNumber: required(40),
});
