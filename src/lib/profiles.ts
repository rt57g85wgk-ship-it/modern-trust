import { listings, type Listing } from "@/lib/mock-data";

export type PublicProfile = {
  id: string;
  type: "landlord" | "renter";
  name: string;
  avatar: string;
  verified: boolean;
  bio: string;
  rating: number;
  reviewsCount: number;
  joined: string;
  reviews: { author: string; rating: number; text: string; date: string }[];
  // Landlord-only
  listings?: Listing[];
  // Renter-only
  preferredArea?: string;
  moveInTimeline?: string;
  lifestyleTags?: string[];
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function landlordIdOf(name: string) {
  return slugify(name);
}

const BIO_BY_NAME: Record<string, string> = {
  "Aria Property Co.":
    "Boutique property manager curating bright, well-located condos across central Bangkok. We respond within the hour and pride ourselves on transparent leases.",
  "Urban Stay":
    "Designer studios with a focus on creative professionals. Every unit is fully furnished and inspected before move-in.",
  "Noble Living":
    "Family-run landlords managing quiet residential buildings in Phrom Phong. We've hosted renters from 30+ countries.",
  "Ananda":
    "Premium developer with thousands of skyline units. Verified leasing team available 7 days a week.",
  "Origin Group":
    "Compact, efficient studios in Bangkok's most vibrant neighborhoods. Flexible 6-month leases available.",
  "AP Thailand":
    "One of Thailand's largest residential developers — modern smart-home units with full building amenities.",
};

const SAMPLE_REVIEWS = [
  { author: "Praew T.", rating: 5, text: "Smooth move-in and very responsive landlord.", date: "2026-02-14" },
  { author: "James K.", rating: 5, text: "Spotless unit. Exactly as described.", date: "2026-01-28" },
  { author: "Mei L.", rating: 4, text: "Good communication, quick to fix a minor AC issue.", date: "2025-12-09" },
];

export function getLandlordProfile(id: string): PublicProfile | null {
  const owned = listings.filter((l) => landlordIdOf(l.landlord.name) === id);
  if (!owned.length) return null;
  const sample = owned[0].landlord;
  const avgRating =
    owned.reduce((sum, l) => sum + l.rating, 0) / owned.length;
  const reviewsCount = owned.reduce((sum, l) => sum + l.reviews, 0);
  return {
    id,
    type: "landlord",
    name: sample.name,
    avatar: sample.avatar,
    verified: sample.verified,
    bio: BIO_BY_NAME[sample.name] ?? "Verified landlord on Modern Trust.",
    rating: Math.round(avgRating * 10) / 10,
    reviewsCount,
    joined: "2024",
    reviews: SAMPLE_REVIEWS,
    listings: owned,
  };
}

// Demo renter profiles so renter-type links work too.
const DEMO_RENTERS: Record<string, PublicProfile> = {
  "praew-t": {
    id: "praew-t",
    type: "renter",
    name: "Praew T.",
    avatar: "https://i.pravatar.cc/150?img=47",
    verified: true,
    bio: "Graphic designer relocating from Chiang Mai. Looking for a quiet 1BR near BTS.",
    rating: 4.9,
    reviewsCount: 6,
    joined: "2025",
    reviews: [
      { author: "Aria Property Co.", rating: 5, text: "Respectful tenant, paid on time, would host again.", date: "2026-02-01" },
      { author: "Noble Living", rating: 5, text: "Excellent communication throughout the lease.", date: "2025-09-12" },
    ],
    preferredArea: "Ari · Ratchathewi",
    moveInTimeline: "Within 30 days",
    lifestyleTags: ["Professional", "Quiet Lifestyle", "Non-Smoker"],
  },
  "james-k": {
    id: "james-k",
    type: "renter",
    name: "James K.",
    avatar: "https://i.pravatar.cc/150?img=58",
    verified: false,
    bio: "Software engineer on a 12-month relocation. Pet owner (small dog).",
    rating: 4.7,
    reviewsCount: 3,
    joined: "2026",
    reviews: [
      { author: "Urban Stay", rating: 5, text: "Tidy and easygoing. Great tenant.", date: "2026-03-04" },
    ],
    preferredArea: "Thonglor · Ekkamai",
    moveInTimeline: "Flexible",
    lifestyleTags: ["Professional", "Pet Friendly"],
  },
};

export function getRenterProfile(id: string): PublicProfile | null {
  return DEMO_RENTERS[id] ?? null;
}

export function getProfileById(id: string): PublicProfile | null {
  return getLandlordProfile(id) ?? getRenterProfile(id);
}
