import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ShieldCheck, Bell, Settings, Heart, Calendar, Plus, TrendingUp, Home as HomeIcon,
  DollarSign, Eye, Sparkles, Edit, Trash2, Image as ImageIcon, Repeat, Check, Clock, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-context";
import { listings, bookings } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — Modern Trust" }, { name: "description", content: "Manage your rentals and bookings." }] }),
});

function Dashboard() {
  const { user, switchRole, favorites } = useApp();
  const nav = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined" && !user) {
      const t = setTimeout(() => nav({ to: "/login" }), 50);
      return () => clearTimeout(t);
    }
  }, [user, nav]);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-semibold">Authentication required</h1>
        <p className="mt-1 text-sm text-muted-foreground">Please sign in to access your dashboard.</p>
        <Link to="/login"><Button className="mt-6">Sign in</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-2xl font-bold capitalize sm:text-3xl flex items-center gap-2">
            {user.name} <ShieldCheck className="h-5 w-5 text-primary" />
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">{user.role} view</span>
          <Button variant="outline" size="sm" onClick={switchRole} className="gap-2">
            <Repeat className="h-4 w-4" /> Switch to {user.role === "renter" ? "Landlord" : "Renter"}
          </Button>
          <Button variant="ghost" size="icon"><Bell className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
        </div>
      </div>

      <motion.div key={user.role} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {user.role === "renter" ? <RenterView favorites={favorites} /> : <LandlordView />}
      </motion.div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, color = "primary" }: { icon: React.ComponentType<{className?:string}>; label: string; value: string; trend?: string; color?: "primary" | "success" | "cyan" }) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    cyan: "bg-brand-cyan/10 text-brand-cyan",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && <span className="text-xs font-medium text-success">{trend}</span>}
      </div>
      <p className="mt-4 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function RenterView({ favorites }: { favorites: string[] }) {
  const saved = listings.filter((l) => favorites.includes(l.id));
  const myBookings = bookings.map((b) => ({ ...b, listing: listings.find((l) => l.id === b.listingId)! }));

  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Heart} label="Saved listings" value={String(saved.length)} color="primary" />
        <StatCard icon={Calendar} label="Active bookings" value="2" trend="+1" color="success" />
        <StatCard icon={Eye} label="Recently viewed" value="14" color="cyan" />
        <StatCard icon={ShieldCheck} label="Trust score" value="98%" color="primary" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">My bookings</h2>
            <span className="text-xs text-muted-foreground">{myBookings.length} total</span>
          </div>
          <div className="mt-4 space-y-3">
            {myBookings.map((b) => (
              <Link key={b.id} to="/property/$id" params={{ id: b.listingId }}
                className="flex items-center gap-4 rounded-xl border border-border p-3 transition-colors hover:bg-muted/40">
                <img src={b.listing.image} alt="" className="h-16 w-20 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{b.listing.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.checkIn} → {b.checkOut} · ฿{b.total.toLocaleString()}
                  </p>
                </div>
                <StatusPill status={b.status as "confirmed" | "pending" | "cancelled"} />
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Profile</h2>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Verification" value={<span className="flex items-center gap-1 text-success"><Check className="h-3 w-3" /> Verified</span>} />
            <Row label="Member since" value="2026" />
            <Row label="Bookings" value="3" />
            <Row label="Reviews left" value="2" />
          </div>
          <Button variant="outline" size="sm" className="mt-4 w-full">Edit profile</Button>
        </section>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Saved listings</h2>
          <Link to="/" className="text-sm font-medium text-primary hover:underline">Browse more →</Link>
        </div>
        {saved.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-medium">No saved listings yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Tap the heart on any listing to save it here.</p>
            <Link to="/"><Button className="mt-4" size="sm">Discover places</Button></Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((l) => (
              <Link key={l.id} to="/property/$id" params={{ id: l.id }}
                className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-card">
                <img src={l.image} alt="" className="aspect-[4/3] w-full object-cover" />
                <div className="p-3">
                  <p className="truncate font-medium">{l.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">฿{l.price.toLocaleString()} / mo</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function LandlordView() {
  const [units, setUnits] = useState(listings.slice(0, 4));
  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Revenue this month" value="฿245,000" trend="+15.3%" color="success" />
        <StatCard icon={Calendar} label="Active bookings" value="128" trend="+8.2%" color="primary" />
        <StatCard icon={TrendingUp} label="Occupancy rate" value="89%" trend="+6.5%" color="cyan" />
        <StatCard icon={HomeIcon} label="Listings" value={String(units.length)} color="primary" />
      </div>

      <section className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-6">
          <div>
            <h2 className="font-semibold">My listings</h2>
            <p className="text-xs text-muted-foreground">Manage units, pricing, and availability.</p>
          </div>
          <Button className="gap-2"><Plus className="h-4 w-4" /> Add listing</Button>
        </div>
        <div className="divide-y divide-border">
          {units.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
              <img src={u.image} alt="" className="h-16 w-24 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{u.title}</p>
                  {u.badge && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{u.badge}</span>}
                </div>
                <p className="text-xs text-muted-foreground">{u.location} · {u.roomType} · ฿{u.price.toLocaleString()}/mo</p>
                <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-brand-cyan/10 px-2 py-0.5 text-[10px] font-medium text-brand-cyan">
                  <Sparkles className="h-3 w-3" /> AI suggests +฿1,500 based on demand
                </div>
              </div>
              <div className="flex items-center gap-3">
                <PromoteToggle />
                <Button variant="outline" size="icon" className="h-9 w-9"><ImageIcon className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" className="h-9 w-9"><Edit className="h-4 w-4" /></Button>
                <Button
                  variant="outline" size="icon"
                  className="h-9 w-9 text-destructive hover:bg-destructive/10"
                  onClick={() => setUnits((u2) => u2.filter((x) => x.id !== u.id))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">Booking requests</h2>
          <div className="mt-4 space-y-3">
            {bookings.map((b) => {
              const l = listings.find((x) => x.id === b.listingId)!;
              return (
                <div key={b.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">{l.title}</p>
                    <p className="text-xs text-muted-foreground">{b.checkIn} · ฿{b.total.toLocaleString()}</p>
                  </div>
                  <StatusPill status={b.status as "confirmed" | "pending" | "cancelled"} />
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">AI optimization tips</h2>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              "Add 3 more photos to The Line Ari to boost views by ~40%.",
              "Lower XT Ekkamai by ฿500 to match weekend demand peaks.",
              "Enable instant booking on 2 listings — average +18% occupancy.",
            ].map((t) => (
              <li key={t} className="flex gap-2 rounded-lg bg-muted/40 p-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {t}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function PromoteToggle() {
  const [on, setOn] = useState(false);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
        on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
      }`}
    >
      <Sparkles className="h-3 w-3" /> {on ? "Promoted" : "Promote"}
    </button>
  );
}

function StatusPill({ status }: { status: "confirmed" | "pending" | "cancelled" }) {
  const map = {
    confirmed: { c: "bg-success/10 text-success", i: Check, l: "Confirmed" },
    pending: { c: "bg-warning/15 text-warning", i: Clock, l: "Pending" },
    cancelled: { c: "bg-destructive/10 text-destructive", i: X, l: "Cancelled" },
  } as const;
  const { c, i: I, l } = map[status];
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${c}`}><I className="h-3 w-3" /> {l}</span>;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
