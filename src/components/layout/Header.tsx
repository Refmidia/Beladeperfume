"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Menu, X, Heart, User } from "lucide-react";

const navLinks = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/catalogo?categoria=feminino", label: "Feminino" },
  { href: "/catalogo?categoria=masculino", label: "Masculino" },
  { href: "/catalogo?categoria=unissex", label: "Unissex" },
  { href: "/catalogo?disponibilidade=pronta_entrega", label: "Pronta Entrega" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <header className="sticky top-0 z-50 bg-bg-cream border-b border-border-cream">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/brand/bela-de-perfume-logo.jpg"
              alt="Bela de Perfume"
              width={90}
              height={36}
              className="h-9 w-auto mix-blend-multiply"
              priority
            />
          </Link>

          {/* Icons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5 stroke-[1.25] text-text-dark" />
            </button>
            
            <Link href="/carrinho" className="p-2.5 relative" aria-label="Carrinho">
              <ShoppingBag className="w-5 h-5 stroke-[1.25] text-text-dark" />
            </Link>

            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2.5"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 stroke-[1.25] text-text-dark" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-bg-cream z-50 shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-border-cream">
                <Image
                  src="/brand/bela-de-perfume-logo.jpg"
                  alt="Bela de Perfume"
                  width={80}
                  height={32}
                  className="h-8 w-auto mix-blend-multiply"
                />
                <button onClick={() => setIsMenuOpen(false)} className="p-2">
                  <X className="w-5 h-5 text-text-dark" />
                </button>
              </div>
              
              <nav className="p-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block py-3 text-text-dark font-medium border-b border-border-cream/50 last:border-0"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border-cream">
                <div className="flex gap-6">
                  <Link href="/favoritos" className="flex items-center gap-2 text-sm text-text-muted" onClick={() => setIsMenuOpen(false)}>
                    <Heart className="w-4 h-4" /> Favoritos
                  </Link>
                  <Link href="/conta" className="flex items-center gap-2 text-sm text-text-muted" onClick={() => setIsMenuOpen(false)}>
                    <User className="w-4 h-4" /> Conta
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
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-0 left-0 right-0 bg-bg-cream z-50 p-4 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Buscar perfumes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-bg-cream-light border border-border-cream rounded-lg text-text-dark placeholder:text-text-muted focus:outline-none focus:border-gold"
                    autoFocus
                  />
                </div>
                <button onClick={() => setIsSearchOpen(false)} className="p-2">
                  <X className="w-5 h-5 text-text-dark" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
