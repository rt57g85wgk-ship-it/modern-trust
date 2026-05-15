import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/app-context";

type Role = "renter" | "landlord";
type Mode = "signin" | "signup";

export function EmailPasswordForm({ role, mode }: { role: Role; mode: Mode }) {
  const { t } = useTranslation();
  const { login } = useApp();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [pending, setPending] = useState(false);

  const schema = z.object({
    name: mode === "signup"
      ? z.string().trim().min(1, t("auth.errors.nameRequired")).max(100)
      : z.string().optional(),
    email: z.string().trim().email(t("auth.errors.invalidEmail")).max(255),
    password: z.string().min(8, t("auth.errors.shortPassword")).max(128),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ name, email, password });
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of result.error.issues) {
        const k = issue.path[0] as keyof typeof errors;
        if (!fieldErrors[k]) fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setPending(true);
    // Mock auth — no backend yet
    setTimeout(() => {
      const finalName = mode === "signup"
        ? name.trim()
        : email.split("@")[0].replace(/[._-]/g, " ");
      login({ name: finalName, email: email.trim(), role });
      toast.success(t("auth.welcomeBack", { name: finalName }));
      setPending(false);
      void nav({ to: "/dashboard" });
    }, 400);
  };

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
      {mode === "signup" && (
        <div className="space-y-1.5">
          <Label htmlFor="ep-name">{t("auth.fullName")}</Label>
          <div className="relative">
            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="ep-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("auth.fullNamePh")}
              className="h-11 pl-9"
              autoComplete="name"
              maxLength={100}
            />
          </div>
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="ep-email">{t("auth.email")}</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="ep-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.emailPh")}
            className="h-11 pl-9"
            autoComplete="email"
            maxLength={255}
          />
        </div>
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ep-password">{t("auth.password")}</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="ep-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("auth.passwordPh")}
            className="h-11 pl-9"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            maxLength={128}
          />
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full gap-2" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {mode === "signin" ? t("auth.signInCta") : t("auth.createCta")}
      </Button>
    </form>
  );
}

export function AuthDivider() {
  const { t } = useTranslation();
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {t("auth.orContinueWith")}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
