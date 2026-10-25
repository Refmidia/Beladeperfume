"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface ProductOfMonthProps {
  brand: string;
  name: string;
  description: string;
  pricePix: number;
  priceCard: number;
  installments?: string;
  imageUrl: string;
  productUrl: string;
  month?: string;
}

export function HeroProductOfMonth({
  brand = "LATTAFA PERFUMES",
  name = "VELVET AMBER",
  description = "Todo mês, um perfume especial para você.",
  pricePix = 199.00,
  priceCard = 229.00,
  installments = "3x sem juros",
  imageUrl = "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&q=80",
  productUrl = "/catalogo",
  month = "OUTUBRO 2026",
}: Partial<ProductOfMonthProps>) {
  return (
    <section className="bg-dark-pattern">
      {/* Marquee */}
      <div className="bg-dark border-y border-gold/20 py-2 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          <span className="text-gold text-xs tracking-[0.3em] mx-8">
            ★ PERFUME DO MÊS — {month} ★
          </span>
          <span className="text-gold text-xs tracking-[0.3em] mx-8">
            ★ PERFUME DO MÊS — {month} ★
          </span>
          <span className="text-gold text-xs tracking-[0.3em] mx-8">
            ★ PERFUME DO MÊS — {month} ★
          </span>
          <span className="text-gold text-xs tracking-[0.3em] mx-8">
            ★ PERFUME DO MÊS — {month} ★
          </span>
        </div>
      </div>

      <div className="container-shop py-10 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center"
        >
          {/* Product Image */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 mb-6">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Brand */}
          <span className="text-gold/70 text-xs tracking-[0.2em] uppercase mb-2">
            {brand}
          </span>

          {/* Name */}
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground-light mb-3">
            {name}
          </h2>

          {/* Description */}
          <p className="text-foreground-light/70 text-sm mb-6 max-w-xs">
            {description}
          </p>

          {/* Price */}
          <div className="mb-6">
            <p className="text-foreground-light/60 text-xs uppercase tracking-wider mb-1">
              NO PIX
            </p>
            <p className="font-serif text-4xl md:text-5xl font-semibold text-foreground-light">
              R$ {pricePix.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-foreground-light/60 text-sm mt-2">
              R$ {priceCard.toFixed(2).replace('.', ',')} no cartão em {installments}
            </p>
          </div>

          {/* CTA */}
          <Link
            href={productUrl}
            className="inline-flex items-center justify-center px-8 py-3 border border-gold text-gold font-medium text-sm tracking-wider hover:bg-gold hover:text-dark transition-colors"
          >
            VER PRODUTO
          </Link>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </section>
  );
}
