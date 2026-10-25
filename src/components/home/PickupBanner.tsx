"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function PickupBanner() {
  return (
    <section className="bg-dark-pattern relative overflow-hidden">
      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold/20 to-transparent" />
      </div>

      <div className="container-shop py-12 md:py-16 relative">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex-1 text-center md:text-left"
          >
            {/* Decorative line */}
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="w-8 h-px bg-gold" />
              <span className="text-gold text-xs tracking-[0.2em] uppercase">
                Compra Online
              </span>
              <div className="w-8 h-px bg-gold" />
            </div>

            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground-light leading-tight mb-4">
              RETIRE<br />NA LOJA
            </h2>

            <p className="text-foreground-light/70 text-sm md:text-base mb-6 max-w-md">
              Após a confirmação, separamos seu pedido com cuidado.
            </p>

            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center px-8 py-3 border border-gold text-gold font-medium text-sm tracking-wider hover:bg-gold hover:text-dark transition-colors"
            >
              COMPRAR AGORA
            </Link>
          </motion.div>

          {/* Shopping Bag Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-shrink-0"
          >
            <div className="relative w-48 h-56 md:w-56 md:h-64">
              {/* Stylized shopping bag shape */}
              <div className="absolute inset-0 bg-card rounded-lg shadow-2xl transform rotate-3">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-8 border-t-4 border-l-4 border-r-4 border-gold rounded-t-full" />
                <div className="absolute inset-0 flex items-center justify-center pt-8">
                  <div className="text-center">
                    <span className="font-serif text-2xl text-gold">Bela</span>
                    <span className="block text-gold/70 text-xs italic">de Perfume</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
