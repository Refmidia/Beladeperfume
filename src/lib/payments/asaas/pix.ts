import type { orders } from "@/db/schema";
import { formatMoney } from "@/lib/money";
import { storeConfig } from "../../../../store.config";
import { asaasFetch } from "./client";

type AsaasCustomer = { id: string };
type AsaasPayment = { id: string; invoiceUrl?: string };
type AsaasPaymentDetails = { id: string; invoiceUrl?: string; status?: string };

function dueDateIso(daysAhead = 1) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

/** Apenas dígitos; exige 11 (CPF) ou 14 (CNPJ). */
export function normalizeCpfCnpj(raw: string) {
  return raw.replace(/\D/g, "");
}

export async function ensureAsaasCustomer(input: {
  name: string;
  cpfCnpj: string;
  email?: string | null;
  phone: string;
}) {
  const cpfCnpj = normalizeCpfCnpj(input.cpfCnpj);
  if (cpfCnpj.length !== 11 && cpfCnpj.length !== 14) {
    throw new Error("Informe um CPF ou CNPJ válido.");
  }
  const mobilePhone = input.phone.replace(/\D/g, "").slice(-11);
  return asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    json: {
      name: input.name.slice(0, 120),
      cpfCnpj,
      email: input.email?.trim() || undefined,
      mobilePhone: mobilePhone.length >= 10 ? mobilePhone : undefined,
      notificationDisabled: true,
    },
  });
}

function paymentBody(
  customerId: string,
  order: typeof orders.$inferSelect,
  billingType: "PIX" | "CREDIT_CARD",
) {
  const value = order.total / 100;
  return {
    customer: customerId,
    billingType,
    value,
    dueDate: dueDateIso(2),
    externalReference: order.orderNumber,
    description: `${storeConfig.store.name} · pedido ${order.orderNumber}`.slice(0, 500),
  };
}

export async function createPixPayment(input: {
  customerId: string;
  order: typeof orders.$inferSelect;
}) {
  return asaasFetch<AsaasPayment>("/payments", {
    method: "POST",
    json: paymentBody(input.customerId, input.order, "PIX"),
  });
}

/** Fatura Asaas: cliente informa cartão (ou débito) na página segura do Asaas. */
export async function createCardInvoicePayment(input: {
  customerId: string;
  order: typeof orders.$inferSelect;
}) {
  return asaasFetch<AsaasPayment>("/payments", {
    method: "POST",
    json: paymentBody(input.customerId, input.order, "CREDIT_CARD"),
  });
}

export async function fetchAsaasPayment(paymentId: string) {
  return asaasFetch<AsaasPaymentDetails>(
    `/payments/${encodeURIComponent(paymentId)}`,
  );
}

export type PixQrCode = {
  encodedImage: string;
  payload: string;
  expirationDate: string;
};

export async function fetchPixQrCode(paymentId: string) {
  return asaasFetch<PixQrCode>(`/payments/${encodeURIComponent(paymentId)}/pixQrCode`);
}

export function orderTotalReais(order: typeof orders.$inferSelect) {
  return formatMoney(order.total);
}
