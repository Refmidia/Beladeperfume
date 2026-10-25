/**
 * Utilitários de precificação
 * 
 * Markup padrão: 47% sobre o custo
 * Desconto PIX: configurável (padrão 25%)
 */

export const MARKUP_MULTIPLIER = 1.47;
export const DEFAULT_PIX_DISCOUNT = 0.25; // 25%

export function calculateSellPrice(costCents: number): number {
  return Math.round(costCents * MARKUP_MULTIPLIER);
}

export function calculatePixPrice(priceCents: number, pixDiscount: number = DEFAULT_PIX_DISCOUNT): number {
  return Math.round(priceCents * (1 - pixDiscount));
}

export function calculatePricesFromCost(costCents: number, pixDiscount: number = DEFAULT_PIX_DISCOUNT) {
  const sellPrice = calculateSellPrice(costCents);
  const pixPrice = calculatePixPrice(sellPrice, pixDiscount);
  
  return {
    costCents,
    sellPriceCents: sellPrice,
    pixPriceCents: pixPrice,
    sellPrice: sellPrice / 100,
    pixPrice: pixPrice / 100,
    discountPercent: Math.round(pixDiscount * 100),
  };
}

export function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatPriceBRL(value: number): string {
  return `R$ ${formatPrice(value)}`;
}
