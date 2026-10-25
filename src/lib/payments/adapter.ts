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

export type OnlinePaymentMethod = "bkash" | "nagad";

/** PIX/cartão online via Asaas (config da loja). */
export function isAsaasOnlineMethod(method: string): method is OnlinePaymentMethod {
  return (
    checkoutPaymentProvider() === "asaas" &&
    (method === "bkash" || method === "nagad")
  );
}

/** Aguardando pagamento Asaas antes de mostrar rastreio / resumo completo. */
export function orderAwaitingAsaasPayment(order: {
  paymentMethod: string;
  paymentVerified: boolean;
}) {
  return isAsaasOnlineMethod(order.paymentMethod) && !order.paymentVerified;
}
