import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-context";
import { Logo } from "@/components/Logo";
import { RoleToggle } from "./login";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({ meta: [{ title: "Create account — Modern Trust" }, { name: "description", content: "Create your Modern Trust account." }] }),
});

function RegisterPage() {
  const { user } = useApp();
  const nav = useNavigate();
  const { t } = useTranslation();
  const [role, setRole] = useState<"renter" | "landlord">("renter");

  useEffect(() => {
    if (user) void nav({ to: "/dashboard" });
  }, [user, nav]);

  return (
    <div className="relative grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-12 sm:px-8 lg:order-1">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <h1 className="text-2xl font-bold">{t("auth.createAccount")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("auth.createSubtitle")}</p>

          <RoleToggle role={role} setRole={setRole} />

          <ul className="mt-6 space-y-1.5 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <Check className="h-3 w-3 text-success" /> {t("auth.registerBullet1")}
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="h-3 w-3 text-success" /> {t("auth.registerBullet2")}
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="h-3 w-3 text-success" /> {t("auth.registerBullet3")}
            </li>
          </ul>

          <div className="mt-6">
            <GoogleAuthButton role={role} />
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("auth.haveAccount")}{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              {t("auth.signInLink")}
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="relative hidden bg-brand-gradient lg:block">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Logo variant="light" />
          <div>
            <h2 className="text-3xl font-bold leading-tight">{t("auth.registerHeroTitle")}</h2>
            <p className="mt-3 max-w-md text-white/80">{t("auth.registerHeroSubtitle")}</p>
          </div>
          <p className="text-xs text-white/60">{t("auth.footerCopyright")}</p>
        </div>
      </div>
    </div>
  );
}
