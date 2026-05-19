import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, MapPin, Wallet, Home as HomeIcon, ShieldCheck, Sparkles, Zap, ArrowRight, Star, ChevronDown, PawPrint, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listings } from "@/lib/mock-data";
import { PropertyCard, PropertyCardSkeleton } from "@/components/PropertyCard";
import { bestMatchIds, sortByMatchScore } from "@/lib/listing-match";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Modern Trust — Find your perfect place" },
      { name: "description", content: "Discover verified rentals in Bangkok. Smart search, transparent pricing, AI-powered recommendations." },
      { property: "og:title", content: "Modern Trust — Find your perfect place" },
      { property: "og:description", content: "Verified rentals in Bangkok with AI-powered search." },
    ],
  }),
});

function Landing() {
  const { t } = useTranslation();
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
    pet: false,
    lease: "any" as "any" | "1y" | "under1y",
    amenities: [] as string[],
  });
  const [showMore, setShowMore] = useState(false);
  const [loading] = useState(false);

  const toggleAmenity = (a: string) =>
    setQ((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter((x) => x !== a)
        : [...prev.amenities, a],
    }));

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (!l.available) return false;
      if (q.location && !l.location.toLowerCase().includes(q.location.toLowerCase())) return false;
      if (q.room !== "any" && l.roomType !== q.room) return false;
      if (q.budget !== "any") {
        const [min, max] = q.budget.split("-").map(Number);
        if (l.price < min || (max && l.price > max)) return false;
      }
      if (q.pet && !l.amenities.includes("Pet Friendly")) return false;
      return true;
    });
  }, [q]);

  const matchIds = useMemo(() => bestMatchIds(filtered, q, 3), [filtered, q]);

  const recommendedForYou = useMemo(
    () => sortByMatchScore(filtered.filter((l) => l.promoted && l.available), q),
    [filtered, q],
  );

  const browseListings = useMemo(() => filtered.filter((l) => !(l.promoted && l.available)), [filtered]);

  const testimonials = [
    { name: "Praew T.", roleKey: "testimonial1Role" as const, textKey: "testimonial1Text" as const },
    { name: "Khun Som", roleKey: "testimonial2Role" as const, textKey: "testimonial2Text" as const },
    { name: "Mike L.", roleKey: "testimonial3Role" as const, textKey: "testimonial3Text" as const },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-brand-cyan/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pt-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" /> {t("landing.heroBadge")}
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              {t("landing.heroTitle1")} <span className="text-brand-gradient">{t("landing.heroTitleAccent")}</span>
              <br className="hidden sm:block" /> {t("landing.heroTitle2")}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">{t("landing.heroSubtitle")}</p>
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
                  placeholder={t("landing.searchPlaceholderLocation")}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </Field>
              <Field icon={<Wallet className="h-4 w-4" />} label={t("landing.searchBudget")}>
                <select
                  value={q.budget}
                  onChange={(e) => setQ({ ...q, budget: e.target.value })}
                  className="w-full bg-transparent text-sm outline-none"
                >
                  <option value="any">{t("landing.budgetAny")}</option>
                  <option value="0-15000">{t("landing.budgetUnder15")}</option>
                  <option value="15000-20000">{t("landing.budget1520")}</option>
                  <option value="20000-30000">{t("landing.budget2030")}</option>
                  <option value="30000-99999">{t("landing.budget30plus")}</option>
                </select>
              </Field>
              <Field icon={<HomeIcon className="h-4 w-4" />} label={t("landing.searchPropertyType")}>
                <select
                  value={q.room}
                  onChange={(e) => setQ({ ...q, room: e.target.value })}
                  className="w-full bg-transparent text-sm outline-none"
                >
                  <option value="any">{t("landing.roomAny")}</option>
                  <option>{t("landing.roomStudio")}</option>
                  <option>{t("landing.room1br")}</option>
                  <option>{t("landing.room2br")}</option>
                </select>
              </Field>
              <Button
                size="lg"
                className="h-12 w-full gap-2 px-6 text-base font-semibold md:h-full md:w-auto"
                onClick={() => {
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
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showMore ? "rotate-180" : ""}`} />
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
                  <div className="grid gap-6 border-t border-border px-2 pb-2 pt-4 sm:px-3 md:grid-cols-3">
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <HomeIcon className="h-3.5 w-3.5 text-primary" /> {t("landing.roomLayout")}
                      </div>
                      <div className="space-y-1.5">
                        {[
                          { v: "Studio", label: t("landing.roomStudio") },
                          { v: "1 Bedroom", label: t("landing.room1br") },
                          { v: "2 Bedroom", label: t("landing.room2br") },
                          { v: "3+ Bedroom", label: t("landing.room3br") },
                        ].map((opt) => (
                          <label key={opt.v} className="flex cursor-pointer items-center gap-2 text-sm">
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
                      <div className="space-y-1.5">
                        {[
                          { v: "any", label: t("landing.leaseAny") },
                          { v: "1y", label: t("landing.lease1y") },
                          { v: "under1y", label: t("landing.leaseUnder1y") },
                        ].map((opt) => (
                          <label key={opt.v} className="flex cursor-pointer items-center gap-2 text-sm">
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
                  </div>

                  <div className="grid gap-6 px-2 pb-3 pt-4 sm:px-3 md:grid-cols-2">
                    <div>
                      <div className="mb-2 inline-flex items-center rounded-md bg-success/10 px-2 py-1 text-xs font-semibold text-success">
                        {t("landing.inUnitAmenities")}
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                        {IN_UNIT_AMENITIES.map((a) => (
                          <label key={a.key} className="flex cursor-pointer items-center gap-2 text-sm">
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
                    <div>
                      <div className="mb-2 inline-flex items-center rounded-md bg-success/10 px-2 py-1 text-xs font-semibold text-success">
                        {t("landing.buildingAmenities")}
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                        {BUILDING_AMENITIES.map((a) => (
                          <label key={a.key} className="flex cursor-pointer items-center gap-2 text-sm">
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

      <section id="recommended" className="scroll-mt-20 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
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
            {recommendedForYou.length > 0 && (
              <div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                      <Sparkles className="h-3.5 w-3.5" /> {t("landing.personalized")}
                    </div>
                    <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{t("landing.recommendedTitle")}</h2>
                    <p className="mt-1 max-w-xl text-sm text-muted-foreground">{t("landing.recommendedDesc")}</p>
                  </div>
                </div>
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {recommendedForYou.map((l, i) => (
                    <PropertyCard key={l.id} listing={l} index={i} bestMatch={matchIds.has(l.id)} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold sm:text-3xl">{t("landing.matchingTitle")}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("landing.matchingCount", { count: browseListings.length })}
                    {recommendedForYou.length > 0 && t("landing.matchingPromotedNote")}
                  </p>
                </div>
                <Link to="/" className="hidden shrink-0 text-sm font-medium text-primary hover:underline sm:inline">
                  {t("common.viewAll")}
                </Link>
              </div>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {browseListings.length === 0 ? (
                  <div className="col-span-full rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
                    {t("landing.allInRecommended")}
                  </div>
                ) : (
                  browseListings.map((l, i) => (
                    <PropertyCard key={l.id} listing={l} index={i} bestMatch={matchIds.has(l.id)} />
                  ))
                )}
              </div>
            </div>
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
              { icon: ShieldCheck, titleKey: "valueHostsTitle" as const, descKey: "valueHostsDesc" as const },
              { icon: Sparkles, titleKey: "valueAiTitle" as const, descKey: "valueAiDesc" as const },
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
                  <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
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
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">{t("landing.testimonialsSubtitle")}</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((row) => (
            <div key={row.name} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex gap-0.5 text-warning">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
              <p className="mt-3 text-sm text-foreground">&ldquo;{t(`landing.${row.textKey}`)}&rdquo;</p>
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

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-transparent bg-muted/40 px-3 py-2 transition-colors focus-within:border-primary focus-within:bg-background">
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        {children}
      </span>
    </label>
  );
}
