/** Property type / layout for landlord listing forms. */
export const PROPERTY_TYPE_OPTIONS = ["Condo", "Apartment", "Dormitory", "House"] as const;

export type PropertyTypeOption = (typeof PROPERTY_TYPE_OPTIONS)[number];

export const ROOM_TYPE_OPTIONS = ["Studio", "1 Bedroom", "2 Bedroom"] as const;
export type RoomTypeOption = (typeof ROOM_TYPE_OPTIONS)[number];

export const SIZE_UNITS = ["sqm"] as const;
export type SizeUnit = (typeof SIZE_UNITS)[number];

export function formatRoomSize(value: number, unit: SizeUnit): string {
  const v = Number.isInteger(value) ? String(value) : String(value);
  return `${v} ${unit}`;
}
