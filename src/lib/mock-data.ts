export type Listing = {
  id: string;
  title: string;
  price: number;
  location: string;
  propertyType?: string;
  roomType: string;
  beds: number;
  baths: number;
  sqm: number;
  rating: number;
  reviews: number;
  available: boolean;
  /** Paid placement — surfaced in the “Recommended For You” shelf only (no card badge). */
  promoted?: boolean;
  /** Earliest move-in (YYYY-MM-DD) for relevance scoring when renter picks a date. */
  availableFrom?: string;
  image: string;
  gallery: string[];
  amenities: string[];
  petFriendly?: boolean;
  minimumLease?: string;
  depositMonths?: 1 | 2;
  utilityRates?: string;
  description: string;
  landlord: { name: string; verified: boolean; avatar: string; lineUrl?: string };
};

const img = (id: number, w = 800, h = 600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const listings: Listing[] = [
  {
    id: "1",
    title: "The Line Ari — Skyline 1BR",
    price: 16000,
    location: "Ari, Bangkok",
    propertyType: "Condo",
    roomType: "1 Bedroom",
    beds: 1,
    baths: 1,
    sqm: 32,
    rating: 4.9,
    reviews: 128,
    available: true,
    promoted: true,
    availableFrom: "2026-05-01",
    image: img(1505691938895, 1200, 800).replace(
      "photo-",
      "photo-1505691938895-1758d7feb511?ixlib=rb-4.0.3&",
    ),
    gallery: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Wi-Fi", "Air Conditioning", "Gym", "Parking", "Pet Friendly", "Elevator"],
    petFriendly: true,
    minimumLease: "12 months",
    depositMonths: 2,
    utilityRates: "Water ฿18/unit · Electricity ฿7/unit",
    description:
      "Bright corner unit with panoramic city views, walkable to BTS Ari. Fully furnished, fiber internet, 24/7 security.",
    landlord: {
      name: "Aria Property Co.",
      verified: true,
      avatar: "https://i.pravatar.cc/100?img=12",
      lineUrl: "https://line.me/R/ti/p/@moderntrust",
    },
  },
  {
    id: "2",
    title: "XT Ekkamai — Studio Loft",
    price: 18500,
    location: "Ekkamai, Bangkok",
    propertyType: "Condo",
    roomType: "Studio",
    beds: 1,
    baths: 1,
    sqm: 28,
    rating: 4.8,
    reviews: 96,
    available: true,
    availableFrom: "2026-06-15",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Wi-Fi", "Gym", "Elevator", "Furnished", "Kitchen"],
    petFriendly: false,
    minimumLease: "12 months",
    depositMonths: 2,
    utilityRates: "Water ฿20/unit · Electricity ฿8/unit",
    description: "Designer studio loft with double-height ceilings. Steps from Ekkamai BTS.",
    landlord: {
      name: "Urban Stay",
      verified: true,
      avatar: "https://i.pravatar.cc/100?img=32",
      lineUrl: "https://line.me/R/ti/p/@moderntrust",
    },
  },
  {
    id: "3",
    title: "Noble Around 33 — Garden 1BR",
    price: 20000,
    location: "Phrom Phong, Bangkok",
    propertyType: "Condo",
    roomType: "1 Bedroom",
    beds: 1,
    baths: 1,
    sqm: 35,
    rating: 4.7,
    reviews: 64,
    available: true,
    availableFrom: "2026-05-20",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Wi-Fi", "Gym", "Parking", "Air Conditioning", "Laundry"],
    petFriendly: false,
    minimumLease: "6 months",
    depositMonths: 2,
    utilityRates: "Water ฿18/unit · Electricity ฿7/unit",
    description: "Quiet residential building with leafy garden views and full amenities.",
    landlord: {
      name: "Noble Living",
      verified: true,
      avatar: "https://i.pravatar.cc/100?img=23",
      lineUrl: "https://line.me/R/ti/p/@moderntrust",
    },
  },
  {
    id: "4",
    title: "Ideo Mobi Sukhumvit — 2BR Sky",
    price: 32000,
    location: "On Nut, Bangkok",
    propertyType: "Condo",
    roomType: "2 Bedroom",
    beds: 2,
    baths: 2,
    sqm: 56,
    rating: 4.9,
    reviews: 211,
    available: true,
    availableFrom: "2026-04-01",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Wi-Fi", "Gym", "Elevator", "Air Conditioning", "Laundry"],
    petFriendly: false,
    minimumLease: "12 months",
    depositMonths: 2,
    utilityRates: "Water ฿18/unit · Electricity ฿7/unit",
    description: "Spacious two-bedroom with skyline lounge access and resort-style pool.",
    landlord: {
      name: "Ananda",
      verified: true,
      avatar: "https://i.pravatar.cc/100?img=45",
      lineUrl: "https://line.me/R/ti/p/@moderntrust",
    },
  },
  {
    id: "5",
    title: "Park Origin Thonglor — Studio",
    price: 14500,
    location: "Thonglor, Bangkok",
    propertyType: "Apartment",
    roomType: "Studio",
    beds: 1,
    baths: 1,
    sqm: 26,
    rating: 4.6,
    reviews: 88,
    available: false,
    availableFrom: "2026-08-01",
    image:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Wi-Fi", "Gym", "Laundry"],
    petFriendly: false,
    minimumLease: "6 months",
    depositMonths: 1,
    utilityRates: "Water ฿20/unit · Electricity ฿8/unit",
    description: "Compact, efficient studio in the heart of Thonglor nightlife district.",
    landlord: {
      name: "Origin Group",
      verified: false,
      avatar: "https://i.pravatar.cc/100?img=15",
      lineUrl: "https://line.me/R/ti/p/@moderntrust",
    },
  },
  {
    id: "6",
    title: "Life Asoke — Skyline Studio",
    price: 17500,
    location: "Asoke, Bangkok",
    propertyType: "Condo",
    roomType: "Studio",
    beds: 1,
    baths: 1,
    sqm: 30,
    rating: 4.8,
    reviews: 142,
    available: true,
    promoted: true,
    availableFrom: "2026-05-10",
    image:
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["Wi-Fi", "Gym", "Air Conditioning", "Furnished", "Kitchen"],
    petFriendly: false,
    minimumLease: "12 months",
    depositMonths: 2,
    utilityRates: "Water ฿18/unit · Electricity ฿7/unit",
    description: "Newly renovated studio with smart home automation, steps from Asoke BTS.",
    landlord: {
      name: "AP Thailand",
      verified: true,
      avatar: "https://i.pravatar.cc/100?img=8",
      lineUrl: "https://line.me/R/ti/p/@moderntrust",
    },
  },
];

export const bookings = [
  {
    id: "b1",
    listingId: "1",
    status: "confirmed",
    checkIn: "2026-06-01",
    checkOut: "2026-12-01",
    total: 96000,
  },
  {
    id: "b2",
    listingId: "3",
    status: "pending",
    checkIn: "2026-07-15",
    checkOut: "2027-01-15",
    total: 120000,
  },
  {
    id: "b3",
    listingId: "5",
    status: "cancelled",
    checkIn: "2026-04-10",
    checkOut: "2026-10-10",
    total: 87000,
  },
];
