import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Heart, Star, MapPin, BedDouble, Bath, Maximize, ShieldCheck, Calendar, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listings } from "@/lib/mock-data";
import { AMENITY_I18N_KEY } from "@/lib/amenities";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/property/$id")({
  loader: ({ params }) => {
    const listing = listings.find((l) => l.id === params.id);
    if (!listing) throw notFound();
    return { listing };
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
  const [booked, setBooked] = useState(false);
  const [date, setDate] = useState("");

  const bedLabel = `${listing.beds} ${listing.beds !== 1 ? t("property.beds") : t("property.bed")}`;
  const bathLabel = `${listing.baths} ${t("property.bath")}`;
  const sqLabel = `${listing.sqm} ${t("property.sqm")}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("property.back")}
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">{listing.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {listing.rating} · {listing.reviews} {t("common.reviews")}
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
          <img src={listing.gallery[active]} alt="" className="h-full max-h-[480px] w-full object-cover" />
        </div>
        {listing.gallery.slice(0, 4).map((g: string, i: number) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`relative overflow-hidden rounded-2xl bg-muted ${active === i ? "ring-2 ring-primary" : ""}`}
          >
            <img src={g} alt="" className="h-full max-h-[235px] min-h-[120px] w-full object-cover" />
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="flex items-center gap-3 border-b border-border pb-6">
            <img src={listing.landlord.avatar} className="h-12 w-12 rounded-full object-cover" alt="" />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 font-semibold">
                {t("property.hostedBy")} {listing.landlord.name}
                {listing.landlord.verified && <ShieldCheck className="h-4 w-4 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground">{t("property.responds")}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-6">
            {[
              { icon: BedDouble, label: bedLabel },
              { icon: Bath, label: bathLabel },
              { icon: Maximize, label: sqLabel },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                <s.icon className="h-5 w-5 text-primary" />
                <p className="mt-2 text-sm font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          <section className="border-t border-border py-6">
            <h2 className="text-lg font-semibold">{t("property.about")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{listing.description}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {t("property.aiDescBadge")}
            </div>
          </section>

          <section className="border-t border-border py-6">
            <h2 className="text-lg font-semibold">{t("property.amenities")}</h2>
            {listing.amenities.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">{t("property.noAmenities")}</p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {listing.amenities.map((a: string) => {
                  const slug = AMENITY_I18N_KEY[a as keyof typeof AMENITY_I18N_KEY];
                  const label = slug ? t(`amenities.values.${slug}`) : a;
                  return (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm font-medium text-foreground"
                  >
                    <Check className="h-3.5 w-3.5 text-success" aria-hidden />
                    {label}
                  </span>
                  );
                })}
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
                    <div className="flex gap-0.5 text-warning">{[...Array(r.r)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}</div>
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
            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">{t("property.moveIn")}</span>
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-transparent text-sm outline-none" />
                </div>
              </label>
            </div>
            <Button className="mt-5 w-full" size="lg" disabled={!listing.available || booked} onClick={() => setBooked(true)}>
              {booked ? t("property.requestSent") : listing.available ? t("property.bookNow") : t("property.unavailableCta")}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">{t("property.bookingNote")}</p>
            <AnimatePresence>
              {booked && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 rounded-lg bg-success/10 p-3 text-sm text-success"
                >
                  <Check className="mr-1 inline h-4 w-4" /> {t("property.bookingSuccess")}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </div>
  );
}
