"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./cart-provider";
import { CartFeedback, CartLoading, CouponForm, EmptyCart } from "./cart";
import { checkoutSchema, deliveryTotals } from "@/lib/checkout/schema";
import { placeOrder } from "@/lib/checkout/actions";
import { formatMoney } from "@/lib/money";
import { storeConfig as config } from "../../../store.config";
import { copy } from "@/lib/storefront/copy";

function paymentLabel(key: Method) {
  if (key === "cod") return config.checkout.paymentMethods.cod.label;
  if (key === "bkash") return "PIX";
  return "Cartão";
}
type Method = "cod" | "bkash" | "nagad";
export function PaymentInstructions({ method }: { method: Method }) {
  const payment = config.checkout.paymentMethods[method];
  if (!payment.enabled) return null;
  return (
    <div className="payment-instructions">
      {"number" in payment && (
        <p>
          {copy.checkout.sendTo} <strong>{payment.number}</strong>{" "}
          <span className="muted">{copy.checkout.account}</span>
        </p>
      )}
      <p>{payment.instructions}</p>
    </div>
  );
}
export function CheckoutPage() {
  const cart = useCart(),
    router = useRouter();
  const [zoneId, setZoneId] = useState(config.checkout.deliveryZones[0].id);
  const enabled = (
    Object.keys(config.checkout.paymentMethods) as Method[]
  ).filter((key) => config.checkout.paymentMethods[key].enabled);
  const [method, setMethod] = useState<Method>(enabled[0] ?? "cod");
  useEffect(() => {
    cart.setCheckoutPayment(method);
  }, [method]);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );
  const [error, setError] = useState(""),
    [pending, setPending] = useState(false);
  const submitting = useRef(false),
    requestId = useRef<string | null>(null);
  const totals = deliveryTotals(cart.subtotal, zoneId, cart.discount);
  const submitDisabled = pending || cart.busy || Boolean(cart.error) || !enabled.length;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    requestId.current ??= crypto.randomUUID();
    const input = {
      ...values,
      zoneId,
      paymentMethod: method,
      requestId: requestId.current,
      // Only a code that currently applies is sent; the server re-validates it.
      ...(cart.coupon
        ? { couponCode: cart.coupon.code, couponDiscount: cart.discount }
        : {}),
      lines: cart.items.map(({ variantId, qty, price }) => ({
        variantId,
        qty,
        price,
      })),
    };
    const parsed = checkoutSchema.safeParse(input);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      setError(copy.checkout.checkFields);
      const field = parsed.error.issues[0]?.path[0];
      if (typeof field === "string")
        (form.elements.namedItem(field) as HTMLElement | null)?.focus();
      return;
    }
    submitting.current = true;
    setPending(true);
    setError("");
    setErrors({});
    try {
      const result = await placeOrder(input);
      if (result.orderNumber) {
        cart.clear();
        router.replace(
          `/order/confirmed/${encodeURIComponent(result.orderNumber)}`,
        );
        return;
      }
      setError(result.error ?? copy.checkout.orderFailed);
      if (result.fields) setErrors(result.fields);
      await cart.refresh();
    } catch {
      setError(copy.checkout.connectionLost);
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }
  const field = (
    name: string,
    title: string,
    options: {
      type?: string;
      autoComplete?: string;
      max?: number;
      optional?: boolean;
      placeholder?: string;
    } = {},
  ) => (
    <div className="checkout-field">
      <label htmlFor={name}>
        {title}
        {options.optional && <span className="muted">, {copy.common.optional}</span>}
      </label>
      <input
        id={name}
        name={name}
        type={options.type ?? "text"}
        autoComplete={options.autoComplete}
        maxLength={options.max ?? 120}
        required={!options.optional}
        placeholder={options.placeholder}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
      />
      {errors[name] && (
        <p id={`${name}-error`} className="form-error">
          {errors[name]?.[0]}
        </p>
      )}
    </div>
  );
  if (!cart.ready)
    return (
      <div className="store-width commerce-page">
        <h1>{copy.checkout.title}</h1>
        <CartLoading />
      </div>
    );
  if (!cart.items.length)
    return (
      <div className="store-width commerce-page">
        <h1>{copy.checkout.title}</h1>
        <CartFeedback />
        <EmptyCart />
      </div>
    );
  return (
    <div className="store-width commerce-page">
      <div className="commerce-heading">
        <h1>{copy.checkout.title}</h1>
        <Link href="/cart" className="text-link">
          {copy.checkout.editBag}
        </Link>
      </div>
      <CartFeedback />
      <form
        noValidate
        onSubmit={submit}
        className="commerce-grid checkout-form"
        aria-busy={pending}
      >
        <fieldset className="checkout-fields" disabled={pending}>
          <section>
            <h2>{copy.checkout.contact}</h2>
            {field("name", copy.checkout.fullName, { autoComplete: "name" })}
            {field("phone", copy.checkout.mobile, {
              type: "tel",
              autoComplete: "tel",
              max: 30,
              placeholder: copy.checkout.phonePlaceholder,
            })}
            {field("email", copy.checkout.email, {
              type: "email",
              autoComplete: "email",
              optional: true,
              max: 254,
            })}
          </section>
          <section>
            <h2>{copy.checkout.delivery}</h2>
            {field("line1", copy.checkout.street, {
              autoComplete: "address-line1",
              max: 240,
            })}
            <div className="checkout-field-pair">
              {field("area", copy.checkout.area, {
                autoComplete: "address-level3",
                max: 100,
              })}
              {field("city", copy.checkout.city, {
                autoComplete: "address-level2",
                max: 100,
              })}
            </div>
            <div className="checkout-field">
              <label htmlFor="zoneId">{copy.checkout.zone}</label>
              <select
                id="zoneId"
                name="zoneId"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
              >
                {config.checkout.deliveryZones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.label} · {formatMoney(zone.fee)} · {zone.etaDays}
                  </option>
                ))}
              </select>
            </div>
          </section>
          <section>
            <h2>{copy.checkout.payment}</h2>
            <fieldset className="payment-methods">
              <legend className="sr-only">{copy.checkout.paymentLegend}</legend>
              {enabled.map((key) => (
                <label key={key} data-selected={key === method}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={key}
                    checked={key === method}
                    onChange={() => setMethod(key)}
                  />
                  <span>{paymentLabel(key)}</span>
                </label>
              ))}
            </fieldset>
            {!enabled.length ? (
              <p role="alert">
                {copy.checkout.noPayment}
              </p>
            ) : (
              <PaymentInstructions method={method} />
            )}
            {method !== "cod" &&
              field("txnId", copy.checkout.txnId, {
                max: 80,
                autoComplete: "off",
              })}
          </section>
          <div className="checkout-field">
            <label htmlFor="note">
              {copy.checkout.orderNote} <span className="muted">, {copy.common.optional}</span>
            </label>
            <textarea id="note" name="note" rows={3} maxLength={1000} />
          </div>
          <div className="checkout-trap" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              maxLength={200}
            />
          </div>
        </fieldset>
        <aside className="checkout-summary">
          <h2>{copy.checkout.yourOrder}</h2>
          <ul className="checkout-items">
            {cart.items.map((item) => (
              <li key={item.variantId}>
                <span>
                  {item.name}
                  <small>
                    {item.label} · {copy.checkout.qty} {item.qty}
                  </small>
                </span>
                <span>{formatMoney(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>
          <CouponForm />
          <dl className="checkout-totals">
            <div>
              <dt>{copy.checkout.subtotal}</dt>
              <dd>{formatMoney(cart.subtotal)}</dd>
            </div>
            {cart.coupon && (
              <>
                <div className="coupon-line">
                  <dt>{copy.checkout.coupon} {cart.coupon.code}</dt>
                  <dd>−{formatMoney(cart.discount)}</dd>
                </div>
                <div className="after-coupon">
                  <dt>{copy.checkout.afterCoupon}</dt>
                  <dd>{formatMoney(cart.subtotal - cart.discount)}</dd>
                </div>
              </>
            )}
            <div>
              <dt>{copy.checkout.deliveryFee}</dt>
              <dd>{formatMoney(totals.fee + totals.saving)}</dd>
            </div>
            {totals.saving > 0 && (
              <div>
                <dt>{copy.checkout.freeDeliverySaving}</dt>
                <dd>−{formatMoney(totals.saving)}</dd>
              </div>
            )}
            <div className="grand-total">
              <dt>{copy.checkout.total}</dt>
              <dd>{formatMoney(totals.total)}</dd>
            </div>
          </dl>
          <p className="confirmation-note">
            {config.checkout.confirmationNote}
          </p>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button primary checkout-submit" type="submit" disabled={submitDisabled}>
            {pending ? copy.checkout.placing : copy.checkout.placeOrder}
          </button>
          <p className="muted checkout-privacy">
            {copy.checkout.privacy}{" "}
            <Link href="/pages/privacy" className="text-link">
              {copy.checkout.privacyLink}
            </Link>
          </p>
        </aside>
        {/* Phones: the total and the order button stay docked while the form scrolls (app-shell.css). */}
        <div className="checkout-dock">
          {error && (
            <p className="checkout-dock-error" aria-hidden>
              {error}
            </p>
          )}
          <p>
            <small>{copy.checkout.total}</small>
            <strong>{formatMoney(totals.total)}</strong>
          </p>
          <button className="button primary" type="submit" disabled={submitDisabled}>
            {pending ? copy.checkout.placingShort : copy.checkout.placeOrder}
          </button>
        </div>
      </form>
    </div>
  );
}
