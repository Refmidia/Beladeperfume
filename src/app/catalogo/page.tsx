"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid";
import {
  ProductFilters,
  MobileFilters,
  SortDropdown,
} from "@/components/product/ProductFilters";
import { SectionTitle } from "@/components/home/SectionTitle";
import { DEMO_PRODUCTS } from "@/data/demo-products";
import type { ProductCategory, ProductConcentration, FragranceFamily, AvailabilityStatus, SortOption } from "@/types";

interface FilterState {
  category: ProductCategory[];
  brand: string[];
  concentration: ProductConcentration[];
  fragranceFamily: FragranceFamily[];
  priceRange: [number, number];
  availability: AvailabilityStatus[];
  sortBy: SortOption;
}

const initialFilters: FilterState = {
  category: [],
  brand: [],
  concentration: [],
  fragranceFamily: [],
  priceRange: [0, 1000],
  availability: [],
  sortBy: "relevance",
};

function CatalogoLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background-secondary border-b border-border">
        <div className="container-shop py-8 sm:py-10">
          <div className="text-center">
            <div className="h-4 w-32 skeleton rounded mx-auto mb-2" />
            <div className="h-8 w-48 skeleton rounded mx-auto" />
          </div>
        </div>
      </div>
      <div className="container-shop py-6 sm:py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-[17px] overflow-hidden">
              <div className="aspect-square skeleton" />
              <div className="p-3 sm:p-4">
                <div className="h-3 w-16 skeleton rounded mb-2" />
                <div className="h-4 w-full skeleton rounded mb-1" />
                <div className="h-4 w-3/4 skeleton rounded mb-3" />
                <div className="h-5 w-28 skeleton rounded mb-1" />
                <div className="h-3 w-24 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CatalogoContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const categoria = searchParams.get("categoria") as ProductCategory | null;
    const disponibilidade = searchParams.get("disponibilidade") as AvailabilityStatus | null;
    const familia = searchParams.get("familia") as FragranceFamily | null;
    const tipo = searchParams.get("tipo") as ProductConcentration | null;

    setFilters((prev) => ({
      ...prev,
      category: categoria ? [categoria] : [],
      availability: disponibilidade ? [disponibilidade] : [],
      fragranceFamily: familia ? [familia] : [],
      concentration: tipo ? [tipo] : [],
    }));

    setTimeout(() => setIsLoading(false), 500);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let result = [...DEMO_PRODUCTS];

    if (filters.category.length > 0) {
      result = result.filter((p) => filters.category.includes(p.category));
    }

    if (filters.brand.length > 0) {
      result = result.filter((p) => filters.brand.includes(p.brand));
    }

    if (filters.concentration.length > 0) {
      result = result.filter((p) => filters.concentration.includes(p.concentration));
    }

    if (filters.fragranceFamily.length > 0) {
      result = result.filter((p) =>
        p.fragranceFamily.some((f) => filters.fragranceFamily.includes(f))
      );
    }

    if (filters.availability.length > 0) {
      result = result.filter((p) => filters.availability.includes(p.availability));
    }

    result = result.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    switch (filters.sortBy) {
      case "price_asc":
        result.sort((a, b) => a.pricePix - b.pricePix);
        break;
      case "price_desc":
        result.sort((a, b) => b.pricePix - a.pricePix);
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "name_asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [filters]);

  const getTitle = () => {
    if (filters.category.length === 1) {
      const categoryLabels: Record<ProductCategory, string> = {
        feminino: "Perfumes Femininos",
        masculino: "Perfumes Masculinos",
        unissex: "Perfumes Unissex",
      };
      return categoryLabels[filters.category[0]];
    }
    if (filters.availability.length === 1) {
      return filters.availability[0] === "pronta_entrega"
        ? "Pronta Entrega"
        : "Sob Encomenda";
    }
    return "Catálogo";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background-secondary border-b border-border">
        <div className="container-shop py-8 sm:py-10">
          <SectionTitle
            subtitle="Coleção Completa"
            title={getTitle()}
            align="center"
          />
        </div>
      </div>

      <div className="container-shop py-6 sm:py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="lg:hidden">
            <MobileFilters
              filters={filters}
              onFiltersChange={setFilters}
              totalProducts={filteredProducts.length}
            />
          </div>

          <p className="text-sm text-foreground-muted hidden sm:block">
            {filteredProducts.length} {filteredProducts.length === 1 ? "produto" : "produtos"}
          </p>

          <SortDropdown
            value={filters.sortBy}
            onChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value }))}
          />
        </div>

        <p className="text-sm text-foreground-muted mb-4 sm:hidden">
          {filteredProducts.length} {filteredProducts.length === 1 ? "produto" : "produtos"}
        </p>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="sticky top-[100px]">
              <ProductFilters
                filters={filters}
                onFiltersChange={setFilters}
                totalProducts={filteredProducts.length}
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <ProductGrid
              products={filteredProducts}
              loading={isLoading}
              emptyMessage="Nenhum produto encontrado com os filtros selecionados."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={<CatalogoLoading />}>
      <CatalogoContent />
    </Suspense>
  );
}
