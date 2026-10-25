"use client";

import { useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductPageClientProps {
  product: Product;
}

export function ProductPageClient({ product }: ProductPageClientProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center border border-border rounded-lg">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="w-10 h-10 flex items-center justify-center text-foreground-muted hover:text-foreground transition-colors"
        >
          -
        </button>
        <span className="w-10 text-center font-medium">{quantity}</span>
        <button
          onClick={() => setQuantity(quantity + 1)}
          className="w-10 h-10 flex items-center justify-center text-foreground-muted hover:text-foreground transition-colors"
        >
          +
        </button>
      </div>

      <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gold hover:bg-gold-dark text-white font-medium rounded-lg transition-colors">
        <ShoppingBag className="w-5 h-5" />
        Adicionar ao Carrinho
      </button>

      <button
        onClick={() => setIsLiked(!isLiked)}
        className={cn(
          "w-12 h-12 flex items-center justify-center rounded-lg border transition-colors",
          isLiked
            ? "bg-gold/10 border-gold text-gold"
            : "border-border text-foreground-muted hover:border-gold hover:text-gold"
        )}
      >
        <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
      </button>
    </div>
  );
}
