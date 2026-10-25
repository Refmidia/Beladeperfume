import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { count, desc, eq, lte, and } from "drizzle-orm";
import {
  Ban,
  Check,
  CircleCheck,
  Info,
  MapPin,
  MessageCircle,
  Phone,
  RotateCcw,
  ShieldCheck,
  StickyNote,
  Truck,
} from "lucide-react";
import { db } from "@/db";
import { orders, orderEvents, type OrderStatus } from "@/db/schema";
import { requireAdmin } from "@/lib/admin/session";
import { formatMoney } from "@/lib/money";
import {
  FULFILMENT_STEPS,
  PAYMENT_LABELS,
  STATUS_LABELS,
  formatDateTime,
  orderEventMessage,
  timeAgo,
  whatsappHref,
} from "@/lib/admin/format";
import { adminCopy as t } from "@/lib/admin/copy";
import {
  OrderActions,
  TimelineComposer,
  VerifyPayment,
} from "@/components/admin/order-controls";
import { Avatar, PageHeader, Panel, StatusBadge, Tag } from "@/components/admin/ui";
import { storeConfig } from "../../../../../../store.config";
export default async function Order({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const o = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { items: true, events: { orderBy: desc(orderEvents.createdAt) } },
  });
  if (!o) notFound();
  const [number] = await db
    .select({ count: count() })
    .from(orders)
    .where(
      and(
        eq(orders.customerId, o.customerId),
        lte(orders.createdAt, o.createdAt),
      ),
    );
  // Latest time each status was entered, for the progress rail.
  const reachedAt = new Map<OrderStatus, Date>();
  for (const e of [...o.events].reverse())
    if (e.type === "status_change" && e.toStatus) reachedAt.set(e.toStatus, e.createdAt);
  const terminal = o.status === "cancelled" || o.status === "returned";
  const branchFrom = terminal
    ? o.events.find((e) => e.toStatus === o.status)?.fromStatus ?? "pending"
    : o.status;
  const reachedIndex = FULFILMENT_STEPS.indexOf(branchFrom as (typeof FULFILMENT_STEPS)[number]);
  const zone = storeConfig.checkout.deliveryZones.find((z) => z.id === o.deliveryZoneId);
  const itemCount = o.items.reduce((sum, i) => sum + i.quantity, 0);
  return (
    <>
      <PageHeader
        crumbs={[[t.orderDetail.crumbsOrders, "/admin/orders"]]}
        title={
          <span className="admin-title-row">
            {o.orderNumber}
            <StatusBadge status={o.status} />
          </span>
        }
        description={t.orderDetail.headerDescription(
          formatDateTime(o.createdAt),
          timeAgo(o.createdAt),
          itemCount,
        )}
        actions={<OrderActions order={o} />}
      />

      <ol className="admin-progress" aria-label={t.orderDetail.progressLabel}>
        {FULFILMENT_STEPS.map((step, i) => {
          const done = i <= reachedIndex;
          const skipped = terminal && i > reachedIndex;
          return (
            <li
              key={step}
              data-state={skipped ? "skipped" : done ? (i === reachedIndex && !terminal ? "current" : "done") : "todo"}
            >
              <span className="admin-progress-dot">{done && <Check size={12} strokeWidth={3} />}</span>
              <span className="admin-progress-label">
                {STATUS_LABELS[step]}
                <small>{reachedAt.get(step) ? formatDateTime(reachedAt.get(step)!) : skipped ? t.orderDetail.skipped : "—"}</small>
              </span>
            </li>
          );
        })}
        {terminal && (
          <li data-state="terminal">
            <span className="admin-progress-dot">
              {o.status === "cancelled" ? <Ban size={12} strokeWidth={2.5} /> : <RotateCcw size={12} strokeWidth={2.5} />}
            </span>
            <span className="admin-progress-label">
              {STATUS_LABELS[o.status]}
              <small>{reachedAt.get(o.status) ? formatDateTime(reachedAt.get(o.status)!) : "—"}</small>
            </span>
          </li>
        )}
      </ol>

      <div className="admin-detail-grid">
        <div className="admin-stack">
          <Panel
            title={t.orderDetail.itemsTitle}
            description={t.orderDetail.itemsDescription(itemCount, o.items.length)}
          >
            <ul className="admin-lines">
              {o.items.map((i) => (
                <li key={i.id}>
                  <span className="admin-thumb">
                    {i.imageUrl && (
                      <Image unoptimized width={64} height={64} src={i.imageUrl} alt={i.productName} />
                    )}
                  </span>
                  <span className="admin-line-name">
                    <small>{i.brandName}</small>
                    <strong>{i.productName}</strong>
                    <span>{i.variantLabel}</span>
                  </span>
                  <span className="admin-line-qty">
                    {i.quantity} × {formatMoney(i.unitPrice)}
                  </span>
                  <strong className="admin-line-total">{formatMoney(i.lineTotal)}</strong>
                </li>
              ))}
            </ul>
            <dl className="admin-totals">
              <div>
                <dt>{t.orderDetail.subtotal}</dt>
                <dd>{formatMoney(o.subtotal)}</dd>
              </div>
              <div>
                <dt>
                  {t.orderDetail.delivery}
                  {zone ? ` · ${zone.label}` : ""}
                </dt>
                <dd>{o.deliveryFee ? formatMoney(o.deliveryFee) : t.orderDetail.deliveryFree}</dd>
              </div>
              {o.discount > 0 && (
                <div>
                  <dt>{o.couponCode ? t.orderDetail.coupon(o.couponCode) : t.orderDetail.discount}</dt>
                  <dd>−{formatMoney(o.discount)}</dd>
                </div>
              )}
              <div className="grand">
                <dt>{t.orderDetail.total}</dt>
                <dd>{formatMoney(o.total)}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title={t.orderDetail.timelineTitle} description={t.orderDetail.timelineDescription}>
            <TimelineComposer order={o} />
            <ol className="admin-timeline">
              {o.events.map((e) => {
                const Icon =
                  e.type === "call_logged"
                    ? Phone
                    : e.type === "note"
                      ? StickyNote
                      : e.type === "system"
                        ? Info
                        : e.toStatus === "shipped"
                          ? Truck
                          : e.toStatus === "cancelled"
                            ? Ban
                            : e.toStatus === "returned"
                              ? RotateCcw
                              : CircleCheck;
                return (
                  <li key={e.id} data-type={e.type} data-status={e.toStatus ?? undefined}>
                    <span className="admin-timeline-icon">
                      <Icon size={14} />
                    </span>
                    <div className="admin-timeline-body">
                      <div className="admin-timeline-head">
                        <strong>
                          {e.type === "status_change" && e.toStatus
                            ? e.fromStatus
                              ? `${STATUS_LABELS[e.fromStatus]} → ${STATUS_LABELS[e.toStatus]}`
                              : t.orderDetail.eventOrderPlaced
                            : e.type === "call_logged"
                              ? t.orderDetail.eventCallLogged
                              : e.type === "note"
                                ? t.orderDetail.eventNote
                                : t.orderDetail.eventSystem}
                        </strong>
                        <time dateTime={e.createdAt.toISOString()} title={formatDateTime(e.createdAt)}>
                          {formatDateTime(e.createdAt)}
                        </time>
                      </div>
                      {e.message && <p>{orderEventMessage(e.message)}</p>}
                      <small>{e.actor === "system" ? t.orderDetail.actorSystem : t.orderDetail.actorTeam}</small>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Panel>
        </div>

        <div className="admin-stack">
          <Panel title={t.orderDetail.customerTitle}>
            <div className="admin-customer">
              <Avatar name={o.customerName} size="lg" />
              <div>
                <Link href={`/admin/customers?id=${o.customerId}`} className="admin-strong admin-link">
                  {o.customerName}
                </Link>
                <small>{t.orderDetail.ordersFromCustomer(number.count)}</small>
              </div>
            </div>
            <div className="admin-contact">
              <a className="admin-btn primary" href={`tel:${o.customerPhone}`}>
                <Phone size={16} /> {t.common.call}
              </a>
              <a className="admin-btn" href={whatsappHref(o.customerPhone)} target="_blank" rel="noreferrer">
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
            <dl className="admin-meta">
              <div>
                <dt>{t.orderDetail.phone}</dt>
                <dd className="admin-mono">{o.customerPhone}</dd>
              </div>
              {o.customerEmail && (
                <div>
                  <dt>{t.orderDetail.email}</dt>
                  <dd>{o.customerEmail}</dd>
                </div>
              )}
              <div>
                <dt>
                  <MapPin size={13} /> {t.orderDetail.shipTo}
                </dt>
                <dd>
                  {[o.shippingAddress.line1, o.shippingAddress.line2, o.shippingAddress.area, o.shippingAddress.city]
                    .filter(Boolean)
                    .join(", ")}
                  <small>{zone ? `${zone.label} · ${zone.etaDays}` : o.deliveryZoneId}</small>
                </dd>
              </div>
            </dl>
            {o.customerNote && (
              <blockquote className="admin-note">
                <small>{t.orderDetail.customerNote}</small>
                {o.customerNote}
              </blockquote>
            )}
          </Panel>

          <Panel title={t.orderDetail.paymentTitle}>
            <dl className="admin-meta">
              <div>
                <dt>{t.orderDetail.method}</dt>
                <dd>{PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod}</dd>
              </div>
              <div>
                <dt>{t.orderDetail.status}</dt>
                <dd>
                  {o.paymentVerified ? (
                    <Tag tone="good">
                      <ShieldCheck size={12} /> {t.orderDetail.verified}
                    </Tag>
                  ) : o.paymentMethod === "cod" ? (
                    <Tag>{t.orderDetail.collectOnDelivery}</Tag>
                  ) : (
                    <Tag tone="warn">{t.orderDetail.awaitingVerification}</Tag>
                  )}
                </dd>
              </div>
              {o.paymentTxnId && (
                <div>
                  <dt>{t.orderDetail.transactionId}</dt>
                  <dd className="admin-mono">{o.paymentTxnId}</dd>
                </div>
              )}
              <div>
                <dt>{t.orderDetail.amount}</dt>
                <dd className="admin-strong">{formatMoney(o.total)}</dd>
              </div>
            </dl>
            {!o.paymentVerified && <VerifyPayment order={o} />}
          </Panel>

          {(o.courierName || o.cancelledReason) && (
            <Panel title={o.cancelledReason ? t.orderDetail.cancellation : t.orderDetail.shipment}>
              <dl className="admin-meta">
                {o.courierName && (
                  <>
                    <div>
                      <dt>{t.orderDetail.courier}</dt>
                      <dd>{o.courierName}</dd>
                    </div>
                    <div>
                      <dt>{t.orderDetail.trackingId}</dt>
                      <dd className="admin-mono">{o.trackingId}</dd>
                    </div>
                  </>
                )}
                {o.cancelledReason && (
                  <div>
                    <dt>{t.orderDetail.reason}</dt>
                    <dd>{o.cancelledReason}</dd>
                  </div>
                )}
              </dl>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
