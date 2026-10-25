import { pricingFromCost } from "./supplier";

export type VariantPricingInput = {
  costPrice: number | null | undefined;
  markupPixPercent: number;
  markupCardPercent: number;
  supplierSuggestedPrice?: number | null;
  price: number;
  retailPrice: number;
  cardPrice: number;
};

/** Recalcula Pix (price), cartão (cardPrice) e retail a partir do custo. */
export function applyCostToVariantPricing(
  variant: VariantPricingInput,
): Pick<VariantPricingInput, "price" | "retailPrice" | "cardPrice"> {
  if (variant.costPrice == null || variant.costPrice < 0) return variant;
  const { pricePixMinor, priceCardMinor } = pricingFromCost({
    costMinor: variant.costPrice,
    markupPixPercent: variant.markupPixPercent,
    markupCardPercent: variant.markupCardPercent,
  });
  return {
    price: pricePixMinor,
    cardPrice: priceCardMinor,
    retailPrice: priceCardMinor,
  };
}
