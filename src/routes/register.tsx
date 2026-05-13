import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, Lock, User as UserIcon, Chrome, Apple, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-context";
import { Logo } from "@/components/Logo";
import { RoleToggle, Input, Divider } from "./login";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({ meta: [{ title: "Create account — Modern Trust" }, { name: "description", content: "Create your Modern Trust account." }] }),
});

function RegisterPage() {
  const { login } = useApp();
  const nav = useNavigate();
  const [role, setRole] = useState<"renter" | "landlord">("renter");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email.");
    if (pass.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    setTimeout(() => {
      login({ name, email, role });
      nav({ to: "/dashboard" });
    }, 700);
  };

  return (
    <div className="relative grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-12 sm:px-8 lg:order-1">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Start in seconds. No credit card required.</p>

          <RoleToggle role={role} setRole={setRole} />

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Input icon={UserIcon} placeholder="Full name" value={name} onChange={setName} />
            <Input icon={Mail} type="email" placeholder="you@example.com" value={email} onChange={setEmail} />
            <Input icon={Lock} type="password" placeholder="Password (min 6 chars)" value={pass} onChange={setPass} />
            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" /> {error}
              </motion.p>
            )}
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {["Free forever for renters", "Verified host badge included", "Cancel anytime"].map((t) => (
                <li key={t} className="flex items-center gap-1.5"><Check className="h-3 w-3 text-success" /> {t}</li>
              ))}
            </ul>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <Divider />

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="gap-2"><Chrome className="h-4 w-4" /> Google</Button>
            <Button variant="outline" className="gap-2"><Apple className="h-4 w-4" /> Apple</Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>

      <div className="relative hidden bg-brand-gradient lg:block">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Logo variant="light" />
          <div>
            <h2 className="text-3xl font-bold leading-tight">Join 12,400+ verified renters and hosts.</h2>
            <p className="mt-3 max-w-md text-white/80">Whether you're searching or listing, Modern Trust gets you to "yes" faster.</p>
          </div>
          <p className="text-xs text-white/60">© Modern Trust · Smart Rental Platform</p>
        </div>
      </div>
    </div>
  );
}
