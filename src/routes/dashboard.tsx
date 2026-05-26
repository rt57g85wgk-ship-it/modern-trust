import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  Bell,
  Settings,
  Heart,
  Calendar,
  Plus,
  TrendingUp,
  Home as HomeIcon,
  DollarSign,
  Eye,
  Sparkles,
  Edit,
  Trash2,
  Repeat,
  Check,
  X,
  Compass,
  Upload,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApp } from "@/lib/app-context";
import { listings } from "@/lib/mock-data";
import { PromoteModal, type PromotePackage } from "@/components/PromoteModal";
import { AmenitiesPicker } from "@/components/AmenitiesPicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PROPERTY_TYPE_OPTIONS,
  ROOM_TYPE_OPTIONS,
  formatRoomSize,
  type RoomTypeOption,
  type SizeUnit,
} from "@/lib/property-form";
import { BUILDING_AMENITY_OPTIONS, IN_UNIT_AMENITY_OPTIONS } from "@/lib/amenities";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { mapDbRoomToUnit, fetchSupabaseListings } from "@/lib/supabase-listings";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Dashboard — Modern Trust" },
      { name: "description", content: "Manage your rentals and bookings." },
    ],
  }),
});

function Dashboard() {
  const { t } = useTranslation();
  const { user, switchRole, favorites, verifyIdentity } = useApp();
  const nav = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined" && !user) {
      const timer = setTimeout(() => nav({ to: "/login" }), 50);
      return () => clearTimeout(timer);
    }
  }, [user, nav]);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-semibold">{t("dashboard.authTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.authDesc")}</p>
        <Link to="/login">
          <Button className="mt-6">{t("dashboard.signIn")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{t("dashboard.welcome")}</p>
          <h1 className="text-2xl font-bold capitalize sm:text-3xl flex items-center gap-2">
            {user.name}
            {user.verified && (
              <span
                title={t("dashboard.verified")}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
              >
                <BadgeCheck className="h-3.5 w-3.5" /> {t("dashboard.verified")}
              </span>
            )}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-2">
              <Compass className="h-4 w-4" /> {t("dashboard.discover")}
            </Button>
          </Link>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">
            {t("dashboard.roleView", {
              role: t(user.role === "renter" ? "dashboard.renter" : "dashboard.landlord"),
            })}
          </span>
          <Button variant="outline" size="sm" onClick={switchRole} className="gap-2">
            <Repeat className="h-4 w-4" />{" "}
            {t("dashboard.switchTo", {
              role: t(user.role === "renter" ? "dashboard.landlord" : "dashboard.renter"),
            })}
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Link to="/account">
            <Button variant="ghost" size="icon" aria-label="Account settings">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <motion.div
        key={user.role}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {user.role === "renter" ? (
          <RenterView favorites={favorites} verified={!!user.verified} onVerify={verifyIdentity} />
        ) : (
          <LandlordView verified={!!user.verified} onVerify={verifyIdentity} />
        )}
      </motion.div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color = "primary",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  trend?: string;
  color?: "primary" | "success" | "cyan";
}) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    cyan: "bg-brand-cyan/10 text-brand-cyan",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && <span className="text-xs font-medium text-success">{trend}</span>}
      </div>
      <p className="mt-4 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function RenterView({
  favorites,
  verified,
  onVerify,
}: {
  favorites: string[];
  verified: boolean;
  onVerify: () => void;
}) {
  const { t } = useTranslation();
  const { data: dbListings = [] } = useQuery({
    queryKey: ["supabase-listings"],
    queryFn: fetchSupabaseListings,
  });
  const saved = dbListings.filter((l) => favorites.includes(l.id));

  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Heart}
          label={t("dashboard.savedListings")}
          value={String(saved.length)}
          color="primary"
        />
        <StatCard icon={Eye} label={t("dashboard.recentlyViewed")} value="14" color="cyan" />
        <StatCard
          icon={ShieldCheck}
          label={t("dashboard.trustScore")}
          value={verified ? "98%" : "—"}
          color="primary"
        />
        <StatCard
          icon={BadgeCheck}
          label={t("dashboard.verification")}
          value={verified ? t("dashboard.verified") : t("dashboard.unverified")}
          color={verified ? "success" : "primary"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <VerificationPanel verified={verified} onVerify={onVerify} />
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">{t("dashboard.profile")}</h2>
          <div className="mt-4 space-y-3 text-sm">
            <Row
              label={t("dashboard.verification")}
              value={
                verified ? (
                  <span className="flex items-center gap-1 text-success">
                    <BadgeCheck className="h-3.5 w-3.5" /> {t("dashboard.verified")}
                  </span>
                ) : (
                  <span className="text-muted-foreground">{t("dashboard.unverified")}</span>
                )
              }
            />
            <Row label={t("dashboard.memberSince")} value="2026" />
            <Row label={t("dashboard.bookings")} value="3" />
            <Row label={t("dashboard.reviewsLeft")} value="2" />
          </div>
          <div className="mt-4 flex gap-2">
            <Link to="/profile/$id" params={{ id: "me" }} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                View public profile
              </Button>
            </Link>
            <Link to="/account" className="flex-1">
              <Button size="sm" className="w-full">
                {t("dashboard.editProfile")}
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("dashboard.savedSectionTitle")}</h2>
          <Link to="/" className="text-sm font-medium text-primary hover:underline">
            {t("dashboard.browseMore")}
          </Link>
        </div>
        {saved.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-medium">{t("dashboard.noSavedTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.noSavedHint")}</p>
            <Link to="/">
              <Button className="mt-4" size="sm">
                {t("dashboard.discoverPlaces")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((l) => (
              <Link
                key={l.id}
                to="/property/$id"
                params={{ id: l.id }}
                className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-card"
              >
                <img src={l.image} alt="" className="aspect-[4/3] w-full object-cover" />
                <div className="p-3">
                  <p className="truncate font-medium">{l.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    ฿{l.price.toLocaleString()} {t("common.perMonth")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function VerificationPanel({ verified, onVerify }: { verified: boolean; onVerify: () => void }) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFile = (files: FileList | null) => {
    if (!files || !files.length) return;
    onVerify();
    toast.success(t("dashboard.verifySuccess"));
  };
  return (
    <div>
      <div className="flex items-center gap-2">
        <BadgeCheck className={`h-5 w-5 ${verified ? "text-success" : "text-primary"}`} />
        <h2 className="font-semibold">{t("dashboard.idVerification")}</h2>
        {verified && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
            <Check className="h-3 w-3" /> {t("dashboard.verified")}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {verified ? t("dashboard.verifyDoneDesc") : t("dashboard.verifyDesc")}
      </p>
      {!verified && (
        <>
          <Button className="mt-4 gap-2" onClick={() => inputRef.current?.click()}>
            <Upload className="h-4 w-4" /> {t("dashboard.uploadId")}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files);
              e.target.value = "";
            }}
          />
        </>
      )}
    </div>
  );
}

type Unit = {
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
};

const defaultThumb =
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80";

function inferPropertyType(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("dorm")) return "Dormitory";
  if (t.includes("apartment")) return "Apartment";
  if (t.includes("house") && !t.includes("townhouse")) return "House";
  return "Condo";
}

function toRoomType(roomType: string, beds: number): RoomTypeOption {
  if (roomType === "Studio") return "Studio";
  if (roomType === "2 Bedroom") return "2 Bedroom";
  if (beds <= 0) return "Studio";
  if (beds >= 2) return "2 Bedroom";
  return "1 Bedroom";
}

function roomTypeBedrooms(roomType: RoomTypeOption): number {
  if (roomType === "Studio") return 0;
  return roomType === "2 Bedroom" ? 2 : 1;
}

const seedUnits: Unit[] = [];

function LandlordView({ verified, onVerify }: { verified: boolean; onVerify: () => void }) {
  const { t } = useTranslation();
  const [units, setUnits] = useState<Unit[]>(seedUnits);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const requireOwnerId = async (): Promise<string> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const ownerId = session?.user?.id;
    if (!ownerId) throw new Error("กรุณาเข้าสู่ระบบก่อนใช้งานส่วนเจ้าของห้อง");
    return ownerId;
  };

  const fetchLandlordUnits = async () => {
    try {
      const owner_id = await requireOwnerId();
      // Fetch buildings owned by this owner
      const { data: buildings, error: bErr } = await supabase
        .from("buildings")
        .select("building_id")
        .eq("owner_id", owner_id);

      if (bErr) throw bErr;
      if (!buildings || buildings.length === 0) {
        setUnits(seedUnits);
        return;
      }

      const buildingIds = buildings.map((b: any) => b.building_id);

      // Fetch rooms in these buildings
      const { data: rooms, error: rErr } = await supabase
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
            amenities_building
          )
        `)
        .in("building_id", buildingIds);

      if (rErr) throw rErr;

      const mappedUnits = (rooms || []).map((room: any) => {
        const building = Array.isArray(room.buildings) 
          ? room.buildings[0] 
          : room.buildings;
        return mapDbRoomToUnit(room, building);
      });

      // Filter seed units that match any room_id from Supabase to prevent duplicates
      const dbIds = new Set(mappedUnits.map((u) => u.id));
      const uniqueSeed = seedUnits.filter((u) => !dbIds.has(u.id));
      setUnits([...mappedUnits, ...uniqueSeed]);
    } catch (err) {
      console.error("Error loading landlord units:", err);
      setUnits(seedUnits);
    }
  };

  useEffect(() => {
    fetchLandlordUnits().finally(() => setLoading(false));
  }, []);

  const handleSave = async (u: Unit) => {
    try {
      const isExisting = exists(units, u.id);
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(u.id);
      const owner_id = await requireOwnerId();
      
      if (isExisting && isUuid) {
        // Upload new images to Supabase Storage if any
        const uploadedUrls: string[] = [];
        if (u.imageFiles && u.imageFiles.length > 0) {
          for (const file of u.imageFiles) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${owner_id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('room-images')
              .upload(filePath, file);

            if (uploadError) {
              console.error("Upload error:", uploadError);
              throw new Error(`อัปโหลดรูปภาพ ${file.name} ไม่สำเร็จ: ${uploadError.message}`);
            }

            const { data: publicUrlData } = supabase.storage
              .from('room-images')
              .getPublicUrl(filePath);

            uploadedUrls.push(publicUrlData.publicUrl);
          }
        }

        const existingRemoteUrls = u.images.filter(
          (url) => !url.startsWith("blob:") && !url.includes("images.unsplash.com")
        );
        const finalImages = [...existingRemoteUrls, ...uploadedUrls];

        // Update Room in Supabase
        const { error: roomError } = await supabase
          .from("rooms")
          .update({
            listing_title: u.title,
            room_type: u.roomType === "Studio" ? "STUDIO" : u.roomType === "1 Bedroom" ? "1_BEDROOM" : "2_BEDROOM",
            room_size_sqm: u.sizeValue,
            status: u.available ? "AVAILABLE" : "OCCUPIED",
            base_rent_monthly: u.price,
            electric_rate_type: u.electric_rate_type || "GOVERNMENT",
            electric_rate: parseFloat(String(u.electric_rate)) || 0,
            water_rate_type: u.water_rate_type || "GOVERNMENT",
            water_rate: parseFloat(String(u.water_rate)) || 0,
            deposit_months: u.depositMonths,
            min_contract_months: parseInt(u.minimumLease) || 12,
            pet_friendly: u.petFriendly,
            description: u.description,
            amenities_in_room: u.amenities,
            images: finalImages.length > 0 ? finalImages : u.images,
          })
          .eq("room_id", u.id);

        if (roomError) throw roomError;
      } else if (!isExisting) {
        // Insert Building
        const { data: buildingData, error: buildingError } = await supabase
          .from("buildings")
          .insert({
            owner_id,
            building_name: u.title, // หรือคุณอาจจะให้กรอกชื่อตึกแยกต่างหาก
            address: u.location,
            property_type: u.propertyType.toUpperCase(),
            latitude: 13.7563,
            longitude: 100.5018,
            zone_tag: u.location,
            amenities_building: u.amenities, // แก้ไขชื่อตัวแปรให้ตรงกับตาราง SQL (amenities_building)
          })
          .select("building_id")
          .single();

        if (buildingError) throw buildingError;

        // Upload images to Supabase Storage (room-images bucket)
        const uploadedUrls: string[] = [];
        if (u.imageFiles && u.imageFiles.length > 0) {
          for (const file of u.imageFiles) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${owner_id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('room-images')
              .upload(filePath, file);

            if (uploadError) {
              console.error("Upload error:", uploadError);
              throw new Error(`อัปโหลดรูปภาพ ${file.name} ไม่สำเร็จ: ${uploadError.message}`);
            }

            const { data: publicUrlData } = supabase.storage
              .from('room-images')
              .getPublicUrl(filePath);

            uploadedUrls.push(publicUrlData.publicUrl);
          }
        }

        // เก็บ URL รูปเดิมที่เคยมีอยู่ (เผื่อกรณีแก้ไข)
        const existingRemoteUrls = u.images.filter(
          (url) => !url.startsWith("blob:") && !url.includes("images.unsplash.com")
        );
        const finalImages = [...existingRemoteUrls, ...uploadedUrls];

        // Insert Room
        const { error: roomError } = await supabase
          .from("rooms")
          .insert({
            building_id: buildingData.building_id,
            room_number: `RM-${Math.floor(Math.random() * 1000)}`,
            listing_title: u.title, // เพิ่มตัวแปร listing_title ตาม SQL
            room_type: u.roomType === "Studio" ? "STUDIO" : u.roomType === "1 Bedroom" ? "1_BEDROOM" : "2_BEDROOM",
            room_size_sqm: u.sizeValue,
            status: u.available ? "AVAILABLE" : "OCCUPIED",
            base_rent_monthly: u.price,
            electric_rate_type: u.electric_rate_type || "GOVERNMENT",
            electric_rate: parseFloat(String(u.electric_rate)) || 0,
            water_rate_type: u.water_rate_type || "GOVERNMENT",
            water_rate: parseFloat(String(u.water_rate)) || 0,
            deposit_months: u.depositMonths,
            min_contract_months: parseInt(u.minimumLease) || 12,
            pet_friendly: u.petFriendly,
            no_smoking: true,
            description: u.description,
            amenities_in_room: u.amenities,
            images: finalImages, // ส่ง URL ที่อัปโหลดเสร็จแล้วเข้าฐานข้อมูล (อย่าลืมสร้างคอลัมน์นี้ใน SQL นะครับ)
          });

        if (roomError) throw roomError;
      }

      await fetchLandlordUnits();
      toast.success(isExisting ? t("dashboard.toastUpdated") : t("dashboard.toastAdded"));
      setEditing(null);
      setCreating(false);
    } catch (error: any) {
      console.error("Supabase Error:", error);
      toast.error(error.message || "Failed to save listing to Supabase.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(deleteId);
      if (isUuid) {
        const { error: rErr } = await supabase
          .from("rooms")
          .delete()
          .eq("room_id", deleteId);

        if (rErr) throw rErr;
      }

      setUnits((arr) => arr.filter((x) => x.id !== deleteId));
      toast.success(t("dashboard.toastDeleted"));
      setDeleteId(null);
    } catch (error: any) {
      console.error("Delete Error:", error);
      toast.error(error.message || "Failed to delete listing from Supabase.");
    }
  };

  const aiTips = [t("dashboard.aiTip1"), t("dashboard.aiTip2"), t("dashboard.aiTip3")];

  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label={t("dashboard.revenueMonth")}
          value="฿245,000"
          trend="+15.3%"
          color="success"
        />
        <StatCard
          icon={Calendar}
          label={t("dashboard.activeBookings")}
          value="128"
          trend="+8.2%"
          color="primary"
        />
        <StatCard
          icon={TrendingUp}
          label={t("dashboard.occupancy")}
          value="89%"
          trend="+6.5%"
          color="cyan"
        />
        <StatCard
          icon={HomeIcon}
          label={t("dashboard.listingsCount")}
          value={String(units.length)}
          color="primary"
        />
      </div>

      <section className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-6">
          <div>
            <h2 className="font-semibold">{t("dashboard.myListings")}</h2>
            <p className="text-xs text-muted-foreground">{t("dashboard.myListingsHint")}</p>
          </div>
          <Button className="gap-2" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> {t("dashboard.addListing")}
          </Button>
        </div>
        <div className="divide-y divide-border">
          {units.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              {t("dashboard.noListingsYet")}
            </div>
          )}
          {units.map((u) => (
            <div
              key={u.id}
              className={`flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap ${!u.available ? "opacity-60" : ""}`}
            >
              <img src={u.image} alt="" className="h-16 w-24 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{u.title}</p>
                  {!u.available && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {t("dashboard.notAvailable")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {u.location} · {u.propertyType} · {u.roomType} ·{" "}
                  {formatRoomSize(u.sizeValue, u.sizeUnit)} · ฿{u.price.toLocaleString()}
                  {t("common.perMonth")}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-brand-cyan/10 px-2 py-0.5 text-[10px] font-medium text-brand-cyan">
                  <Sparkles className="h-3 w-3" /> {t("dashboard.aiSuggest")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PromoteToggle
                  title={u.title}
                  monthlyRent={u.price}
                  promoted={u.promoted}
                  onPromote={() =>
                    setUnits((arr) =>
                      arr.map((x) => (x.id === u.id ? { ...x, promoted: true } : x)),
                    )
                  }
                  onUnpromote={() =>
                    setUnits((arr) =>
                      arr.map((x) => (x.id === u.id ? { ...x, promoted: false } : x)),
                    )
                  }
                />
                <Select
                  value={u.available ? "available" : "unavailable"}
                  onValueChange={(v) =>
                    setUnits((arr) =>
                      arr.map((x) => (x.id === u.id ? { ...x, available: v === "available" } : x)),
                    )
                  }
                >
                  <SelectTrigger className="h-9 w-[150px] gap-1.5 text-xs font-medium">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${u.available ? "bg-success" : "bg-muted-foreground"}`}
                    />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">{t("dashboard.statusAvailable")}</SelectItem>
                    <SelectItem value="unavailable">{t("dashboard.statusUnavailable")}</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setEditing(u)}
                  aria-label={t("common.edit")}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteId(u.id)}
                  aria-label={t("common.delete")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <VerificationPanel verified={verified} onVerify={onVerify} />
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold">{t("dashboard.profile")}</h2>
          <div className="mt-4 space-y-3 text-sm">
            <Row
              label={t("dashboard.verification")}
              value={
                verified ? (
                  <span className="flex items-center gap-1 text-success">
                    <BadgeCheck className="h-3.5 w-3.5" /> {t("dashboard.verified")}
                  </span>
                ) : (
                  <span className="text-muted-foreground">{t("dashboard.unverified")}</span>
                )
              }
            />
            <Row label={t("dashboard.memberSince")} value="2026" />
            <Row label={t("dashboard.bookings")} value="3" />
            <Row label={t("dashboard.reviewsLeft")} value="2" />
          </div>
          <div className="mt-4 flex gap-2">
            <Link to="/profile/$id" params={{ id: "me" }} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                View public profile
              </Button>
            </Link>
            <Link to="/account" className="flex-1">
              <Button size="sm" className="w-full">
                {t("dashboard.editProfile")}
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-1">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">{t("dashboard.aiTips")}</h2>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            {aiTips.map((tip) => (
              <li key={tip} className="flex gap-2 rounded-lg bg-muted/40 p-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {tip}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <ListingFormDialog
        open={creating || !!editing}
        initial={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />
      <DeleteConfirm
        open={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={units.find((u) => u.id === deleteId)?.title}
      />
    </div>
  );
}

function exists(arr: Unit[], id: string) {
  return arr.some((x) => x.id === id);
}

function ListingFormDialog({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: Unit | null;
  onClose: () => void;
  onSave: (u: Unit) => void;
}) {
  const { t } = useTranslation();
  const isEdit = !!initial;
  const [form, setForm] = useState<Unit>(() => {
    const init = initial ? { ...initial } : blankUnit();
    if (!init.electric_rate_type) {
      const ratesStr = init.utilityRates || "";
      if (ratesStr.toLowerCase().includes("electricity ฿") || ratesStr.includes("ค่าไฟ ฿")) {
        init.electric_rate_type = "FIXED";
        const match = ratesStr.match(/(?:Electricity ฿|ค่าไฟ ฿)([\d.]+)/);
        init.electric_rate = match ? parseFloat(match[1]) : 7;
      } else {
        init.electric_rate_type = "GOVERNMENT";
      }
    }
    if (!init.water_rate_type) {
      const ratesStr = init.utilityRates || "";
      if (ratesStr.toLowerCase().includes("water ฿") || ratesStr.includes("ค่าน้ำ ฿") || ratesStr.includes("เหมาจ่าย ฿") || ratesStr.includes("ต่อหน่วย ฿")) {
        init.water_rate_type = "FIXED";
        const match = ratesStr.match(/(?:Water ฿|ค่าน้ำ ฿|เหมาจ่าย ฿|ต่อหน่วย ฿)([\d.]+)/);
        init.water_rate = match ? parseFloat(match[1]) : 18;
      } else {
        init.water_rate_type = "GOVERNMENT";
      }
    }
    return init;
  });
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = initial ? { ...initial } : blankUnit();
    if (!init.electric_rate_type) {
      const ratesStr = init.utilityRates || "";
      if (ratesStr.toLowerCase().includes("electricity ฿") || ratesStr.includes("ค่าไฟ ฿")) {
        init.electric_rate_type = "FIXED";
        const match = ratesStr.match(/(?:Electricity ฿|ค่าไฟ ฿)([\d.]+)/);
        init.electric_rate = match ? parseFloat(match[1]) : 7;
      } else {
        init.electric_rate_type = "GOVERNMENT";
      }
    }
    if (!init.water_rate_type) {
      const ratesStr = init.utilityRates || "";
      if (ratesStr.toLowerCase().includes("water ฿") || ratesStr.includes("ค่าน้ำ ฿") || ratesStr.includes("เหมาจ่าย ฿") || ratesStr.includes("ต่อหน่วย ฿")) {
        init.water_rate_type = "FIXED";
        const match = ratesStr.match(/(?:Water ฿|ค่าน้ำ ฿|เหมาจ่าย ฿|ต่อหน่วย ฿)([\d.]+)/);
        init.water_rate = match ? parseFloat(match[1]) : 18;
      } else {
        init.water_rate_type = "GOVERNMENT";
      }
    }
    setForm(init);
  }, [initial, open]);

  const addImageUrls = (files: FileList | File[] | null) => {
    if (!files || !files.length) return;
    
    const fileArray = Array.from(files as File[]);
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    const validFiles = fileArray.filter(f => {
      if (f.size > MAX_SIZE) {
        toast.error(`ไฟล์ ${f.name} มีขนาดใหญ่เกิน 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setForm((prev) => {
      const currentImages = prev.images.filter(src => src !== defaultThumb);
      const remainingSlots = 5 - currentImages.length;
      
      if (remainingSlots <= 0) {
        toast.error("อัปโหลดได้สูงสุด 5 รูปเท่านั้น");
        return prev;
      }

      const filesToAdd = validFiles.slice(0, remainingSlots);
      if (validFiles.length > remainingSlots) {
        toast.warning(`ระบบเพิ่มได้อีกแค่ ${remainingSlots} รูป (สูงสุด 5 รูป)`);
      }

      const urls = filesToAdd.map((f) => URL.createObjectURL(f));
      const newImages = [...currentImages, ...urls];
      const newImageFiles = [...(prev.imageFiles || []), ...filesToAdd];
      
      return { 
        ...prev, 
        images: newImages, 
        imageFiles: newImageFiles, 
        image: newImages[0] ?? prev.image 
      };
    });
  };

  const removeImageAt = (idx: number) => {
    setForm((prev) => {
      const currentImages = prev.images.filter(src => src !== defaultThumb);
      const target = currentImages[idx];
      if (target?.startsWith("blob:")) URL.revokeObjectURL(target);
      
      const nextImages = currentImages.filter((_, i) => i !== idx);
      const nextFiles = prev.imageFiles ? prev.imageFiles.filter((_, i) => i !== idx) : [];
      
      const finalImages = nextImages.length ? nextImages : [defaultThumb];
      return { ...prev, images: finalImages, imageFiles: nextFiles, image: finalImages[0] };
    });
  };

  const persist = () => {
    const images = form.images.length ? form.images : [defaultThumb];

    const waterStr = form.water_rate_type === "GOVERNMENT"
      ? "Water (Gov Rate)"
      : `Water ฿${form.water_rate || 0}/unit`;

    const electricStr = form.electric_rate_type === "GOVERNMENT"
      ? "Electricity (Gov Rate)"
      : `Electricity ฿${form.electric_rate || 0}/unit`;

    const utilityRates = `${waterStr} · ${electricStr}`;

    onSave({
      ...form,
      bedrooms: roomTypeBedrooms(form.roomType),
      bathrooms: 0,
      sizeUnit: "sqm",
      amenities: form.amenities.filter((a) => a !== "Pet Friendly"),
      images,
      image: images[0],
      id: form.id || `u-${Date.now()}`,
      utilityRates,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("dashboard.form.editTitle") : t("dashboard.form.addTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t("dashboard.form.editDesc") : t("dashboard.form.addDesc")}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          <Field label={t("dashboard.form.title")}>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t("dashboard.form.titlePh")}
            />
          </Field>
          <Field label={t("dashboard.form.description")}>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t("dashboard.form.descPh")}
              className="min-h-[140px] resize-y text-sm leading-relaxed"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("dashboard.form.location")}>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder={t("dashboard.form.locationPh")}
                className="h-10"
              />
            </Field>
            <div className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {t("dashboard.form.propertyType")}
              </span>
              <Select
                value={form.propertyType}
                onValueChange={(propertyType) => setForm({ ...form, propertyType })}
              >
                <SelectTrigger className="h-10 w-full rounded-md border-input bg-background shadow-sm">
                  <SelectValue placeholder={t("dashboard.form.propertyTypePh")} />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {t("dashboard.form.roomType")}
              </span>
              <Select
                value={form.roomType}
                onValueChange={(roomType) =>
                  setForm({
                    ...form,
                    roomType: roomType as RoomTypeOption,
                    bedrooms: roomTypeBedrooms(roomType as RoomTypeOption),
                    bathrooms: 0,
                  })
                }
              >
                <SelectTrigger className="h-10 w-full rounded-md border-input bg-background shadow-sm">
                  <SelectValue placeholder={t("dashboard.form.roomTypePh")} />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {t(`dashboard.form.roomTypeOptions.${opt}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Field label={t("dashboard.form.roomSize")}>
              <Input
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                className="h-10"
                placeholder={t("dashboard.form.roomSizePh")}
                value={form.sizeValue === 0 ? "" : form.sizeValue}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  setForm({
                    ...form,
                    sizeValue: Number.isNaN(raw) ? 0 : Math.max(0, raw),
                    sizeUnit: "sqm",
                  });
                }}
              />
            </Field>
          </div>

          <div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {t("dashboard.form.roomSizeHint")}{" "}
              <span className="font-medium text-foreground">{t("dashboard.form.roomSizeEx1")}</span>
              .
            </p>
          </div>

          <Field label={t("dashboard.form.monthlyRent")}>
            <Input
              type="number"
              min={0}
              className="h-10"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {t("dashboard.form.roomStatus")}
              </span>
              <Select
                value={form.available ? "available" : "occupied"}
                onValueChange={(v) => setForm({ ...form, available: v === "available" })}
              >
                <SelectTrigger className="h-10 w-full rounded-md border-input bg-background shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">{t("dashboard.form.statusAvailable")}</SelectItem>
                  <SelectItem value="occupied">{t("dashboard.form.statusOccupied")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {t("dashboard.form.petFriendly")}
              </span>
              <Select
                value={form.petFriendly ? "yes" : "no"}
                onValueChange={(v) => setForm({ ...form, petFriendly: v === "yes" })}
              >
                <SelectTrigger className="h-10 w-full rounded-md border-input bg-background shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">{t("dashboard.form.petFriendlyYes")}</SelectItem>
                  <SelectItem value="no">{t("dashboard.form.petFriendlyNo")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("dashboard.form.minimumLease")}>
              <Input
                className="h-10"
                value={form.minimumLease}
                onChange={(e) => setForm({ ...form, minimumLease: e.target.value })}
                placeholder={t("dashboard.form.minimumLeasePh")}
              />
            </Field>
            <div>
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {t("dashboard.form.depositMonths")}
              </span>
              <Select
                value={String(form.depositMonths)}
                onValueChange={(v) => setForm({ ...form, depositMonths: Number(v) as 1 | 2 })}
              >
                <SelectTrigger className="h-10 w-full rounded-md border-input bg-background shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t("dashboard.form.depositOne")}</SelectItem>
                  <SelectItem value="2">{t("dashboard.form.depositTwo")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
            <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("dashboard.form.utilityRates")}
            </span>

            {/* ค่าไฟ (Electricity) */}
            <div className="space-y-3">
              <span className="block text-xs font-semibold text-foreground">
                ค่าไฟ (Electricity Rate)
              </span>
              <RadioGroup
                value={form.electric_rate_type}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    electric_rate_type: v as "GOVERNMENT" | "FIXED",
                    electric_rate: v === "GOVERNMENT" ? "" : form.electric_rate || "",
                  })
                }
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="GOVERNMENT" id="electric-gov" />
                  <Label htmlFor="electric-gov" className="cursor-pointer text-sm font-normal">
                    เรทการไฟฟ้า (ไฟหลวง)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="FIXED" id="electric-fixed" />
                  <Label htmlFor="electric-fixed" className="cursor-pointer text-sm font-normal">
                    เรทหอพัก/คอนโด (Fixed Rate)
                  </Label>
                </div>
              </RadioGroup>

              <AnimatePresence initial={false}>
                {form.electric_rate_type === "FIXED" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2">
                      <Label htmlFor="electric-rate-input" className="mb-1.5 block text-xs text-muted-foreground">
                        ค่าไฟต่อหน่วย (บาท)
                      </Label>
                      <Input
                        id="electric-rate-input"
                        type="text"
                        inputMode="decimal"
                        className="h-10"
                        placeholder="เช่น 7.00"
                        value={form.electric_rate ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || /^\d*\.?\d*$/.test(val)) {
                            setForm({ ...form, electric_rate: val });
                          }
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <hr className="border-border/60" />

            {/* ค่าน้ำ (Water) */}
            <div className="space-y-3">
              <span className="block text-xs font-semibold text-foreground">
                ค่าน้ำ (Water Rate)
              </span>
              <RadioGroup
                value={form.water_rate_type}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    water_rate_type: v as "GOVERNMENT" | "FIXED",
                    water_rate: v === "GOVERNMENT" ? "" : form.water_rate || "",
                  })
                }
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="GOVERNMENT" id="water-gov" />
                  <Label htmlFor="water-gov" className="cursor-pointer text-sm font-normal">
                    เรทการประปา
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="FIXED" id="water-fixed" />
                  <Label htmlFor="water-fixed" className="cursor-pointer text-sm font-normal">
                    เรทเหมาจ่าย/ต่อหน่วย
                  </Label>
                </div>
              </RadioGroup>

              <AnimatePresence initial={false}>
                {form.water_rate_type === "FIXED" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2">
                      <Label htmlFor="water-rate-input" className="mb-1.5 block text-xs text-muted-foreground">
                        ค่าน้ำ (บาท)
                      </Label>
                      <Input
                        id="water-rate-input"
                        type="text"
                        inputMode="decimal"
                        className="h-10"
                        placeholder="เช่น 18.00"
                        value={form.water_rate ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || /^\d*\.?\d*$/.test(val)) {
                            setForm({ ...form, water_rate: val });
                          }
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AmenitiesPicker
              label={t("dashboard.form.inUnitAmenities")}
              options={IN_UNIT_AMENITY_OPTIONS}
              value={form.amenities}
              onChange={(amenities) => setForm({ ...form, amenities })}
            />
            <AmenitiesPicker
              label={t("dashboard.form.buildingAmenities")}
              options={BUILDING_AMENITY_OPTIONS}
              value={form.amenities}
              onChange={(amenities) => setForm({ ...form, amenities })}
            />
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
              {t("dashboard.form.photos")}
            </span>
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileRef.current?.click();
                }
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                addImageUrls(e.dataTransfer.files);
              }}
              onClick={() => fileRef.current?.click()}
              className={cn(
                "cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors",
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/50",
              )}
            >
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-foreground">
                {t("dashboard.form.dropPhotos")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">สูงสุด 5 รูป / รูปละไม่เกิน 5MB (PNG, JPG, WEBP)</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  addImageUrls(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {form.images.map((src, idx) => (
                <div
                  key={`${src}-${idx}`}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted"
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImageAt(idx);
                    }}
                    className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-background/95 text-foreground shadow-md ring-1 ring-border/60 transition-colors hover:bg-destructive hover:text-destructive-foreground"
                    aria-label={t("dashboard.form.removeImage")}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 border-t border-border pt-4 sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={persist}
            disabled={!form.title.trim() || form.price <= 0 || form.sizeValue <= 0}
          >
            {isEdit ? t("dashboard.form.saveChanges") : t("dashboard.form.createListing")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function blankUnit(): Unit {
  return {
    id: "",
    title: "",
    location: "",
    propertyType: "Condo",
    roomType: "1 Bedroom",
    bedrooms: 1,
    bathrooms: 0,
    sizeValue: 32,
    sizeUnit: "sqm",
    price: 15000,
    image: defaultThumb,
    images: [defaultThumb],
    description: "",
    amenities: [],
    petFriendly: false,
    minimumLease: "12 months",
    depositMonths: 2,
    utilityRates: "",
    available: true,
    promoted: false,
    electric_rate_type: "GOVERNMENT",
    electric_rate: undefined,
    water_rate_type: "GOVERNMENT",
    water_rate: undefined,
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function DeleteConfirm({
  open,
  onCancel,
  onConfirm,
  title,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
}) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("dashboard.deleteTitle")}</DialogTitle>
          <DialogDescription>{t("dashboard.deleteDesc", { title: title ?? "" })}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="gap-2">
            <Trash2 className="h-4 w-4" /> {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PromoteToggle({
  title,
  monthlyRent,
  promoted,
  onPromote,
  onUnpromote,
}: {
  title: string;
  monthlyRent: number;
  promoted: boolean;
  onPromote: () => void;
  onUnpromote: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => (promoted ? onUnpromote() : setOpen(true))}
        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${promoted
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/70"
          }`}
      >
        <Sparkles className="h-3 w-3" />{" "}
        {promoted ? t("dashboard.promoted") : t("dashboard.promote")}
      </button>
      <PromoteModal
        open={open}
        onClose={() => setOpen(false)}
        monthlyRent={monthlyRent}
        listingTitle={title}
        onConfirm={(pkg: PromotePackage, price: number) => {
          onPromote();
          setOpen(false);
          toast.success(
            t("dashboard.promoteSuccess", {
              days: pkg.days,
              price: Math.round(price).toLocaleString(),
            }),
          );
        }}
      />
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
