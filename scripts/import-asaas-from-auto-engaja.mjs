/**
 * Copia Asaas do Auto Engaja (MySQL ae_settings) para o .env desta loja.
 * Rode na sua máquina (você autorizou):
 *   node scripts/import-asaas-from-auto-engaja.mjs
 *
 * Opcional: AUTO_ENGAJA_ENV=F:/auto-engajamento/.env.local
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const require = createRequire(
  existsSync("F:/auto-engajamento/package.json")
    ? "F:/auto-engajamento/package.json"
    : join(root, "package.json"),
);
const mysql = require("mysql2/promise");
import { randomBytes } from "node:crypto";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const aeEnvPath =
  process.env.AUTO_ENGAJA_ENV ?? "F:/auto-engajamento/.env.local";

function parseDatabaseUrl(raw) {
  const m = raw.match(/DATABASE_URL="([^"]+)"/) ?? raw.match(/DATABASE_URL=(\S+)/);
  if (!m) throw new Error("DATABASE_URL não encontrado em " + aeEnvPath);
  const url = new URL(m[1].replace(/^mysql:\/\//, "http://"));
  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
  };
}

async function main() {
  if (!existsSync(aeEnvPath)) {
    console.error("Arquivo não encontrado:", aeEnvPath);
    process.exit(1);
  }
  const aeEnv = readFileSync(aeEnvPath, "utf8");
  const conn = await mysql.createConnection(parseDatabaseUrl(aeEnv));
  const keys = [
    "asaas_api_key",
    "asaas_env",
    "asaas_webhook_token",
    "asaas_key_production",
    "asaas_key_sandbox",
  ];
  const [rows] = await conn.query("SELECT k, v FROM ae_settings WHERE k IN (?)", [keys]);
  await conn.end();

  const map = Object.fromEntries(rows.map((r) => [r.k, r.v ?? ""]));
  let apiKey = map.asaas_api_key?.trim();
  const envName = map.asaas_env === "production" ? "production" : "sandbox";
  if (!apiKey) {
    apiKey =
      (envName === "production" ? map.asaas_key_production : map.asaas_key_sandbox)?.trim() ?? "";
  }
  if (!apiKey) {
    console.error("Nenhuma chave Asaas em ae_settings. Configure no admin do Auto Engaja.");
    process.exit(1);
  }

  let webhookToken = map.asaas_webhook_token?.trim();
  if (!webhookToken || webhookToken.length < 8) {
    webhookToken = randomBytes(24).toString("hex");
    console.log("Novo ASAAS_WEBHOOK_TOKEN gerado (use o mesmo na Asaas → webhook Bela).");
  }

  const belaEnvPath = join(root, ".env");
  let bela = existsSync(belaEnvPath) ? readFileSync(belaEnvPath, "utf8") : "";
  const lines = {
    PAYMENT_ADAPTER: "asaas",
    ASAAS_API_KEY: apiKey,
    ASAAS_ENVIRONMENT: envName,
    ASAAS_WEBHOOK_TOKEN: webhookToken,
  };
  for (const [k, v] of Object.entries(lines)) {
    const re = new RegExp(`^${k}=.*$`, "m");
    const line = `${k}=${v.includes(" ") ? `"${v}"` : v}`;
    bela = re.test(bela) ? bela.replace(re, line) : bela.trimEnd() + "\n" + line + "\n";
  }
  writeFileSync(belaEnvPath, bela);
  console.log("Atualizado .env da Bela de Perfume (PAYMENT_ADAPTER=asaas).");
  console.log("Próximo: store.config.ts checkout.paymentProvider = \"asaas\" e webhook na Vercel.");
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
