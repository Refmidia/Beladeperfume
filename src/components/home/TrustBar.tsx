"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Store, ShieldCheck, Headphones } from "lucide-react";

const trustItems = [
  {
    icon: BadgeCheck,
    title: "100% AUTÊNTICO",
    description: "Importado do Oriente Médio",
  },
  {
    icon: Store,
    title: "RETIRE NA LOJA",
    description: "Compre online e retire",
  },
  {
    icon: ShieldCheck,
    title: "COMPRA SEGURA",
    description: "Até 25% OFF no PIX",
  },
  {
    icon: Headphones,
    title: "ATENDIMENTO EXCLUSIVO",
    description: "Consultoras especializadas",
  },
];

export function TrustBar() {
  return (
    <section className="bg-dark py-8 md:py-10">
      <div className="container-shop">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <item.icon className="w-8 h-8 md:w-10 md:h-10 text-gold mb-3 stroke-[1.5]" />
              <h3 className="text-foreground-light text-xs font-semibold tracking-wide mb-1">
                {item.title}
              </h3>
              <p className="text-foreground-light/60 text-[11px]">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
