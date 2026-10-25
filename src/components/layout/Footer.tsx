import Link from "next/link";
import { MessageCircle, Mail, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/lib/config";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const footerLinks = {
  institucional: [
    { label: "Sobre Nós", href: "/sobre" },
    { label: "Nossa História", href: "/historia" },
    { label: "Blog", href: "/blog" },
    { label: "Trabalhe Conosco", href: "/carreiras" },
  ],
  ajuda: [
    { label: "Central de Ajuda", href: "/ajuda" },
    { label: "Como Comprar", href: "/como-comprar" },
    { label: "Formas de Pagamento", href: "/pagamento" },
    { label: "Prazos de Entrega", href: "/entrega" },
    { label: "Trocas e Devoluções", href: "/trocas" },
  ],
  categorias: [
    { label: "Perfumes Femininos", href: "/catalogo?categoria=feminino" },
    { label: "Perfumes Masculinos", href: "/catalogo?categoria=masculino" },
    { label: "Perfumes Unissex", href: "/catalogo?categoria=unissex" },
    { label: "Pronta Entrega", href: "/catalogo?disponibilidade=pronta_entrega" },
    { label: "Decants", href: "/catalogo?tipo=decant" },
  ],
};

const socialLinks = [
  { icon: InstagramIcon, href: siteConfig.social.instagram, label: "Instagram" },
  { icon: FacebookIcon, href: siteConfig.social.facebook, label: "Facebook" },
  { icon: MessageCircle, href: siteConfig.social.whatsapp, label: "WhatsApp" },
];

export function Footer() {
  return (
    <footer className="bg-dark text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container-shop py-10 md:py-14">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="font-serif text-2xl md:text-3xl font-medium mb-3">
              Receba Novidades Exclusivas
            </h3>
            <p className="text-white/70 text-sm mb-6">
              Cadastre-se e ganhe 10% OFF na primeira compra
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-gold transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gold hover:bg-gold-dark text-white font-medium rounded-lg transition-colors"
              >
                Cadastrar
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-shop py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <h2 className="font-serif text-2xl font-semibold tracking-wide">
                <span className="text-gold">Bela</span> de Perfume
              </h2>
            </Link>
            <p className="text-white/70 text-sm mb-4 leading-relaxed">
              Sua ponte para a rica tradição olfativa do Oriente Médio. Fragrâncias autênticas, 
              importadas diretamente das melhores casas de perfumaria árabe.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-gold rounded-full transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Institucional */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">
              Institucional
            </h4>
            <ul className="space-y-2">
              {footerLinks.institucional.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ajuda */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">
              Ajuda
            </h4>
            <ul className="space-y-2">
              {footerLinks.ajuda.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categorias */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">
              Categorias
            </h4>
            <ul className="space-y-2">
              {footerLinks.categorias.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
            <a href={`mailto:${siteConfig.contact.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="w-4 h-4" />
              {siteConfig.contact.email}
            </a>
            <a href={`tel:+${siteConfig.contact.whatsapp}`} className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="w-4 h-4" />
              {siteConfig.contact.phone}
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {siteConfig.contact.location}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-shop py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
            <p>© 2024 {siteConfig.name}. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacidade" className="hover:text-white transition-colors">
                Política de Privacidade
              </Link>
              <Link href="/termos" className="hover:text-white transition-colors">
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
