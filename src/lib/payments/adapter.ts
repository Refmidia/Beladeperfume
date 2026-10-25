import { env } from "@/lib/env";
import { storeConfig } from "../../../store.config";

export type PaymentAdapter = "manual" | "asaas";

export function checkoutPaymentProvider(): PaymentAdapter {
  return storeConfig.checkout.paymentProvider;
}

/** Servidor: Asaas só quando loja e env estão configurados. */
export function asaasEnabled() {
  return (
    checkoutPaymentProvider() === "asaas" &&
    env.PAYMENT_ADAPTER === "asaas" &&
    Boolean(env.ASAAS_API_KEY?.trim())
  );
}
