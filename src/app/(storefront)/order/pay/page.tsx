import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { AsaasCardPanel } from "@/components/storefront/asaas-card";
import { AsaasPixPanel } from "@/components/storefront/asaas-pix";
import { AsaasPaymentWait } from "@/components/storefront/asaas-payment-wait";
import { asaasEnabled, isAsaasOnlineMethod, orderAwaitingAsaasPayment } from "@/lib/payments/adapter";
import { copy } from "@/lib/storefront/copy";
import { storeConfig as config } from "../../../../../store.config";

export const metadata = {
  title: copy.orderConfirm.payTitle,
  robots: { index: false, follow: false },
};

function AsaasPaymentSection({ record }: { record: typeof orders.$inferSelect }) {
  if (record.paymentMethod === "bkash") {
    return <AsaasPixPanel order={record} />;
  }
  if (record.paymentMethod === "nagad") {
    return <AsaasCardPanel order={record} />;
  }
  return null;
}

export default async function Page() {
  const token = (await cookies()).get("attar-order")?.value;
  const [record] = token
    ? await db.select().from(orders).where(eq(orders.id, token)).limit(1)
    : [];
  if (!record) {
    return (
      <div className="store-width commerce-page">
        <h1>{copy.orderConfirm.lookupTitle}</h1>
        <p>{copy.orderConfirm.lookupHint}</p>
        <Link className="button primary" href="/track-order">
          {copy.orderConfirm.track}
        </Link>
      </div>
    );
  }

  if (!orderAwaitingAsaasPayment(record)) {
    redirect(`/order/confirmed/${encodeURIComponent(record.orderNumber)}`);
  }

  const asaasOnline = isAsaasOnlineMethod(record.paymentMethod);
  const panel =
    asaasEnabled() && record.paymentTxnId ? (
      <AsaasPaymentSection record={record} />
    ) : asaasOnline && !asaasEnabled() ? (
      <p className="confirmation-note">{copy.orderConfirm.asaasNotConfigured}</p>
    ) : asaasOnline && !record.paymentTxnId ? (
      <p className="confirmation-note">{copy.orderConfirm.asaasChargeMissing}</p>
    ) : (
      <AsaasPaymentSection record={record} />
    );

  return (
    <div className="store-width commerce-page confirmation-page confirmation-page--pay">
      <p className="muted">{copy.orderConfirm.payEyebrow}</p>
      <h1>{copy.orderConfirm.payTitle}</h1>
      <p className="confirmation-note">{copy.orderConfirm.payOrderRef}</p>
      {panel}
      {!record.paymentVerified && asaasEnabled() && record.paymentTxnId && (
        <AsaasPaymentWait />
      )}
      <p className="muted checkout-privacy">{copy.orderConfirm.payAfterHint}</p>
      <div className="confirmation-links">
        <Link className="text-link" href="/products">
          {copy.orderConfirm.continueShopping}
        </Link>
        <a
          className="text-link"
          href={`tel:${config.contact.phone.replace(/\s/g, "")}`}
        >
          {copy.orderConfirm.callStore(config.contact.phone)}
        </a>
      </div>
    </div>
  );
}
