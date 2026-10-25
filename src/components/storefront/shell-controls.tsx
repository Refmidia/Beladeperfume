"use client";
import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";
import { storeConfig } from "../../../store.config";
import { copy } from "@/lib/storefront/copy";
import { CartDrawer } from "./cart";
import { WishlistSheet } from "./wishlist";
import { SearchForm } from "./search-suggest";

export { SearchForm };

/** Right-side icons: search (phones), wishlist, bag. */
export function HeaderActions() {
  return (
    <div className="header-actions">
      <Link className="icon-button mobile-only" href="/search" aria-label={copy.common.searchFragrances}>
        <Search size={18} />
      </Link>
      {storeConfig.features.wishlist && <WishlistSheet />}
      <CartDrawer />
    </div>
  );
}

function AnnouncementItem({
  message,
}: {
  message: { title: string | null; href: string | null; rel?: string };
}) {
  if (message.href) {
    return (
      <Link href={message.href} rel={message.rel} className="announcement-link">
        {message.title}
      </Link>
    );
  }
  return <span>{message.title}</span>;
}

function AnnouncementCycle({
  messages,
  duplicate,
}: {
  messages: { title: string | null; href: string | null; rel?: string }[];
  duplicate?: boolean;
}) {
  return (
    <span className="announcement-marquee-group" aria-hidden={duplicate || undefined}>
      {messages.map((message, i) => (
        <span className="announcement-marquee-item" key={`${duplicate ? "dup-" : ""}${i}`}>
          {i > 0 ? (
            <span className="announcement-sep" aria-hidden>
              ·
            </span>
          ) : null}
          <AnnouncementItem message={message} />
        </span>
      ))}
    </span>
  );
}

export function Announcement({
  messages,
}: {
  messages: { title: string | null; href: string | null; rel?: string }[];
}) {
  if (!messages.length) return null;

  return (
    <div className="announcement">
      <div className="announcement-marquee" aria-live="off">
        <div className="announcement-marquee-track">
          <AnnouncementCycle messages={messages} />
          <AnnouncementCycle messages={messages} duplicate />
        </div>
      </div>
    </div>
  );
}

export function Newsletter() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <form
      className="newsletter"
      onSubmit={(event) => {
        event.preventDefault();
        console.info("Newsletter signup stub");
        setSubmitted(true);
      }}
    >
      <label>
        <span className="sr-only">{copy.footer.newsletterLabel}</span>
        <input type="email" placeholder={copy.footer.newsletterHint} disabled={submitted} />
      </label>
      <button type="submit" disabled={submitted}>
        {submitted ? copy.footer.newsletterSoon : copy.footer.subscribe}
      </button>
    </form>
  );
}
