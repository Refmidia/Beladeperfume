"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, User, Heart, Wind, Cookie } from "lucide-react";

const quizOptions = {
  gender: [
    { id: "masculino", label: "Masculino", desc: "Perfumes para ele", icon: User },
    { id: "feminino", label: "Feminino", desc: "Perfumes para ela", icon: Heart },
    { id: "unissex", label: "Unissex", desc: "Escolhas sem rótulos", icon: Sparkles },
  ],
  style: [
    { id: "amadeirado", label: "Amadeirado", desc: "Marcante e envolvente", icon: Wind },
    { id: "floral", label: "Floral", desc: "Leve e elegante", icon: Sparkles },
    { id: "oriental", label: "Oriental", desc: "Intenso e sofisticado", icon: Wind },
    { id: "gourmand", label: "Gourmand", desc: "Doce e acolhedor", icon: Cookie },
  ],
};

export function FragranceQuiz() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-dark text-white overflow-hidden">
      <div className="container-shop">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="text-gold text-xs sm:text-sm font-medium tracking-[0.15em] uppercase mb-2 block">
            Descubra a sua Próxima Fragrância
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold">
            Encontre seu Perfume
          </h2>
          <p className="text-white/70 mt-3 max-w-md mx-auto text-sm sm:text-base">
            Comece pelo estilo que mais combina com você e veja a seleção no catálogo.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
          {/* Gender Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">
              Para quem?
            </h3>
            <div className="space-y-3">
              {quizOptions.gender.map((option) => (
                <Link
                  key={option.id}
                  href={`/catalogo?categoria=${option.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center group-hover:bg-gold/30 transition-colors">
                    <option.icon className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <span className="font-medium text-white block">{option.label}</span>
                    <span className="text-sm text-white/50">{option.desc}</span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Style Selection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">
              Qual estilo?
            </h3>
            <div className="space-y-3">
              {quizOptions.style.map((option) => (
                <Link
                  key={option.id}
                  href={`/catalogo?familia=${option.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center group-hover:bg-gold/30 transition-colors">
                    <option.icon className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <span className="font-medium text-white block">{option.label}</span>
                    <span className="text-sm text-white/50">{option.desc}</span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
