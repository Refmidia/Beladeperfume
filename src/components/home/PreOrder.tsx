"use client";

import { SectionTitle } from "./SectionTitle";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getPreorderProducts } from "@/data/demo-products";

export function PreOrder() {
  const products = getPreorderProducts();

  if (products.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container-shop">
        <SectionTitle
          subtitle="Edições Especiais"
          title="Sob Encomenda"
          href="/catalogo?disponibilidade=sob_encomenda"
          align="center"
        />
        
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
