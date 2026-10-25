"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Expand, MessageCircle, Minus, Phone, PhoneCall, Plus, Share, Truck, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ProductDetail } from "@/lib/catalog/query";
import { formatMoney, calcDiscountPercent } from "@/lib/money";
import { label } from "@/lib/catalog/labels";
import { copy } from "@/lib/storefront/copy";
import { storeConfig as config } from "../../../store.config";
import { WishlistButton } from "./wishlist-button";
import { Media } from "./media";
import { Stars } from "./ui";
import { useCart } from "./cart-provider";
import { haptic } from "./device";
const tel = `tel:${config.contact.phone.replace(/\s/g, "")}`;
const paymentNames = Object.entries(config.checkout.paymentMethods)
  .filter(([, method]) => method.enabled)
  .map(([key, method]) => ("label" in method ? method.label : key === "bkash" ? "PIX" : "Nagad"));

/** Native share sheet where the browser has one (phones); renders nothing elsewhere. */
function ShareButton({ name }: { name: string }) {
  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setCanShare(typeof navigator.share === "function"), 0);
    return () => clearTimeout(timer);
  }, []);
  if (!canShare) return null;
  return (
    <button
      type="button"
      className="icon-button gallery-share"
      aria-label={copy.product.share(name)}
      onClick={() => {
        haptic(6);
        navigator.share({ title: name, url: window.location.href }).catch(() => {});
      }}
    >
      <Share size={17} aria-hidden />
    </button>
  );
}

export function ProductGallery({
  images,
  name,
}: {
  images: ProductDetail["images"];
  name: string;
}) {
  const [index, setIndex] = useState(0);
  const selected = images[index];
  const track = useRef<HTMLButtonElement>(null);
  // Phones swipe through the frames (a scroll-snap strip, see app-shell.css); the dots follow.
  const onScroll = () => {
    const element = track.current;
    if (!element || !element.clientWidth) return;
    const next = Math.round(element.scrollLeft / element.clientWidth);
    if (next !== index && images[next]) setIndex(next);
  };
  const choose = (i: number) => {
    setIndex(i);
    const element = track.current;
    if (element && element.scrollWidth > element.clientWidth) element.scrollTo({ left: i * element.clientWidth });
  };
  return (
    <div className="product-gallery">
      <Dialog>
        <DialogTrigger ref={track} className="gallery-main" aria-label={copy.product.enlarge(name)} onScroll={onScroll}>
          {images.length ? (
            images.map((image, i) => (
              <div key={image.id} className="gallery-frame" data-selected={index === i} aria-hidden={index !== i}>
                <Media priority={i === 0} src={image.url} alt={image.alt ?? name} sizes="(max-width: 900px) 100vw, 50vw" />
              </div>
            ))
          ) : (
            <Media alt={name} />
          )}
          <span className="gallery-zoom" aria-hidden>
            <Expand size={16} />
          </span>
        </DialogTrigger>
        <DialogContent className="gallery-dialog">
          <DialogTitle className="sr-only">{name}</DialogTitle>
          <DialogDescription className="sr-only">{copy.product.enlargedImage}</DialogDescription>
          <Media src={selected?.url} alt={selected?.alt ?? name} sizes="90vw" />
        </DialogContent>
      </Dialog>
      <ShareButton name={name} />
      {images.length > 1 && (
        <div className="gallery-dots" aria-hidden>
          {images.map((image, i) => (
            <span key={image.id} data-active={index === i || undefined} />
          ))}
        </div>
      )}
      {images.length > 1 && (
        <div className="gallery-thumbnails">
          {images.map((img, i) => (
            <button key={img.id} aria-label={copy.product.viewImage(i)} aria-pressed={index === i} onClick={() => choose(i)}>
              <Media src={img.url} alt="" sizes="96px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductBuyBox({
  product: p,
  rating,
}: {
  product: ProductDetail;
  /** null when reviews are switched off. */
  rating?: { average: number; count: number } | null;
}) {
  const cart = useCart();
  const [variantId, setVariantId] = useState(
    p.variants.find((v) => v.stockQuantity > 0)?.id ?? p.variants[0]?.id,
  );
  const [quantity, setQuantity] = useState(1);
  // The floating mobile bar appears only once the main button has scrolled away.
  const purchaseRow = useRef<HTMLDivElement>(null);
  const [barVisible, setBarVisible] = useState(false);
  useEffect(() => {
    const row = purchaseRow.current;
    if (!row) return;
    // "Scrolled away" means gone under the sticky header, not just off the top of the screen.
    const header = document.querySelector(".store-header")?.getBoundingClientRect().height ?? 0;
    const observer = new IntersectionObserver(
      ([entry]) => setBarVisible(!entry.isIntersecting && entry.boundingClientRect.top < header),
      { rootMargin: `-${Math.round(header)}px 0px 0px 0px` },
    );
    // On phones the button stacks above the stepper, so watch the button itself.
    observer.observe(row.querySelector(".add-to-bag") ?? row);
    return () => observer.disconnect();
  }, []);
  const v = p.variants.find((v) => v.id === variantId);
  const heading = (
    <>
      <Link href={`/brands/${p.brand.slug}`} className="buy-brand">
        {p.brand.name}
      </Link>
      <h1>{p.name}</h1>
      {rating && (
        <a href="#reviews" className="buy-rating">
          {rating.count ? (
            <>
              <Stars value={rating.average} />
              <span>
                {rating.average.toFixed(1)}
                <span className="muted">
                  {" "}
                  · {rating.count} {copy.product.review(rating.count)}
                </span>
              </span>
            </>
          ) : (
            <span className="muted">{copy.reviews.noReviewsYet}</span>
          )}
        </a>
      )}
    </>
  );
  if (!v)
    return (
      <div className="buy-box">
        {heading}
        <p className="callout">{copy.product.noSizes}</p>
        <Link href="/products" className="button">
          {copy.cart.browse}
        </Link>
      </div>
    );
  const low = v.stockQuantity <= (v.lowStockOverride ?? config.catalog.lowStockThreshold);
  const discount = calcDiscountPercent(v.retailPrice, v.price);
  const soldOut = v.stockQuantity === 0;
  const size = v.sizeLabel ?? `${v.sizeMl} ml`;
  const wa = config.contact.whatsapp
    ? `https://wa.me/${config.contact.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(copy.product.whatsappAsk(p.brand.name, p.name, size))}`
    : null;
  const add = () => {
    haptic(8);
    void cart.add({ variantId: v.id, qty: quantity, price: v.price });
  };
  const disabled = !cart.ready || cart.busy || soldOut;
  return (
    <div className="buy-box">
      {heading}
      <div className="buy-tags">
        <span className="chip">{label(p.concentration)}</span>
        <span className="chip">{label(p.gender)}</span>
        {p.packaging !== "standard" && <span className="chip">{label(p.packaging)}</span>}
      </div>

      <div className="buy-price buy-price-dual">
        <p className="price-pix">
          <span className="price-pix-label">PIX</span>
          <strong>{formatMoney(v.price)}</strong>
        </p>
        <p className="price-card muted">
          Cartão <strong>{formatMoney(v.cardPrice || v.retailPrice)}</strong>
        </p>
        {config.features.dealBadges && discount > 0 && <span className="badge deal">{copy.product.savePercent(discount)}</span>}
      </div>
      <p className="stock-state" data-tone={soldOut ? "bad" : low ? "warn" : "good"}>
        <i aria-hidden />
        {soldOut ? copy.product.soldOut : low ? copy.product.onlyLeft(v.stockQuantity) : copy.product.inStock}
      </p>

      {p.variants.length > 1 && (
        <fieldset className="size-picker">
          <legend>
            {copy.product.size} <span>{size}</span>
          </legend>
          <div className="size-options">
            {p.variants.map((variant) => (
              <button
                type="button"
                key={variant.id}
                disabled={variant.stockQuantity === 0}
                aria-pressed={variant.id === v.id}
                onClick={() => {
                  setVariantId(variant.id);
                  setQuantity(1);
                }}
              >
                <strong>{variant.sizeLabel ?? `${variant.sizeMl} ml`}</strong>
                <span>{variant.stockQuantity === 0 ? copy.product.soldOut : formatMoney(variant.price)}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="purchase-row" ref={purchaseRow}>
        <div className="quantity-control" role="group" aria-label={copy.product.quantity}>
          <button aria-label={copy.product.decreaseQty} disabled={quantity <= 1 || soldOut} onClick={() => setQuantity((q) => q - 1)}>
            <Minus size={15} />
          </button>
          <output aria-live="polite">{quantity}</output>
          <button
            aria-label={copy.product.increaseQty}
            disabled={quantity >= Math.min(v.stockQuantity, 999)}
            onClick={() => setQuantity((q) => q + 1)}
          >
            <Plus size={15} />
          </button>
        </div>
        <button className="button primary lg add-to-bag" disabled={disabled} onClick={add}>
          {soldOut ? copy.product.soldOut : cart.busy ? copy.product.adding : copy.product.addToBag}
        </button>
        {config.features.wishlist && <WishlistButton id={p.id} name={p.name} />}
      </div>

      <div className="buy-note">
        <span className="icon-tile sm">
          <PhoneCall size={15} aria-hidden />
        </span>
        <p>{config.checkout.confirmationNote}</p>
      </div>

      <div className="buy-panel">
        <div className="buy-panel-row">
          <span className="icon-tile sm">
            <Truck size={15} aria-hidden />
          </span>
          <div>
            <strong>{copy.product.delivery}</strong>
            <ul className="delivery-zones">
              {config.checkout.deliveryZones.map((zone) => (
                <li key={zone.id}>
                  <span>{zone.label}</span>
                  <span>
                    {zone.etaDays} · {formatMoney(zone.fee)}
                  </span>
                </li>
              ))}
            </ul>
            {config.checkout.freeDeliveryOver !== null && (
              <small>{copy.product.freeDeliveryOver(formatMoney(config.checkout.freeDeliveryOver))}</small>
            )}
            {p.groundShippingOnly && <small>{copy.product.groundOnly}</small>}
          </div>
        </div>
        <div className="buy-panel-row">
          <span className="icon-tile sm">
            <Wallet size={15} aria-hidden />
          </span>
          <div>
            <strong>{copy.product.payment}</strong>
            <small>{paymentNames.join(" · ")}</small>
          </div>
        </div>
      </div>

      <div className="buy-help">
        <p>{copy.pdp.questions}</p>
        <div>
          <a className="button sm" href={tel}>
            <Phone size={14} aria-hidden /> {copy.product.callUs}
          </a>
          {wa && (
            <a className="button sm" href={wa} target="_blank" rel="noreferrer">
              <MessageCircle size={14} aria-hidden /> WhatsApp
            </a>
          )}
        </div>
      </div>

      <p className="buy-meta">
        <span>
          {copy.product.sku} {v.sku}
        </span>
        {v.barcode && (
          <span>
            {copy.product.barcode} {v.barcode}
          </span>
        )}
        <Link href="/pages/authenticity" className="text-link">
          {copy.product.authenticity}
        </Link>
      </p>

      <MobileBuyBar visible={barVisible}>
        <div>
          <strong>{formatMoney(v.price)}</strong>
          <span>{size}</span>
        </div>
        <button disabled={disabled} className="button primary" onClick={add} tabIndex={barVisible ? 0 : -1}>
          {soldOut ? copy.product.soldOut : cart.busy ? copy.product.adding : copy.product.addToBag}
        </button>
      </MobileBuyBar>
    </div>
  );
}

/** Docked buy bar. Portalled to <body>, so it stays fixed while the page recedes behind a sheet. */
function MobileBuyBar({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => setHost(document.body), 0);
    return () => clearTimeout(timer);
  }, []);
  const bar = (
    <div className="mobile-buy-bar" data-visible={visible || undefined} aria-hidden={!visible}>
      {children}
    </div>
  );
  return host ? createPortal(bar, host) : null;
}
