import { env } from "@/lib/env";
import { lanOrigins } from "@/lib/dev-origins";

/** Origins allowed to POST /api/uploads (admin session still required). */
export function isAllowedUploadOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const allowed = new Set<string>();
  allowed.add(new URL(env.NEXT_PUBLIC_APP_URL).origin);

  try {
    allowed.add(new URL(request.url).origin);
  } catch {
    /* ignore */
  }

  for (const host of [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ]) {
    if (host) allowed.add(`https://${host.replace(/^https?:\/\//, "")}`);
  }

  for (const o of lanOrigins()) allowed.add(o);

  return allowed.has(origin);
}
