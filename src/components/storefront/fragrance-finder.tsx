import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { homepageFragranceFinder } from "@/lib/storefront/copy";

export function FragranceFinder() {
  const f = homepageFragranceFinder();
  return (
    <section className="section fragrance-finder" aria-labelledby="fragrance-finder-title">
      <p className="fragrance-finder-eyebrow">{f.eyebrow}</p>
      <h2 id="fragrance-finder-title">{f.title}</h2>
      <p className="fragrance-finder-sub">{f.subtitle}</p>
      <div className="fragrance-finder-block">
        <p className="fragrance-finder-label">{f.forWho}</p>
        <div className="fragrance-finder-grid">
          {f.audience.map((item) => (
            <Link key={item.href} href={item.href} className="fragrance-finder-card">
              <strong>{item.title}</strong>
              <span>{item.hint}</span>
              <ArrowUpRight size={16} aria-hidden className="fragrance-finder-arrow" />
            </Link>
          ))}
        </div>
      </div>
      <div className="fragrance-finder-block">
        <p className="fragrance-finder-label">{f.byStyle}</p>
        <div className="fragrance-finder-grid">
          {f.styles.map((item) => (
            <Link key={item.title} href={item.href} className="fragrance-finder-card">
              <strong>{item.title}</strong>
              <span>{item.hint}</span>
              <ArrowUpRight size={16} aria-hidden className="fragrance-finder-arrow" />
            </Link>
          ))}
        </div>
      </div>
      <div className="fragrance-finder-cta">
        <Link href="/products" className="button primary">
          {f.viewAll}
        </Link>
      </div>
    </section>
  );
}
