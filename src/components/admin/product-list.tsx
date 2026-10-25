"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Package, Plus, Star, X } from "lucide-react";
import { productFlags } from "@/lib/admin/actions";
import { adminCopy as t } from "@/lib/admin/copy";
import { formatMoney } from "@/lib/money";
import { storeConfig } from "../../../store.config";
type Row = {
  id: string;
  name: string;
  brand: string;
  sizeMl: number | null;
  sizeLabel: string | null;
  reviewPending?: boolean;
  concentration: string;
  isActive: boolean;
  isFeatured: boolean;
  image: string | null;
  variants: number;
  min: number;
  max: number;
  stock: number;
  cost?: number | null;
  pix?: number;
  card?: number;
  suggested?: number | null;
  marginPix?: number | null;
};
function Stock({ stock }: { stock: number }) {
  const tone = stock === 0 ? "bad" : stock <= storeConfig.catalog.lowStockThreshold ? "warn" : "good";
  return (
    <span className="admin-stock" data-tone={tone}>
      <i aria-hidden />
      {stock === 0 ? t.products.outOfStock : t.products.inStock(stock)}
    </span>
  );
}
function Price({ r }: { r: Row }) {
  return (
    <>
      {r.min === r.max ? formatMoney(r.min) : `${formatMoney(r.min)} – ${formatMoney(r.max)}`}
      <small>
        {r.variants} {t.products.size(r.variants)}
      </small>
    </>
  );
}
export function ProductList({ rows }: { rows: Row[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, start] = useTransition();
  const router = useRouter();
  function update(
    ids: string[],
    flags: { isActive?: boolean; isFeatured?: boolean },
  ) {
    start(async () => {
      try {
        const r = await productFlags(ids, flags);
        if (r.ok) {
          toast.success(r.message);
          setSelected([]);
        } else toast.error(r.message);
        router.refresh();
      } catch {
        toast.error(t.messages.saveFailed);
      }
    });
  }
  const toggle = (id: string, on: boolean) =>
    setSelected(on ? [...selected, id] : selected.filter((v) => v !== id));
  if (!rows.length)
    return (
      <div className="admin-table-card">
        <div className="admin-empty">
          <span className="admin-empty-icon">
            <Package size={22} />
          </span>
          <strong>{t.products.emptyTitle}</strong>
          <p>{t.products.emptyHint}</p>
          <Link className="admin-btn primary" href="/admin/products/new">
            <Plus size={16} /> {t.products.newProduct}
          </Link>
        </div>
      </div>
    );
  return (
    <>
      <div className="admin-table-card">
        <table className="admin-table admin-desktop-only">
          <thead>
            <tr>
              <th className="check">
                <input
                  type="checkbox"
                  className="admin-checkbox"
                  aria-label={t.products.selectAll}
                  checked={rows.length > 0 && selected.length === rows.length}
                  onChange={(e) =>
                    setSelected(e.target.checked ? rows.map((r) => r.id) : [])
                  }
                />
              </th>
              <th>{t.products.colProduct}</th>
              <th>Volume</th>
              <th>Custo</th>
              <th>Pix</th>
              <th>Cartão</th>
              <th>Margem Pix</th>
              <th>{t.products.colStock}</th>
              <th className="center">{t.products.colActive}</th>
              <th className="center">{t.products.colFeatured}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="admin-row-link" data-selected={selected.includes(r.id) || undefined}>
                <td className="check">
                  <input
                    type="checkbox"
                    className="admin-checkbox admin-above"
                    aria-label={t.products.selectProduct(r.name)}
                    checked={selected.includes(r.id)}
                    onChange={(e) => toggle(r.id, e.target.checked)}
                  />
                </td>
                <td>
                  <span className="admin-product-cell">
                    <span className="admin-thumb">
                      {r.image && (
                        <Image unoptimized width={56} height={56} src={r.image} alt="" />
                      )}
                    </span>
                    <span>
                      <Link href={`/admin/products/${r.id}`} className="admin-stretch admin-strong">
                        {r.name}
                      </Link>
                      <small>
                        {r.brand} · {r.concentration.toUpperCase()}
                        {r.reviewPending ? " · Revisão pendente" : ""}
                      </small>
                    </span>
                  </span>
                </td>
                <td>{r.sizeLabel ?? (r.sizeMl != null ? `${r.sizeMl} ml` : "—")}</td>
                <td className="num">{r.cost != null ? formatMoney(r.cost) : "—"}</td>
                <td className="num">{formatMoney(r.pix ?? r.min)}</td>
                <td className="num">{formatMoney(r.card ?? r.max)}</td>
                <td className="num">{r.marginPix != null ? `${r.marginPix.toFixed(1)}%` : "—"}</td>
                <td>
                  <Stock stock={r.stock} />
                </td>
                <td className="center">
                  <input
                    type="checkbox"
                    role="switch"
                    className="admin-switch admin-above"
                    aria-label={t.products.visibleInStore(r.name)}
                    checked={r.isActive}
                    disabled={pending}
                    onChange={(e) => update([r.id], { isActive: e.target.checked })}
                  />
                </td>
                <td className="center">
                  <button
                    type="button"
                    className="admin-star admin-above"
                    aria-pressed={r.isFeatured}
                    aria-label={t.products.featureProduct(r.name)}
                    disabled={pending}
                    onClick={() => update([r.id], { isFeatured: !r.isFeatured })}
                  >
                    <Star size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="admin-cards admin-mobile-only">
          {rows.map((r) => (
            <li key={r.id} className="admin-card-row product">
              <input
                type="checkbox"
                className="admin-checkbox admin-above"
                aria-label={t.products.selectProduct(r.name)}
                checked={selected.includes(r.id)}
                onChange={(e) => toggle(r.id, e.target.checked)}
              />
              <span className="admin-thumb">
                {r.image && <Image unoptimized width={56} height={56} src={r.image} alt="" />}
              </span>
              <span className="admin-card-row-main">
                <Link href={`/admin/products/${r.id}`} className="admin-stretch admin-strong">
                  {r.name}
                </Link>
                <small>
                  {r.brand} · <Price r={r} />
                </small>
                <Stock stock={r.stock} />
              </span>
              <span className="admin-card-row-side">
                <input
                  type="checkbox"
                  role="switch"
                  className="admin-switch admin-above"
                  aria-label={t.products.visibleInStore(r.name)}
                  checked={r.isActive}
                  disabled={pending}
                  onChange={(e) => update([r.id], { isActive: e.target.checked })}
                />
                <button
                  type="button"
                  className="admin-star admin-above"
                  aria-pressed={r.isFeatured}
                  aria-label={t.products.featureProduct(r.name)}
                  disabled={pending}
                  onClick={() => update([r.id], { isFeatured: !r.isFeatured })}
                >
                  <Star size={18} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="admin-bulkbar" data-visible={selected.length > 0 || undefined} aria-hidden={!selected.length}>
        <span>{t.products.selected(selected.length)}</span>
        <button
          type="button"
          className="admin-btn sm"
          tabIndex={selected.length ? 0 : -1}
          disabled={pending}
          onClick={() => update(selected, { isActive: true })}
        >
          <Eye size={14} /> {t.products.showInStore}
        </button>
        <button
          type="button"
          className="admin-btn sm"
          tabIndex={selected.length ? 0 : -1}
          disabled={pending}
          onClick={() => update(selected, { isActive: false })}
        >
          <EyeOff size={14} /> {t.products.hide}
        </button>
        <button
          type="button"
          className="admin-btn icon sm ghost"
          tabIndex={selected.length ? 0 : -1}
          aria-label={t.products.clearSelection}
          onClick={() => setSelected([])}
        >
          <X size={14} />
        </button>
      </div>
    </>
  );
}
