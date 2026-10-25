"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Search, X } from "lucide-react";
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

export function Announcement({
  messages,
}: {
  messages: { title: string | null; href: string | null; rel?: string }[];
}) {
  const announcementRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = !!sessionStorage.getItem("attar-announcement-dismissed");
    } catch {}
    if (dismissed) {
      const timer = setTimeout(() => setHidden(true), 0);
      return () => clearTimeout(timer);
    }
  }, []);
  if (hidden || !messages.length) return null;

  const row = (
    <span className="announcement-marquee-group">
      {messages.map((message, i) => (
        <span className="announcement-marquee-item" key={i}>
          <AnnouncementItem message={message} />
          <span className="announcement-sep" aria-hidden>
            {" "}
            ·{" "}
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <div className="announcement" ref={announcementRef}>
      <div className="announcement-marquee" aria-live="off">
        <div className="announcement-marquee-track">
          {row}
          <span className="announcement-marquee-group" aria-hidden>
            {messages.map((message, i) => (
              <span className="announcement-marquee-item" key={`dup-${i}`}>
                <AnnouncementItem message={message} />
                <span className="announcement-sep" aria-hidden>
                  {" "}
                  ·{" "}
                </span>
              </span>
            ))}
          </span>
        </div>
      </div>
      <button
        className="announcement-close"
        aria-label={copy.announcement.dismiss}
        onClick={() => {
          setHidden(true);
          try {
            sessionStorage.setItem("attar-announcement-dismissed", "1");
          } catch {}
        }}
      >
        <X size={14} />
      </button>
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
