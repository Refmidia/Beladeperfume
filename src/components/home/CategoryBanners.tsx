"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    id: "feminino",
    title: "Perfumes",
    subtitle: "Femininos",
    href: "/catalogo?categoria=feminino",
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80",
  },
  {
    id: "masculino",
    title: "Perfumes",
    subtitle: "Masculinos",
    href: "/catalogo?categoria=masculino",
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80",
  },
  {
    id: "unissex",
    title: "Perfumes",
    subtitle: "Unissex",
    href: "/catalogo?categoria=unissex",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80",
  },
];

export function CategoryBanners() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background-secondary">
      <div className="container-shop">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={category.href}
                className="group relative block overflow-hidden rounded-2xl min-h-[200px] sm:min-h-[280px] border border-border hover:border-gold/50 transition-all duration-300"
              >
                {/* Background Image */}
                <Image
                  src={category.image}
                  alt={`${category.title} ${category.subtitle}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/40 to-transparent" />
                
                <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
                  <span className="text-xs text-white/70 tracking-widest uppercase">
                    Coleção
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-white mt-1">
                    {category.title}
                    <br />
                    <span className="italic text-gold">{category.subtitle}</span>
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm font-medium text-white/80 group-hover:text-gold transition-colors mt-4">
                    VER COLEÇÃO
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
