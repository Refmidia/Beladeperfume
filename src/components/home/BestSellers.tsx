"use client";

import { SectionTitle } from "./SectionTitle";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getFeaturedProducts } from "@/data/demo-products";

export function BestSellers() {
  const products = getFeaturedProducts().slice(0, 4);

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container-shop">
        <SectionTitle
          subtitle="Best Sellers"
          title="Mais Vendidos"
          href="/catalogo?ordenar=mais_vendidos"
          align="center"
        />
        
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
