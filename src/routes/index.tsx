import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Search,
  MapPin,
  Wallet,
  Home as HomeIcon,
  ShieldCheck,
  Sparkles,
  Zap,
  ArrowRight,
  Star,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PawPrint,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { listings } from "@/lib/mock-data";
import { PropertyCard, PropertyCardSkeleton } from "@/components/PropertyCard";
import { bestMatchIds, sortByMatchScore, scoreListing } from "@/lib/listing-match";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { BarChart, Bar, Cell, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { fetchSupabaseListings } from "@/lib/supabase-listings";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Modern Trust — Find your perfect place" },
      {
        name: "description",
        content:
          "Discover verified rentals in Bangkok. Smart search, transparent pricing, AI-powered recommendations.",
      },
      { property: "og:title", content: "Modern Trust — Find your perfect place" },
      {
        property: "og:description",
        content: "Verified rentals in Bangkok with AI-powered search.",
      },
    ],
  }),
});

function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useApp();
  const IN_UNIT_AMENITIES: { key: string; label: string }[] = [
    { key: "ac", label: t("landing.amAc") },
    { key: "fan", label: t("landing.amFan") },
    { key: "cableTv", label: t("landing.amCableTv") },
    { key: "fridge", label: t("landing.amFridge") },
    { key: "furniture", label: t("landing.amFurniture") },
    { key: "waterHeater", label: t("landing.amWaterHeater") },
    { key: "wifi", label: t("landing.amWifi") },
    { key: "sofa", label: t("landing.amSofa") },
    { key: "deskChair", label: t("landing.amDeskChair") },
    { key: "stove", label: t("landing.amStove") },
  ];
  const BUILDING_AMENITIES: { key: string; label: string }[] = [
    { key: "keycard", label: t("landing.amKeycard") },
    { key: "fingerprint", label: t("landing.amFingerprint") },
    { key: "security", label: t("landing.amSecurity") },
    { key: "cctv", label: t("landing.amCctv") },
    { key: "bikeParking", label: t("landing.amBikeParking") },
    { key: "carParking", label: t("landing.amCarParking") },
    { key: "pool", label: t("landing.amPool") },
    { key: "fitness", label: t("landing.amFitness") },
    { key: "laundryShop", label: t("landing.amLaundryShop") },
    { key: "salon", label: t("landing.amSalon") },
    { key: "elevator", label: t("landing.amElevator") },
    { key: "shop", label: t("landing.amShop") },
    { key: "restaurant", label: t("landing.amRestaurant") },
    { key: "evCharge", label: t("landing.amEvCharge") },
  ];

  const [q, setQ] = useState({
    location: "",
    date: "",
    budget: "any",
    room: "any",
    propertyType: "any",
    pet: false,
    lease: "" as "" | "1y" | "under1y",
    amenities: [] as string[],
    maxDistance: 99.0,
  });
  const [submittedQuery, setSubmittedQuery] = useState<typeof q | null>(null);

  const activeQuery = useMemo(() => {
    return submittedQuery || {
      location: "",
      date: "",
      budget: "any",
      room: "any",
      propertyType: "any",
      pet: false,
      lease: "" as "" | "1y" | "under1y",
      amenities: [] as string[],
      maxDistance: 99.0,
    };
  }, [submittedQuery]);

  const [showMore, setShowMore] = useState(false);
  const { data: dbListings = [], isLoading } = useQuery({
    queryKey: ["supabase-listings"],
    queryFn: fetchSupabaseListings,
  });
  const loading = isLoading;

  const combinedListings = useMemo(() => {
    return dbListings;
  }, [dbListings]);
  const [minPrice, maxPrice] = useMemo(() => {
    if (q.budget === "any") return [0, 50000];
    const [min, max] = q.budget.split("-").map(Number);
    return [min ?? 0, max ?? 50000];
  }, [q.budget]);

  const [localRange, setLocalRange] = useState<[number, number]>([minPrice, maxPrice]);

  useMemo(() => {
    if (localRange[0] !== minPrice || localRange[1] !== maxPrice) {
      setLocalRange([minPrice, maxPrice]);
    }
  }, [minPrice, maxPrice]);

  const histogramData = useMemo(() => {
    const bins: { price: number; count: number }[] = [];
    const peak = 18000;
    const stdDev = 8000;
    for (let i = 0; i <= 25; i++) {
      const price = i * 2000;
      const exponent = -Math.pow(price - peak, 2) / (2 * Math.pow(stdDev, 2));
      const count = Math.round(35 * Math.exp(exponent));
      const adjustedCount = Math.max(1, count);
      bins.push({ price, count: adjustedCount });
    }
    return bins;
  }, []);

  const handleSliderChange = (val: number[]) => {
    if (val.length === 2) {
      setLocalRange([val[0], val[1]]);
      setQ((prev) => ({ ...prev, budget: `${val[0]}-${val[1]}` }));
    }
  };

  const getBudgetLabel = (budget: string) => {
    if (budget === "any") return t("landing.budgetAny");
    const [min, max] = budget.split("-").map(Number);
    if (min === 0 && max === 50000) return t("landing.budgetAny");
    return `${min.toLocaleString()} - ${max >= 50000 ? "50,000+" : max.toLocaleString()} ฿`;
  };

  const toggleAmenity = (a: string) =>
    setQ((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter((x) => x !== a)
        : [...prev.amenities, a],
    }));

  const filtered = useMemo(() => {
    return combinedListings.filter((l) => {
      if (!l.available) return false;
      if (activeQuery.location && !l.location.toLowerCase().includes(activeQuery.location.toLowerCase())) return false;
      if (activeQuery.room !== "any" && l.roomType !== activeQuery.room) return false;
      if (activeQuery.propertyType !== "any" && l.propertyType !== activeQuery.propertyType) return false;
      if (activeQuery.budget !== "any") {
        const [min, max] = activeQuery.budget.split("-").map(Number);
        if (l.price < min || (max && l.price > max)) return false;
      }
      if (activeQuery.pet && !l.amenities.includes("Pet Friendly")) return false;
      if (activeQuery.maxDistance !== 99 && l.distance !== undefined && l.distance > activeQuery.maxDistance) return false;
      return true;
    });
  }, [combinedListings, activeQuery]);

  const sortedFiltered = useMemo(() => {
    return sortByMatchScore(filtered, activeQuery);
  }, [filtered, activeQuery]);

  const bestMatches = useMemo(() => {
    return sortedFiltered.slice(0, 3);
  }, [sortedFiltered]);

  const bestMatchIdsSet = useMemo(() => {
    return new Set(bestMatches.map((m) => m.id));
  }, [bestMatches]);

  const generalListings = useMemo(() => {
    // 1. Get all available listings
    const availableListings = combinedListings.filter((l) => l.available);

    // 2. Classify each listing into Group 1, 2, or 3
    const classified = availableListings.map((l) => {
      const score = scoreListing(l, activeQuery);
      
      let group = 3;
      if (l.promoted) {
        group = 1;
      } else {
        const matchesLocation = !activeQuery.location || l.location.toLowerCase().includes(activeQuery.location.toLowerCase());
        if (matchesLocation) {
          group = 2;
        } else {
          group = 3;
        }
      }

      return { listing: l, group, score };
    });

    // 3. Filter out regular listings that are already in best matches (to avoid duplicates)
    const filteredClassified = classified.filter((item) => {
      if (!item.listing.promoted && bestMatchIdsSet.has(item.listing.id)) {
        return false;
      }
      return true;
    });

    // 4. Sort by Group ascending, then by Match Score descending
    filteredClassified.sort((a, b) => {
      if (a.group !== b.group) {
        return a.group - b.group;
      }
      return b.score - a.score;
    });

    // 5. Return the sorted listings
    return filteredClassified.map((item) => item.listing);
  }, [combinedListings, activeQuery, bestMatchIdsSet]);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [submittedQuery, combinedListings]);

  const itemsPerPage = 12;
  const totalPages = Math.ceil(generalListings.length / itemsPerPage);

  const paginatedGeneralListings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return generalListings.slice(start, start + itemsPerPage);
  }, [generalListings, currentPage]);


  const testimonials = [
    {
      name: "Praew T.",
      roleKey: "testimonial1Role" as const,
      textKey: "testimonial1Text" as const,
    },
    {
      name: "Khun Som",
      roleKey: "testimonial2Role" as const,
      textKey: "testimonial2Text" as const,
    },
    { name: "Mike L.", roleKey: "testimonial3Role" as const, textKey: "testimonial3Text" as const },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-brand-cyan/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" /> {t("landing.heroBadge")}
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              {t("landing.heroTitle1")}{" "}
              <span className="text-brand-gradient">{t("landing.heroTitleAccent")}</span>
              <br className="hidden sm:block" /> {t("landing.heroTitle2")}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              {t("landing.heroSubtitle")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mx-auto mt-10 max-w-5xl rounded-2xl border border-border bg-card p-2 shadow-card sm:p-3"
          >
            <div className="grid gap-2 md:grid-cols-[1.4fr_1fr_1fr_auto]">
              <Field icon={<MapPin className="h-4 w-4" />} label={t("landing.searchLocation")}>
                <input
                  value={q.location}
                  onChange={(e) => setQ({ ...q, location: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (!user) {
                        void navigate({ to: "/login" });
                        return;
                      }
                      if (!q.location.trim()) {
                        toast.error(t("landing.toastLocationRequired"));
                        return;
                      }
                      setSubmittedQuery({ ...q });
                      const el = document.getElementById("recommended");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  placeholder={t("landing.searchPlaceholderLocation")}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </Field>
              <Field icon={<Wallet className="h-4 w-4" />} label={t("landing.searchBudget")}>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full text-left bg-transparent text-sm outline-none flex items-center justify-between font-semibold text-foreground cursor-pointer"
                    >
                      <span>{getBudgetLabel(q.budget)}</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[340px] sm:w-[380px] p-5 rounded-2xl bg-card border shadow-xl space-y-4" align="start" sideOffset={12}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-sm">{t("landing.priceRange")}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setQ((prev) => ({ ...prev, budget: "any" }));
                          setLocalRange([0, 50000]);
                        }}
                        className="text-xs text-blue-500 hover:text-blue-600 transition-colors underline font-medium cursor-pointer"
                      >
                        {t("landing.clear")}
                      </button>
                    </div>

                    {/* Histogram chart */}
                    <div className="h-20 w-full flex items-end px-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={histogramData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                          <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                            {histogramData.map((entry, index) => {
                              const isActive = entry.price >= localRange[0] && entry.price <= localRange[1];
                              return (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={isActive ? "#3b82f6" : "#e2e8f0"}
                                  className="transition-colors duration-150"
                                />
                              );
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Double thumb slider */}
                    <div className="px-1">
                      <Slider
                        min={0}
                        max={50000}
                        step={1000}
                        value={[localRange[0], localRange[1]]}
                        onValueChange={handleSliderChange}
                        className="w-full"
                      />
                    </div>

                    {/* Min/Max input boxes */}
                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex-1 rounded-xl border border-border bg-muted/20 px-3 py-2">
                        <span className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                          {t("landing.startPrice")}
                        </span>
                        <input
                          type="number"
                          value={localRange[0]}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(50000, Number(e.target.value) || 0));
                            setLocalRange([val, localRange[1]]);
                            setQ((prev) => ({ ...prev, budget: `${val}-${localRange[1]}` }));
                          }}
                          className="w-full bg-transparent text-sm font-semibold outline-none text-foreground"
                        />
                      </div>
                      <span className="text-muted-foreground font-semibold">-</span>
                      <div className="flex-1 rounded-xl border border-border bg-muted/20 px-3 py-2">
                        <span className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                          {t("landing.endPrice")}
                        </span>
                        <input
                          type="number"
                          value={localRange[1]}
                          onChange={(e) => {
                            const val = Math.max(localRange[0], Math.min(50000, Number(e.target.value) || 0));
                            setLocalRange([localRange[0], val]);
                            setQ((prev) => ({ ...prev, budget: `${localRange[0]}-${val}` }));
                          }}
                          className="w-full bg-transparent text-sm font-semibold outline-none text-foreground"
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </Field>
              <Field
                icon={<HomeIcon className="h-4 w-4" />}
                label={t("landing.searchPropertyType")}
              >
                <select
                  value={q.propertyType}
                  onChange={(e) => setQ({ ...q, propertyType: e.target.value })}
                  className="w-full bg-transparent text-sm outline-none"
                >
                  <option value="any">{t("landing.propAny")}</option>
                  <option value="Condo">{t("landing.propCondo")}</option>
                  <option value="Apartment">{t("landing.propApartment")}</option>
                  <option value="Dormitory">{t("landing.propDorm")}</option>
                  <option value="House">{t("landing.propHouse")}</option>
                </select>
              </Field>
              <Button
                size="lg"
                className="h-12 w-full gap-2 px-6 text-base font-semibold md:h-full md:w-auto"
                onClick={() => {
                  if (!user) {
                    void navigate({ to: "/login" });
                    return;
                  }
                  if (!q.location.trim()) {
                    toast.error(t("landing.toastLocationRequired"));
                    return;
                  }
                  setSubmittedQuery({ ...q });
                  const el = document.getElementById("recommended");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                <Search className="h-5 w-5" /> {t("landing.findRoom")}
              </Button>
            </div>

            <div className="mt-2 flex justify-center">
              <button
                type="button"
                onClick={() => setShowMore((v) => !v)}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
              >
                {showMore ? t("landing.hideMoreOptions") : t("landing.moreOptions")}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${showMore ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            <AnimatePresence initial={false}>
              {showMore && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-6 border-t border-border px-2 pb-2 pt-4 sm:px-3 md:grid-cols-4">
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <HomeIcon className="h-3.5 w-3.5 text-primary" /> {t("landing.roomLayout")}
                      </div>
                      <div className="space-y-1.5">
                        {[
                          { v: "Studio", label: t("landing.roomStudio") },
                          { v: "1 Bedroom", label: t("landing.room1br") },
                          { v: "2 Bedroom", label: t("landing.room2br") },
                        ].map((opt) => (
                          <label
                            key={opt.v}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                          >
                            <input
                              type="radio"
                              name="roomLayout"
                              checked={q.room === opt.v}
                              onChange={() => setQ({ ...q, room: opt.v })}
                              className="h-3.5 w-3.5 accent-primary"
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <PawPrint className="h-3.5 w-3.5 text-primary" /> {t("landing.petPolicy")}
                      </div>
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                           type="checkbox"
                           checked={q.pet}
                           onChange={(e) => setQ({ ...q, pet: e.target.checked })}
                           className="h-3.5 w-3.5 accent-primary"
                        />
                        {t("landing.petFriendlyOnly")}
                      </label>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <FileText className="h-3.5 w-3.5 text-primary" /> {t("landing.leaseTerm")}
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                        {[
                          { v: "1y", label: t("landing.lease1y") },
                          { v: "under1y", label: t("landing.leaseUnder1y") },
                        ].map((opt) => (
                          <label
                            key={opt.v}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                          >
                            <input
                              type="radio"
                              name="lease"
                              checked={q.lease === opt.v}
                              onChange={() => setQ({ ...q, lease: opt.v as typeof q.lease })}
                              className="h-3.5 w-3.5 accent-primary"
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-primary" /> {t("landing.maxDistance")}
                      </div>
                      <div className="relative">
                        <select
                          value={q.maxDistance}
                          onChange={(e) => setQ({ ...q, maxDistance: Number(e.target.value) })}
                          className="w-full rounded-xl border border-border bg-muted/20 hover:bg-muted/30 px-3 py-2 text-sm outline-none focus:border-primary focus:bg-background text-foreground transition-all font-semibold cursor-pointer appearance-none pr-8"
                        >
                          <option value={99.0}>{t("landing.distAny")}</option>
                          <option value={1.0}>{t("landing.distClose")}</option>
                          <option value={5.0}>{t("landing.distConvenient")}</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none opacity-50" />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 px-2 pb-3 pt-4 sm:px-3 md:grid-cols-2">
                    <div>
                      <div className="mb-2 inline-flex items-center rounded-md bg-brand-cyan/10 px-2 py-1 text-xs font-semibold text-brand-cyan">
                        {t("landing.inUnitAmenities")}
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                        {IN_UNIT_AMENITIES.map((a) => (
                          <label
                            key={a.key}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={q.amenities.includes(a.key)}
                              onChange={() => toggleAmenity(a.key)}
                              className="h-3.5 w-3.5 accent-brand-cyan"
                            />
                            {a.label}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                        {t("landing.buildingAmenities")}
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                        {BUILDING_AMENITIES.map((a) => (
                          <label
                            key={a.key}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={q.amenities.includes(a.key)}
                              onChange={() => toggleAmenity(a.key)}
                              className="h-3.5 w-3.5 accent-primary"
                            />
                            {a.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-6 text-center sm:grid-cols-4">
            {[
              ["12,400+", t("landing.trustListings")],
              ["4.9★", t("landing.trustRating")],
              ["100%", t("landing.trustHosts")],
              ["24/7", t("landing.trustAi")],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="text-xl font-bold text-foreground sm:text-2xl">{n}</div>
                <div className="text-xs text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="recommended"
        className="scroll-mt-20 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <Search className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-medium">{t("landing.noMatchesTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("landing.noMatchesHint")}</p>
          </div>
        ) : (
          <div className="space-y-16">
            {submittedQuery !== null && bestMatches.length > 0 && (
              <div className="relative rounded-3xl border border-primary/20 dark:border-primary/30 bg-muted/20 p-6 md:p-8 shadow-glow overflow-hidden">
                {/* Subtle background decoration */}
                <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-primary/15 dark:bg-primary/25 blur-2xl pointer-events-none" />
                <div className="absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-brand-cyan/15 dark:bg-brand-cyan/25 blur-2xl pointer-events-none" />

                <div className="relative flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary backdrop-blur-sm">
                      <Sparkles className="h-3.5 w-3.5 animate-pulse" /> {t("landing.personalized")}
                    </div>
                    <h2 className="mt-3 text-2xl font-bold sm:text-3xl text-foreground">
                      {t("landing.matchingTitle")}
                    </h2>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {t("landing.matchingCount", { count: bestMatches.length })}
                      {t("landing.matchingPromotedNote")}
                    </p>
                  </div>
                </div>
                <div className="relative mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {bestMatches.map((l, i) => (
                    <PropertyCard key={l.id} listing={l} index={i} bestMatch={true} />
                  ))}
                </div>
              </div>
            )}

            {generalListings.length > 0 && (
              <div className="space-y-8">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold sm:text-3xl text-foreground">
                      {t("landing.generalTitle")}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("landing.generalDesc")} ({t("landing.matchingCount", { count: generalListings.length })})
                    </p>
                  </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedGeneralListings.map((l, i) => (
                    <PropertyCard key={l.id} listing={l} index={i} bestMatch={false} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setCurrentPage((p) => Math.max(1, p - 1));
                        document.getElementById("recommended")?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      disabled={currentPage === 1}
                      className="h-10 w-10 rounded-xl border border-border bg-card text-foreground transition-all hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      const isActive = currentPage === pageNum;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setCurrentPage(pageNum);
                            document.getElementById("recommended")?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }}
                          className={`h-10 min-w-10 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 ${
                            isActive
                              ? "bg-primary text-primary-foreground shadow-sm font-bold"
                              : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                        document.getElementById("recommended")?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      disabled={currentPage === totalPages}
                      className="h-10 w-10 rounded-xl border-border bg-card text-foreground transition-all hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="border-t border-border bg-muted/30 py-20" id="pricing">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">{t("landing.valueTitle")}</h2>
            <p className="mt-3 text-muted-foreground">{t("landing.valueSubtitle")}</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                titleKey: "valueHostsTitle" as const,
                descKey: "valueHostsDesc" as const,
              },
              {
                icon: Sparkles,
                titleKey: "valueAiTitle" as const,
                descKey: "valueAiDesc" as const,
              },
              { icon: Zap, titleKey: "valueBookTitle" as const, descKey: "valueBookDesc" as const },
            ].map((f) => (
              <motion.div
                key={f.titleKey}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{t(`landing.${f.titleKey}`)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(`landing.${f.descKey}`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-10 text-white sm:p-16">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">{t("landing.ctaTitle")}</h2>
              <p className="mt-3 text-white/80">{t("landing.ctaSubtitle")}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/register">
                  <Button size="lg" className="bg-white text-brand-navy hover:bg-white/90">
                    {t("landing.ctaHost")} <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                  >
                    {t("landing.ctaDashboard")}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["฿245K", t("landing.ctaStat1")],
                ["89%", t("landing.ctaStat2")],
                ["4.9★", t("landing.ctaStat3")],
                ["2,341", t("landing.ctaStat4")],
              ].map(([n, l]) => (
                <div key={l} className="rounded-xl bg-white/10 p-4 backdrop-blur">
                  <div className="text-2xl font-bold">{n}</div>
                  <div className="mt-1 text-xs text-white/70">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">{t("landing.testimonialsTitle")}</h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {t("landing.testimonialsSubtitle")}
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((row) => (
            <div key={row.name} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex gap-0.5 text-warning">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-3 text-sm text-foreground">
                &ldquo;{t(`landing.${row.textKey}`)}&rdquo;
              </p>
              <div className="mt-4 text-sm">
                <div className="font-semibold">{row.name}</div>
                <div className="text-muted-foreground">{t(`landing.${row.roleKey}`)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-transparent bg-muted/40 px-3 py-2 transition-colors focus-within:border-primary focus-within:bg-background">
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {children}
      </span>
    </div>
  );
}
