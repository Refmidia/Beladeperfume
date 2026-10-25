"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Package, Clock } from "lucide-react";
import { cn, formatCurrencyCompact } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const hasDiscount = product.discountPercent > 0;
  const isAvailable = product.availability === "pronta_entrega";
  const isPreorder = product.availability === "sob_encomenda";

  return (
    <motion.article
      className="group relative bg-card border border-border rounded-[17px] overflow-hidden card-hover"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Container */}
      <Link href={`/produto/${product.slug}`} className="block relative aspect-square">
        {/* Skeleton while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton" />
        )}
        
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={cn(
            "object-cover transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          priority={priority}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-3 right-3 bg-gold text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
            -{product.discountPercent}%
          </span>
        )}

        {/* New Badge */}
        {product.isNew && !hasDiscount && (
          <span className="absolute top-3 right-3 bg-dark text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
            NOVO
          </span>
        )}

        {/* Action Buttons */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsLiked(!isLiked);
            }}
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-full border-2 transition-all duration-200",
              isLiked
                ? "bg-gold border-gold text-white"
                : "bg-dark border-gold text-white hover:bg-gold"
            )}
            aria-label={isLiked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart
              className={cn("w-4 h-4", isLiked && "fill-current")}
              strokeWidth={1.5}
            />
          </button>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              // Add to cart logic
            }}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-dark border-2 border-gold text-white hover:bg-gold transition-all duration-200"
            aria-label="Adicionar ao carrinho"
          >
            <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Mobile: Always visible buttons */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-2 lg:hidden">
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsLiked(!isLiked);
            }}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all duration-200",
              isLiked
                ? "bg-gold border-gold text-white"
                : "bg-dark border-gold text-white"
            )}
            aria-label={isLiked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart
              className={cn("w-3.5 h-3.5", isLiked && "fill-current")}
              strokeWidth={1.5}
            />
          </button>
          
          <button
            onClick={(e) => {
              e.preventDefault();
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-dark border-2 border-gold text-white"
            aria-label="Adicionar ao carrinho"
          >
            <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {/* Brand */}
        <span className="text-[11px] sm:text-xs text-foreground-muted uppercase tracking-wide">
          {product.brand}
        </span>

        {/* Name */}
        <Link href={`/produto/${product.slug}`}>
          <h3 className="font-serif text-sm sm:text-base font-medium text-foreground uppercase tracking-wide mt-1 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] hover:text-gold transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Size */}
        <span className="text-[11px] sm:text-xs text-foreground-subtle mt-1 block">
          {product.sizeMl}ml
        </span>

        {/* Pricing */}
        <div className="mt-2 sm:mt-3">
          {/* PIX Price */}
          <p className="text-gold font-semibold text-sm sm:text-base">
            {formatCurrencyCompact(product.pricePix)}{" "}
            <span className="text-[11px] sm:text-xs font-normal">no PIX</span>
          </p>

          {/* Regular Price */}
          {hasDiscount && (
            <p className="text-foreground-muted text-xs sm:text-sm mt-0.5">
              <span className="line-through">{formatCurrencyCompact(product.price)}</span>
              {" "}no cartão
            </p>
          )}
          {!hasDiscount && (
            <p className="text-foreground-muted text-xs sm:text-sm mt-0.5">
              ou {formatCurrencyCompact(product.price)} no cartão
            </p>
          )}
        </div>

        {/* Availability Badge */}
        <div className="mt-2 sm:mt-3">
          {isAvailable && (
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-success bg-success/10 px-2 py-1 rounded-full">
              <Package className="w-3 h-3" />
              Pronta Entrega
            </span>
          )}
          {isPreorder && (
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-warning bg-warning/10 px-2 py-1 rounded-full">
              <Clock className="w-3 h-3" />
              Sob Encomenda
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-[17px] overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-3 sm:p-4">
        <div className="h-3 w-16 skeleton rounded mb-2" />
        <div className="h-4 w-full skeleton rounded mb-1" />
        <div className="h-4 w-3/4 skeleton rounded mb-3" />
        <div className="h-3 w-12 skeleton rounded mb-3" />
        <div className="h-5 w-28 skeleton rounded mb-1" />
        <div className="h-3 w-24 skeleton rounded" />
      </div>
    </div>
  );
}
