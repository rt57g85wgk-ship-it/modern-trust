import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Check, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const PACKAGE_DEFS = [
  { days: 7 as const, rate: 0.02 },
  { days: 14 as const, rate: 0.035 },
  { days: 30 as const, rate: 0.05 },
] as const;

export type PromotePackage = (typeof PACKAGE_DEFS)[number];

const fmtTHB = (n: number) => `฿${Math.round(n).toLocaleString("en-US")}`;

type PricedPackage = PromotePackage & {
  price: number;
  savings: number;
  perDay: number;
  label: string;
  tagline: string;
  badge: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  monthlyRent: number;
  listingTitle: string;
  onConfirm: (pkg: PromotePackage, price: number) => void;
};

export function PromoteModal({ open, onClose, monthlyRent, listingTitle, onConfirm }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<PromotePackage["days"]>(14);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const priced = useMemo((): PricedPackage[] => {
    return PACKAGE_DEFS.map((p) => {
      const baseline = monthlyRent * PACKAGE_DEFS[0].rate * (p.days / 7);
      const price = monthlyRent * p.rate;
      const savings = Math.max(0, baseline - price);
      const label = t(`promote.packages.${p.days}.label`);
      const tagline = t(`promote.packages.${p.days}.tagline`);
      const badge = t(`promote.packages.${p.days}.badge`);
      return {
        ...p,
        price,
        savings,
        perDay: price / p.days,
        label,
        tagline,
        badge,
      };
    });
  }, [monthlyRent, t]);

  const current = priced.find((p) => p.days === selected)!;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t("promote.headline")}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-t-3xl border border-border bg-card shadow-card sm:rounded-3xl"
          >
            <div className="relative border-b border-border p-6">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                aria-label={t("common.close")}
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" /> {t("promote.kicker")}
              </div>
              <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">{t("promote.headline")}</h2>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                {listingTitle} · {fmtTHB(monthlyRent)}
                {t("common.perMonth")}
              </p>
            </div>

            <div className="grid gap-3 p-6 sm:grid-cols-3">
              {priced.map((p) => {
                const active = p.days === selected;
                return (
                  <button
                    key={p.days}
                    type="button"
                    onClick={() => setSelected(p.days)}
                    aria-pressed={active}
                    className={`relative rounded-2xl border p-4 text-left transition-all ${
                      active
                        ? "border-primary bg-primary/5 shadow-glow ring-1 ring-primary/40"
                        : "border-border bg-background hover:border-primary/40 hover:bg-muted/40"
                    }`}
                  >
                    {p.badge.trim() !== "" && (
                      <span className="absolute -top-2 right-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground shadow">
                        {p.badge}
                      </span>
                    )}
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        {t("promote.daysUnit", { count: p.days })}
                      </span>
                      {active && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="mt-2 text-2xl font-bold tracking-tight">{fmtTHB(p.price)}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {fmtTHB(p.perDay)}
                      {t("promote.perDay")}
                    </div>
                    {p.savings > 0 && (
                      <div className="mt-3 inline-flex items-center gap-1 rounded-md bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success">
                        <TrendingUp className="h-3 w-3" /> {t("promote.save")} {fmtTHB(p.savings)}
                      </div>
                    )}
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {p.label} — {p.tagline}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/30 px-6 py-4">
              <div>
                <p className="text-xs text-muted-foreground">{t("promote.totalDue")}</p>
                <p className="text-lg font-semibold">
                  {fmtTHB(current.price)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    · {t("promote.daysUnit", { count: current.days })}
                  </span>
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">{t("promote.disclaimer")}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  {t("common.cancel")}
                </Button>
                <Button onClick={() => onConfirm(current, current.price)} className="gap-2">
                  <Sparkles className="h-4 w-4" /> {t("promote.activate")}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
