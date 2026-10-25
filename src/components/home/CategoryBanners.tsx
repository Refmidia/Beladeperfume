"use client";

import Link from "next/link";
import Image from "next/image";

const categories = [
  {
    id: "feminino",
    title: "Perfumes",
    subtitle: "Femininos",
    href: "/catalogo?categoria=feminino",
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80",
  },
  {
    id: "unissex",
    title: "Perfumes",
    subtitle: "Unissex",
    href: "/catalogo?categoria=unissex",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80",
  },
  {
    id: "masculino",
    title: "Perfumes",
    subtitle: "Masculinos",
    href: "/catalogo?categoria=masculino",
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80",
  },
];

export function CategoryBanners() {
  return (
    <section className="bg-bg-cream">
      <div className="space-y-3 px-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={category.href}
            className="relative block h-44 rounded-2xl overflow-hidden"
          >
            {/* Background Image */}
            <Image
              src={category.image}
              alt={`${category.title} ${category.subtitle}`}
              fill
              className="object-cover"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              <span className="text-white/70 text-[10px] tracking-[0.2em] uppercase">
                COLEÇÃO
              </span>
              <h3 className="font-serif text-white text-[22px] leading-tight">
                {category.title}
                <br />
                <span className="italic text-gold-light">{category.subtitle}</span>
              </h3>
              <span className="text-white/80 text-[11px] tracking-wider mt-2 flex items-center gap-1">
                VER COLEÇÃO
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
