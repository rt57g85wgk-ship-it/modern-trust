import { supabase } from "@/lib/supabase";

export type Listing = {
  id: string;
  title: string;
  price: number;
  location: string;
  propertyType?: string;
  distance?: number;
  roomType: string;
  beds: number;
  baths: number;
  sqm: number;
  rating: number;
  reviews: number;
  available: boolean;
  promoted?: boolean;
  availableFrom?: string;
  image: string;
  gallery: string[];
  amenities: string[];
  petFriendly?: boolean;
  minimumLease?: string;
  depositMonths?: 1 | 2;
  utilityRates?: string;
  electric_rate_type?: "GOVERNMENT" | "FIXED";
  electric_rate?: number | string;
  water_rate_type?: "GOVERNMENT" | "FIXED";
  water_rate?: number | string;
  description: string;
  landlord: {
    id?: string;
    name: string;
    verified: boolean;
    avatar: string;
    lineUrl?: string;
    phone?: string;
    lineId?: string;
    lineQrUrl?: string;
  };
};

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

export async function fetchAndMatchListings(q: SearchFilters): Promise<Listing[]> {
  const { data: rooms, error } = await supabase
    .from("rooms")
    .select(`
      *,
      buildings (
        *,
        users (
          name,
          is_verified,
          email,
          phone_number,
          line_id,
          line_url,
          line_qr_url
        )
      )
    `);

  if (error) {
    console.error("Error fetching rooms for matching:", error);
    return [];
  }

  const mappedListings = (rooms || []).map((room: any) => {
    const building = Array.isArray(room.buildings)
      ? room.buildings[0]
      : room.buildings;

    let roomType = "1 Bedroom";
    if (room.room_type === "STUDIO") roomType = "Studio";
    else if (room.room_type === "2_BEDROOM") roomType = "2 Bedroom";

    const bedsCount = room.room_type === "STUDIO" ? 0 : (room.room_type === "2_BEDROOM" ? 2 : 1);
    const propType = building ? building.property_type : "Condo";

    const defaultThumb = "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80";
    const gallery = Array.isArray(room.images) && room.images.length > 0 
      ? room.images 
      : [defaultThumb];
    const image = gallery[0];

    const landlordUser = Array.isArray(building?.users)
      ? building.users[0]
      : building?.users;

    const landlordName = landlordUser?.name || "Verified Landlord";
    const landlordAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(landlordName)}`;

    return {
      id: room.room_id,
      title: room.listing_title || building?.building_name || "Room",
      price: Number(room.base_rent_monthly) || 0,
      location: building?.address || "Bangkok",
      propertyType: propType,
      distance: 0.5,
      roomType: roomType,
      beds: bedsCount,
      baths: roomType === "2 Bedroom" ? 2 : 1,
      sqm: Number(room.room_size_sqm) || 30,
      rating: 4.8,
      reviews: 0,
      available: room.status === "AVAILABLE",
      promoted: !!room.promoted,
      image,
      gallery,
      amenities: room.amenities_in_room || [],
      petFriendly: !!room.pet_friendly,
      minimumLease: `${room.min_contract_months || 12} months`,
      depositMonths: (room.deposit_months === 1 || room.deposit_months === 2) ? room.deposit_months : 2,
      description: room.description || "",
      landlord: {
        id: building?.owner_id,
        name: landlordName,
        verified: !!landlordUser?.is_verified,
        avatar: landlordAvatar,
        phone: landlordUser?.phone_number,
        lineId: landlordUser?.line_id,
        lineUrl: landlordUser?.line_url,
        lineQrUrl: landlordUser?.line_qr_url,
      }
    };
  });

  return sortByMatchScore(mappedListings, q);
}

export function calculateMatchPercentage(listing: Listing, q: SearchFilters): number {
  const rawScore = scoreListing(listing, q);
  
  // ประเมินคะแนนเต็มสูงสุด (Max Possible Score) 
  // Location(~7) + Budget(6) + Room(4) + Date(4) = ประมาณ 21-22 คะแนน
  const MAX_SCORE = 22; 

  // ป้องกันกรณีติดลบ (เช่น ห้องไม่ว่างที่โดน -12) ให้เปอร์เซ็นต์ต่ำสุดคือ 0
  if (rawScore <= 0) return 0;

  // เทียบบัญญัติไตรยางศ์เป็น % และปัดเศษทศนิยมทิ้ง
  let percentage = (rawScore / MAX_SCORE) * 100;
  
  // ป้องกันไม่ให้เกิน 100% กรณี location overlap กันเยอะมาก
  return Math.min(Math.round(percentage), 100); 
}
