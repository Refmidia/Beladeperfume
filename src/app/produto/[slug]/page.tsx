import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Package, Clock, Truck, ShieldCheck } from "lucide-react";
import { formatCurrencyCompact } from "@/lib/utils";
import { getProductBySlug, DEMO_PRODUCTS } from "@/data/demo-products";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductPageClient } from "./ProductPageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function ProductSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background-secondary border-b border-border">
        <div className="container-shop py-4">
          <div className="h-4 w-64 skeleton rounded" />
        </div>
      </div>
      <div className="container-shop py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="aspect-square skeleton rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 w-24 skeleton rounded" />
            <div className="h-10 w-3/4 skeleton rounded" />
            <div className="h-6 w-full skeleton rounded" />
            <div className="h-6 w-2/3 skeleton rounded" />
            <div className="h-32 skeleton rounded-xl" />
            <div className="h-20 skeleton rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

async function ProductContent({ slug }: { slug: string }) {
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = DEMO_PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category
  ).slice(0, 4);

  const isAvailable = product.availability === "pronta_entrega";

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background-secondary border-b border-border">
        <div className="container-shop py-4">
          <nav className="flex items-center gap-2 text-sm text-foreground-muted">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/catalogo" className="hover:text-foreground transition-colors">
              Catálogo
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-shop py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="relative aspect-square bg-card border border-border rounded-2xl overflow-hidden">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            
            {product.discountPercent > 0 && (
              <span className="absolute top-4 right-4 bg-gold text-white text-sm font-semibold px-3 py-1.5 rounded-full">
                -{product.discountPercent}%
              </span>
            )}
          </div>

          <div>
            <span className="text-sm text-foreground-muted uppercase tracking-wider">
              {product.brand}
            </span>
            
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mt-2 mb-4">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 text-sm bg-background-secondary px-3 py-1.5 rounded-full">
                {product.sizeMl}ml
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm bg-background-secondary px-3 py-1.5 rounded-full capitalize">
                {product.concentration.replace("_", " ")}
              </span>
              {isAvailable ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-success bg-success/10 px-3 py-1.5 rounded-full">
                  <Package className="w-4 h-4" />
                  Pronta Entrega
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm text-warning bg-warning/10 px-3 py-1.5 rounded-full">
                  <Clock className="w-4 h-4" />
                  Sob Encomenda
                </span>
              )}
            </div>

            <p className="text-foreground-muted leading-relaxed mb-6">
              {product.description}
            </p>

            {product.notes && (
              <div className="bg-background-secondary rounded-xl p-5 mb-6">
                <h3 className="font-semibold text-foreground text-sm mb-3">Pirâmide Olfativa</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {product.notes.top && (
                    <div>
                      <span className="text-foreground-muted block mb-1">Topo</span>
                      <span className="text-foreground">{product.notes.top.join(", ")}</span>
                    </div>
                  )}
                  {product.notes.heart && (
                    <div>
                      <span className="text-foreground-muted block mb-1">Coração</span>
                      <span className="text-foreground">{product.notes.heart.join(", ")}</span>
                    </div>
                  )}
                  {product.notes.base && (
                    <div>
                      <span className="text-foreground-muted block mb-1">Base</span>
                      <span className="text-foreground">{product.notes.base.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="border-t border-b border-border py-6 mb-6">
              <div className="flex items-end gap-4 mb-2">
                <span className="text-3xl font-semibold text-gold">
                  {formatCurrencyCompact(product.pricePix)}
                </span>
                <span className="text-foreground-muted">no PIX</span>
              </div>
              {product.discountPercent > 0 && (
                <p className="text-foreground-muted">
                  <span className="line-through">{formatCurrencyCompact(product.price)}</span>
                  {" "}ou {formatCurrencyCompact(product.price)} no cartão
                </p>
              )}
            </div>

            <ProductPageClient product={product} />

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="w-5 h-5 text-gold" />
                <span className="text-foreground-muted">Frete grátis +R$299</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <ShieldCheck className="w-5 h-5 text-gold" />
                <span className="text-foreground-muted">100% Autêntico</span>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-16 sm:mt-20">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
              Produtos Relacionados
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent slug={slug} />
    </Suspense>
  );
}

export async function generateStaticParams() {
  return DEMO_PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}
