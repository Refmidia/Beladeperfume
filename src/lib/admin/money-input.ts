/** Entrada/saída de valores em reais (BR) ↔ centavos inteiros no banco. */

export function formatReaisInput(minor: number | null | undefined): string {
  if (minor == null) return "";
  return (minor / 100)
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parseReaisInput(raw: string): number | null {
  const t = raw.trim().replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}
