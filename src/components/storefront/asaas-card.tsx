import Link from "next/link";
import { copy } from "@/lib/storefront/copy";
import { asaasEnabled } from "@/lib/payments/adapter";
import { fetchAsaasPayment, orderTotalReais } from "@/lib/payments/asaas/pix";
import type { orders } from "@/db/schema";
import { AsaasError } from "@/lib/payments/asaas/client";

export async function AsaasCardPanel({ order }: { order: typeof orders.$inferSelect }) {
  if (!asaasEnabled() || order.paymentMethod !== "nagad" || !order.paymentTxnId) {
    return null;
  }

  let invoiceUrl: string | undefined;
  try {
    const payment = await fetchAsaasPayment(order.paymentTxnId);
    invoiceUrl = payment.invoiceUrl;
  } catch (e) {
    return (
      <p className="confirmation-note">
        {e instanceof AsaasError
          ? copy.checkout.asaasCardUnavailable
          : copy.checkout.asaasCardUnavailable}
      </p>
    );
  }

  if (!invoiceUrl) {
    return <p className="confirmation-note">{copy.checkout.asaasCardUnavailable}</p>;
  }

  return (
    <section className="asaas-card-panel">
      <h2>{copy.checkout.asaasCardTitle}</h2>
      <p className="muted">
        {copy.checkout.asaasCardTotal} <strong>{orderTotalReais(order)}</strong>
      </p>
      <p className="confirmation-note">{copy.checkout.asaasCardHint}</p>
      {order.paymentVerified ? (
        <p className="coupon-ok">{copy.checkout.asaasCardPaid}</p>
      ) : (
        <Link className="button primary lg" href={invoiceUrl} rel="noopener noreferrer">
          {copy.checkout.asaasCardPayButton}
        </Link>
      )}
    </section>
  );
}
