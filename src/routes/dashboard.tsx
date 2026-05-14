import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ShieldCheck, Bell, Settings, Heart, Calendar, Plus, TrendingUp, Home as HomeIcon,
  DollarSign, Eye, EyeOff, Sparkles, Edit, Trash2, Repeat, Check, Clock, X, Compass, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useApp } from "@/lib/app-context";
import { listings, bookings } from "@/lib/mock-data";
import { PromoteModal, type PromotePackage } from "@/components/PromoteModal";
import { AmenitiesPicker } from "@/components/AmenitiesPicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROPERTY_TYPE_OPTIONS, SIZE_UNITS, formatRoomSize, type SizeUnit } from "@/lib/property-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — Modern Trust" }, { name: "description", content: "Manage your rentals and bookings." }] }),
});

function Dashboard() {
  const { t } = useTranslation();
  const { user, switchRole, favorites } = useApp();
  const nav = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined" && !user) {
      const timer = setTimeout(() => nav({ to: "/login" }), 50);
      return () => clearTimeout(timer);
    }
  }, [user, nav]);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-semibold">{t("dashboard.authTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.authDesc")}</p>
        <Link to="/login"><Button className="mt-6">{t("dashboard.signIn")}</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{t("dashboard.welcome")}</p>
          <h1 className="text-2xl font-bold capitalize sm:text-3xl flex items-center gap-2">
            {user.name} <ShieldCheck className="h-5 w-5 text-primary" />
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-2">
              <Compass className="h-4 w-4" /> {t("dashboard.discover")}
            </Button>
          </Link>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">
            {t("dashboard.roleView", { role: t(user.role === "renter" ? "dashboard.renter" : "dashboard.landlord") })}
          </span>
          <Button variant="outline" size="sm" onClick={switchRole} className="gap-2">
            <Repeat className="h-4 w-4" />{" "}
            {t("dashboard.switchTo", { role: t(user.role === "renter" ? "dashboard.landlord" : "dashboard.renter") })}
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
  const { t } = useTranslation();
  const saved = listings.filter((l) => favorites.includes(l.id));
  const myBookings = bookings.map((b) => ({ ...b, listing: listings.find((l) => l.id === b.listingId)! }));

  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Heart} label={t("dashboard.savedListings")} value={String(saved.length)} color="primary" />
        <StatCard icon={Calendar} label={t("dashboard.activeBookings")} value="2" trend="+1" color="success" />
        <StatCard icon={Eye} label={t("dashboard.recentlyViewed")} value="14" color="cyan" />
        <StatCard icon={ShieldCheck} label={t("dashboard.trustScore")} value="98%" color="primary" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{t("dashboard.myBookings")}</h2>
            <span className="text-xs text-muted-foreground">{t("dashboard.bookingsTotal", { count: myBookings.length })}</span>
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
          <h2 className="font-semibold">{t("dashboard.profile")}</h2>
          <div className="mt-4 space-y-3 text-sm">
            <Row label={t("dashboard.verification")} value={<span className="flex items-center gap-1 text-success"><Check className="h-3 w-3" /> {t("dashboard.verified")}</span>} />
            <Row label={t("dashboard.memberSince")} value="2026" />
            <Row label={t("dashboard.bookings")} value="3" />
            <Row label={t("dashboard.reviewsLeft")} value="2" />
          </div>
          <Button variant="outline" size="sm" className="mt-4 w-full">{t("dashboard.editProfile")}</Button>
        </section>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("dashboard.savedSectionTitle")}</h2>
          <Link to="/" className="text-sm font-medium text-primary hover:underline">{t("dashboard.browseMore")}</Link>
        </div>
        {saved.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-medium">{t("dashboard.noSavedTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.noSavedHint")}</p>
            <Link to="/"><Button className="mt-4" size="sm">{t("dashboard.discoverPlaces")}</Button></Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((l) => (
              <Link key={l.id} to="/property/$id" params={{ id: l.id }}
                className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-card">
                <img src={l.image} alt="" className="aspect-[4/3] w-full object-cover" />
                <div className="p-3">
                  <p className="truncate font-medium">{l.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">฿{l.price.toLocaleString()} {t("common.perMonth")}</p>
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
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  sizeValue: number;
  sizeUnit: SizeUnit;
  price: number;
  image: string;
  images: string[];
  description: string;
  amenities: string[];
  available: boolean;
  promoted: boolean;
};

const defaultThumb = "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80";

function inferPropertyType(roomType: string, title: string): string {
  const t = title.toLowerCase();
  if (roomType === "Studio") return "Studio";
  if (t.includes("townhouse")) return "Townhouse";
  if (t.includes("house") && !t.includes("townhouse")) return "House";
  return "Condo";
}

const seedUnits: Unit[] = listings.slice(0, 4).map((l) => {
  const imgs = [l.image, ...l.gallery].filter((url, i, arr) => arr.indexOf(url) === i);
  return {
    id: l.id,
    title: l.title,
    location: l.location,
    propertyType: inferPropertyType(l.roomType, l.title),
    bedrooms: l.beds,
    bathrooms: l.baths,
    sizeValue: l.sqm,
    sizeUnit: "sqm" as SizeUnit,
    price: l.price,
    image: l.image,
    images: imgs.length ? imgs : [l.image],
    description: l.description,
    amenities: [...l.amenities],
    available: l.available,
    promoted: !!l.promoted,
  };
});

function LandlordView() {
  const { t } = useTranslation();
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
    toast.success(exists(units, u.id) ? t("dashboard.toastUpdated") : t("dashboard.toastAdded"));
    setEditing(null);
    setCreating(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setUnits((arr) => arr.filter((x) => x.id !== deleteId));
    toast.success(t("dashboard.toastDeleted"));
    setDeleteId(null);
  };

  const aiTips = [t("dashboard.aiTip1"), t("dashboard.aiTip2"), t("dashboard.aiTip3")];

  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={DollarSign} label={t("dashboard.revenueMonth")} value="฿245,000" trend="+15.3%" color="success" />
        <StatCard icon={Calendar} label={t("dashboard.activeBookings")} value="128" trend="+8.2%" color="primary" />
        <StatCard icon={TrendingUp} label={t("dashboard.occupancy")} value="89%" trend="+6.5%" color="cyan" />
        <StatCard icon={HomeIcon} label={t("dashboard.listingsCount")} value={String(units.length)} color="primary" />
      </div>

      <section className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-6">
          <div>
            <h2 className="font-semibold">{t("dashboard.myListings")}</h2>
            <p className="text-xs text-muted-foreground">{t("dashboard.myListingsHint")}</p>
          </div>
          <Button className="gap-2" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> {t("dashboard.addListing")}
          </Button>
        </div>
        <div className="divide-y divide-border">
          {units.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              {t("dashboard.noListingsYet")}
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
                  {!u.available && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {t("dashboard.notAvailable")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {u.location} · {u.propertyType} · {u.bedrooms} {t(u.bedrooms === 1 ? "common.bed" : "common.beds")} · {formatRoomSize(u.sizeValue, u.sizeUnit)} · ฿{u.price.toLocaleString()}{t("common.perMonth")}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-brand-cyan/10 px-2 py-0.5 text-[10px] font-medium text-brand-cyan">
                  <Sparkles className="h-3 w-3" /> {t("dashboard.aiSuggest")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PromoteToggle
                  title={u.title}
                  monthlyRent={u.price}
                  promoted={u.promoted}
                  onPromote={() => setUnits((arr) => arr.map((x) => (x.id === u.id ? { ...x, promoted: true } : x)))}
                  onUnpromote={() => setUnits((arr) => arr.map((x) => (x.id === u.id ? { ...x, promoted: false } : x)))}
                />
                <Button
                  variant="outline" size="sm"
                  onClick={() => setUnits((arr) => arr.map((x) => x.id === u.id ? { ...x, available: !x.available } : x))}
                  className="gap-1.5"
                >
                  {u.available ? <><EyeOff className="h-3.5 w-3.5" /> {t("dashboard.unlist")}</> : <><Eye className="h-3.5 w-3.5" /> {t("dashboard.relist")}</>}
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setEditing(u)} aria-label={t("common.edit")}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline" size="icon"
                  className="h-9 w-9 text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteId(u.id)}
                  aria-label={t("common.delete")}
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
          <h2 className="font-semibold">{t("dashboard.bookingRequests")}</h2>
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
            <h2 className="font-semibold">{t("dashboard.aiTips")}</h2>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            {aiTips.map((tip) => (
              <li key={tip} className="flex gap-2 rounded-lg bg-muted/40 p-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {tip}
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
  const { t } = useTranslation();
  const isEdit = !!initial;
  const [form, setForm] = useState<Unit>(() => initial ?? blankUnit());
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(initial ?? blankUnit());
  }, [initial, open]);

  const addImageUrls = (files: FileList | File[] | null) => {
    if (!files || !files.length) return;
    const urls = Array.from(files as File[]).map((f) => URL.createObjectURL(f));
    setForm((prev) => {
      const images = [...prev.images, ...urls];
      return { ...prev, images, image: images[0] ?? prev.image };
    });
  };

  const removeImageAt = (idx: number) => {
    setForm((prev) => {
      const target = prev.images[idx];
      if (target?.startsWith("blob:")) URL.revokeObjectURL(target);
      const next = prev.images.filter((_, i) => i !== idx);
      const images = next.length ? next : [defaultThumb];
      return { ...prev, images, image: images[0] };
    });
  };

  const persist = () => {
    const images = form.images.length ? form.images : [defaultThumb];
    onSave({ ...form, images, image: images[0], id: form.id || `u-${Date.now()}` });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("dashboard.form.editTitle") : t("dashboard.form.addTitle")}</DialogTitle>
          <DialogDescription>
            {isEdit ? t("dashboard.form.editDesc") : t("dashboard.form.addDesc")}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          <Field label={t("dashboard.form.title")}>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t("dashboard.form.titlePh")} />
          </Field>
          <Field label={t("dashboard.form.description")}>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t("dashboard.form.descPh")}
              className="min-h-[140px] resize-y text-sm leading-relaxed"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("dashboard.form.location")}>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder={t("dashboard.form.locationPh")} className="h-10" />
            </Field>
            <div className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("dashboard.form.propertyType")}</span>
              <Select value={form.propertyType} onValueChange={(propertyType) => setForm({ ...form, propertyType })}>
                <SelectTrigger className="h-10 w-full rounded-md border-input bg-background shadow-sm">
                  <SelectValue placeholder={t("dashboard.form.propertyTypePh")} />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("dashboard.form.bedrooms")}>
              <Input
                type="number"
                min={0}
                max={30}
                step={1}
                inputMode="numeric"
                className="h-10"
                value={form.bedrooms}
                onChange={(e) => {
                  const n = Math.round(Number(e.target.value));
                  setForm({ ...form, bedrooms: Number.isNaN(n) ? 0 : Math.min(30, Math.max(0, n)) });
                }}
              />
            </Field>
            <Field label={t("dashboard.form.bathrooms")}>
              <Input
                type="number"
                min={0}
                max={20}
                step={0.5}
                inputMode="decimal"
                className="h-10"
                value={form.bathrooms}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  const bathrooms = Number.isNaN(raw) ? 0 : Math.round(raw * 2) / 2;
                  setForm({ ...form, bathrooms: Math.min(20, Math.max(0, bathrooms)) });
                }}
              />
            </Field>
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("dashboard.form.roomSize")}</span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px]">
              <Input
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                className="h-10"
                placeholder={t("dashboard.form.roomSizePh")}
                value={form.sizeValue === 0 ? "" : form.sizeValue}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  setForm({ ...form, sizeValue: Number.isNaN(raw) ? 0 : Math.max(0, raw) });
                }}
              />
              <Select
                value={form.sizeUnit}
                onValueChange={(sizeUnit) => setForm({ ...form, sizeUnit: sizeUnit as SizeUnit })}
              >
                <SelectTrigger className="h-10 w-full rounded-md border-input bg-background shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIZE_UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {t("dashboard.form.roomSizeHint")}{" "}
              <span className="font-medium text-foreground">{t("dashboard.form.roomSizeEx1")}</span>{" "}
              {t("dashboard.form.roomSizeOr")}{" "}
              <span className="font-medium text-foreground">{t("dashboard.form.roomSizeEx2")}</span>.
            </p>
          </div>

          <Field label={t("dashboard.form.monthlyRent")}>
            <Input type="number" min={0} className="h-10" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </Field>

          <AmenitiesPicker value={form.amenities} onChange={(amenities) => setForm({ ...form, amenities })} />

          <div>
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("dashboard.form.photos")}</span>
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileRef.current?.click();
                }
              }}
              onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                addImageUrls(e.dataTransfer.files);
              }}
              onClick={() => fileRef.current?.click()}
              className={cn(
                "cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors",
                dragOver ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/50",
              )}
            >
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-foreground">{t("dashboard.form.dropPhotos")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("dashboard.form.mockUpload")}</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  addImageUrls(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {form.images.map((src, idx) => (
                <div key={`${src}-${idx}`} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImageAt(idx);
                    }}
                    className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-background/95 text-foreground shadow-md ring-1 ring-border/60 transition-colors hover:bg-destructive hover:text-destructive-foreground"
                    aria-label={t("dashboard.form.removeImage")}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <label className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">{t("dashboard.form.availableTitle")}</p>
              <p className="text-xs text-muted-foreground">{t("dashboard.form.availableHint")}</p>
            </div>
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => setForm({ ...form, available: e.target.checked })}
              className="h-4 w-4 accent-primary"
            />
          </label>
        </div>
        <DialogFooter className="gap-2 border-t border-border pt-4 sm:justify-end">
          <Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
          <Button onClick={persist} disabled={!form.title.trim() || form.price <= 0 || form.sizeValue <= 0}>
            {isEdit ? t("dashboard.form.saveChanges") : t("dashboard.form.createListing")}
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
    propertyType: "Condo",
    bedrooms: 1,
    bathrooms: 1,
    sizeValue: 32,
    sizeUnit: "sqm",
    price: 15000,
    image: defaultThumb,
    images: [defaultThumb],
    description: "",
    amenities: [],
    available: true,
    promoted: false,
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
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("dashboard.deleteTitle")}</DialogTitle>
          <DialogDescription>
            {t("dashboard.deleteDesc", { title: title ?? "" })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>{t("common.cancel")}</Button>
          <Button variant="destructive" onClick={onConfirm} className="gap-2">
            <Trash2 className="h-4 w-4" /> {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PromoteToggle({
  title, monthlyRent, promoted, onPromote, onUnpromote,
}: {
  title: string; monthlyRent: number; promoted: boolean;
  onPromote: () => void; onUnpromote: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => (promoted ? onUnpromote() : setOpen(true))}
        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
          promoted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
        }`}
      >
        <Sparkles className="h-3 w-3" /> {promoted ? t("dashboard.promoted") : t("dashboard.promote")}
      </button>
      <PromoteModal
        open={open}
        onClose={() => setOpen(false)}
        monthlyRent={monthlyRent}
        listingTitle={title}
        onConfirm={(pkg: PromotePackage, price: number) => {
          onPromote();
          setOpen(false);
          toast.success(
            t("dashboard.promoteSuccess", {
              days: pkg.days,
              price: Math.round(price).toLocaleString(),
            }),
          );
        }}
      />
    </>
  );
}

function StatusPill({ status }: { status: "confirmed" | "pending" | "cancelled" }) {
  const { t } = useTranslation();
  const map = {
    confirmed: { c: "bg-success/10 text-success", i: Check, l: t("dashboard.statusConfirmed") },
    pending: { c: "bg-warning/15 text-warning", i: Clock, l: t("dashboard.statusPending") },
    cancelled: { c: "bg-destructive/10 text-destructive", i: X, l: t("dashboard.statusCancelled") },
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
