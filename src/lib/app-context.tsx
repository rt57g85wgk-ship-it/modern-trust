import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import i18n from "@/lib/i18n";

type Role = "renter" | "landlord";
type User = { name: string; email: string; role: Role; verified?: boolean } | null;

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

  const login = (u: NonNullable<User>) => {
    setUser(u);
    localStorage.setItem("mt_user", JSON.stringify(u));
  };
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
    const next: User = { ...user, role: user.role === "renter" ? "landlord" : "renter" };
    setUser(next);
    localStorage.setItem("mt_user", JSON.stringify(next));
  };

  return (
    <AppContext.Provider value={{ user, favorites, theme, login, logout, toggleFavorite, toggleTheme, toggleLang, switchRole }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
