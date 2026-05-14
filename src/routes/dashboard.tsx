import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ShieldCheck, Bell, Settings, Heart, Calendar, Plus, TrendingUp, Home as HomeIcon,
  DollarSign, Eye, EyeOff, Sparkles, Edit, Trash2, Repeat, Check, Clock, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useApp } from "@/lib/app-context";
import { listings, bookings } from "@/lib/mock-data";
import { PromoteModal, type PromotePackage } from "@/components/PromoteModal";
import { toast } from "sonner";

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

type Unit = {
  id: string;
  title: string;
  location: string;
  roomType: string;
  price: number;
  image: string;
  available: boolean;
  badge?: "Recommended";
};

const seedUnits: Unit[] = listings.slice(0, 4).map((l) => ({
  id: l.id,
  title: l.title,
  location: l.location,
  roomType: l.roomType,
  price: l.price,
  image: l.image,
  available: l.available,
  badge: l.badge === "Recommended" ? "Recommended" : undefined,
}));

function LandlordView() {
  const [units, setUnits] = useState<Unit[]>(seedUnits);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = (u: Unit) => {
    setUnits((arr) => {
      const exists = arr.some((x) => x.id === u.id);
      if (exists) return arr.map((x) => (x.id === u.id ? u : x));
      return [u, ...arr];
    });
    toast.success(exists(units, u.id) ? "Listing updated" : "Listing added");
    setEditing(null);
    setCreating(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setUnits((arr) => arr.filter((x) => x.id !== deleteId));
    toast.success("Listing deleted");
    setDeleteId(null);
  };

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
          <Button className="gap-2" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Add listing
          </Button>
        </div>
        <div className="divide-y divide-border">
          {units.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No listings yet. Click <span className="font-medium text-foreground">Add listing</span> to create your first.
            </div>
          )}
          {units.map((u) => (
            <div
              key={u.id}
              className={`flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap ${!u.available ? "opacity-60" : ""}`}
            >
              <img src={u.image} alt="" className="h-16 w-24 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{u.title}</p>
                  {u.badge === "Recommended" && u.available && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                      <Sparkles className="h-2.5 w-2.5" /> Recommended
                    </span>
                  )}
                  {!u.available && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      Not Available
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{u.location} · {u.roomType} · ฿{u.price.toLocaleString()}/mo</p>
                <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-brand-cyan/10 px-2 py-0.5 text-[10px] font-medium text-brand-cyan">
                  <Sparkles className="h-3 w-3" /> AI suggests +฿1,500 based on demand
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PromoteToggle
                  title={u.title}
                  monthlyRent={u.price}
                  promoted={u.badge === "Recommended"}
                  onPromote={() => setUnits((arr) => arr.map((x) => x.id === u.id ? { ...x, badge: "Recommended" } : x))}
                  onUnpromote={() => setUnits((arr) => arr.map((x) => x.id === u.id ? { ...x, badge: undefined } : x))}
                />
                <Button
                  variant="outline" size="sm"
                  onClick={() => setUnits((arr) => arr.map((x) => x.id === u.id ? { ...x, available: !x.available } : x))}
                  className="gap-1.5"
                >
                  {u.available ? <><EyeOff className="h-3.5 w-3.5" /> Unlist</> : <><Eye className="h-3.5 w-3.5" /> Relist</>}
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setEditing(u)} aria-label="Edit">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline" size="icon"
                  className="h-9 w-9 text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteId(u.id)}
                  aria-label="Delete"
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

      <ListingFormDialog
        open={creating || !!editing}
        initial={editing}
        onClose={() => { setCreating(false); setEditing(null); }}
        onSave={handleSave}
      />
      <DeleteConfirm
        open={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={units.find((u) => u.id === deleteId)?.title}
      />
    </div>
  );
}

function exists(arr: Unit[], id: string) {
  return arr.some((x) => x.id === id);
}

function ListingFormDialog({
  open, initial, onClose, onSave,
}: { open: boolean; initial: Unit | null; onClose: () => void; onSave: (u: Unit) => void }) {
  const isEdit = !!initial;
  const [form, setForm] = useState<Unit>(() => initial ?? blankUnit());

  useEffect(() => {
    setForm(initial ?? blankUnit());
  }, [initial, open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit listing" : "Add new listing"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update your unit details and availability." : "Create a new rental listing for your portfolio."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Title">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. The Line Ari — Skyline 1BR" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Location">
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Bangkok" />
            </Field>
            <Field label="Room type">
              <Input value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })} placeholder="1 Bedroom" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Monthly rent (฿)">
              <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </Field>
            <Field label="Image URL">
              <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
            </Field>
          </div>
          <label className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Available for booking</p>
              <p className="text-xs text-muted-foreground">Renters can book or contact you.</p>
            </div>
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => setForm({ ...form, available: e.target.checked })}
              className="h-4 w-4 accent-primary"
            />
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => onSave({ ...form, id: form.id || `u-${Date.now()}` })}
            disabled={!form.title.trim() || form.price <= 0}
          >
            {isEdit ? "Save changes" : "Create listing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function blankUnit(): Unit {
  return {
    id: "",
    title: "",
    location: "",
    roomType: "Studio",
    price: 15000,
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
    available: true,
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function DeleteConfirm({ open, onCancel, onConfirm, title }: { open: boolean; onCancel: () => void; onConfirm: () => void; title?: string }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete this listing?</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{title}</span> will be permanently removed from your portfolio. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} className="gap-2">
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PromoteToggle({ title, monthlyRent }: { title: string; monthlyRent: number }) {
  const [on, setOn] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => (on ? setOn(false) : setOpen(true))}
        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
          on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
        }`}
      >
        <Sparkles className="h-3 w-3" /> {on ? "Promoted" : "Promote"}
      </button>
      <PromoteModal
        open={open}
        onClose={() => setOpen(false)}
        monthlyRent={monthlyRent}
        listingTitle={title}
        onConfirm={(pkg: PromotePackage, price: number) => {
          setOn(true);
          setOpen(false);
          toast.success(`Promotion activated · ${pkg.days} days · ฿${Math.round(price).toLocaleString()}`);
        }}
      />
    </>
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
