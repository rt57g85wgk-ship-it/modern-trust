import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { User, Home as HomeIcon, ShieldCheck, Check, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-context";
import { Logo } from "@/components/Logo";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { EmailPasswordForm, AuthDivider } from "@/components/EmailPasswordForm";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — Modern Trust" }, { name: "description", content: "Sign in to Modern Trust." }] }),
});

function LoginPage() {
  const { user, authLoading } = useApp();
  const nav = useNavigate();
  const { t } = useTranslation();
  const [role, setRole] = useState<"renter" | "landlord">("renter");

  useEffect(() => {
    if (!authLoading && user) void nav({ to: "/dashboard" });
  }, [user, authLoading, nav]);

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="relative hidden bg-brand-gradient lg:block">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Logo variant="light" />
          <div>
            <h2 className="text-3xl font-bold leading-tight">{t("auth.loginHeroTitle")}</h2>
            <p className="mt-3 max-w-md text-white/80">{t("auth.loginHeroSubtitle")}</p>
            <div className="mt-8 grid max-w-sm grid-cols-2 gap-3">
              {[
                ["12,400+", t("auth.loginStatListings")],
                ["100%", t("auth.loginStatHosts")],
                ["4.9★", t("auth.loginStatRating")],
                ["24/7", t("auth.loginStatSupport")],
              ].map(([n, l]) => (
                <div key={l} className="rounded-xl bg-white/10 p-4 backdrop-blur">
                  <div className="text-2xl font-bold">{n}</div>
                  <div className="text-xs text-white/70">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/60">{t("auth.footerCopyright")}</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <h1 className="text-2xl font-bold">{t("auth.signIn")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("auth.signInSubtitle")}</p>

          <RoleToggle role={role} setRole={setRole} />

          <EmailPasswordForm role={role} mode="signin" />

          <AuthDivider />

          <GoogleAuthButton role={role} />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              {t("auth.createOne")}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export function RoleToggle({ role, setRole }: { role: "renter" | "landlord"; setRole: (r: "renter" | "landlord") => void }) {
  const { t } = useTranslation();
  return (
    <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/40 p-1">
      {(["renter", "landlord"] as const).map((k) => {
        const selected = role === k;
        const label = k === "renter" ? t("auth.renterRole") : t("auth.landlordRole");
        const Icon = k === "renter" ? User : HomeIcon;
        return (
          <button
            key={k}
            type="button"
            onClick={() => setRole(k)}
            aria-pressed={selected}
            className={`relative flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              selected
                ? "text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {selected && (
              <motion.div
                layoutId="roleBg"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="absolute inset-0 rounded-lg bg-primary shadow-glow ring-1 ring-primary/40"
              />
            )}
            <span className="relative flex items-center gap-2">
              <Icon className="h-4 w-4" /> {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function _refs() {
  return [ShieldCheck, Check];
}
