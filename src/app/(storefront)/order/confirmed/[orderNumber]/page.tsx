import Link from "next/link";
import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getPublicOrder } from "@/lib/orders/public-order";
import { OrderSummary } from "@/components/storefront/order-tracking";
import { AsaasCardPanel } from "@/components/storefront/asaas-card";
import { AsaasPixPanel } from "@/components/storefront/asaas-pix";
import { PaymentInstructions } from "@/components/storefront/checkout";
import { asaasEnabled } from "@/lib/payments/adapter";
import { SuccessMark } from "@/components/storefront/ui";
import { copy } from "@/lib/storefront/copy";
import { storeConfig as config } from "../../../../../../store.config";
export const metadata = {
  title: copy.metaPages.orderReceived,
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const token = (await cookies()).get("attar-order")?.value;
  const [record] = token
    ? await db
        .select()
        .from(orders)
        .where(and(eq(orders.id, token), eq(orders.orderNumber, orderNumber)))
    : [];
  if (!record)
    return (
      <div className="store-width commerce-page">
        <h1>{copy.orderConfirm.lookupTitle}</h1>
        <p>{copy.orderConfirm.lookupHint}</p>
        <Link className="button primary" href="/track-order">
          {copy.orderConfirm.track}
        </Link>
      </div>
    );
  const order = await getPublicOrder(record.orderNumber, record.customerPhone);
  return (
    <div className="store-width commerce-page confirmation-page">
      <SuccessMark size={44} />
      <p className="muted">{copy.orderConfirm.received}</p>
      <h1>{record.orderNumber}</h1>
      <p className="confirmation-note">{config.checkout.confirmationNote}</p>
      <ol className="next-steps">
        <li>
          <strong>{copy.orderConfirm.stepCall}</strong>
          <span>{copy.orderConfirm.stepCallHint}</span>
        </li>
        <li>
          <strong>{copy.orderConfirm.stepConfirm}</strong>
          <span>{copy.orderConfirm.stepConfirmHint}</span>
        </li>
        <li>
          <strong>{copy.orderConfirm.stepShip}</strong>
          <span>{copy.orderConfirm.stepShipHint}</span>
        </li>
      </ol>
      {record.paymentMethod !== "cod" &&
        (asaasEnabled() && record.paymentMethod === "bkash" ? (
          <AsaasPixPanel order={record} />
        ) : asaasEnabled() && record.paymentMethod === "nagad" ? (
          <AsaasCardPanel order={record} />
        ) : (
          <section>
            <p className="confirmation-note">
              {copy.orderConfirm.txnReceived(record.paymentTxnId ?? "")}
            </p>
            <PaymentInstructions method={record.paymentMethod} />
          </section>
        ))}
      <div className="confirmation-links">
        <Link className="button primary" href="/track-order">
          {copy.orderConfirm.track}
        </Link>
        <a
          className="text-link"
          href={`tel:${config.contact.phone.replace(/\s/g, "")}`}
        >
          {copy.orderConfirm.callStore(config.contact.phone)}
        </a>
        {config.contact.whatsapp && (
          <a
            className="text-link"
            href={`https://wa.me/${config.contact.whatsapp.replace(/\D/g, "")}`}
          >
            WhatsApp
          </a>
        )}
      </div>
      {order && <OrderSummary order={order} />}
    </div>
  );
}
