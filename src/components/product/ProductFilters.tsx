"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductCategory, ProductConcentration, FragranceFamily, AvailabilityStatus, SortOption } from "@/types";
import { DEMO_BRANDS } from "@/data/demo-products";

interface FilterState {
  category: ProductCategory[];
  brand: string[];
  concentration: ProductConcentration[];
  fragranceFamily: FragranceFamily[];
  priceRange: [number, number];
  availability: AvailabilityStatus[];
  sortBy: SortOption;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalProducts: number;
}

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "feminino", label: "Feminino" },
  { value: "masculino", label: "Masculino" },
  { value: "unissex", label: "Unissex" },
];

const CONCENTRATIONS: { value: ProductConcentration; label: string }[] = [
  { value: "parfum", label: "Parfum" },
  { value: "extrait", label: "Extrait de Parfum" },
  { value: "edp", label: "Eau de Parfum" },
  { value: "edt", label: "Eau de Toilette" },
  { value: "body_splash", label: "Body Splash" },
  { value: "decant", label: "Decant" },
];

const FRAGRANCE_FAMILIES: { value: FragranceFamily; label: string }[] = [
  { value: "amadeirado", label: "Amadeirado" },
  { value: "floral", label: "Floral" },
  { value: "oriental", label: "Oriental" },
  { value: "gourmand", label: "Gourmand" },
  { value: "citrico", label: "Cítrico" },
  { value: "aquatico", label: "Aquático" },
  { value: "fougere", label: "Fougère" },
  { value: "aromatico", label: "Aromático" },
];

const AVAILABILITY: { value: AvailabilityStatus; label: string }[] = [
  { value: "pronta_entrega", label: "Pronta Entrega" },
  { value: "sob_encomenda", label: "Sob Encomenda" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevância" },
  { value: "price_asc", label: "Menor Preço" },
  { value: "price_desc", label: "Maior Preço" },
  { value: "newest", label: "Mais Recentes" },
  { value: "name_asc", label: "A-Z" },
];

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left py-2"
      >
        <span className="font-medium text-foreground text-sm">{title}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-foreground-muted transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckboxGroup<T extends string>({
  options,
  selected,
  onChange,
}: {
  options: { value: T; label: string }[];
  selected: T[];
  onChange: (values: T[]) => void;
}) {
  const toggleValue = (value: T) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div
            className={cn(
              "w-4 h-4 rounded border flex items-center justify-center transition-colors",
              selected.includes(option.value)
                ? "bg-gold border-gold"
                : "border-border group-hover:border-gold"
            )}
          >
            {selected.includes(option.value) && (
              <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6L5 9L10 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}

export function ProductFilters({
  filters,
  onFiltersChange,
  totalProducts,
}: ProductFiltersProps) {
  const updateFilters = (update: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...update });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: [],
      brand: [],
      concentration: [],
      fragranceFamily: [],
      priceRange: [0, 1000],
      availability: [],
      sortBy: "relevance",
    });
  };

  const hasActiveFilters =
    filters.category.length > 0 ||
    filters.brand.length > 0 ||
    filters.concentration.length > 0 ||
    filters.fragranceFamily.length > 0 ||
    filters.availability.length > 0;

  return (
    <div className="bg-card border border-border rounded-xl p-4 lg:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Filtros</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-gold hover:text-gold-dark transition-colors"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      <FilterSection title="Gênero">
        <CheckboxGroup
          options={CATEGORIES}
          selected={filters.category}
          onChange={(values) => updateFilters({ category: values })}
        />
      </FilterSection>

      <FilterSection title="Marca">
        <CheckboxGroup
          options={DEMO_BRANDS.map((b) => ({ value: b.name, label: b.name }))}
          selected={filters.brand}
          onChange={(values) => updateFilters({ brand: values })}
        />
      </FilterSection>

      <FilterSection title="Tipo">
        <CheckboxGroup
          options={CONCENTRATIONS}
          selected={filters.concentration}
          onChange={(values) => updateFilters({ concentration: values })}
        />
      </FilterSection>

      <FilterSection title="Família Olfativa" defaultOpen={false}>
        <CheckboxGroup
          options={FRAGRANCE_FAMILIES}
          selected={filters.fragranceFamily}
          onChange={(values) => updateFilters({ fragranceFamily: values })}
        />
      </FilterSection>

      <FilterSection title="Disponibilidade">
        <CheckboxGroup
          options={AVAILABILITY}
          selected={filters.availability}
          onChange={(values) => updateFilters({ availability: values })}
        />
      </FilterSection>

      <FilterSection title="Faixa de Preço" defaultOpen={false}>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-xs text-foreground-muted mb-1 block">Mínimo</label>
              <input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e) =>
                  updateFilters({
                    priceRange: [Number(e.target.value), filters.priceRange[1]],
                  })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-gold"
                placeholder="R$ 0"
              />
            </div>
            <span className="text-foreground-muted mt-5">—</span>
            <div className="flex-1">
              <label className="text-xs text-foreground-muted mb-1 block">Máximo</label>
              <input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e) =>
                  updateFilters({
                    priceRange: [filters.priceRange[0], Number(e.target.value)],
                  })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-gold"
                placeholder="R$ 1000"
              />
            </div>
          </div>
        </div>
      </FilterSection>
    </div>
  );
}

export function MobileFilters({
  filters,
  onFiltersChange,
  totalProducts,
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters =
    filters.category.length > 0 ||
    filters.brand.length > 0 ||
    filters.concentration.length > 0 ||
    filters.fragranceFamily.length > 0 ||
    filters.availability.length > 0;

  const activeFilterCount =
    filters.category.length +
    filters.brand.length +
    filters.concentration.length +
    filters.fragranceFamily.length +
    filters.availability.length;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-sm font-medium hover:border-gold transition-colors"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtros
        {activeFilterCount > 0 && (
          <span className="bg-gold text-white text-xs px-1.5 py-0.5 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-[320px] max-w-[90vw] bg-background z-50 shadow-xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-background flex items-center justify-between p-4 border-b border-border">
                <span className="font-semibold">Filtros</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-background-secondary rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4">
                <ProductFilters
                  filters={filters}
                  onFiltersChange={onFiltersChange}
                  totalProducts={totalProducts}
                />
              </div>

              <div className="sticky bottom-0 bg-background border-t border-border p-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 bg-gold hover:bg-gold-dark text-white font-medium rounded-lg transition-colors"
                >
                  Ver {totalProducts} Produtos
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function SortDropdown({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (value: SortOption) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const currentOption = SORT_OPTIONS.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-sm font-medium hover:border-gold transition-colors"
      >
        <span className="text-foreground-muted">Ordenar:</span>
        <span>{currentOption?.label}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg py-2 min-w-[180px] z-50"
            >
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm transition-colors",
                    option.value === value
                      ? "text-gold bg-gold/5"
                      : "text-foreground-muted hover:text-foreground hover:bg-background-secondary"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
