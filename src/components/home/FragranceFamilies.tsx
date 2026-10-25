"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

const families = [
  { name: "Floral Frutado", count: 36, slug: "floral-frutado" },
  { name: "Amadeirado Especiado", count: 24, slug: "amadeirado-especiado" },
  { name: "Floral Frutado Gourmand", count: 16, slug: "floral-frutado-gourmand" },
  { name: "Amadeirado Aromático", count: 13, slug: "amadeirado-aromatico" },
  { name: "Oriental Amadeirado", count: 11, slug: "oriental-amadeirado" },
  { name: "Oriental Floral", count: 10, slug: "oriental-floral" },
  { name: "Floral Amadeirado Almiscarado", count: 10, slug: "floral-amadeirado-almiscarado" },
];

export function FragranceFamilies() {
  return (
    <section className="bg-bg-dark py-12">
      <div className="container-shop">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-gold text-[11px] tracking-[0.25em] uppercase font-medium">
            EXPLORE
          </span>
          <h2 className="font-serif text-[28px] text-text-light mt-2 mb-3">
            Por Família Olfativa
          </h2>
          <div className="w-8 h-0.5 bg-gold mx-auto" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3">
          {families.map((family, index) => (
            <Link
              key={family.slug}
              href={`/catalogo?familia=${family.slug}`}
              className={`
                bg-bg-dark-card rounded-xl p-4 flex items-start gap-3
                hover:bg-bg-dark-card/80 transition-colors
                ${index === families.length - 1 && families.length % 2 !== 0 ? 'col-span-2 max-w-[50%] mx-auto' : ''}
              `}
            >
              <Sparkles className="w-4 h-4 text-text-light mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-serif text-[15px] text-text-light leading-tight block">
                  {family.name}
                </span>
                <span className="text-gold text-[12px] mt-1 block">
                  {family.count} perfumes
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
