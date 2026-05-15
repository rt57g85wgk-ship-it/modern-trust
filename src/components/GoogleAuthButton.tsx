import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { Chrome } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-context";
import { toast } from "sonner";

type Role = "renter" | "landlord";

function GoogleAuthButtonOAuth({ role }: { role: Role }) {
  const { login } = useApp();
  const nav = useNavigate();
  const { t } = useTranslation();
  const [pending, setPending] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setPending(true);
      try {
        const r = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        if (!r.ok) throw new Error("userinfo");
        const u = (await r.json()) as { name?: string; email?: string };
        const email = u.email ?? "";
        const name = u.name?.trim() || (email ? email.split("@")[0] : "User");
        if (!email) throw new Error("noemail");
        login({ name, email, role });
        nav({ to: "/dashboard" });
      } catch {
        toast.error(t("auth.errors.googleFailed"));
      } finally {
        setPending(false);
      }
    },
    onError: () => {
      toast.error(t("auth.errors.googlePopup"));
    },
  });

  return (
    <Button
      type="button"
      size="lg"
      className="w-full gap-2"
      disabled={pending}
      onClick={() => googleLogin()}
    >
      <Chrome className="h-4 w-4" />
      {pending ? t("auth.signingIn") : t("auth.continueGoogle")}
    </Button>
  );
}

export function GoogleAuthButton({ role }: { role: Role }) {
  const { t } = useTranslation();
  const { login } = useApp();
  const nav = useNavigate();
  const [pending, setPending] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

  if (!clientId) {
    const handleSimulated = async () => {
      setPending(true);
      // simulate Google auth flow
      await new Promise((r) => setTimeout(r, 900));
      const demoEmail = role === "landlord" ? "host.demo@gmail.com" : "renter.demo@gmail.com";
      const demoName = role === "landlord" ? "Demo Host" : "Demo Renter";
      login({ name: demoName, email: demoEmail, role });
      toast.success(t("auth.welcomeBack", { name: demoName }));
      await new Promise((r) => setTimeout(r, 250));
      nav({ to: "/dashboard" });
    };

    return (
      <Button
        type="button"
        size="lg"
        className="w-full gap-2"
        disabled={pending}
        onClick={handleSimulated}
      >
        <Chrome className="h-4 w-4" />
        {pending ? t("auth.signingIn") : t("auth.continueGoogle")}
      </Button>
    );
  }

  return <GoogleAuthButtonOAuth role={role} />;
}
