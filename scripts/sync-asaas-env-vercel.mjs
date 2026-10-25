/**
 * Envia variáveis Asaas do .env local para a Vercel (projeto beladeperfume).
 * node scripts/sync-asaas-env-vercel.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env");
const KEYS = [
  "PAYMENT_ADAPTER",
  "ASAAS_API_KEY",
  "ASAAS_ENVIRONMENT",
  "ASAAS_WEBHOOK_TOKEN",
];

function parseEnv(text) {
  const out = {};
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i);
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

function vercelEnvAdd(name, value, env = "production") {
  const r = spawnSync(
    "npx",
    [
      "vercel",
      "env",
      "add",
      name,
      "--environment",
      env,
      "--force",
      "--yes",
      "--sensitive",
      "--value",
      value,
    ],
    {
      cwd: root,
      encoding: "utf8",
      shell: true,
      stdio: ["pipe", "pipe", "pipe"],
    },
  );
  if (r.status !== 0) {
    console.error(`Falha ${name}:`, r.stderr || r.stdout);
    return false;
  }
  console.log(`OK ${name} (${env})`);
  return true;
}

if (!existsSync(envPath)) {
  console.error("Sem .env");
  process.exit(1);
}
const vars = parseEnv(readFileSync(envPath, "utf8"));
let ok = true;
for (const k of KEYS) {
  if (!vars[k]) {
    console.warn("Pulando (ausente):", k);
    continue;
  }
  if (!vercelEnvAdd(k, vars[k], "production")) ok = false;
  if (!vercelEnvAdd(k, vars[k], "preview")) ok = false;
}
process.exit(ok ? 0 : 1);
