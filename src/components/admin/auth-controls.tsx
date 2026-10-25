"use client";
import { createAuthClient } from "better-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, LoaderCircle, LogOut } from "lucide-react";
import { adminCopy as t } from "@/lib/admin/copy";

const auth = createAuthClient();
export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [reveal, setReveal] = useState(false);
  return (
    <form
      className="admin-login-form"
      method="post"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError("");
        const data = new FormData(e.currentTarget);
        try {
          const result = await auth.signIn.email({
            email: String(data.get("email")),
            password: String(data.get("password")),
          });
          if (result.error) setError(t.auth.signInFailed);
          else {
            router.replace("/admin");
            router.refresh();
          }
        } catch {
          setError(t.auth.connectFailed);
        } finally {
          setPending(false);
        }
      }}
    >
      <label className="admin-field">
        <span>{t.auth.email}</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          placeholder={t.auth.emailPlaceholder}
          required
          maxLength={254}
        />
      </label>
      <label className="admin-field">
        <span>{t.auth.password}</span>
        <span className="admin-input-affix">
          <input
            name="password"
            type={reveal ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            required
            maxLength={128}
          />
          <button
            type="button"
            className="admin-affix-btn"
            onClick={() => setReveal(!reveal)}
            aria-label={reveal ? t.auth.hidePassword : t.auth.showPassword}
            aria-pressed={reveal}
          >
            {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </span>
      </label>
      {error && (
        <p role="alert" className="admin-callout" data-tone="bad">
          {error}
        </p>
      )}
      <button className="admin-btn primary lg" disabled={pending}>
        {pending ? (
          <>
            <LoaderCircle size={16} className="admin-spin" /> {t.auth.signingIn}
          </>
        ) : (
          <>
            {t.auth.signIn} <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
}
export function Logout() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <button
        type="button"
        className="admin-menu-item danger"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          try {
            const result = await auth.signOut();
            if (result.error) throw new Error();
            router.replace("/admin/login");
            router.refresh();
          } catch {
            setError(t.auth.signOutFailed);
            setPending(false);
          }
        }}
      >
        <LogOut size={15} /> {pending ? t.auth.signingOut : t.auth.signOut}
      </button>
      {error && (
        <span role="alert" className="admin-error-text">
          {error}
        </span>
      )}
    </>
  );
}
