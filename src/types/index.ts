export type ProductCategory = "feminino" | "masculino" | "unissex";

export type ProductConcentration = 
  | "edp" 
  | "edt" 
  | "parfum" 
  | "body_splash" 
  | "decant"
  | "extrait";

export type FragranceFamily = 
  | "amadeirado"
  | "floral"
  | "oriental"
  | "gourmand"
  | "citrico"
  | "aquatico"
  | "fougere"
  | "chipre"
  | "aromatico";

export type AvailabilityStatus = "pronta_entrega" | "sob_encomenda" | "esgotado";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  price: number;
  pricePix: number;
  discountPercent: number;
  images: string[];
  category: ProductCategory;
  concentration: ProductConcentration;
  fragranceFamily: FragranceFamily[];
  sizeMl: number;
  stock: number;
  availability: AvailabilityStatus;
  notes?: {
    top?: string[];
    heart?: string[];
    base?: string[];
  };
  isFeatured?: boolean;
  isNew?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface FilterState {
  category: ProductCategory[];
  brand: string[];
  concentration: ProductConcentration[];
  fragranceFamily: FragranceFamily[];
  priceRange: [number, number];
  availability: AvailabilityStatus[];
  search: string;
  sortBy: SortOption;
}

export type SortOption = 
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "newest"
  | "name_asc";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  country?: string;
}
