import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, Lock, User, Home as HomeIcon, ShieldCheck, Chrome, Apple, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-context";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — Modern Trust" }, { name: "description", content: "Sign in to Modern Trust." }] }),
});

function LoginPage() {
  const { login } = useApp();
  const nav = useNavigate();
  const [role, setRole] = useState<"renter" | "landlord">("renter");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email.");
    if (pass.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    setTimeout(() => {
      login({ name: email.split("@")[0].replace(/\W/g, " "), email, role });
      nav({ to: "/dashboard" });
    }, 700);
  };

  return (
    <div className="relative grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="relative hidden bg-brand-gradient lg:block">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Logo variant="light" />
          <div>
            <h2 className="text-3xl font-bold leading-tight">Welcome back to a smarter way to rent.</h2>
            <p className="mt-3 max-w-md text-white/80">Verified hosts, transparent prices, and an AI assistant that actually helps.</p>
            <div className="mt-8 grid grid-cols-2 gap-3 max-w-sm">
              {[["12,400+", "listings"], ["100%", "verified hosts"], ["4.9★", "avg rating"], ["24/7", "AI support"]].map(([n, l]) => (
                <div key={l} className="rounded-xl bg-white/10 p-4 backdrop-blur">
                  <div className="text-2xl font-bold">{n}</div>
                  <div className="text-xs text-white/70">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/60">© Modern Trust · Smart Rental Platform</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back. Please enter your details.</p>

          <RoleToggle role={role} setRole={setRole} />

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Input icon={Mail} type="email" placeholder="you@example.com" value={email} onChange={setEmail} />
            <Input icon={Lock} type="password" placeholder="Password" value={pass} onChange={setPass} />
            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" /> {error}
              </motion.p>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <Divider />

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="gap-2"><Chrome className="h-4 w-4" /> Google</Button>
            <Button variant="outline" className="gap-2"><Apple className="h-4 w-4" /> Apple</Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account? <Link to="/register" className="font-medium text-primary hover:underline">Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export function RoleToggle({ role, setRole }: { role: "renter" | "landlord"; setRole: (r: "renter" | "landlord") => void }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/40 p-1">
      {([["renter", "I'm renting", User], ["landlord", "I'm hosting", HomeIcon]] as const).map(([k, l, Icon]) => (
        <button
          key={k}
          type="button"
          onClick={() => setRole(k)}
          className={`relative flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            role === k ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {role === k && <motion.div layoutId="roleBg" className="absolute inset-0 rounded-lg bg-card shadow-soft" />}
          <span className="relative flex items-center gap-2"><Icon className="h-4 w-4" /> {l}</span>
        </button>
      ))}
    </div>
  );
}

export function Input({ icon: Icon, ...p }: { icon: React.ComponentType<{ className?: string }>; type?: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-input bg-background px-3 py-2.5 transition-colors focus-within:border-primary">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <input
        type={p.type || "text"}
        placeholder={p.placeholder}
        value={p.value}
        onChange={(e) => p.onChange(e.target.value)}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

export function Divider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
      <div className="h-px flex-1 bg-border" /> OR CONTINUE WITH <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export function _refs() { return [ShieldCheck, Check]; } // keep imports tree-shakable
