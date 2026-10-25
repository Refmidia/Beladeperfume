import "../src/db/load-env";
import { eq } from "drizzle-orm";
import { verifyPassword } from "better-auth/crypto";
import { db, closeDb } from "../src/db";
import { user, account } from "../src/db/schema";
import { env } from "../src/lib/env";

async function main() {
  const rows = await db.select({ email: user.email, role: user.role, id: user.id }).from(user);
  console.log("users:", rows.map((r) => `${r.email} (${r.role})`).join(", ") || "(none)");
  const target = env.ADMIN_EMAIL.toLowerCase();
  const admin = rows.find((r) => r.email === target);
  if (!admin) {
    console.log("admin_found: false", "expected:", target);
    return;
  }
  const [acc] = await db.select().from(account).where(eq(account.userId, admin.id));
  const ok =
    acc?.password && (await verifyPassword({ hash: acc.password, password: env.ADMIN_PASSWORD }));
  console.log("admin_found: true", "password_matches_env:", !!ok);
  const { getAuth } = await import("../src/lib/auth");
  const res = await getAuth().api.signInEmail({
    body: { email: target, password: env.ADMIN_PASSWORD },
    asResponse: true,
  });
  console.log("signInEmail_status:", res.status);
}

main()
  .then(() => closeDb())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
