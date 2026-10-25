/**
 * Registra webhook Asaas para a Bela (mesma conta do Auto Engaja).
 * node scripts/register-asaas-webhook.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(root, "package.json"));
const envText = readFileSync(join(root, ".env"), "utf8");
const get = (k) => {
  const m = envText.match(new RegExp(`^${k}=(.+)$`, "m"));
  if (!m) return "";
  let v = m[1].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  return v;
};

const key = get("ASAAS_API_KEY");
const token = get("ASAAS_WEBHOOK_TOKEN");
const envName = get("ASAAS_ENVIRONMENT") === "sandbox" ? "sandbox" : "production";
const base =
  envName === "sandbox" ? "https://api-sandbox.asaas.com/v3" : "https://api.asaas.com/v3";
const appUrl =
  process.env.WEBHOOK_BASE_URL?.replace(/\/$/, "") ||
  "https://beladeperfume.vercel.app";
const webhookUrl = `${appUrl}/api/asaas/webhook`;

async function main() {
  if (!key || !token) {
    console.error("Configure ASAAS_API_KEY e ASAAS_WEBHOOK_TOKEN no .env");
    process.exit(1);
  }
  const res = await fetch(`${base}/webhooks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      access_token: key,
      "User-Agent": "beladeperfume-attar",
    },
    body: JSON.stringify({
      name: "Bela de Perfume - PIX",
      url: webhookUrl,
      email: "contato@beladeperfume.com.br",
      enabled: true,
      interrupted: false,
      apiVersion: 3,
      authToken: token,
      sendType: "SEQUENTIALLY",
      events: ["PAYMENT_RECEIVED", "PAYMENT_CONFIRMED"],
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Asaas:", json.errors?.[0]?.description ?? res.statusText);
    process.exit(1);
  }
  console.log("Webhook registrado:", webhookUrl);
}

main();
