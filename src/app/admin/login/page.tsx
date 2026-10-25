import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { adminSession } from "@/lib/admin/session";
import { env } from "@/lib/env";
import { LoginForm } from "@/components/admin/auth-controls";
import { adminCopy as t } from "@/lib/admin/copy";
import { storeConfig } from "../../../../store.config";

export default async function Login() {
  if (await adminSession()) redirect("/admin");
  return (
    <main className="admin-login">
      <section className="admin-login-art" aria-hidden>
        <Image
          src="/editorial/fragrance-still-life.webp"
          alt=""
          fill
          fetchPriority="high"
          sizes="(max-width: 900px) 0px, 50vw"
        />
        <div className="admin-login-art-copy">
          <span className="admin-wordmark light">
            {storeConfig.store.name}
            <sup>©</sup>
          </span>
          <p>{t.login.tagline}</p>
        </div>
      </section>
      <section className="admin-login-pane">
        <Link href="/" className="admin-login-back">
          {storeConfig.store.name} <ArrowUpRight size={14} />
        </Link>
        <div className="admin-login-card">
          <span className="admin-eyebrow">{t.login.eyebrow}</span>
          <h1>{t.login.title}</h1>
          <p className="admin-muted">{t.login.subtitle}</p>
          <LoginForm />
          {env.DEMO_MODE && (
            <p className="admin-muted admin-login-demo">
              {t.login.demoHint}{" "}
              <Link href="/demo">{t.login.demoLink}</Link>.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
