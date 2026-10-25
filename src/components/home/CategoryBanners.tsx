"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    id: "feminino",
    title: "Perfumes",
    subtitle: "Femininos",
    href: "/catalogo?categoria=feminino",
    gradient: "from-rose-100/50 to-background-secondary",
  },
  {
    id: "masculino",
    title: "Perfumes",
    subtitle: "Masculinos",
    href: "/catalogo?categoria=masculino",
    gradient: "from-amber-100/50 to-background-secondary",
  },
  {
    id: "unissex",
    title: "Perfumes",
    subtitle: "Unissex",
    href: "/catalogo?categoria=unissex",
    gradient: "from-stone-200/50 to-background-secondary",
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
                className={`group relative block overflow-hidden rounded-2xl bg-gradient-to-br ${category.gradient} p-6 sm:p-8 min-h-[200px] sm:min-h-[240px] border border-border hover:border-gold/50 transition-all duration-300`}
              >
                {/* Decorative element */}
                <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-gold/10 group-hover:scale-150 transition-transform duration-500" />
                
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-foreground-muted tracking-widest uppercase">
                      Coleção
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mt-2">
                      {category.title}
                      <br />
                      <span className="italic text-gold">{category.subtitle}</span>
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground-muted group-hover:text-gold transition-colors mt-4">
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
