import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MAISON OUD | Perfumes Árabes Premium",
  description:
    "Descubra fragrâncias exclusivas do Oriente Médio. Perfumes árabes autênticos com frete para todo Brasil.",
  keywords: [
    "perfumes árabes",
    "oud",
    "fragrâncias orientais",
    "perfumaria árabe",
    "lattafa",
    "armaf",
    "afnan",
  ],
  openGraph: {
    title: "MAISON OUD | Perfumes Árabes Premium",
    description: "Descubra fragrâncias exclusivas do Oriente Médio",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${cormorant.variable} ${manrope.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground font-sans antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
