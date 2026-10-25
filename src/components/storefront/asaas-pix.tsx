import { BelaPaymentBrand } from "@/components/storefront/bela-payment-brand";
import { copy } from "@/lib/storefront/copy";
import { asaasEnabled } from "@/lib/payments/adapter";
import { fetchPixQrCode, orderTotalReais } from "@/lib/payments/asaas/pix";
import type { orders } from "@/db/schema";
import { AsaasError } from "@/lib/payments/asaas/client";

export async function AsaasPixPanel({ order }: { order: typeof orders.$inferSelect }) {
  if (!asaasEnabled() || order.paymentMethod !== "bkash") {
    return null;
  }
  if (!order.paymentTxnId) {
    return <p className="confirmation-note">{copy.checkout.asaasPixUnavailable}</p>;
  }

  let qr: Awaited<ReturnType<typeof fetchPixQrCode>> | null = null;
  let error = "";
  try {
    qr = await fetchPixQrCode(order.paymentTxnId);
  } catch (e) {
    error =
      e instanceof AsaasError
        ? copy.checkout.asaasPixUnavailable
        : copy.checkout.asaasPixUnavailable;
  }

  if (error) {
    return <p className="confirmation-note">{error}</p>;
  }
  if (!qr) return null;

  return (
    <section className="asaas-pix-panel bela-payment-panel">
      <BelaPaymentBrand />
      <h2>{copy.checkout.asaasPixTitle}</h2>
      <p className="muted">
        {copy.checkout.asaasPixTotal} <strong>{orderTotalReais(order)}</strong>
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element -- QR base64 from Asaas */}
      <img
        className="asaas-pix-qr"
        src={`data:image/png;base64,${qr.encodedImage}`}
        alt={copy.checkout.asaasPixQrAlt}
        width={220}
        height={220}
      />
      <label className="asaas-pix-copy">
        <span>{copy.checkout.asaasPixCopyLabel}</span>
        <textarea readOnly rows={3} value={qr.payload} />
      </label>
      {order.paymentVerified ? (
        <p className="coupon-ok">{copy.checkout.asaasPixPaid}</p>
      ) : (
        <p className="confirmation-note">{copy.checkout.asaasPixPending}</p>
      )}
    </section>
  );
}
