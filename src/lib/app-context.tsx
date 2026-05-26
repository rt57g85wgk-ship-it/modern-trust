import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import i18n from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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
  idCardNumber?: string;
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
  verifyIdentity: (idCardNumber: string) => void;
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
  if (feRole === "landlord") return "OWNER";
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
      console.log("onAuthStateChange event fired:", event, "User ID:", session?.user?.id);
      if (session?.user) {
        const sbUser = session.user;
        const metadata = sbUser.user_metadata || {};
        console.log("Session user metadata:", metadata);
        
        let profile: UserProfile = {
          name: metadata.full_name || sbUser.email?.split("@")[0] || "User",
          email: sbUser.email || "",
          role: mapDbRoleToFrontend(metadata.role || "renter"),
          verified: !!metadata.verified,
          avatar: metadata.avatar || "",
          bio: metadata.bio || "",
          phone: metadata.phone || "",
          idCardNumber: metadata.idCardNumber || "",
          preferredArea: metadata.preferredArea || "",
          moveInTimeline: metadata.moveInTimeline || "",
          lifestyleTags: metadata.lifestyleTags || [],
        };

        // ONLY query public.users database table on login/initial/refresh events.
        // On USER_UPDATED, skip database select to prevent deadlocks/race conditions.
        if (event !== "USER_UPDATED") {
          try {
            console.log("Querying 'users' table for user_id:", sbUser.id);
            const { data: dbUser, error: dbError } = await supabase
              .from("users")
              .select("*")
              .eq("user_id", sbUser.id)
              .maybeSingle();

            console.log("Database query result - User row:", dbUser, "Error:", dbError);

            if (dbUser) {
              profile = {
                name: dbUser.name || profile.name,
                email: dbUser.email || profile.email,
                role: mapDbRoleToFrontend(dbUser.role || metadata.role),
                verified: dbUser.is_verified ?? !!metadata.verified,
                avatar: metadata.avatar || "",
                bio: metadata.bio || "",
                phone: dbUser.phone_number || metadata.phone || "",
                idCardNumber: dbUser.id_card_number || metadata.idCardNumber || "",
                preferredArea: metadata.preferredArea || "",
                moveInTimeline: metadata.moveInTimeline || "",
                lifestyleTags: metadata.lifestyleTags || [],
              };
              console.log("Profile resolved from DB data:", profile);
            } else if (!dbError) {
              // No user row exists, let's create one
              const newDbUser = {
                user_id: sbUser.id,
                email: profile.email,
                name: profile.name,
                role: mapFrontendRoleToDb(profile.role),
                phone_number: profile.phone || null,
                id_card_number: profile.idCardNumber || null,
                is_verified: profile.verified || false,
              };
              console.log("Inserting new row into 'users' table:", newDbUser);
              const { error: insErr } = await supabase.from("users").insert(newDbUser);
              if (insErr) {
                console.error("Failed to insert new user row:", insErr);
              } else {
                console.log("Successfully inserted new user row.");
              }
            }
          } catch (e) {
            console.error("Users table synchronization failed:", e);
          }
        } else {
          console.log("Event is USER_UPDATED; bypassing database query.");
          // Maintain the existing profile/phone state from local storage or memory
          const localUserStr = localStorage.getItem("mt_user");
          if (localUserStr) {
            const localUser = JSON.parse(localUserStr);
            profile = {
              ...localUser,
              name: metadata.full_name || localUser.name,
              role: mapDbRoleToFrontend(metadata.role || localUser.role),
              verified: metadata.verified !== undefined ? !!metadata.verified : localUser.verified,
              avatar: metadata.avatar || localUser.avatar,
              bio: metadata.bio || localUser.bio,
              phone: metadata.phone || localUser.phone,
              idCardNumber: metadata.idCardNumber || localUser.idCardNumber,
            };
          }
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
      console.log("Persist called with next user state:", next);
      console.log("Active Supabase session found:", !!session, session?.user?.id);
      
      if (session) {
        const metadataPatch = {
          full_name: next.name,
          role: next.role,
          verified: next.verified,
          avatar: next.avatar,
          bio: next.bio,
          phone: next.phone,
          idCardNumber: next.idCardNumber,
          preferredArea: next.preferredArea,
          moveInTimeline: next.moveInTimeline,
          lifestyleTags: next.lifestyleTags,
        };
        console.log("Updating Supabase Auth metadata with:", metadataPatch);
        const { error: authError } = await supabase.auth.updateUser({ data: metadataPatch });
        if (authError) {
          console.error("Error updating Supabase auth metadata:", authError);
          toast.error(`Auth Error: ${authError.message}`);
        } else {
          console.log("Auth metadata updated successfully.");
        }

        const dbPatch = {
          user_id: session.user.id,
          name: next.name,
          role: mapFrontendRoleToDb(next.role),
          phone_number: next.phone || null,
          id_card_number: next.idCardNumber || null,
          is_verified: next.verified || false,
          email: next.email,
        };
        console.log("Upserting DB users table row with patch:", dbPatch);
        const { error: dbError } = await supabase
          .from("users")
          .upsert(dbPatch, { onConflict: "user_id" });
        
        if (dbError) {
          console.error("Error updating Supabase 'users' table:", dbError);
          toast.error(`Database Error: ${dbError.message}`);
        } else {
          console.log("Database users table row upserted successfully.");
        }
      } else {
        console.warn("No active Supabase session; skipping DB/Auth synchronization.");
      }
    } catch (e) {
      console.error("Error persisting user profile to Supabase:", e);
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
  const verifyIdentity = (idCardNumber: string) => {
    if (!user) return;
    persist({ ...user, verified: true, idCardNumber });
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
