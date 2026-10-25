/** Celular brasileiro: DDD + 9 dígitos (nono dígito 9). Aceita +55 ou formato local. */
export function normalizePhone(value: string): string {
  let digits = value.trim().replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) digits = digits.slice(2);
  if (!/^[1-9]{2}9\d{8}$/.test(digits))
    throw new Error("Informe um celular válido com DDD, por exemplo (11) 99999-9999.");
  return `+55${digits}`;
}

export function isValidPhone(value: string): boolean {
  try {
    normalizePhone(value);
    return true;
  } catch {
    return false;
  }
}

export function formatPhone(value: string): string {
  const normalized = normalizePhone(value);
  const local = normalized.slice(3);
  return `+55 ${local.slice(0, 2)} ${local.slice(2, 7)}-${local.slice(7)}`;
}
