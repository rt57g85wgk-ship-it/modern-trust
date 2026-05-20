import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import i18n from "@/lib/i18n";

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
  logout: () => void;
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const u = localStorage.getItem("mt_user");
    const f = localStorage.getItem("mt_fav");
    const t = (localStorage.getItem("mt_theme") as "light" | "dark") || "light";
    const lang = localStorage.getItem("mt_lang");
    if (u) setUser(JSON.parse(u));
    if (f) setFavorites(JSON.parse(f));
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    if (lang === "th" || lang === "TH") void i18n.changeLanguage("th");
    else void i18n.changeLanguage("en");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("mt_fav", JSON.stringify(favorites));
  }, [favorites]);

  const persist = (next: NonNullable<User>) => {
    setUser(next);
    localStorage.setItem("mt_user", JSON.stringify(next));
  };

  const login = (u: NonNullable<User>) => persist(u);
  const logout = () => {
    setUser(null);
    localStorage.removeItem("mt_user");
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
