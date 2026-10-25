import { env } from "@/lib/env";

const SANDBOX = "https://api-sandbox.asaas.com/v3";
const PRODUCTION = "https://api.asaas.com/v3";

function baseUrl() {
  if (env.ASAAS_API_URL) return env.ASAAS_API_URL.replace(/\/$/, "");
  return env.ASAAS_ENVIRONMENT === "sandbox" ? SANDBOX : PRODUCTION;
}

export class AsaasError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AsaasError";
  }
}

export async function asaasFetch<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const key = env.ASAAS_API_KEY?.trim();
  if (!key) throw new AsaasError("ASAAS_API_KEY is not configured.", 503);

  const headers = new Headers(init?.headers);
  headers.set("access_token", key);
  headers.set("User-Agent", "beladeperfume-attar");
  if (init?.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers,
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const msg =
      typeof data === "object" &&
      data &&
      "errors" in data &&
      Array.isArray((data as { errors: { description?: string }[] }).errors)
        ? (data as { errors: { description?: string }[] }).errors
            .map((e) => e.description)
            .filter(Boolean)
            .join("; ") || res.statusText
        : res.statusText;
    throw new AsaasError(msg, res.status);
  }

  return data as T;
}
