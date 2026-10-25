"use client";

import Image from "next/image";
import Link from "next/link";
import { getFeaturedProducts } from "@/data/demo-products";

export function BestSellers() {
  const products = getFeaturedProducts().slice(0, 4);

  return (
    <section className="bg-bg-cream py-10">
      <div className="container-shop">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-gold text-[11px] tracking-[0.25em] uppercase font-medium">
            BEST SELLERS
          </span>
          <h2 className="font-serif text-[28px] text-text-dark mt-1">
            Mais Vendidos
          </h2>
        </div>

        {/* Grid 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/produto/${product.slug}`}
              className="bg-white rounded-2xl overflow-hidden border border-border-cream"
            >
              {/* Image */}
              <div className="relative aspect-square bg-bg-cream-light">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {/* Discount Badge */}
                {product.discountPercent > 0 && (
                  <span className="absolute top-2 left-2 bg-gold text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                    {product.discountPercent}%
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-serif text-[13px] text-text-dark uppercase tracking-wide line-clamp-2 min-h-[36px]">
                  {product.name}
                </h3>
                
                <div className="mt-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-gold font-semibold text-[15px]">
                      R$ {product.pricePix.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-gold text-[11px]">no PIX</span>
                  </div>
                  <p className="text-text-muted text-[11px] mt-0.5">
                    R$ {product.price.toFixed(2).replace('.', ',')} no cartão
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
