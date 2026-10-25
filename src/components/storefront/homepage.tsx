import { Fragment } from "react";
import Link from "next/link";
import { ugcRel } from "@/lib/demo/links";
import {
  ArrowRight,
  ArrowUpRight,
  MessageCircle,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { getBanners, getNavigation, getSections } from "@/lib/catalog/content";
import { queryCatalog } from "@/lib/catalog/query";
import { copy, heroSlideText, homepageValueProps } from "@/lib/storefront/copy";
import { storeConfig } from "../../../store.config";
import { RecentlyViewed } from "./recently-viewed";
import type { homepageSections } from "@/db/schema";
import { StoreCarousel } from "./carousel";
import { ProductCard } from "./product-card";
import { Media } from "./media";
import { SectionHead } from "./ui";
import { shop, shopIcons } from "./shell";
import { FragranceFinder } from "./fragrance-finder";

/*
 * Homepage sections render in the order set in Admin → Homepage.
 * Each `type` below maps to one renderer; see AGENTS.md "Add a homepage
 * section type" to add another.
 */
type Section = typeof homepageSections.$inferSelect;
const valueIcons = {
  "shield-check": ShieldCheck,
  phone: Phone,
  truck: Truck,
  "message-circle": MessageCircle,
};

async function HomeSection({ section: s }: { section: Section }) {
  const [banners, nav] = await Promise.all([getBanners(), getNavigation()]);

  if (s.type === "hero") {
    const heroes = banners.filter((b) => b.placement === "hero");
    if (!heroes.length) return <FallbackHero />;
    return (
      <section className="hero" aria-label={copy.homepage.featured}>
        <StoreCarousel hero label={copy.homepage.featured}>
          {heroes.map((b, index) => {
            const slide = heroSlideText(index, b);
            return (
            <div className="hero-slide" key={b.id}>
              <div className="hero-copy">
                {index === 0 ? <h1>{slide.title}</h1> : <h2>{slide.title}</h2>}
                {slide.subtitle && <p>{slide.subtitle}</p>}
                <div className="hero-actions">
                  {slide.href && (
                    <Link className="button primary lg" href={slide.href} rel={ugcRel(slide.href)}>
                      {slide.ctaLabel} <ArrowRight size={18} aria-hidden />
                    </Link>
                  )}
                  <Link className="button lg" href="/products">
                    {copy.footer.allFragrances}
                  </Link>
                </div>
              </div>
              <Media
                className="hero-media"
                priority={index === 0}
                src={b.imageUrl}
                alt={slide.title || copy.homepage.collectionAlt}
                sizes="(max-width: 800px) 100vw, 55vw"
              />
            </div>
          );
          })}
        </StoreCarousel>
      </section>
    );
  }

  if (s.type === "value_props")
    return (
      <section className="trust-row" aria-label={copy.homepage.whyShop}>
        {homepageValueProps().map((item) => {
          const Icon = valueIcons[item.icon as keyof typeof valueIcons] ?? ShieldCheck;
          return (
            <div className="trust-item" key={item.title}>
              <span className="icon-tile">
                <Icon size={18} strokeWidth={1.7} aria-hidden />
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          );
        })}
      </section>
    );

  if (s.type === "category_tiles")
    return (
      <section className="section">
        <SectionHead title={s.title ?? copy.homepage.shopByCategory} description={s.subtitle} />
        <div className="category-grid">
          {s.config.tiles?.map((tile) => (
            <Link key={tile.href} href={tile.href} rel={ugcRel(tile.href)} transitionTypes={["nav-forward"]} className="category-tile">
              <Media src={tile.imageUrl} alt="" sizes="(max-width: 700px) 50vw, 25vw" />
              <span className="category-tile-label">
                {tile.title}
                <span className="arrow-chip" aria-hidden>
                  <ArrowUpRight size={16} />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    );

  if (s.type === "product_carousel") {
    const source = s.config.source;
    const collection = nav.collections.find((c) => c.id === s.config.collectionId);
    if (source === "collection" && !collection) return null;
    const raw =
      source === "deals" ? { deal: true, sort: "discount" } : source === "new" ? { new: true } : {};
    const result = await queryCatalog(raw, {
      featured: source === "featured",
      scope: source === "collection" ? collection?.filterJson : undefined,
      limit: Math.min(Math.max(s.config.limit ?? 8, 1), 60),
    });
    if (!result.items.length) return null;
    const href =
      source === "collection"
        ? `/c/${collection!.slug}`
        : source === "deals"
          ? "/products?deal=true&sort=discount"
          : source === "new"
            ? "/products?new=true"
            : "/products";
    return (
      <section className="section">
        <SectionHead title={s.title ?? copy.homepage.fragrances} description={s.subtitle} href={href} />
        <StoreCarousel label={s.title ?? copy.homepage.fragrances}>
          {result.items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </StoreCarousel>
      </section>
    );
  }

  if (s.type === "brand_strip") {
    const featured = nav.brands.filter((b) => b.isFeatured);
    if (!featured.length) return null;
    return (
      <section className="section">
        <SectionHead
          title={s.title ?? copy.homepage.fragranceHouses}
          description={s.subtitle}
          href="/brands"
          linkLabel={copy.homepage.allBrands}
        />
        <div className="brand-row">
          {featured.map((b) => (
            <Link key={b.id} href={`/brands/${b.slug}`} className="brand-tile">
              <Media src={b.logoUrl} alt={b.name} sizes="200px" />
            </Link>
          ))}
        </div>
      </section>
    );
  }

  if (s.type === "event_cards") {
    const events = banners.filter((b) => b.placement === "event_card");
    if (!events.length) return null;
    return (
      <section className="section">
        <SectionHead title={s.title ?? copy.homepage.salesEvents} description={s.subtitle} />
        <div className="event-grid">
          {events.map((b) => (
            <Link key={b.id} href={b.href ?? "/products"} rel={ugcRel(b.href)} className="event-card">
              <Media src={b.imageUrl} alt="" sizes="(max-width: 700px) 100vw, 50vw" />
              <span className="event-card-copy">
                <strong>{b.title}</strong>
                {b.subtitle && <span>{b.subtitle}</span>}
              </span>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  if (s.type === "collection_banner") {
    const c = nav.collections.find((c) => c.id === s.config.collectionId);
    if (!c) return null;
    return (
      <section className="feature-banner">
        <div className="feature-banner-copy">
          <h2>{s.title ?? c.name}</h2>
          {(s.subtitle ?? c.description) && <p>{s.subtitle ?? c.description}</p>}
          <Link href={`/c/${c.slug}`} className="button light lg">
            {s.config.ctaLabel ?? copy.homepage.shopCollection(c.name)} <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
        <Media
          className="feature-banner-media"
          src={s.config.imageUrl ?? c.heroImageUrl}
          alt=""
          sizes="(max-width: 800px) 100vw, 50vw"
        />
      </section>
    );
  }
  return null;
}

/** Phones only: a row of round shortcuts under the hero, like an app's category strip. */
function PhoneShortcuts() {
  return (
    <nav className="phone-shortcuts" aria-label={copy.nav.shopBy}>
      {shop.map((link) => {
        const Icon = shopIcons[link.key];
        return (
          <Link key={link.key} href={link.href} transitionTypes={["nav-forward"]} className="phone-shortcut" data-tone={link.key === "deals" ? "deal" : undefined}>
            <span aria-hidden>
              <Icon size={22} strokeWidth={1.6} />
            </span>
            {link.key === "all" ? copy.homepage.all : link.key === "new" ? copy.homepage.new : link.name}
          </Link>
        );
      })}
    </nav>
  );
}

function FallbackHero() {
  return (
    <section className="hero">
      <div className="hero-slide">
        <div className="hero-copy">
          <h1>{copy.homepage.heroFallbackTitle}</h1>
          <p>{copy.homepage.heroFallbackSubtitle}</p>
          <div className="hero-actions">
            <Link href="/products" className="button primary lg">
              {copy.cart.browse} <ArrowRight size={18} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export async function Homepage() {
  const sections = await getSections();
  const heroId = sections.find((s) => s.type === "hero")?.id;
  const finderAfterId =
    sections.find((s) => s.type === "category_tiles")?.id ??
    sections.find((s) => s.type === "product_carousel")?.id;
  return (
    <div className="store-width home-page">
      {sections.some((s) => s.type === "hero") ? null : <FallbackHero />}
      {!sections.some((s) => s.type === "hero") && <PhoneShortcuts />}
      {sections.map((section) => (
        <Fragment key={section.id}>
          <HomeSection section={section} />
          {section.id === heroId && <PhoneShortcuts />}
          {section.id === finderAfterId && <FragranceFinder />}
        </Fragment>
      ))}
      {storeConfig.features.recentlyViewed && <RecentlyViewed />}
    </div>
  );
}
