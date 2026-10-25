"use client";

import { SectionTitle } from "./SectionTitle";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getReadyToShipProducts } from "@/data/demo-products";

export function ReadyToShip() {
  const products = getReadyToShipProducts().slice(0, 4);

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background-secondary">
      <div className="container-shop">
        <SectionTitle
          subtitle="Envio Imediato"
          title="Pronta Entrega"
          href="/catalogo?disponibilidade=pronta_entrega"
          align="center"
        />
        
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
