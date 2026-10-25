/**
 * Configuração central da loja
 * Todas as referências ao nome da loja devem vir deste arquivo
 */

export const siteConfig = {
  name: "Bela de Perfume",
  nameShort: "Bela",
  tagline: "Perfumes Árabes Premium",
  description: "Descubra fragrâncias exclusivas do Oriente Médio. Perfumes árabes autênticos com frete para todo Brasil.",
  url: "https://beladeperfume.com.br",
  
  contact: {
    email: "contato@beladeperfume.com.br",
    phone: "(11) 99999-9999",
    whatsapp: "5511999999999",
    location: "São Paulo, SP",
  },
  
  social: {
    instagram: "https://instagram.com/beladeperfume",
    facebook: "https://facebook.com/beladeperfume",
    whatsapp: "https://wa.me/5511999999999",
  },
  
  seo: {
    title: "Bela de Perfume | Perfumes Árabes Premium",
    description: "Descubra fragrâncias exclusivas do Oriente Médio. Perfumes árabes autênticos com frete para todo Brasil.",
    keywords: [
      "perfumes árabes",
      "oud",
      "fragrâncias orientais",
      "perfumaria árabe",
      "lattafa",
      "armaf",
      "afnan",
      "bela de perfume",
    ],
  },
  
  shipping: {
    freeShippingThreshold: 299,
    pixDiscount: 25,
  },
} as const;

export type SiteConfig = typeof siteConfig;
