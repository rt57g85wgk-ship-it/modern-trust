import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Search, MapPin, Calendar, Wallet, Home as HomeIcon, ShieldCheck, Sparkles, Zap, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listings } from "@/lib/mock-data";
import { PropertyCard, PropertyCardSkeleton } from "@/components/PropertyCard";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Modern Trust — Find your perfect place" },
      { name: "description", content: "Discover verified rentals in Bangkok. Smart search, transparent pricing, AI-powered recommendations." },
      { property: "og:title", content: "Modern Trust — Find your perfect place" },
      { property: "og:description", content: "Verified rentals in Bangkok with AI-powered search." },
    ],
  }),
});

function Landing() {
  const [q, setQ] = useState({ location: "", date: "", budget: "any", room: "any" });
  const [loading] = useState(false);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (q.location && !l.location.toLowerCase().includes(q.location.toLowerCase())) return false;
      if (q.room !== "any" && l.roomType !== q.room) return false;
      if (q.budget !== "any") {
        const [min, max] = q.budget.split("-").map(Number);
        if (l.price < min || (max && l.price > max)) return false;
      }
      return true;
    });
  }, [q]);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-brand-cyan/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pt-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" /> AI-powered rental search · Now in Bangkok
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              Find your <span className="text-brand-gradient">perfect place</span>
              <br className="hidden sm:block" /> with confidence.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Verified listings, transparent pricing, and a smart assistant that helps you book the right room — fast.
            </p>
          </motion.div>

          {/* SEARCH BAR */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mx-auto mt-10 max-w-5xl rounded-2xl border border-border bg-card p-2 shadow-card sm:p-3"
          >
            <div className="grid gap-2 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
              <Field icon={<MapPin className="h-4 w-4" />} label="Location">
                <input
                  value={q.location}
                  onChange={(e) => setQ({ ...q, location: e.target.value })}
                  placeholder="Ari, Asoke, Thonglor…"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </Field>
              <Field icon={<Calendar className="h-4 w-4" />} label="Move-in">
                <input
                  type="date"
                  value={q.date}
                  onChange={(e) => setQ({ ...q, date: e.target.value })}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </Field>
              <Field icon={<Wallet className="h-4 w-4" />} label="Budget">
                <select
                  value={q.budget}
                  onChange={(e) => setQ({ ...q, budget: e.target.value })}
                  className="w-full bg-transparent text-sm outline-none"
                >
                  <option value="any">Any</option>
                  <option value="0-15000">Under ฿15,000</option>
                  <option value="15000-20000">฿15,000 – ฿20,000</option>
                  <option value="20000-30000">฿20,000 – ฿30,000</option>
                  <option value="30000-99999">฿30,000+</option>
                </select>
              </Field>
              <Field icon={<HomeIcon className="h-4 w-4" />} label="Room type">
                <select
                  value={q.room}
                  onChange={(e) => setQ({ ...q, room: e.target.value })}
                  className="w-full bg-transparent text-sm outline-none"
                >
                  <option value="any">Any</option>
                  <option>Studio</option>
                  <option>1 Bedroom</option>
                  <option>2 Bedroom</option>
                </select>
              </Field>
              <Button size="lg" className="h-full gap-2 px-6">
                <Search className="h-4 w-4" /> <span className="hidden sm:inline">Find a Room</span>
              </Button>
            </div>
          </motion.div>

          {/* TRUST STRIP */}
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-6 text-center sm:grid-cols-4">
            {[
              ["12,400+", "Verified listings"],
              ["4.9★", "Average rating"],
              ["100%", "ID verified hosts"],
              ["24/7", "AI assistant"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="text-xl font-bold text-foreground sm:text-2xl">{n}</div>
                <div className="text-xs text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LISTINGS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="features">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Recommended for you</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {filtered.length} place{filtered.length === 1 ? "" : "s"} match your search
            </p>
          </div>
          <Link to="/" className="hidden text-sm font-medium text-primary hover:underline sm:inline">View all →</Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)
            : filtered.length === 0
            ? (
              <div className="col-span-full rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
                <Search className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 font-medium">No matches yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Try widening your filters or clearing the location.</p>
              </div>
            )
            : filtered.map((l, i) => <PropertyCard key={l.id} listing={l} index={i} />)}
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="border-t border-border bg-muted/30 py-20" id="pricing">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Built for trust. Designed for speed.</h2>
            <p className="mt-3 text-muted-foreground">A smarter way to rent — for renters and landlords alike.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Verified hosts", desc: "Every landlord is ID-checked. Every listing is reviewed before going live." },
              { icon: Sparkles, title: "AI recommendations", desc: "Trust AI learns your preferences and surfaces rooms that fit your lifestyle." },
              { icon: Zap, title: "Instant booking", desc: "Book in minutes, not days. Transparent pricing — no hidden fees." },
            ].map((f) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-10 text-white sm:p-16">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">List your property in 5 minutes.</h2>
              <p className="mt-3 text-white/80">Reach thousands of verified renters. Manage bookings, payments, and chats in one dashboard.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/register">
                  <Button size="lg" className="bg-white text-brand-navy hover:bg-white/90">
                    Become a host <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                    See dashboard
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["฿245K", "Avg. monthly revenue"],
                ["89%", "Occupancy rate"],
                ["4.9★", "Host rating"],
                ["2,341", "Active hosts"],
              ].map(([n, l]) => (
                <div key={l} className="rounded-xl bg-white/10 p-4 backdrop-blur">
                  <div className="text-2xl font-bold">{n}</div>
                  <div className="mt-1 text-xs text-white/70">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { name: "Praew T.", role: "Renter, Ari", text: "Found my apartment in under an hour. The AI assistant helped me filter exactly what I needed." },
            { name: "Khun Som", role: "Landlord, 6 units", text: "Modern Trust pays for itself. Verified renters and instant booking changed my business." },
            { name: "Mike L.", role: "Renter, Asoke", text: "Transparent pricing and ID-verified hosts gave me peace of mind moving from abroad." },
          ].map((t) => (
            <div key={t.name} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex gap-0.5 text-warning">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
              <p className="mt-3 text-sm text-foreground">"{t.text}"</p>
              <div className="mt-4 text-sm">
                <div className="font-semibold">{t.name}</div>
                <div className="text-muted-foreground">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-transparent bg-muted/40 px-3 py-2 transition-colors focus-within:border-primary focus-within:bg-background">
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        {children}
      </span>
    </label>
  );
}
