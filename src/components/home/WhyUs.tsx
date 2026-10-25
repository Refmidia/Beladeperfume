"use client";

import { Star, Globe, Heart } from "lucide-react";
import { siteConfig } from "@/lib/config";

const cards = [
  {
    icon: Star,
    title: "Autenticidade Garantida",
    description: "Todos os nossos produtos são importados diretamente das melhores casas de perfumaria do Oriente Médio, com certificado de origem e autenticidade.",
  },
  {
    icon: Globe,
    title: "Exclusividade Real",
    description: "Trabalhamos com marcas e aromas que você não encontra em qualquer lugar. Nossa curadoria seleciona apenas fragrâncias raras e de alta concentração.",
  },
  {
    icon: Heart,
    title: "Atendimento Dedicado",
    description: "Nossa equipe é apaixonada por perfumaria árabe e está pronta para te ajudar a encontrar a fragrância perfeita para cada momento da sua vida.",
  },
];

export function WhyUs() {
  return (
    <section className="bg-bg-dark py-12">
      <div className="container-shop">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-gold text-[11px] tracking-[0.25em] uppercase font-medium">
            NOSSA ESSÊNCIA
          </span>
          <h2 className="font-serif text-[26px] text-text-light mt-2">
            Por que {siteConfig.name}?
          </h2>
          <p className="text-text-light-muted text-[13px] mt-3 max-w-sm mx-auto leading-relaxed">
            Somos mais do que uma perfumaria. Somos uma ponte entre você e a rica tradição olfativa do Oriente Médio.
          </p>
          <div className="w-8 h-0.5 bg-gold mx-auto mt-4" />
        </div>

        {/* Cards */}
        <div className="space-y-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="border border-gold/30 rounded-2xl p-5"
            >
              <div className="w-12 h-12 rounded-full border border-gold/50 flex items-center justify-center mb-4 mx-auto">
                <card.icon className="w-5 h-5 text-gold" />
              </div>
              <h3 className="font-serif text-[18px] text-text-light text-center mb-2">
                {card.title}
              </h3>
              <p className="text-text-light-muted text-[13px] text-center leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
