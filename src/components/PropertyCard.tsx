import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, Star, MapPin, BedDouble, Sparkles } from "lucide-react";
import { useApp } from "@/lib/app-context";
import type { Listing } from "@/lib/mock-data";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function PropertyCard({
  listing,
  index = 0,
  bestMatch = false,
}: {
  listing: Listing;
  index?: number;
  bestMatch?: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, favorites, toggleFavorite } = useApp();
  const fav = favorites.includes(listing.id);
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={`group overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
        bestMatch
          ? "border-primary/30 bg-gradient-to-b from-card to-primary/5 shadow-glow hover:shadow-[0_0_0_1px_oklch(0.55_0.22_260_/_0.30),_0_12px_36px_-8px_oklch(0.55_0.22_260_/_0.45)]"
          : "border-border bg-card shadow-soft hover:shadow-card"
      } ${
        !listing.available ? "opacity-60 grayscale-[0.2]" : ""
      }`}
    >
      <Link to="/property/$id" params={{ id: listing.id }} className="block" aria-disabled={!listing.available}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {!imgError ? (
            <img
              src={listing.image}
              alt={listing.title}
              loading="lazy"
              onError={() => setImgError(true)}
              className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                !listing.available ? "saturate-50" : ""
              }`}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{t("propertyCard.noImage")}</div>
          )}

          {!bestMatch && listing.promoted && listing.available && (
            <span className="absolute left-3 top-3 flex items-center gap-1 rounded-md border border-primary/40 bg-background/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {t("propertyCard.recommended")}
            </span>
          )}
          {!listing.available && (
            <span className="absolute right-3 top-3 rounded-full bg-foreground/85 px-2.5 py-1 text-[11px] font-semibold text-background backdrop-blur">
              {t("propertyCard.notAvailable")}
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (!user) {
                void navigate({ to: "/login" });
                return;
              }
              toggleFavorite(listing.id);
            }}
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-soft backdrop-blur transition-transform hover:scale-110"
            aria-label={t("propertyCard.favorite")}
          >
            <Heart className={`h-4 w-4 ${fav ? "fill-destructive text-destructive" : "text-foreground"}`} />
          </button>
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-semibold text-foreground">{listing.title}</h3>
            <div className="flex shrink-0 items-center gap-0.5 text-sm">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              <span className="font-medium">{listing.rating}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>
              {listing.location}
              {listing.distance !== undefined ? ` (${listing.distance} ${t("common.km")})` : ""}
            </span>
            <span className="mx-1">·</span>
            <BedDouble className="h-3 w-3" />
            <span>{listing.roomType}</span>
          </div>
          {listing.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {listing.amenities.slice(0, 3).map((a) => (
                <span
                  key={a}
                  className="rounded-md border border-border/80 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  {a}
                </span>
              ))}
              {listing.amenities.length > 3 && (
                <span className="self-center text-[10px] font-medium text-muted-foreground/90">
                  +{listing.amenities.length - 3}
                </span>
              )}
            </div>
          )}
          <div className="flex items-baseline justify-between border-t border-border pt-3">
            <div>
              <span className="text-lg font-bold text-foreground">฿{listing.price.toLocaleString()}</span>
              <span className="ml-1 text-xs text-muted-foreground">{t("common.month")}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {listing.reviews} {t("common.reviews")}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
