import { env } from "@/lib/env";
import { handleAsaasWebhook } from "@/lib/payments/asaas/webhook-handlers";

export async function POST(request: Request) {
  if (env.PAYMENT_ADAPTER !== "asaas") {
    return new Response(null, { status: 404 });
  }

  const token = env.ASAAS_WEBHOOK_TOKEN?.trim();
  if (token) {
    const header =
      request.headers.get("asaas-access-token") ??
      request.headers.get("x-asaas-access-token");
    if (header !== token) {
      return new Response(null, { status: 401 });
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  try {
    await handleAsaasWebhook(body as Parameters<typeof handleAsaasWebhook>[0]);
  } catch {
    console.error("Asaas webhook handler failed.");
    return new Response(null, { status: 500 });
  }

  return new Response(null, { status: 200 });
}
