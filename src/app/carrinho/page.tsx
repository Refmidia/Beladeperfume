"use client";

import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { siteConfig } from "@/lib/config";

export default function CarrinhoPage() {
  return (
    <div className="min-h-[60vh] bg-background">
      <div className="container-shop py-12">
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-8">
          Carrinho
        </h1>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-background-secondary rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-foreground-muted" />
          </div>
          <h2 className="font-serif text-xl font-medium text-foreground mb-2">
            Seu carrinho está vazio
          </h2>
          <p className="text-foreground-muted mb-6 max-w-sm">
            Explore nosso catálogo e descubra fragrâncias incríveis do Oriente Médio.
          </p>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold hover:bg-gold-dark text-white font-medium rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continuar Comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
