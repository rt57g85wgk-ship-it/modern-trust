import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Upload,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/app-context";
import { parseThaiIdCard, type ParsedThaiIdCard } from "@/lib/ocr";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/verify-identity")({
  component: VerifyIdentityPage,
  head: () => ({
    meta: [
      { title: "Verify Identity — Modern Trust" },
      {
        name: "description",
        content:
          "Verify your identity with a Thai national ID card to unlock full platform features.",
      },
    ],
  }),
});

type ScanState = "idle" | "scanning" | "done" | "error";

function VerifyIdentityPage() {
  const { t } = useTranslation();
  const { user, verifyIdentity, authLoading } = useApp();
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [scanState, setScanState] = useState<ScanState>("idle");
  const [parsed, setParsed] = useState<ParsedThaiIdCard | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);

  // Redirect if already verified
  useEffect(() => {
    if (!authLoading && user?.verified) {
      void nav({ to: "/dashboard" });
    }
  }, [user, authLoading, nav]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      void nav({ to: "/login" });
    }
  }, [user, authLoading, nav]);

  const handleScan = useCallback(async (file: File) => {
    setScanState("scanning");
    setParsed(null);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });

    try {
      // Dynamic import to avoid loading 3MB WASM on pages that don't need it
      const Tesseract = await import("tesseract.js");
      const result = await Tesseract.recognize(file, "tha+eng", {
        logger: (m: any) => {
          if (m.status === "recognizing text") {
            // Could add progress bar here
          }
        },
      });
      const text = result.data.text;

      const data = parseThaiIdCard(text);
      setParsed(data);
      setScanState(data.idNumber ? "done" : "error");
    } catch (err) {
      console.error("OCR error:", err);
      setScanState("error");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    void handleScan(file);
    e.target.value = "";
  };

  const handleConfirm = async () => {
    if (!parsed?.idNumber) return;
    setConfirming(true);
    try {
      // This route skips image upload per spec — /account flow stores it separately
      await verifyIdentity(parsed.idNumber);
      toast.success(t("verifyIdentity.toastSuccess"));
      void nav({ to: "/dashboard" });
    } catch (err: any) {
      console.error("Verify error:", err);
      toast.error(err.message || t("verifyIdentity.toastError"));
    } finally {
      setConfirming(false);
    }
  };

  const reset = () => {
    setScanState("idle");
    setParsed(null);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Back link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("verifyIdentity.backToDashboard")}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("verifyIdentity.headerTitle")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("verifyIdentity.headerSubtitle")}
            </p>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="mt-8 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <StepDot
            n={1}
            label={t("verifyIdentity.stepUpload")}
            active={scanState === "idle"}
            done={scanState !== "idle"}
          />
          <div className="h-px flex-1 bg-border" />
          <StepDot
            n={2}
            label={t("verifyIdentity.stepVerify")}
            active={scanState === "done"}
            done={confirming}
          />
          <div className="h-px flex-1 bg-border" />
          <StepDot n={3} label={t("verifyIdentity.stepConfirm")} active={false} done={false} />
        </div>

        {/* Card area */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <AnimatePresence mode="wait">
            {/* IDLE — upload prompt */}
            {scanState === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-10"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5">
                  <Camera className="h-8 w-8 text-primary/60" />
                </div>
                <p className="mt-4 text-sm font-medium">
                  {t("verifyIdentity.uploadPromptTitle")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("verifyIdentity.uploadPromptFormats")}
                </p>

                {/* PDPA Consent Box */}
                <div className="mt-6 w-full max-w-md rounded-xl border border-border bg-muted/30 p-4 text-left">
                  <div className="flex items-center gap-2 text-xm font-semibold text-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>{t("verifyIdentity.consentTitle")}</span>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                    {t("verifyIdentity.consentDesc")}
                  </p>

                  <div className="mt-4 flex items-start gap-2.5 border-t border-border/60 pt-3">
                    <Checkbox
                      id="pdpa-consent"
                      checked={consentAccepted}
                      onCheckedChange={(checked) => setConsentAccepted(!!checked)}
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor="pdpa-consent"
                      className="cursor-pointer text-xs font-normal leading-relaxed text-muted-foreground select-none hover:text-foreground transition-colors"
                    >
                      {t("verifyIdentity.consentCheckbox")}
                    </Label>
                  </div>
                </div>

                <Button
                  className="mt-6 gap-2"
                  onClick={() => fileRef.current?.click()}
                  disabled={!consentAccepted}
                >
                  <Upload className="h-4 w-4" /> {t("verifyIdentity.btnChooseImage")}
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </motion.div>
            )}

            {/* SCANNING */}
            {scanState === "scanning" && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-10"
              >
                {preview && (
                  <img
                    src={preview}
                    alt="ID preview"
                    className="mb-6 max-h-44 rounded-xl border border-border object-contain"
                  />
                )}
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-3 text-sm font-medium">{t("verifyIdentity.scanningTitle")}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("verifyIdentity.scanningDesc")}
                </p>
              </motion.div>
            )}

            {/* DONE — show parsed */}
            {scanState === "done" && parsed && (
              <motion.div
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {preview && (
                  <img
                    src={preview}
                    alt="ID preview"
                    className="mb-6 max-h-44 w-full rounded-xl border border-border object-contain"
                  />
                )}

                <div className="space-y-3 rounded-xl bg-muted/40 p-4">
                  <DataRow label={t("verifyIdentity.dataLabelId")} value={parsed.idNumber} />
                  <DataRow label={t("verifyIdentity.dataLabelNameTh")} value={parsed.fullNameTh} />
                  <DataRow label={t("verifyIdentity.dataLabelNameEn")} value={parsed.fullNameEn} />
                  <DataRow label={t("verifyIdentity.dataLabelExpiry")} value={parsed.expiry} />
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  ⚠️ {t("verifyIdentity.doneWarning")}
                </p>

                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={reset}
                    disabled={confirming}
                  >
                    <RefreshCw className="h-4 w-4" /> {t("verifyIdentity.btnScanAgain")}
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    onClick={handleConfirm}
                    disabled={confirming}
                  >
                    {confirming ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />{" "}
                        {t("verifyIdentity.btnVerifying")}
                      </>
                    ) : (
                      <>
                        <BadgeCheck className="h-4 w-4" /> {t("verifyIdentity.btnConfirm")}
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ERROR */}
            {scanState === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-10"
              >
                {preview && (
                  <img
                    src={preview}
                    alt="ID preview"
                    className="mb-6 max-h-44 rounded-xl border border-border object-contain opacity-60"
                  />
                )}
                <AlertTriangle className="h-8 w-8 text-amber-500" />
                <p className="mt-3 text-sm font-medium">
                  {t("verifyIdentity.errorTitle")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("verifyIdentity.errorDesc")}
                </p>
                <Button className="mt-6 gap-2" onClick={reset}>
                  <RefreshCw className="h-4 w-4" /> {t("verifyIdentity.btnTryAgain")}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Manual fallback link */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          {t("verifyIdentity.fallbackText")}{" "}
          <Link
            to="/account"
            className="text-primary underline underline-offset-2 hover:text-primary/80"
          >
            {t("verifyIdentity.fallbackLink")}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

function StepDot({
  n,
  label,
  active,
  done,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${done
          ? "bg-success text-success-foreground"
          : active
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
          }`}
      >
        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : n}
      </div>
      <span className={active || done ? "text-foreground" : ""}>{label}</span>
    </div>
  );
}

function DataRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${value ? "" : "text-muted-foreground/50"}`}>
        {value ?? "ไม่พบข้อมูล"}
      </span>
    </div>
  );
}
