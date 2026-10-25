/**
 * Garante coleções, banners e seções da home quando o catálogo foi importado
 * sem o seed demo (ex.: SEED_DEMO_DATA=false na Vercel).
 *
 * Uso: node --import tsx scripts/ensure-homepage-merchandising.ts
 */
import "../src/db/load-env";
import { count, eq } from "drizzle-orm";
import { db, closeDb } from "../src/db";
import { banners, brands, collections, homepageSections } from "../src/db/schema";
import { formatMoney } from "../src/lib/money";
import { storeConfig } from "../store.config";

const hour = 60 * 60 * 1000;
const ago = (hours: number) => new Date(Date.now() - hours * hour);

async function main() {
  const [[{ n: sectionCount }], [{ n: bannerCount }], [{ n: collectionCount }]] = await Promise.all([
    db.select({ n: count() }).from(homepageSections),
    db.select({ n: count() }).from(banners),
    db.select({ n: count() }).from(collections),
  ]);

  if (collectionCount === 0) {
    await db.insert(collections).values([
      {
        name: "Masculino",
        slug: "men",
        description: "Fragrâncias marcantes para ele.",
        filterJson: { gender: ["men"] },
        sortOrder: 0,
        heroImageUrl: "/seed/men.svg",
      },
      {
        name: "Feminino",
        slug: "women",
        description: "Florais, orientais e almíscar.",
        filterJson: { gender: ["women"] },
        sortOrder: 1,
        heroImageUrl: "/seed/women.svg",
      },
      {
        name: "Perfumes árabes",
        slug: "arabian",
        description: "Oud, attars e extratos com curadoria oriental.",
        filterJson: { brandType: ["arabian"] },
        sortOrder: 2,
        heroImageUrl: "/seed/niche.svg",
      },
      {
        name: "Ofertas",
        slug: "deals",
        description: "Preços especiais nesta semana.",
        filterJson: { deal: true, sort: "discount" },
        sortOrder: 3,
        heroImageUrl: "/seed/deals.svg",
      },
    ]);
    console.log("Coleções criadas (4).");
  }

  const [niche] = await db.select().from(collections).where(eq(collections.slug, "arabian"));

  if (bannerCount === 0) {
    const freeDelivery = storeConfig.checkout.freeDeliveryOver;
    const deliveryCopy =
      freeDelivery === null
        ? storeConfig.checkout.deliveryZones.map((zone) => `${zone.label}: ${formatMoney(zone.fee)}`).join(" · ")
        : `Frete grátis em pedidos a partir de ${formatMoney(freeDelivery)}`;
    const now = ago(24);
    await db.insert(banners).values([
      {
        placement: "announcement",
        title: "Seleção árabe: oud, attar e extratos",
        href: "/c/arabian",
        sortOrder: 0,
        startsAt: now,
      },
      {
        placement: "announcement",
        title: deliveryCopy,
        href: "/pages/delivery-returns",
        sortOrder: 1,
        startsAt: now,
      },
      {
        placement: "hero",
        title: "Melhor preço no PIX",
        subtitle:
          "Fragrâncias selecionadas — confirmamos seu pedido por telefone antes do envio.",
        imageUrl: "/editorial/fragrance-still-life.webp",
        href: "/products",
        ctaLabel: "Comprar agora",
        sortOrder: 0,
        startsAt: now,
      },
      {
        placement: "hero",
        title: "Seu perfume favorito",
        subtitle: "Catálogo completo com atendimento por WhatsApp.",
        imageUrl: "/seed/hero-oils.svg",
        href: "/products",
        ctaLabel: "Ver fragrâncias",
        sortOrder: 1,
        startsAt: now,
      },
      {
        placement: "event_card",
        title: "Kits presente",
        subtitle: "Embalados para presentear",
        imageUrl: "/seed/brand-sahmira-scents-hero.svg",
        href: "/products",
        ctaLabel: "Ver kits",
        sortOrder: 0,
        startsAt: now,
      },
      {
        placement: "event_card",
        title: "Minis e amostras",
        subtitle: "Experimente antes do frasco cheio",
        imageUrl: "/seed/brand-elowen-stage-hero.svg",
        href: "/products",
        ctaLabel: "Ver tamanhos pequenos",
        sortOrder: 1,
        startsAt: now,
      },
      {
        placement: "promo_strip",
        title: "Confirmamos cada pedido com você",
        subtitle: storeConfig.checkout.confirmationNote,
        href: "/pages/delivery-returns",
        ctaLabel: "Como funciona",
        sortOrder: 0,
        startsAt: now,
      },
    ]);
    console.log("Banners criados (7).");
  }

  if (sectionCount === 0) {
    await db.insert(homepageSections).values([
      { type: "hero", config: {}, sortOrder: 0 },
      {
        type: "product_carousel",
        title: "Mais vendidos",
        config: { source: "featured", limit: 58 },
        sortOrder: 1,
      },
      {
        type: "category_tiles",
        title: "Coleções",
        subtitle: "Perfumes por estilo",
        config: {
          tiles: [
            { title: "Perfumes masculinos", href: "/products?gender=men", imageUrl: "/seed/men.svg" },
            { title: "Perfumes femininos", href: "/products?gender=women", imageUrl: "/seed/women.svg" },
            { title: "Perfumes unissex", href: "/products?gender=unisex", imageUrl: "/seed/niche.svg" },
          ],
        },
        sortOrder: 2,
      },
      { type: "value_props", title: "Por que a Bela de Perfume", config: { items: [] }, sortOrder: 3 },
      {
        type: "product_carousel",
        title: "Destaques",
        config: { source: "featured", limit: 58 },
        sortOrder: 4,
      },
      { type: "event_cards", title: "Presentes e descobertas", config: {}, sortOrder: 5 },
      { type: "brand_strip", title: "Marcas", config: {}, sortOrder: 6 },
      ...(niche
        ? [
            {
              type: "collection_banner" as const,
              title: "O universo árabe",
              subtitle: "Oud, attar e extratos com curadoria oriental.",
              config: {
                collectionId: niche.id,
                imageUrl: "/seed/niche.svg",
                href: "/c/arabian",
                ctaLabel: "Explorar árabes",
              },
              sortOrder: 7,
            },
          ]
        : []),
      {
        type: "product_carousel",
        title: "Novidades",
        config: { source: "new", limit: 58 },
        sortOrder: 8,
      },
    ]);
    console.log("Seções da homepage criadas.");
  } else {
    console.log("Homepage já tinha seções; nada alterado nas seções.");
  }

  const brandRows = await db.select().from(brands).orderBy(brands.sortOrder);
  let featuredSet = 0;
  for (const [index, row] of brandRows.entries()) {
    if (row.isFeatured) continue;
    if (index % 2 === 0) {
      await db.update(brands).set({ isFeatured: true, updatedAt: new Date() }).where(eq(brands.id, row.id));
      featuredSet++;
    }
  }
  if (featuredSet) console.log(`Marcas em destaque: ${featuredSet}.`);

  console.log("Merchandising da home pronto. Recarregue beladeperfume.vercel.app.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(closeDb);
