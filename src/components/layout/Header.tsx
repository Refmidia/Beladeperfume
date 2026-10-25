"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  Heart,
  User,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config";

const navLinks = [
  { href: "/catalogo", label: "Catálogo" },
  {
    href: "/catalogo?categoria=feminino",
    label: "Feminino",
    children: [
      { href: "/catalogo?categoria=feminino&tipo=edp", label: "Eau de Parfum" },
      { href: "/catalogo?categoria=feminino&tipo=body_splash", label: "Body Splash" },
    ],
  },
  {
    href: "/catalogo?categoria=masculino",
    label: "Masculino",
    children: [
      { href: "/catalogo?categoria=masculino&tipo=edp", label: "Eau de Parfum" },
      { href: "/catalogo?categoria=masculino&tipo=parfum", label: "Parfum" },
    ],
  },
  { href: "/catalogo?categoria=unissex", label: "Unissex" },
  { href: "/catalogo?disponibilidade=pronta_entrega", label: "Pronta Entrega" },
  { href: "/marcas", label: "Marcas" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      {/* Benefits Bar */}
      <div className="bg-dark text-white text-xs py-2 px-4 text-center">
        <span className="hidden sm:inline">
          🚚 Frete Grátis acima de R$ {siteConfig.shipping.freeShippingThreshold} | 💳 Até {siteConfig.shipping.pixDiscount}% OFF no PIX | ✨ Produtos 100% Autênticos
        </span>
        <span className="sm:hidden">
          🚚 Frete Grátis +R${siteConfig.shipping.freeShippingThreshold} | 💳 {siteConfig.shipping.pixDiscount}% OFF PIX
        </span>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        {/* Mobile Header */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-[60px] px-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <h1 className="font-serif text-lg font-semibold tracking-wide text-foreground">
                <span className="text-gold">Bela</span> de Perfume
              </h1>
            </Link>

            {/* Right Icons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-background-secondary rounded-full transition-colors"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5 stroke-[1.5]" />
              </button>
              
              <Link
                href="/carrinho"
                className="p-2 hover:bg-background-secondary rounded-full transition-colors relative"
                aria-label="Carrinho"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                <span className="absolute -top-0.5 -right-0.5 bg-gold text-white text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                  0
                </span>
              </Link>

              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 hover:bg-background-secondary rounded-full transition-colors"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block">
          <div className="container-shop">
            <div className="flex items-center justify-between h-[80px]">
              {/* Logo */}
              <Link href="/" className="flex-shrink-0">
                <h1 className="font-serif text-2xl font-semibold tracking-wide text-foreground">
                  <span className="text-gold">Bela</span> de Perfume
                </h1>
              </Link>

              {/* Navigation */}
              <nav className="flex items-center gap-6">
                {navLinks.map((link) => (
                  <div key={link.href} className="relative group">
                    <Link
                      href={link.href}
                      className="flex items-center gap-1 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors py-2"
                    >
                      {link.label}
                      {link.children && (
                        <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform" />
                      )}
                    </Link>
                    
                    {link.children && (
                      <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <div className="bg-card border border-border rounded-lg shadow-lg py-2 min-w-[180px]">
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block px-4 py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2.5 hover:bg-background-secondary rounded-full transition-colors"
                  aria-label="Buscar"
                >
                  <Search className="w-5 h-5 stroke-[1.5]" />
                </button>
                
                <Link
                  href="/favoritos"
                  className="p-2.5 hover:bg-background-secondary rounded-full transition-colors"
                  aria-label="Favoritos"
                >
                  <Heart className="w-5 h-5 stroke-[1.5]" />
                </Link>
                
                <Link
                  href="/conta"
                  className="p-2.5 hover:bg-background-secondary rounded-full transition-colors"
                  aria-label="Minha Conta"
                >
                  <User className="w-5 h-5 stroke-[1.5]" />
                </Link>
                
                <Link
                  href="/carrinho"
                  className="p-2.5 hover:bg-background-secondary rounded-full transition-colors relative"
                  aria-label="Carrinho"
                >
                  <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                  <span className="absolute top-0 right-0 bg-gold text-white text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                    0
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-[280px] bg-background z-50 lg:hidden shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="font-serif text-lg font-semibold">Menu</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-background-secondary rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <nav className="p-4">
                {navLinks.map((link) => (
                  <div key={link.href} className="py-1">
                    <Link
                      href={link.href}
                      className="block py-3 text-foreground font-medium hover:text-gold transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                    {link.children && (
                      <div className="pl-4 border-l border-border ml-2">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block py-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
                <div className="flex items-center gap-4">
                  <Link
                    href="/favoritos"
                    className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="w-4 h-4" />
                    Favoritos
                  </Link>
                  <Link
                    href="/conta"
                    className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Conta
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setIsSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-0 left-0 right-0 bg-background z-50 p-4 shadow-lg"
            >
              <div className="container-shop">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                    <input
                      type="text"
                      placeholder="Buscar perfumes, marcas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-background-secondary border border-border rounded-lg text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-gold transition-colors"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2 hover:bg-background-secondary rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
