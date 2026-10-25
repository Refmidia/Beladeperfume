"use client";

import { motion } from "framer-motion";
import { BadgeCheck, ShieldCheck, Truck, Headphones } from "lucide-react";

const benefits = [
  {
    icon: BadgeCheck,
    title: "100% Autêntico",
    description: "Importado diretamente do Oriente Médio com certificado de origem",
  },
  {
    icon: ShieldCheck,
    title: "Compra Segura",
    description: "Até 25% OFF no PIX — maior desconto disponível",
  },
  {
    icon: Truck,
    title: "Entrega em Todo Brasil",
    description: "Frete grátis em compras acima de R$ 299",
  },
  {
    icon: Headphones,
    title: "Atendimento Exclusivo",
    description: "Consultoras especializadas em perfumaria árabe",
  },
];

export function Benefits() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background-secondary">
      <div className="container-shop">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
                <benefit.icon className="w-6 h-6 sm:w-7 sm:h-7 text-gold" />
              </div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1">
                {benefit.title}
              </h3>
              <p className="text-foreground-muted text-xs sm:text-sm leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
