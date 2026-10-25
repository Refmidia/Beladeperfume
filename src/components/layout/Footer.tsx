"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Mail } from "lucide-react";
import { siteConfig } from "@/lib/config";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const navSections = [
  {
    title: "NAVEGAÇÃO",
    links: [
      { label: "Início", href: "/" },
      { label: "Catálogo", href: "/catalogo" },
      { label: "Feminino", href: "/catalogo?categoria=feminino" },
      { label: "Masculino", href: "/catalogo?categoria=masculino" },
      { label: "Unissex", href: "/catalogo?categoria=unissex" },
    ],
  },
  {
    title: "INFORMAÇÕES",
    links: [
      { label: "Sobre Nós", href: "/sobre" },
      { label: "Como Comprar", href: "/como-comprar" },
      { label: "Formas de Pagamento", href: "/pagamento" },
      { label: "Política de Privacidade", href: "/privacidade" },
      { label: "Termos de Uso", href: "/termos" },
    ],
  },
];

function AccordionSection({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4"
      >
        <span className="text-text-light-muted text-[11px] tracking-[0.15em]">{title}</span>
        <ChevronDown className={`w-4 h-4 text-text-light-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-4 space-y-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-text-light-muted text-[13px] hover:text-text-light"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-bg-dark-deep">
      <div className="container-shop py-10">
        {/* Logo and description */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/brand/bela-de-perfume-logo.jpg"
              alt="Bela de Perfume"
              width={100}
              height={40}
              className="h-10 w-auto mx-auto invert brightness-200"
            />
          </Link>
          <p className="text-text-light-muted text-[13px] mt-4 max-w-xs mx-auto leading-relaxed">
            Perfumaria árabe de luxo. Fragrâncias exclusivas do Oriente Médio, selecionadas com maestria.
          </p>
        </div>

        {/* Social icons */}
        <div className="flex justify-center gap-3 mb-8">
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 border border-white/20 rounded-lg flex items-center justify-center hover:border-gold transition-colors"
          >
            <InstagramIcon className="w-5 h-5 text-text-light" />
          </a>
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="w-10 h-10 border border-white/20 rounded-lg flex items-center justify-center hover:border-gold transition-colors"
          >
            <Mail className="w-5 h-5 text-text-light" />
          </a>
        </div>

        {/* Accordion sections */}
        <div className="mb-8">
          {navSections.map((section) => (
            <AccordionSection key={section.title} title={section.title} links={section.links} />
          ))}
        </div>

        {/* Bottom */}
        <div className="text-center pt-4 border-t border-white/10">
          <p className="text-text-light-muted text-[11px]">
            © 2026 {siteConfig.name}. Todos os direitos reservados.
          </p>
          <p className="text-text-light-muted text-[10px] mt-1">
            Perfumaria Árabe de Luxo — São Paulo, SP
          </p>
        </div>
      </div>
    </footer>
  );
}
