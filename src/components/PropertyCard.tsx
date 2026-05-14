import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, Star, MapPin, BedDouble } from "lucide-react";
import { useApp } from "@/lib/app-context";
import type { Listing } from "@/lib/mock-data";
import { useState } from "react";

import { Sparkles } from "lucide-react";

export function PropertyCard({ listing, index = 0 }: { listing: Listing; index?: number }) {
  const { favorites, toggleFavorite } = useApp();
  const fav = favorites.includes(listing.id);
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
    >
      <Link to="/property/$id" params={{ id: listing.id }} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {!imgError ? (
            <img
              src={listing.image}
              alt={listing.title}
              loading="lazy"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
          )}
          {listing.badge && (
            <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeStyles[listing.badge]}`}>
              {listing.badge}
            </span>
          )}
          {!listing.available && (
            <span className="absolute right-3 top-3 rounded-full bg-foreground/80 px-2.5 py-1 text-[11px] font-semibold text-background">
              Unavailable
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(listing.id);
            }}
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-soft backdrop-blur transition-transform hover:scale-110"
            aria-label="Favorite"
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
            <span>{listing.location}</span>
            <span className="mx-1">·</span>
            <BedDouble className="h-3 w-3" />
            <span>{listing.roomType}</span>
          </div>
          <div className="flex items-baseline justify-between border-t border-border pt-3">
            <div>
              <span className="text-lg font-bold text-foreground">฿{listing.price.toLocaleString()}</span>
              <span className="ml-1 text-xs text-muted-foreground">/ month</span>
            </div>
            <span className="text-xs text-muted-foreground">{listing.reviews} reviews</span>
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
