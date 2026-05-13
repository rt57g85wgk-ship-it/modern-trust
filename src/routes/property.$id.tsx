import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Heart, Star, MapPin, BedDouble, Bath, Maximize, ShieldCheck, MessageCircle, Calendar, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listings } from "@/lib/mock-data";
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
  const fav = favorites.includes(listing.id);
  const [active, setActive] = useState(0);
  const [booked, setBooked] = useState(false);
  const [date, setDate] = useState("");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Discover
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">{listing.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" /> {listing.rating} · {listing.reviews} reviews</span>
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {listing.location}</span>
            {listing.available ? (
              <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-success"><Check className="h-3 w-3" /> Available</span>
            ) : (
              <span className="rounded-full bg-muted px-2 py-0.5">Unavailable</span>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={() => toggleFavorite(listing.id)} className="gap-2">
          <Heart className={`h-4 w-4 ${fav ? "fill-destructive text-destructive" : ""}`} />
          {fav ? "Saved" : "Save"}
        </Button>
      </div>

      {/* GALLERY */}
      <div className="mt-6 grid gap-2 sm:grid-cols-4">
        <div className="relative col-span-2 row-span-2 overflow-hidden rounded-2xl bg-muted">
          <img src={listing.gallery[active]} alt="" className="h-full max-h-[480px] w-full object-cover" />
        </div>
        {listing.gallery.slice(0, 4).map((g: string, i: number) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`relative overflow-hidden rounded-2xl bg-muted ${active === i ? "ring-2 ring-primary" : ""}`}
          >
            <img src={g} alt="" className="h-full max-h-[235px] min-h-[120px] w-full object-cover" />
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          {/* LANDLORD */}
          <div className="flex items-center gap-3 border-b border-border pb-6">
            <img src={listing.landlord.avatar} className="h-12 w-12 rounded-full object-cover" alt="" />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 font-semibold">
                Hosted by {listing.landlord.name}
                {listing.landlord.verified && <ShieldCheck className="h-4 w-4 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground">Responds within an hour</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2"><MessageCircle className="h-4 w-4" /> Contact</Button>
          </div>

          {/* SPECS */}
          <div className="grid grid-cols-3 gap-4 py-6">
            {[
              { icon: BedDouble, label: `${listing.beds} Bed${listing.beds > 1 ? "s" : ""}` },
              { icon: Bath, label: `${listing.baths} Bath` },
              { icon: Maximize, label: `${listing.sqm} m²` },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                <s.icon className="h-5 w-5 text-primary" />
                <p className="mt-2 text-sm font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          <section className="border-t border-border py-6">
            <h2 className="text-lg font-semibold">About this place</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{listing.description}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> AI-generated description
            </div>
          </section>

          <section className="border-t border-border py-6">
            <h2 className="text-lg font-semibold">Amenities</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {listing.amenities.map((a: string) => (
                <div key={a} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-success" /> {a}
                </div>
              ))}
            </div>
          </section>

          <section className="border-t border-border py-6">
            <h2 className="text-lg font-semibold">Location</h2>
            <div className="mt-4 flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 bg-grid">
              <div className="text-center">
                <MapPin className="mx-auto h-8 w-8 text-primary" />
                <p className="mt-2 text-sm font-medium">{listing.location}</p>
                <p className="text-xs text-muted-foreground">Map preview</p>
              </div>
            </div>
          </section>

          <section className="border-t border-border py-6">
            <h2 className="text-lg font-semibold">Reviews</h2>
            <div className="mt-4 space-y-4">
              {[
                { n: "Praew T.", r: 5, t: "Spotless unit, great location, fast check-in." },
                { n: "James K.", r: 5, t: "Landlord was responsive. Loved the view." },
              ].map((r) => (
                <div key={r.n} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{r.n}</p>
                    <div className="flex gap-0.5 text-warning">{[...Array(r.r)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}</div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.t}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* BOOKING */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-bold">฿{listing.price.toLocaleString()}</span>
                <span className="ml-1 text-sm text-muted-foreground">/ month</span>
              </div>
              <span className="flex items-center gap-1 text-sm"><Star className="h-3.5 w-3.5 fill-warning text-warning" /> {listing.rating}</span>
            </div>
            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Move-in date</span>
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-transparent text-sm outline-none" />
                </div>
              </label>
            </div>
            <Button
              className="mt-5 w-full"
              size="lg"
              disabled={!listing.available || booked}
              onClick={() => setBooked(true)}
            >
              {booked ? "Request sent ✓" : listing.available ? "Book Now" : "Unavailable"}
            </Button>
            <Button variant="outline" className="mt-2 w-full gap-2"><MessageCircle className="h-4 w-4" /> Contact landlord</Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">You won't be charged. Booking is simulated for demo.</p>
            <AnimatePresence>
              {booked && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 rounded-lg bg-success/10 p-3 text-sm text-success"
                >
                  <Check className="mr-1 inline h-4 w-4" /> Request sent! Landlord will respond shortly.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </div>
  );
}
