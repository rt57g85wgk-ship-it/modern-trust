import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  Edit,
  Home as HomeIcon,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProfileById, type PublicProfile, slugify, fetchSupabaseProfileById } from "@/lib/profiles";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/profile/$id")({
  loader: async ({ params }) => {
    // "me" is handled in the component using the live user context.
    if (params.id === "me") return { profile: null as PublicProfile | null, isMe: true };
    
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id);
    if (isUuid) {
      const profile = await fetchSupabaseProfileById(params.id);
      if (!profile) throw notFound();
      return { profile, isMe: false };
    }
    
    const profile = getProfileById(params.id);
    if (!profile) throw notFound();
    return { profile, isMe: false };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.profile
          ? `${loaderData.profile.name} — Modern Trust`
          : "Profile — Modern Trust",
      },
      {
        name: "description",
        content: loaderData?.profile?.bio ?? "View this Modern Trust profile.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, isMe } = Route.useLoaderData();
  const { user } = useApp();
  const nav = useNavigate();

  let view: PublicProfile | null = profile;
  if (isMe) {
    if (!user) {
      if (typeof window !== "undefined") setTimeout(() => nav({ to: "/login" }), 0);
      return null;
    }
    view = {
      id: "me",
      type: user.role,
      name: user.name,
      avatar:
        user.avatar ??
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
      verified: !!user.verified,
      bio: user.bio ?? "No bio yet — add one from your account page.",
      rating: 5,
      reviewsCount: 0,
      joined: "2026",
      reviews: [],
      preferredArea: user.preferredArea,
      moveInTimeline: user.moveInTimeline,
      lifestyleTags: user.lifestyleTags,
      listings: [], // demo "me" landlord starts empty
    };
  }

  if (!view) return null;
  const isLandlord = view.type === "landlord";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
      >
        <div className="h-28 bg-gradient-to-br from-primary/20 via-brand-cyan/15 to-transparent sm:h-36" />
        <div className="-mt-12 flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-end sm:p-8">
          <img
            src={view.avatar}
            alt={view.name}
            className="h-24 w-24 rounded-2xl border-4 border-card object-cover shadow-card sm:h-28 sm:w-28"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold sm:text-3xl">{view.name}</h1>
              {view.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified
                </span>
              )}
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                {view.type}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                {view.rating} · {view.reviewsCount} reviews
              </span>
              <span className="flex items-center gap-1">
                <CalendarClock className="h-3.5 w-3.5" /> Joined {view.joined}
              </span>
              {isLandlord && view.listings && (
                <span className="flex items-center gap-1">
                  <HomeIcon className="h-3.5 w-3.5" /> {view.listings.length} listings
                </span>
              )}
            </div>
          </div>
          {isMe && (
            <Link to="/account">
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="h-4 w-4" /> Edit profile
              </Button>
            </Link>
          )}
        </div>

        <div className="grid gap-6 border-t border-border p-6 md:grid-cols-3 sm:p-8">
          <div className="md:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              About
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground">{view.bio}</p>
          </div>
          <div className="space-y-2.5 rounded-2xl border border-border bg-muted/30 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Trust signals
            </h3>
            <Signal
              icon={ShieldCheck}
              label="ID verification"
              value={view.verified ? "Verified" : "Not verified"}
              ok={view.verified}
            />
            <Signal
              icon={Star}
              label="Rating"
              value={`${view.rating} / 5`}
              ok={view.rating >= 4.5}
            />
            <Signal
              icon={CalendarClock}
              label="Member since"
              value={view.joined}
              ok
            />
          </div>
        </div>
      </motion.section>

      {!isLandlord && (
        <section className="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Renter profile</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Fact label="Preferred area" value={view.preferredArea ?? "—"} icon={MapPin} />
            <Fact label="Move-in timeline" value={view.moveInTimeline ?? "—"} icon={CalendarClock} />
            <Fact
              label="Verified"
              value={view.verified ? "Yes" : "Not yet"}
              icon={BadgeCheck}
            />
          </div>
          {view.lifestyleTags && view.lifestyleTags.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Lifestyle
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {view.lifestyleTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {isLandlord && view.listings && view.listings.length > 0 && (
        <section className="mt-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold">Rental portfolio</h2>
              <p className="text-sm text-muted-foreground">
                {view.listings.length} active{" "}
                {view.listings.length === 1 ? "listing" : "listings"} from {view.name}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {view.listings.map((l) => (
              <Link
                key={l.id}
                to="/property/$id"
                params={{ id: l.id }}
                className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-card"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={l.image}
                    alt={l.title}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="space-y-1.5 p-4">
                  <p className="truncate font-semibold">{l.title}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {l.location}
                  </p>
                  <p className="text-sm font-bold">
                    ฿{l.price.toLocaleString()}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">/ mo</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {view.reviews.length > 0 && (
        <section className="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Reviews</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {view.reviews.map((r) => (
              <div
                key={r.author + r.date}
                className="rounded-2xl border border-border bg-muted/30 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{r.author}</p>
                  <div className="flex text-warning">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                <p className="mt-2 text-xs text-muted-foreground/80">{r.date}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Signal({
  icon: Icon,
  label,
  value,
  ok,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className={`h-4 w-4 ${ok ? "text-success" : "text-muted-foreground"}`} />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-medium">{value}</span>
    </div>
  );
}

function Fact({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-4">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-2 text-sm font-medium">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// Re-export for other modules wanting the slug helper from here.
export { slugify };
