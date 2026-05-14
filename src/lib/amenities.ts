/** Canonical amenities for listing forms and filters (English keys stored in state). */
export const LISTING_AMENITY_OPTIONS = [
  "Wi-Fi",
  "Parking",
  "Laundry",
  "Gym",
  "Air Conditioning",
  "Furnished",
  "Pet Friendly",
  "Private Bathroom",
  "Kitchen",
  "Elevator",
] as const;

/** i18n slug under `amenities.values.*` for each canonical option. */
export const AMENITY_I18N_KEY: Record<(typeof LISTING_AMENITY_OPTIONS)[number], string> = {
  "Wi-Fi": "wifi",
  Parking: "parking",
  Laundry: "laundry",
  Gym: "gym",
  "Air Conditioning": "airCon",
  Furnished: "furnished",
  "Pet Friendly": "petFriendly",
  "Private Bathroom": "privateBathroom",
  Kitchen: "kitchen",
  Elevator: "elevator",
};

const order = new Map<string, number>(LISTING_AMENITY_OPTIONS.map((a, i) => [a, i]));

export function sortAmenitiesSelected(selected: string[]): string[] {
  return [...selected].sort((a, b) => (order.get(a) ?? 100) - (order.get(b) ?? 100));
}

