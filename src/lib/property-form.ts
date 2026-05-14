/** Property type / layout for landlord listing forms. */
export const PROPERTY_TYPE_OPTIONS = [
  "Studio",
  "Apartment",
  "Condo",
  "Shared Room",
  "Basement",
  "House",
  "Townhouse",
] as const;

export type PropertyTypeOption = (typeof PROPERTY_TYPE_OPTIONS)[number];

export const SIZE_UNITS = ["sqm", "sq ft"] as const;
export type SizeUnit = (typeof SIZE_UNITS)[number];

export function formatRoomSize(value: number, unit: SizeUnit): string {
  const v = Number.isInteger(value) ? String(value) : String(value);
  return unit === "sqm" ? `${v} sqm` : `${v} sq ft`;
}
