/** Canonical amenities for listing forms and filters (English keys stored in state). */
export const LISTING_AMENITY_OPTIONS = [
  "Air Conditioning",
  "Fan",
  "Cable TV / Satellite",
  "Refrigerator",
  "Furnished",
  "Water Heater",
  "Wi-Fi",
  "Sofa",
  "Desk & Chair",
  "Stove",
  "Keycard Door Access",
  "Fingerprint Door Access",
  "Security Guard",
  "CCTV",
  "Motorbike / Bicycle Parking",
  "Parking",
  "Swimming Pool",
  "Gym",
  "Laundry",
  "Salon & Beauty",
  "Elevator",
  "Convenience Store",
  "Restaurant",
  "EV Charging Station",
  "Pet Friendly",
  "Private Bathroom",
  "Kitchen",
] as const;

export const IN_UNIT_AMENITY_OPTIONS = [
  "Air Conditioning",
  "Fan",
  "Cable TV / Satellite",
  "Refrigerator",
  "Furnished",
  "Water Heater",
  "Wi-Fi",
  "Sofa",
  "Desk & Chair",
  "Stove",
] as const;

export const BUILDING_AMENITY_OPTIONS = [
  "Keycard Door Access",
  "Fingerprint Door Access",
  "Security Guard",
  "CCTV",
  "Motorbike / Bicycle Parking",
  "Parking",
  "Swimming Pool",
  "Gym",
  "Laundry",
  "Salon & Beauty",
  "Elevator",
  "Convenience Store",
  "Restaurant",
  "EV Charging Station",
] as const;

/** i18n slug under `amenities.values.*` for each canonical option. */
export const AMENITY_I18N_KEY: Record<(typeof LISTING_AMENITY_OPTIONS)[number], string> = {
  "Air Conditioning": "airCon",
  Fan: "fan",
  "Cable TV / Satellite": "cableTv",
  Refrigerator: "fridge",
  Furnished: "furnished",
  "Water Heater": "waterHeater",
  "Wi-Fi": "wifi",
  Sofa: "sofa",
  "Desk & Chair": "deskChair",
  Stove: "stove",
  "Keycard Door Access": "keycard",
  "Fingerprint Door Access": "fingerprint",
  "Security Guard": "security",
  CCTV: "cctv",
  "Motorbike / Bicycle Parking": "bikeParking",
  Parking: "parking",
  "Swimming Pool": "pool",
  Gym: "gym",
  Laundry: "laundry",
  "Salon & Beauty": "salon",
  Elevator: "elevator",
  "Convenience Store": "shop",
  Restaurant: "restaurant",
  "EV Charging Station": "evCharge",
  "Pet Friendly": "petFriendly",
  "Private Bathroom": "privateBathroom",
  Kitchen: "kitchen",
};

const order = new Map<string, number>(LISTING_AMENITY_OPTIONS.map((a, i) => [a, i]));

export function sortAmenitiesSelected(selected: string[]): string[] {
  return [...selected].sort((a, b) => (order.get(a) ?? 100) - (order.get(b) ?? 100));
}
