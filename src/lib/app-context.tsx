import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import i18n from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

type Role = "renter" | "landlord";

export type PaymentMethod = {
  id: string;
  brand: string; // Visa, Mastercard, PromptPay, etc.
  last4: string;
  holder?: string;
  expiry?: string; // MM/YY
};

export type UserProfile = {
  name: string;
  email: string;
  role: Role;
  verified?: boolean;
  avatar?: string;
  bio?: string;
  phone?: string;
  // Renter extras
  preferredArea?: string;
  moveInTimeline?: string;
  lifestyleTags?: string[];
  // Settings
  language?: "en" | "th";
  notifyEmail?: boolean;
  notifyPush?: boolean;
  notifySms?: boolean;
  googleConnected?: boolean;
  // Payments
  paymentMethods?: PaymentMethod[];
};

type User = UserProfile | null;

type Ctx = {
  user: User;
  favorites: string[];
  theme: "light" | "dark";
  login: (u: NonNullable<User>) => void;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, name: string, role: Role) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  toggleFavorite: (id: string) => void;
  toggleTheme: () => void;
  toggleLang: () => void;
  switchRole: () => void;
  verifyIdentity: () => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  addPaymentMethod: (pm: Omit<PaymentMethod, "id">) => void;
  removePaymentMethod: (id: string) => void;
};

const AppContext = createContext<Ctx | null>(null);

function mapDbRoleToFrontend(dbRole: string): "renter" | "landlord" {
  const r = (dbRole || "").toUpperCase();
  if (r === "TENANT" || r === "RENTER") return "renter";
  if (r === "LANDLORD" || r === "HOST" || r === "OWNER") return "landlord";
  return "renter";
}

function mapFrontendRoleToDb(feRole: "renter" | "landlord"): string {
  if (feRole === "renter") return "TENANT";
  if (feRole === "landlord") return "LANDLORD";
  return "TENANT";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const f = localStorage.getItem("mt_fav");
    const t = (localStorage.getItem("mt_theme") as "light" | "dark") || "light";
    const lang = localStorage.getItem("mt_lang");
    if (f) setFavorites(JSON.parse(f));
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    if (lang === "th" || lang === "TH") void i18n.changeLanguage("th");
    else void i18n.changeLanguage("en");

    // Listen to Supabase Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const sbUser = session.user;
        const metadata = sbUser.user_metadata || {};
        
        let profile: UserProfile = {
          name: metadata.full_name || sbUser.email?.split("@")[0] || "User",
          email: sbUser.email || "",
          role: mapDbRoleToFrontend(metadata.role || "renter"),
          verified: !!metadata.verified,
          avatar: metadata.avatar || "",
          bio: metadata.bio || "",
          phone: metadata.phone || "",
          preferredArea: metadata.preferredArea || "",
          moveInTimeline: metadata.moveInTimeline || "",
          lifestyleTags: metadata.lifestyleTags || [],
        };

        try {
          // Attempt to query the users table in Supabase
          const { data: dbUser, error: dbError } = await supabase
            .from("users")
            .select("*")
            .eq("user_id", sbUser.id)
            .maybeSingle();

          if (dbUser) {
            profile = {
              name: dbUser.name || profile.name,
              email: dbUser.email || profile.email,
              role: mapDbRoleToFrontend(dbUser.role || metadata.role),
              verified: !!metadata.verified,
              avatar: metadata.avatar || "",
              bio: metadata.bio || "",
              phone: dbUser.phone_number || metadata.phone || "",
              preferredArea: metadata.preferredArea || "",
              moveInTimeline: metadata.moveInTimeline || "",
              lifestyleTags: metadata.lifestyleTags || [],
            };
          } else if (!dbError) {
            // No user row exists, let's create one
            const newDbUser = {
              user_id: sbUser.id,
              email: profile.email,
              name: profile.name,
              role: mapFrontendRoleToDb(profile.role),
              phone_number: profile.phone || null,
            };
            await supabase.from("users").insert(newDbUser);
          }
        } catch (e) {
          console.warn("Users table synchronization bypassed:", e);
        }

        setUser(profile);
        localStorage.setItem("mt_user", JSON.stringify(profile));
      } else {
        // Fallback to local session if no Supabase session but local user exists (for local mock auth)
        const localUserStr = localStorage.getItem("mt_user");
        if (localUserStr) {
          setUser(JSON.parse(localUserStr));
        } else {
          setUser(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("mt_fav", JSON.stringify(favorites));
  }, [favorites]);

  const persist = async (next: NonNullable<User>) => {
    setUser(next);
    localStorage.setItem("mt_user", JSON.stringify(next));

    // Sync to Supabase Auth & DB if session exists
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const metadataPatch = {
          full_name: next.name,
          role: next.role,
          verified: next.verified,
          avatar: next.avatar,
          bio: next.bio,
          phone: next.phone,
          preferredArea: next.preferredArea,
          moveInTimeline: next.moveInTimeline,
          lifestyleTags: next.lifestyleTags,
        };
        await supabase.auth.updateUser({ data: metadataPatch });

        const dbPatch = {
          name: next.name,
          role: mapFrontendRoleToDb(next.role),
          phone_number: next.phone || null,
        };
        await supabase.from("users").update(dbPatch).eq("user_id", session.user.id);
      }
    } catch (e) {
      console.warn("Error persisting user profile to Supabase:", e);
    }
  };

  const login = (u: NonNullable<User>) => {
    setUser(u);
    localStorage.setItem("mt_user", JSON.stringify(u));
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Error signing out from Supabase:", e);
    }
    setUser(null);
    localStorage.removeItem("mt_user");
  };

  const signUp = async (email: string, password: string, name: string, role: Role) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role,
          verified: false,
        },
      },
    });
  };

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  const toggleFavorite = (id: string) =>
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("mt_theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };
  const toggleLang = () => {
    const next = i18n.language === "th" ? "en" : "th";
    void i18n.changeLanguage(next);
  };
  const switchRole = () => {
    if (!user) return;
    persist({ ...user, role: user.role === "renter" ? "landlord" : "renter" });
  };
  const verifyIdentity = () => {
    if (!user) return;
    persist({ ...user, verified: true });
  };
  const updateProfile = (patch: Partial<UserProfile>) => {
    if (!user) return;
    persist({ ...user, ...patch });
  };
  const addPaymentMethod = (pm: Omit<PaymentMethod, "id">) => {
    if (!user) return;
    const next: PaymentMethod = { ...pm, id: `pm-${Date.now()}` };
    persist({ ...user, paymentMethods: [...(user.paymentMethods ?? []), next] });
  };
  const removePaymentMethod = (id: string) => {
    if (!user) return;
    persist({
      ...user,
      paymentMethods: (user.paymentMethods ?? []).filter((p) => p.id !== id),
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        favorites,
        theme,
        login,
        logout,
        signUp,
        signIn,
        toggleFavorite,
        toggleTheme,
        toggleLang,
        switchRole,
        verifyIdentity,
        updateProfile,
        addPaymentMethod,
        removePaymentMethod,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
