import type { OrderStatus } from "@/db/schema";
import { label as catalogLabel } from "@/lib/catalog/labels";

/** Fuso horário exibido no admin (Brasil). */
export const ADMIN_TIME_ZONE = "America/Sao_Paulo";

const dateLocale = "pt-BR";

export function formatDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" },
) {
  return date.toLocaleString(dateLocale, { timeZone: ADMIN_TIME_ZONE, ...options });
}

export function formatDateTime(date: Date) {
  return formatDate(date, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Idade relativa compacta. */
export function timeAgo(date: Date, now: Date = new Date()) {
  const minutes = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60000));
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  return days < 30 ? `há ${days} d` : formatDate(date);
}

export function hoursSince(date: Date, now: Date = new Date()) {
  return Math.max(0, (now.getTime() - date.getTime()) / 3600000);
}

export function ordinal(n: number) {
  return `${n}º`;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Rótulo legível em português (atributos de produto, notas, filtros). */
export function humanize(value: string) {
  return catalogLabel(value);
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Aguardando confirmação",
  confirmed: "Confirmado",
  packed: "Embalado",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
  returned: "Devolvido",
};

/** Caminho feliz do pedido; cancelado/devolvido saem dele. */
export const FULFILMENT_STEPS = ["pending", "confirmed", "packed", "shipped", "delivered"] as const;

export const PAYMENT_LABELS: Record<string, string> = {
  cod: "Pagamento na entrega",
  bkash: "PIX",
  nagad: "Cartão",
};

const LEGACY_EVENT_MESSAGES: Record<string, string> = {
  "Order placed. Awaiting phone confirmation.":
    "Pedido criado. Aguardando confirmação por telefone.",
  "Order placed; awaiting phone confirmation.":
    "Pedido criado. Aguardando confirmação por telefone.",
};

/** Mensagens de evento gravadas em inglês no banco (pedidos antigos). */
export function orderEventMessage(message: string | null | undefined) {
  if (!message) return message;
  return LEGACY_EVENT_MESSAGES[message] ?? message;
}

/** wa.me quer só dígitos, com DDI. */
export function whatsappHref(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}
