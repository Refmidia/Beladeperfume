"use client";

import { SectionTitle } from "./SectionTitle";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getNewProducts } from "@/data/demo-products";

export function NewArrivals() {
  const products = getNewProducts().slice(0, 4);

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container-shop">
        <SectionTitle
          subtitle="Recém Chegados"
          title="Novidades do Oriente"
          href="/catalogo?ordenar=lancamentos"
          align="center"
        />
        
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
