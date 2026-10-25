"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

const genderOptions = [
  { id: "masculino", label: "Masculino", desc: "Perfumes para ele", href: "/catalogo?categoria=masculino" },
  { id: "feminino", label: "Feminino", desc: "Perfumes para ela", href: "/catalogo?categoria=feminino" },
  { id: "unissex", label: "Unissex", desc: "Escolhas sem rótulos", href: "/catalogo?categoria=unissex" },
];

const styleOptions = [
  { id: "amadeirado", label: "Amadeirado", desc: "Marcante e envolvente", href: "/catalogo?familia=amadeirado" },
  { id: "floral", label: "Floral", desc: "Leve e elegante", href: "/catalogo?familia=floral" },
  { id: "oriental", label: "Oriental", desc: "Intenso e sofisticado", href: "/catalogo?familia=oriental" },
  { id: "gourmand", label: "Gourmand", desc: "Doce e acolhedor", href: "/catalogo?familia=gourmand" },
];

export function FragranceFinder() {
  return (
    <section className="bg-bg-dark py-12">
      <div className="container-shop">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-gold text-[11px] tracking-[0.25em] uppercase font-medium">
            DESCUBRA A SUA PRÓXIMA FRAGRÂNCIA
          </span>
          <h2 className="font-serif text-[28px] text-text-light mt-2">
            Encontre seu Perfume
          </h2>
          <p className="text-text-light-muted text-[13px] mt-2 max-w-xs mx-auto">
            Comece pelo estilo que mais combina com você e veja a seleção no catálogo.
          </p>
        </div>

        {/* Para Quem? */}
        <div className="mb-6">
          <h3 className="text-gold-muted text-[11px] tracking-[0.2em] uppercase mb-3">
            PARA QUEM?
          </h3>
          <div className="space-y-2">
            {genderOptions.map((option) => (
              <Link
                key={option.id}
                href={option.href}
                className="flex items-center justify-between p-4 bg-bg-dark-card rounded-xl"
              >
                <div>
                  <span className="text-text-light font-medium text-[15px] block">
                    {option.label}
                  </span>
                  <span className="text-gold-muted text-[12px]">
                    {option.desc}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-text-light-muted" />
              </Link>
            ))}
          </div>
        </div>

        {/* Qual Estilo? */}
        <div>
          <h3 className="text-gold-muted text-[11px] tracking-[0.2em] uppercase mb-3">
            QUAL ESTILO?
          </h3>
          <div className="space-y-2">
            {styleOptions.map((option) => (
              <Link
                key={option.id}
                href={option.href}
                className="flex items-center justify-between p-4 bg-bg-dark-card rounded-xl"
              >
                <div>
                  <span className="text-text-light font-medium text-[15px] block">
                    {option.label}
                  </span>
                  <span className="text-gold-muted text-[12px]">
                    {option.desc}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-text-light-muted" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
