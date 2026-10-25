import Image from "next/image";
import Link from "next/link";
import { asc, count, desc, eq, sql } from "drizzle-orm";
import {
  ArrowRight,
  ArrowUpRight,
  CircleCheck,
  Clock,
  Package,
  Phone,
  PhoneCall,
  Plus,
  ShoppingBag,
  StickyNote,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Wallet,
  Info,
} from "lucide-react";
import { db } from "@/db";
import {
  orders,
  orderEvents,
  orderStatus,
  productImages,
  productVariants,
  type OrderStatus,
} from "@/db/schema";
import { requireAdmin } from "@/lib/admin/session";
import { formatMoney } from "@/lib/money";
import {
  ADMIN_TIME_ZONE,
  PAYMENT_LABELS,
  STATUS_LABELS,
  formatDate,
  hoursSince,
  timeAgo,
} from "@/lib/admin/format";
import { Avatar, EmptyState, PageHeader, Panel, StatusBadge } from "@/components/admin/ui";
import { storeConfig } from "../../../../store.config";
import { adminCopy as t } from "@/lib/admin/copy";

const TZ = "America/Sao_Paulo";

const CONFIRMED_OR_LATER = sql.raw(`('confirmed','packed','shipped','delivered')`);
const DAYS = 14;
const dayKey = (date: Date) => date.toLocaleDateString("en-CA", { timeZone: TZ });
/** Round an axis maximum up to 1, 2, 2.5 or 5 × 10ⁿ so gridlines land on clean values. */
function niceCeil(value: number) {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  return ([1, 2, 2.5, 5, 10].find((step) => step * power >= value) ?? 10) * power;
}

export default async function Dashboard() {
  const user = await requireAdmin();
  const lowStock = sql`${productVariants.isActive} = true and ${productVariants.stockQuantity} <= coalesce(${productVariants.lowStockOverride}, ${storeConfig.catalog.lowStockThreshold})`;
  const [queue, events, [stats], [stock], lowRows, statusCounts, daily] = await Promise.all([
    db.query.orders.findMany({
      where: eq(orders.status, "pending"),
      orderBy: asc(orders.createdAt),
      with: { items: true },
    }),
    db.query.orderEvents.findMany({
      orderBy: desc(orderEvents.createdAt),
      limit: 20,
      with: { order: true },
    }),
    db
      .select({
        now: sql<string>`now()`,
        today: sql<number>`count(*) filter (where (${orders.createdAt} at time zone 'America/Sao_Paulo')::date = (now() at time zone 'America/Sao_Paulo')::date)::int`,
        revenue: sql<string>`coalesce(sum(${orders.total}) filter (where ${orders.status} in ${CONFIRMED_OR_LATER} and ${orders.createdAt} >= (date_trunc('week', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo')), 0)`,
      })
      .from(orders),
    db.select({ count: count() }).from(productVariants).where(lowStock),
    db.query.productVariants.findMany({
      where: lowStock,
      orderBy: asc(productVariants.stockQuantity),
      limit: 5,
      with: {
        product: {
          with: {
            brand: true,
            images: { orderBy: asc(productImages.sortOrder), limit: 1 },
          },
        },
      },
    }),
    db.select({ status: orders.status, count: count() }).from(orders).groupBy(orders.status),
    db
      .select({
        day: sql<string>`to_char((${orders.createdAt} at time zone 'America/Sao_Paulo')::date, 'YYYY-MM-DD')`,
        orders: sql<number>`count(*)::int`,
        revenue: sql<number>`coalesce(sum(${orders.total}) filter (where ${orders.status} in ${CONFIRMED_OR_LATER}), 0)::bigint`,
      })
      .from(orders)
      .where(sql`${orders.createdAt} >= now() - interval '${sql.raw(String(DAYS * 2 + 1))} days'`)
      .groupBy(sql`1`),
  ]);

  const now = new Date(stats.now);
  const byDay = new Map(daily.map((d) => [d.day, d]));
  const series = Array.from({ length: DAYS * 2 }, (_, i) => {
    const date = new Date(now.getTime() - (DAYS * 2 - 1 - i) * 86400000);
    const row = byDay.get(dayKey(date));
    return { date, orders: Number(row?.orders ?? 0), revenue: Number(row?.revenue ?? 0) };
  });
  const previous = series.slice(0, DAYS);
  const current = series.slice(DAYS);
  const periodRevenue = current.reduce((sum, d) => sum + d.revenue, 0);
  const periodOrders = current.reduce((sum, d) => sum + d.orders, 0);
  const previousRevenue = previous.reduce((sum, d) => sum + d.revenue, 0);
  const change = previousRevenue ? (periodRevenue - previousRevenue) / previousRevenue : null;
  const axisMax = niceCeil(Math.max(...current.map((d) => d.revenue)));

  const counts = Object.fromEntries(statusCounts.map((s) => [s.status, s.count])) as Partial<
    Record<OrderStatus, number>
  >;
  const open = (["pending", "confirmed", "packed", "shipped"] as const).map((status) => ({
    status,
    count: counts[status] ?? 0,
  }));
  const openTotal = open.reduce((sum, s) => sum + s.count, 0);
  const allTotal = orderStatus.enumValues.reduce((sum, s) => sum + (counts[s] ?? 0), 0);

  const hour = Number(now.toLocaleString("pt-BR", { timeZone: TZ, hour: "2-digit", hour12: false }));
  const greeting = t.dashboard.greeting(hour, user.name || "");

  const tiles = [
    {
      label: t.dashboard.tileCall,
      value: queue.length,
      hint: queue.length ? t.dashboard.tileCallHintOldest(timeAgo(queue[0].createdAt, now)) : t.dashboard.tileCallHintClear,
      href: "#call-queue",
      icon: PhoneCall,
      tone: queue.length ? "warn" : "good",
    },
    {
      label: t.dashboard.tileToday,
      value: stats.today,
      hint: t.dashboard.tileTodayHint(periodOrders, DAYS),
      href: "/admin/orders",
      icon: ShoppingBag,
    },
    {
      label: t.dashboard.tileRevenue,
      value: formatMoney(Number(stats.revenue)),
      hint: t.dashboard.tileRevenueHint,
      href: "/admin/orders?status=delivered",
      icon: Wallet,
    },
    {
      label: t.dashboard.tileLowStock,
      value: stock.count,
      hint: stock.count ? t.dashboard.tileRestock : t.dashboard.tileStockOk,
      href: "/admin/products?stock=low",
      icon: Package,
      tone: stock.count ? "bad" : undefined,
    },
  ];

  return (
    <>
      <PageHeader
        title={greeting}
        description={`${formatDate(now, { weekday: "long", day: "numeric", month: "long" })} · ${t.dashboard.descWaiting(queue.length)}`}
        actions={
          <>
            <Link className="admin-btn" href="/admin/orders">
              {t.dashboard.allOrders}
            </Link>
            <Link className="admin-btn primary" href="/admin/products/new">
              <Plus size={16} /> {t.dashboard.newProduct}
            </Link>
          </>
        }
      />

      <div className="admin-kpis">
        {tiles.map(({ label, value, hint, href, icon: Icon, tone }) => (
          <Link key={label} href={href} className="admin-kpi" data-tone={tone}>
            <span className="admin-kpi-head">
              <span className="admin-icon-tile">
                <Icon size={18} strokeWidth={1.7} />
              </span>
              <ArrowUpRight size={16} className="admin-kpi-arrow" aria-hidden />
            </span>
            <span className="admin-kpi-label">{label}</span>
            <strong className="admin-kpi-value">{value}</strong>
            <span className="admin-kpi-hint">{hint}</span>
          </Link>
        ))}
      </div>

      <div className="admin-dash-grid">
        <div className="admin-stack">
        <Panel
          id="call-queue"
          className="admin-queue-panel"
          title={t.dashboard.callQueue}
          description={t.dashboard.callQueueDesc}
          actions={
            <Link className="admin-btn sm ghost" href="/admin/orders?status=pending">
              {t.dashboard.openList} <ArrowRight size={14} />
            </Link>
          }
        >
          {queue.length ? (
            <ol className="admin-queue">
              {queue.map((o, index) => {
                const age = hoursSince(o.createdAt, now);
                return (
                  <li key={o.id} className="admin-queue-item">
                    <span className="admin-queue-rank">{index + 1}</span>
                    <Avatar name={o.customerName} />
                    <div className="admin-queue-who">
                      <Link href={`/admin/orders/${o.id}`} className="admin-stretch">
                        {o.customerName}
                      </Link>
                      <span>
                        {o.orderNumber} · {o.items.reduce((sum, i) => sum + i.quantity, 0)} {t.common.items(o.items.reduce((sum, i) => sum + i.quantity, 0))} ·{" "}
                        {PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod}
                      </span>
                    </div>
                    <span className="admin-age" data-urgency={age >= 24 ? "high" : age >= 6 ? "mid" : "low"}>
                      <Clock size={13} /> {timeAgo(o.createdAt, now)}
                    </span>
                    <strong className="admin-queue-total">{formatMoney(o.total)}</strong>
                    <a className="admin-btn sm call" href={`tel:${o.customerPhone}`} aria-label={`${t.common.call} ${o.customerName} ${o.customerPhone}`}>
                      <Phone size={14} /> <span className="admin-hide-sm">{o.customerPhone}</span><span className="admin-show-sm">{t.common.call}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          ) : (
            <EmptyState icon={<CircleCheck size={22} />} title={t.dashboard.queueEmpty}>
              {t.dashboard.queueEmptyHint}
            </EmptyState>
          )}
        </Panel>

        <Panel
          className="admin-chart-panel"
          title={t.dashboard.revenue}
          description={t.dashboard.revenueDesc(DAYS)}
        >
          <div className="admin-hero-number">
            <strong>{formatMoney(periodRevenue)}</strong>
            {change !== null && (
              <span className="admin-delta" data-dir={change >= 0 ? "up" : "down"}>
                {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(Math.round(change * 100))}%
                <span className="admin-muted">{t.dashboard.vsPrevious(DAYS)}</span>
              </span>
            )}
          </div>
          <div className="admin-chart" aria-hidden>
            <div className="admin-chart-grid">
              {[1, 0.5, 0].map((f) => (
                <span key={f}>
                  <em>{f === 0 ? "0" : formatMoney(Math.round(axisMax * f))}</em>
                </span>
              ))}
            </div>
            <div className="admin-chart-bars">
              {current.map((d, i) => (
                <div
                  key={i}
                  className="admin-chart-col"
                  tabIndex={0}
                  data-edge={i < 3 ? "start" : i > DAYS - 4 ? "end" : undefined}
                >
                  <span className="admin-chart-bar" style={{ height: `${(d.revenue / axisMax) * 100}%` }} data-zero={d.revenue === 0 || undefined} />
                  <span className="admin-chart-tip">
                    <strong>{formatMoney(d.revenue)}</strong>
                    <span>
                      {d.orders} {t.common.orders(d.orders)} · {formatDate(d.date, { weekday: "short", day: "numeric", month: "short" })}
                    </span>
                  </span>
                  <span className="admin-chart-x" data-odd={i % 2 === 1 || undefined}>
                    {formatDate(d.date, { day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <table className="admin-sr-only">
            <caption>{t.dashboard.revenueDesc(DAYS)}</caption>
            <thead>
              <tr>
                <th>{t.dashboard.day}</th>
                <th>{t.orders.title}</th>
                <th>{t.dashboard.revenueCol}</th>
              </tr>
            </thead>
            <tbody>
              {current.map((d, i) => (
                <tr key={i}>
                  <td>{formatDate(d.date)}</td>
                  <td>{d.orders}</td>
                  <td>{formatMoney(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        </div>
        <div className="admin-stack">
          <Panel
            title={t.dashboard.pipeline}
            description={t.dashboard.pipelineDesc(openTotal, allTotal)}
          >
            <div className="admin-pipeline-bar" role="img" aria-label={open.map((s) => `${STATUS_LABELS[s.status]} ${s.count}`).join(", ")}>
              {open
                .filter((s) => s.count > 0)
                .map((s) => (
                  <span key={s.status} data-status={s.status} style={{ flexGrow: s.count }} />
                ))}
              {!openTotal && <span className="empty" />}
            </div>
            <ul className="admin-pipeline">
              {orderStatus.enumValues.map((status) => (
                <li key={status}>
                  <Link href={`/admin/orders?status=${status}`}>
                    <StatusBadge status={status} />
                    <strong>{counts[status] ?? 0}</strong>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title={t.dashboard.lowStock}
            description={t.dashboard.lowStockDesc(storeConfig.catalog.lowStockThreshold)}
            actions={
              stock.count > 0 && (
                <Link className="admin-btn sm ghost" href="/admin/products?stock=low">
                  {t.common.viewAll}
                </Link>
              )
            }
          >
            {lowRows.length ? (
              <ul className="admin-lowstock">
                {lowRows.map((v) => (
                  <li key={v.id}>
                    <span className="admin-thumb sm">
                      {v.product.images[0] && (
                        <Image unoptimized src={v.product.images[0].url} alt="" width={40} height={40} />
                      )}
                    </span>
                    <span className="admin-lowstock-name">
                      <Link href={`/admin/products/${v.productId}`} className="admin-stretch">
                        {v.product.name}
                      </Link>
                      <small>
                        {v.product.brand.name} · {v.sizeLabel ?? `${v.sizeMl} ml`}
                      </small>
                    </span>
                    <span className="admin-tag" data-tone={v.stockQuantity === 0 ? "bad" : "warn"}>
                      {v.stockQuantity === 0 ? t.dashboard.soldOut : t.dashboard.left(v.stockQuantity)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={<CircleCheck size={22} />} title={t.dashboard.stockHealthy} />
            )}
          </Panel>
        <Panel className="admin-activity-panel" title={t.dashboard.activity} description={t.dashboard.activityDesc}>
          {events.length ? (
            <ol className="admin-activity">
              {events.map((e) => {
                const Icon =
                  e.type === "call_logged" ? Phone : e.type === "note" ? StickyNote : e.type === "system" ? Info : e.toStatus === "cancelled" || e.toStatus === "returned" ? TriangleAlert : CircleCheck;
                return (
                  <li key={e.id} data-type={e.type} data-status={e.toStatus ?? undefined}>
                    <span className="admin-activity-icon">
                      <Icon size={14} />
                    </span>
                    <span className="admin-activity-body">
                      <span>
                        <Link href={`/admin/orders/${e.orderId}`}>{e.order.orderNumber}</Link>{" "}
                        {e.type === "status_change" && e.toStatus
                          ? e.fromStatus
                            ? t.dashboard.movedTo(STATUS_LABELS[e.toStatus].toLowerCase())
                            : t.dashboard.wasPlaced
                          : e.type === "call_logged"
                            ? t.dashboard.callLogged
                            : e.type === "note"
                              ? t.dashboard.noteAdded
                              : t.dashboard.updated}
                      </span>
                      {e.message && e.type !== "status_change" && <small>{e.message}</small>}
                    </span>
                    <time dateTime={e.createdAt.toISOString()}>{timeAgo(e.createdAt, now)}</time>
                  </li>
                );
              })}
            </ol>
          ) : (
            <EmptyState title={t.dashboard.noActivity} />
          )}
        </Panel>
        </div>
      </div>
    </>
  );
}
