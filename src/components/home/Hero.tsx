"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/config";

export function Hero() {
  return (
    <section className="relative bg-background-secondary overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920&q=80"
          alt="Perfumes árabes luxuosos"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background-secondary via-background-secondary/95 to-background-secondary/80" />
      </div>

      <div className="container-shop relative">
        <div className="flex flex-col lg:flex-row items-center min-h-[60vh] lg:min-h-[70vh] py-12 lg:py-0">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left lg:pr-12"
          >
            <span className="inline-block text-gold text-sm font-medium tracking-[0.2em] uppercase mb-4">
              Coleção Exclusiva
            </span>
            
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-foreground leading-[1.1] mb-6">
              A Arte da{" "}
              <span className="text-gold-gradient">Perfumaria</span>
              <br />
              Árabe
            </h1>
            
            <p className="text-foreground-muted text-base sm:text-lg max-w-lg mx-auto lg:mx-0 mb-8">
              Descubra fragrâncias ancestrais do Oriente Médio. Ouds raros, âmbares preciosos e 
              composições que contam histórias milenares.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gold hover:bg-gold-dark text-white font-medium rounded-lg transition-colors"
              >
                Explorar Coleção
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                href="/catalogo?disponibilidade=pronta_entrega"
                className="inline-flex items-center gap-2 px-8 py-4 border border-border hover:border-gold text-foreground font-medium rounded-lg transition-colors"
              >
                Pronta Entrega
              </Link>
            </div>
          </motion.div>

          {/* Visual Element - Perfume Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 relative mt-12 lg:mt-0"
          >
            <div className="relative w-full max-w-md mx-auto aspect-square">
              {/* Decorative circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[90%] h-[90%] rounded-full border border-gold/20" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[75%] h-[75%] rounded-full border border-gold/30" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[60%] h-[60%] rounded-full bg-gold/10 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&q=80"
                    alt="Frasco de perfume luxuoso"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
