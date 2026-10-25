/** Bela de Perfume — custo → Pix / cartão (minor units, BRL centavos). */

export const DEFAULT_MARKUP_PIX_PERCENT = 47;
export const DEFAULT_MARKUP_CARD_PERCENT = 53;

/** costReais × (1 + markup/100), arredondado para centavos inteiros. */
export function saleFromCostMinor(
  costMinor: number,
  markupPercent: number,
): number {
  if (!Number.isInteger(costMinor) || costMinor < 0)
    throw new Error("Invalid cost.");
  if (!Number.isFinite(markupPercent) || markupPercent < 0)
    throw new Error("Invalid markup.");
  return Math.round(costMinor * (1 + markupPercent / 100));
}

export function pricingFromCost(input: {
  costMinor: number;
  markupPixPercent?: number;
  markupCardPercent?: number;
}) {
  const pix = saleFromCostMinor(
    input.costMinor,
    input.markupPixPercent ?? DEFAULT_MARKUP_PIX_PERCENT,
  );
  const card = saleFromCostMinor(
    input.costMinor,
    input.markupCardPercent ?? DEFAULT_MARKUP_CARD_PERCENT,
  );
  return {
    pricePixMinor: pix,
    priceCardMinor: card,
    grossProfitPixMinor: pix - input.costMinor,
    grossProfitCardMinor: card - input.costMinor,
    grossMarginPixPercent: input.costMinor > 0 ? ((pix - input.costMinor) / pix) * 100 : 0,
    grossMarginCardPercent: input.costMinor > 0 ? ((card - input.costMinor) / card) * 100 : 0,
  };
}

/** Reais inteiros do fornecedor (160) → centavos (16000). */
export function supplierReaisToMinor(reais: number): number {
  if (!Number.isFinite(reais) || reais < 0) throw new Error("Invalid supplier amount.");
  return Math.round(reais * 100);
}

export type CheckoutPriceMethod = "bkash" | "cod" | "nagad";

/** Pix (bkash slot) usa preço Pix; demais formas usam cartão. */
export function unitPriceForPayment(
  variant: { price: number; cardPrice: number },
  paymentMethod: CheckoutPriceMethod,
): number {
  return paymentMethod === "bkash" ? variant.price : variant.cardPrice;
}
