import type { Listing } from "@/lib/mock-data";

export type SearchFilters = {
  location: string;
  date: string;
  budget: string;
  room: string;
};

function budgetBounds(budget: string): { min: number; max: number } | null {
  if (budget === "any") return null;
  const [minRaw, maxRaw] = budget.split("-");
  const min = Number(minRaw);
  const max = Number(maxRaw);
  if (Number.isNaN(min)) return null;
  return { min, max: Number.isNaN(max) ? min : max };
}

/** Higher score = better match to current search filters. */
export function scoreListing(listing: Listing, q: SearchFilters): number {
  let score = 0;

  const needle = q.location.trim().toLowerCase();
  if (needle) {
    const hay = listing.location.toLowerCase();
    if (hay.includes(needle)) score += 5;
    for (const word of needle.split(/\s+/)) {
      if (word.length > 1 && hay.includes(word)) score += 1;
    }
  } else {
    score += 0.5;
  }

  const bounds = budgetBounds(q.budget);
  if (bounds) {
    const { min, max } = bounds;
    if (listing.price >= min && listing.price <= max) {
      score += 4;
      const mid = (min + max) / 2;
      const span = Math.max(max - min, 1);
      score += Math.max(0, 2 * (1 - Math.abs(listing.price - mid) / span));
    }
  } else {
    score += 0.5;
  }

  if (q.room !== "any" && listing.roomType === q.room) score += 4;
  else if (q.room === "any") score += 0.5;

  if (q.date) {
    if (listing.availableFrom) {
      score += listing.availableFrom <= q.date ? 4 : -0.5;
    } else if (listing.available) {
      score += 1;
    }
  } else {
    score += 0.25;
  }

  if (!listing.available) score -= 12;

  return score;
}

export function bestMatchIds(listings: Listing[], q: SearchFilters, limit = 3): Set<string> {
  if (listings.length === 0) return new Set();
  const sorted = [...listings].sort((a, b) => scoreListing(b, q) - scoreListing(a, q));
  return new Set(sorted.slice(0, limit).map((l) => l.id));
}

export function sortByMatchScore(listings: Listing[], q: SearchFilters): Listing[] {
  return [...listings].sort((a, b) => scoreListing(b, q) - scoreListing(a, q));
}
