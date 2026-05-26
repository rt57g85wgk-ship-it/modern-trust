import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  FileText,
  Heart,
  Home as HomeIcon,
  MapPin,
  Maximize,
  MessageCircle,
  PawPrint,
  ShieldCheck,
  Star,
  WalletCards,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AMENITY_I18N_KEY,
  BUILDING_AMENITY_OPTIONS,
  IN_UNIT_AMENITY_OPTIONS,
} from "@/lib/amenities";
import { useApp } from "@/lib/app-context";
import { slugify } from "@/lib/profiles";
import { fetchSupabaseListingById } from "@/lib/supabase-listings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/property/$id")({
  loader: async ({ params }) => {
    const dbListing = await fetchSupabaseListingById(params.id);
    if (!dbListing) throw notFound();
    return { listing: dbListing };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.listing.title} — Modern Trust` },
      { name: "description", content: loaderData?.listing.description },
      { property: "og:title", content: loaderData?.listing.title },
      { property: "og:description", content: loaderData?.listing.description },
      { property: "og:image", content: loaderData?.listing.image },
    ],
  }),
  component: PropertyPage,
});

function PropertyPage() {
  const { listing } = Route.useLoaderData();
  const { favorites, toggleFavorite } = useApp();
  const { t } = useTranslation();
  const fav = favorites.includes(listing.id);
  const [active, setActive] = useState(0);
  const [date, setDate] = useState("");
  const [contactOpen, setContactOpen] = useState(false);

  const sqLabel = `${listing.sqm} ${t("property.sqm")}`;
  const propertyType = listing.propertyType ?? "Condo";
  const petFriendly = listing.petFriendly ?? listing.amenities.includes("Pet Friendly");
  const minimumLease = listing.minimumLease ?? t("property.minimumLeaseFallback");
  const depositMonths = listing.depositMonths ?? 2;
  
  // Dynamically format utility rates from database columns if present, otherwise use string fallback
  let utilityRates = listing.utilityRates ?? t("property.utilityRatesFallback");
  if (listing.electric_rate_type || listing.water_rate_type) {
    let waterPart = "";
    if (listing.water_rate_type === "GOVERNMENT") {
      waterPart = t("property.waterGovRate");
    } else if (listing.water_rate_type === "FIXED") {
      waterPart = t("property.waterFixedRate", { rate: listing.water_rate });
    }

    let electricPart = "";
    if (listing.electric_rate_type === "GOVERNMENT") {
      electricPart = t("property.electricGovRate");
    } else if (listing.electric_rate_type === "FIXED") {
      electricPart = t("property.electricFixedRate", { rate: listing.electric_rate });
    }

    if (waterPart && electricPart) {
      utilityRates = `${waterPart} · ${electricPart}`;
    } else if (waterPart) {
      utilityRates = waterPart;
    } else if (electricPart) {
      utilityRates = electricPart;
    }
  }

  const lineUrl = listing.landlord.lineUrl ?? "https://line.me/R/ti/p/@moderntrust";

  const openLine = () => {
    if (typeof window === "undefined") return;
    window.open(lineUrl, "_blank", "noopener,noreferrer");
  };

  const amenityLabel = (amenity: string) => {
    const slug = AMENITY_I18N_KEY[amenity as keyof typeof AMENITY_I18N_KEY];
    return slug ? t(`amenities.values.${slug}`) : amenity;
  };

  const inUnitAmenities = listing.amenities.filter((amenity: string) =>
    (IN_UNIT_AMENITY_OPTIONS as readonly string[]).includes(amenity),
  );
  const buildingAmenities = listing.amenities.filter((amenity: string) =>
    (BUILDING_AMENITY_OPTIONS as readonly string[]).includes(amenity),
  );
  const otherAmenities = listing.amenities.filter(
    (amenity: string) =>
      amenity !== "Pet Friendly" &&
      !(IN_UNIT_AMENITY_OPTIONS as readonly string[]).includes(amenity) &&
      !(BUILDING_AMENITY_OPTIONS as readonly string[]).includes(amenity),
  );
  const landlordId = listing.landlord.id || slugify(listing.landlord.name) || "landlord";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("property.back")}
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">{listing.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {listing.rating} ·{" "}
              {listing.reviews} {t("common.reviews")}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {listing.location}
            </span>
            {listing.available ? (
              <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-success">
                <Check className="h-3 w-3" /> {t("property.available")}
              </span>
            ) : (
              <span className="rounded-full bg-muted px-2 py-0.5">{t("property.unavailable")}</span>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={() => toggleFavorite(listing.id)} className="gap-2">
          <Heart className={`h-4 w-4 ${fav ? "fill-destructive text-destructive" : ""}`} />
          {fav ? t("property.saved") : t("property.save")}
        </Button>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-4">
        <div className="relative col-span-2 row-span-2 overflow-hidden rounded-2xl bg-muted">
          <img
            src={listing.gallery[active]}
            alt=""
            className="h-full max-h-[480px] w-full object-cover"
          />
        </div>
        {listing.gallery.slice(0, 4).map((g: string, i: number) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`relative overflow-hidden rounded-2xl bg-muted ${active === i ? "ring-2 ring-primary" : ""}`}
          >
            <img
              src={g}
              alt=""
              className="h-full max-h-[235px] min-h-[120px] w-full object-cover"
            />
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <Link
            to="/profile/$id"
            params={{ id: landlordId }}
            className="flex items-center gap-3 border-b border-border pb-6 transition-colors hover:opacity-90"
          >
            <img
              src={listing.landlord.avatar}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-transparent transition-all group-hover:ring-primary/30"
              alt=""
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 font-semibold">
                {t("property.hostedBy")} {listing.landlord.name}
                {listing.landlord.verified && <ShieldCheck className="h-4 w-4 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("property.responds")} · View profile →
              </p>
            </div>
          </Link>

          <div className="grid gap-4 py-6 sm:grid-cols-3">
            {[
              { icon: Building2, label: propertyType, caption: t("property.propertyType") },
              { icon: HomeIcon, label: listing.roomType, caption: t("property.roomType") },
              { icon: Maximize, label: sqLabel, caption: t("property.roomSize") },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                <s.icon className="h-5 w-5 text-primary" />
                <p className="mt-2 text-sm font-medium">{s.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.caption}</p>
              </div>
            ))}
          </div>

          <section className="border-t border-border py-6">
            <h2 className="text-lg font-semibold">{t("property.listingDetails")}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: Check,
                  label: listing.available
                    ? t("property.statusAvailable")
                    : t("property.statusOccupied"),
                  caption: t("property.roomStatus"),
                },
                {
                  icon: PawPrint,
                  label: petFriendly ? t("property.petFriendlyYes") : t("property.petFriendlyNo"),
                  caption: t("property.petFriendly"),
                },
                { icon: FileText, label: minimumLease, caption: t("property.minimumLease") },
                {
                  icon: WalletCards,
                  label: t("property.depositMonths", { count: depositMonths }),
                  caption: t("property.deposit"),
                },
                { icon: Zap, label: utilityRates, caption: t("property.utilityRates") },
              ].map((item) => (
                <div key={item.caption} className="rounded-xl border border-border bg-card p-4">
                  <item.icon className="h-4 w-4 text-primary" />
                  <p className="mt-2 text-sm font-medium">{item.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.caption}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border-t border-border py-6">
            <h2 className="text-lg font-semibold">{t("property.about")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {listing.description}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {t("property.aiDescBadge")}
            </div>
          </section>

          <section className="border-t border-border py-6">
            <h2 className="text-lg font-semibold">{t("property.amenities")}</h2>
            {listing.amenities.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">{t("property.noAmenities")}</p>
            ) : (
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <AmenityGroup
                  title={t("property.inUnitAmenities")}
                  amenities={inUnitAmenities}
                  labelFor={amenityLabel}
                />
                <AmenityGroup
                  title={t("property.buildingAmenities")}
                  amenities={buildingAmenities}
                  labelFor={amenityLabel}
                />
                {otherAmenities.length > 0 && (
                  <AmenityGroup
                    title={t("property.otherAmenities")}
                    amenities={otherAmenities}
                    labelFor={amenityLabel}
                  />
                )}
              </div>
            )}
          </section>

          <section className="border-t border-border py-6">
            <h2 className="text-lg font-semibold">{t("property.location")}</h2>
            <div className="mt-4 flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 bg-grid">
              <div className="text-center">
                <MapPin className="mx-auto h-8 w-8 text-primary" />
                <p className="mt-2 text-sm font-medium">{listing.location}</p>
                <p className="text-xs text-muted-foreground">{t("property.mapPreview")}</p>
              </div>
            </div>
          </section>

          <section className="border-t border-border py-6">
            <h2 className="text-lg font-semibold">{t("property.reviews")}</h2>
            <div className="mt-4 space-y-4">
              {[
                { n: t("property.review1Author"), r: 5, text: t("property.review1Body") },
                { n: t("property.review2Author"), r: 5, text: t("property.review2Body") },
              ].map((r) => (
                <div key={r.n} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{r.n}</p>
                    <div className="flex gap-0.5 text-warning">
                      {[...Array(r.r)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-bold">฿{listing.price.toLocaleString()}</span>
                <span className="ml-1 text-sm text-muted-foreground">{t("property.perMonth")}</span>
              </div>
              <span className="flex items-center gap-1 text-sm">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {listing.rating}
              </span>
            </div>
            <Button
              className="mt-5 w-full gap-2 rounded-xl py-6 text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
              size="lg"
              disabled={!listing.available}
              onClick={() => setContactOpen(true)}
              style={{ backgroundColor: "#06C755", color: "white" }}
            >
              <MessageCircle className="h-6 w-6" />
              Contact Landlord
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {t("property.bookingNote")}
            </p>
          </div>
        </aside>
      </div>

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("property.contactTitle")}</DialogTitle>
            <DialogDescription>{t("property.contactDesc")}</DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3">
            <img
              src={listing.landlord.avatar}
              alt=""
              className="h-12 w-12 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-semibold">{listing.landlord.name}</span>
                {listing.landlord.verified && <ShieldCheck className="h-4 w-4 text-primary" />}
              </div>
              <div className="text-xs text-muted-foreground">
                {propertyType} · {listing.roomType} · {sqLabel}
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground mb-1">เบอร์โทรศัพท์</p>
              <p className="font-medium">{listing.landlord.phone || "081-234-5678"}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground mb-1">Line ID</p>
              <p className="font-medium">{listing.landlord.lineId || "@moderntrust"}</p>
            </div>
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-xl border border-border">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(lineUrl)}`}
                  alt="Line QR Code"
                  className="w-36 h-36 object-contain"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2 mt-4">
            <Button variant="outline" onClick={() => setContactOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              className="gap-2 rounded-xl py-5 text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
              onClick={() => {
                setContactOpen(false);
                openLine();
              }}
              style={{ backgroundColor: "#06C755", color: "white" }}
            >
              <MessageCircle className="h-5 w-5" />
              Open Line
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AmenityGroup({
  title,
  amenities,
  labelFor,
}: {
  title: string;
  amenities: string[];
  labelFor: (amenity: string) => string;
}) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {amenities.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{t("property.noAmenities")}</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {amenities.map((amenity) => (
            <span
              key={amenity}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm font-medium text-foreground"
            >
              <Check className="h-3.5 w-3.5 text-success" aria-hidden />
              {labelFor(amenity)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
