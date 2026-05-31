import { supabase } from "./supabase";
import { type Listing } from "./mock-data";

export type RoomTypeOption = "Studio" | "1 Bedroom" | "2 Bedroom";
export type SizeUnit = "sqm";

export type Unit = {
  id: string;
  title: string;
  location: string;
  propertyType: string;
  roomType: RoomTypeOption;
  bedrooms: number;
  bathrooms: number;
  sizeValue: number;
  sizeUnit: SizeUnit;
  price: number;
  image: string;
  images: string[];
  description: string;
  amenities: string[];
  petFriendly: boolean;
  minimumLease: string;
  depositMonths: 1 | 2;
  utilityRates: string;
  available: boolean;
  promoted: boolean;
  electric_rate_type?: "GOVERNMENT" | "FIXED";
  electric_rate?: number | string;
  water_rate_type?: "GOVERNMENT" | "FIXED";
  water_rate?: number | string;
  imageFiles?: File[];
  room_number?: string;
  floor_level?: string | number;
};

const defaultThumb =
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80";

function capitalize(str: string): string {
  if (!str) return "";
  const lower = str.toLowerCase();
  if (lower === "dormitory") return "Dormitory";
  if (lower === "apartment") return "Apartment";
  if (lower === "house") return "House";
  if (lower === "condo") return "Condo";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatRoomType(dbRoomType: string): RoomTypeOption {
  if (dbRoomType === "STUDIO") return "Studio";
  if (dbRoomType === "2_BEDROOM") return "2 Bedroom";
  return "1 Bedroom"; // 1_BEDROOM or default
}

function getBedroomsCount(roomType: RoomTypeOption): number {
  if (roomType === "Studio") return 0;
  return roomType === "2 Bedroom" ? 2 : 1;
}

const dbAmenityMap: Record<string, string> = {
  // In-room amenities
  "เครื่องปรับอากาศ (แอร์)": "Air Conditioning",
  "พัดลม": "Fan",
  "เคเบิลทีวี/ดาวเทียม": "Cable TV / Satellite",
  "ตู้เย็น": "Refrigerator",
  "เฟอร์นิเจอร์": "Furnished",
  "เครื่องทำน้ำอุ่น": "Water Heater",
  "อินเทอร์เน็ต/Wi-Fi ในห้อง": "Wi-Fi",
  "อินเทอร์เน็ต/Wi-Fi": "Wi-Fi",
  "โซฟา": "Sofa",
  "โต๊ะทำงาน/เขียนหนังสือ": "Desk & Chair",
  "โต๊ะ - เก้าอี้ทำงาน": "Desk & Chair",
  "เตาปรุงอาหาร": "Stove",
  "ระเบียง": "Balcony",
  "ซิงค์ล้างจาน": "Kitchen",
  "ครัว": "Kitchen",
  "ห้องน้ำส่วนตัว": "Private Bathroom",
  
  // Building amenities
  "มีประตูระบบ Keycard": "Keycard Door Access",
  "คีย์การ์ด": "Keycard Door Access",
  "มีประตูระบบลายนิ้วมือ": "Fingerprint Door Access",
  "พนักงานรักษาความปลอดภัย (Security)": "Security Guard",
  "ยามรักษาความปลอดภัย": "Security Guard",
  "กล้องวงจรปิด (CCTV)": "CCTV",
  "กล้องวงจรปิด": "CCTV",
  "ที่จอดรถมอเตอร์ไซด์/จักรยาน": "Motorbike / Bicycle Parking",
  "ที่จอดรถ (Parking)": "Parking",
  "ที่จอดรถ": "Parking",
  "สระว่ายน้ำ": "Swimming Pool",
  "ฟิตเนส": "Gym",
  "เครื่องซักผ้าหยอดเหรียญ": "Laundry",
  "ร้านซักรีด/บริการเครื่องซักผ้า": "Laundry",
  "ร้านทำผม-เสริมสวย": "Salon & Beauty",
  "ลิฟต์": "Elevator",
  "ร้านค้า": "Convenience Store",
  "ร้านอาหาร": "Restaurant",
  "สถานี charge รถไฟฟ้า": "EV Charging Station",
  "เลี้ยงสัตว์ได้": "Pet Friendly",
  "เลี้ยงสัตว์": "Pet Friendly"
};

function parseDbAmenities(dbField: any): string[] {
  if (!dbField) return [];
  let rawKeys: string[] = [];
  if (Array.isArray(dbField)) {
    rawKeys = dbField;
  } else if (typeof dbField === "object") {
    rawKeys = Object.keys(dbField).filter((key) => dbField[key] === true);
  }
  
  const mapped = rawKeys.map(k => dbAmenityMap[k] || k);
  return Array.from(new Set(mapped.filter(Boolean)));
}

export function mapDbRoomToListing(room: any, building: any): Listing {
  const roomTypeFormatted = formatRoomType(room.room_type);
  const bedsCount = getBedroomsCount(roomTypeFormatted);
  
  // Format property type
  const propType = building ? capitalize(building.property_type) : "Condo";
  
  // Combine images and fallback to default
  const gallery = Array.isArray(room.images) && room.images.length > 0 
    ? room.images 
    : [defaultThumb];
  const image = gallery[0];

  // Merge amenities
  const inRoomAmenities = parseDbAmenities(room.amenities_in_room);
  const bldAmenities = building ? parseDbAmenities(building.amenities_building) : [];
  const mergedAmenities = Array.from(new Set([...inRoomAmenities, ...bldAmenities]));
  if (room.pet_friendly && !mergedAmenities.includes("Pet Friendly")) {
    mergedAmenities.push("Pet Friendly");
  }

  // Format utility rates
  const waterStr = room.water_rate_type === "GOVERNMENT"
    ? "Water (Gov Rate)"
    : `Water ฿${room.water_rate || 0}/unit`;
  const electricStr = room.electric_rate_type === "GOVERNMENT"
    ? "Electricity (Gov Rate)"
    : `Electricity ฿${room.electric_rate || 0}/unit`;
  const utilityRates = `${waterStr} · ${electricStr}`;

  return {
    id: room.room_id,
    title: room.listing_title || (building ? building.building_name : "Room"),
    price: Number(room.base_rent_monthly) || 0,
    location: building ? building.address : "Bangkok",
    propertyType: propType,
    distance: 0.5, // Default distance placeholder
    roomType: roomTypeFormatted,
    beds: bedsCount || 1,
    baths: roomTypeFormatted === "2 Bedroom" ? 2 : 1,
    sqm: Number(room.room_size_sqm) || 30,
    rating: 4.8,
    reviews: 0,
    available: room.status === "AVAILABLE",
    promoted: !!room.promoted,
    image,
    gallery,
    amenities: mergedAmenities,
    petFriendly: !!room.pet_friendly,
    minimumLease: `${room.min_contract_months || 12} months`,
    depositMonths: (room.deposit_months === 1 || room.deposit_months === 2) ? room.deposit_months : 2,
    utilityRates,
    electric_rate_type: room.electric_rate_type,
    electric_rate: room.electric_rate,
    water_rate_type: room.water_rate_type,
    water_rate: room.water_rate,
    description: room.description || "",
    landlord: (() => {
      const landlordUser = Array.isArray(building?.users)
        ? building.users[0]
        : building?.users;
      const landlordName = landlordUser?.name || "Verified Landlord";
      const landlordVerified = landlordUser?.is_verified ?? true;
      const landlordAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(landlordName)}`;
      const landlordPhone = landlordUser?.phone_number || "081-234-5678";
      const landlordLineId = landlordUser?.line_id || "@moderntrust";
      const landlordLineUrl = landlordUser?.line_url || "https://line.me/R/ti/p/@moderntrust";
      const landlordLineQrUrl = landlordUser?.line_qr_url || "";
      return {
        id: building?.owner_id || undefined,
        name: landlordName,
        verified: landlordVerified,
        avatar: landlordAvatar,
        phone: landlordPhone,
        lineId: landlordLineId,
        lineUrl: landlordLineUrl,
        lineQrUrl: landlordLineQrUrl,
        phoneContactEnabled: (() => {
          let enabled = landlordUser?.phone_contact_enabled ?? false;
          if (typeof window !== "undefined") {
            try {
              const localUserStr = localStorage.getItem("mt_user");
              if (localUserStr) {
                const localUser = JSON.parse(localUserStr);
                if (
                  localUser &&
                  localUser.phoneContactEnabled === true &&
                  (building?.owner_id === localUser.id || landlordName === localUser.name)
                ) {
                  enabled = true;
                }
              }
            } catch (e) {
              console.warn("Failed to check local user premium status:", e);
            }
          }
          return enabled;
        })(),
      };
    })()
  };
}

export function mapDbRoomToUnit(room: any, building: any): Unit {
  const roomTypeFormatted = formatRoomType(room.room_type);
  const bedsCount = getBedroomsCount(roomTypeFormatted);
  const propType = building ? capitalize(building.property_type) : "Condo";
  
  const gallery = Array.isArray(room.images) && room.images.length > 0 
    ? room.images 
    : [defaultThumb];
  const image = gallery[0];

  const inRoomAmenities = parseDbAmenities(room.amenities_in_room);
  
  const waterStr = room.water_rate_type === "GOVERNMENT"
    ? "Water (Gov Rate)"
    : `Water ฿${room.water_rate || 0}/unit`;
  const electricStr = room.electric_rate_type === "GOVERNMENT"
    ? "Electricity (Gov Rate)"
    : `Electricity ฿${room.electric_rate || 0}/unit`;
  const utilityRates = `${waterStr} · ${electricStr}`;

  return {
    id: room.room_id,
    title: room.listing_title || (building ? building.building_name : "Room"),
    location: building ? building.address : "Bangkok",
    propertyType: propType,
    roomType: roomTypeFormatted,
    bedrooms: bedsCount,
    bathrooms: roomTypeFormatted === "2 Bedroom" ? 2 : 1,
    sizeValue: Number(room.room_size_sqm) || 30,
    sizeUnit: "sqm",
    price: Number(room.base_rent_monthly) || 0,
    image,
    images: gallery,
    description: room.description || "",
    amenities: inRoomAmenities,
    petFriendly: !!room.pet_friendly,
    minimumLease: `${room.min_contract_months || 12} months`,
    depositMonths: (room.deposit_months === 1 || room.deposit_months === 2) ? room.deposit_months : 2,
    utilityRates,
    available: room.status === "AVAILABLE",
    promoted: !!room.promoted,
    electric_rate_type: room.electric_rate_type || "GOVERNMENT",
    electric_rate: room.electric_rate || 0,
    water_rate_type: room.water_rate_type || "GOVERNMENT",
    water_rate: room.water_rate || 0,
    room_number: room.room_number || "",
    floor_level: room.floor_level || ""
  };
}

export async function fetchSupabaseListings(): Promise<Listing[]> {
  try {
    const { data: initialRooms, error: initialError } = await supabase
      .from("rooms")
      .select(`
        *,
        buildings (
          building_name,
          address,
          property_type,
          latitude,
          longitude,
          zone_tag,
          amenities_building,
          owner_id,
          users (
            name,
            is_verified,
            email,
            phone_number,
            line_id,
            line_url,
            line_qr_url,
            phone_contact_enabled
          )
        )
      `);

    let rooms = initialRooms;
    let error = initialError;

    if (error && error.message.includes("phone_contact_enabled")) {
      console.warn("phone_contact_enabled column not found in database, retrying without it...");
      const retryResult = await supabase
        .from("rooms")
        .select(`
          *,
          buildings (
            building_name,
            address,
            property_type,
            latitude,
            longitude,
            zone_tag,
            amenities_building,
            owner_id,
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
      rooms = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      console.error("Error fetching listings from Supabase:", error);
      return [];
    }

    if (!rooms || rooms.length === 0) {
      return [];
    }

    return rooms.map((room: any) => {
      // Handle array or object for joined buildings relation
      const building = Array.isArray(room.buildings) 
        ? room.buildings[0] 
        : room.buildings;
      return mapDbRoomToListing(room, building);
    });
  } catch (err) {
    console.error("Catch error fetching listings:", err);
    return [];
  }
}

export async function fetchSupabaseListingById(id: string): Promise<Listing | null> {
  try {
    const { data: initialRoom, error: initialError } = await supabase
      .from("rooms")
      .select(`
        *,
        buildings (
          building_name,
          address,
          property_type,
          latitude,
          longitude,
          zone_tag,
          amenities_building,
          owner_id,
          users (
            name,
            is_verified,
            email,
            phone_number,
            line_id,
            line_url,
            line_qr_url,
            phone_contact_enabled
          )
        )
      `)
      .eq("room_id", id)
      .maybeSingle();

    let room = initialRoom;
    let error = initialError;

    if (error && error.message.includes("phone_contact_enabled")) {
      console.warn("phone_contact_enabled column not found in database, retrying without it...");
      const retryResult = await supabase
        .from("rooms")
        .select(`
          *,
          buildings (
            building_name,
            address,
            property_type,
            latitude,
            longitude,
            zone_tag,
            amenities_building,
            owner_id,
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
        `)
        .eq("room_id", id)
        .maybeSingle();
      room = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      console.error("Error fetching single listing from Supabase:", error);
      return null;
    }

    if (!room) return null;

    const building = Array.isArray(room.buildings) 
      ? room.buildings[0] 
      : room.buildings;
      
    return mapDbRoomToListing(room, building);
  } catch (err) {
    console.error("Catch error fetching single listing:", err);
    return null;
  }
}
