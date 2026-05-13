import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Role = "renter" | "landlord";
type User = { name: string; email: string; role: Role } | null;

type Ctx = {
  user: User;
  favorites: string[];
  theme: "light" | "dark";
  lang: "EN" | "TH";
  login: (u: NonNullable<User>) => void;
  logout: () => void;
  toggleFavorite: (id: string) => void;
  toggleTheme: () => void;
  toggleLang: () => void;
  switchRole: () => void;
};

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lang, setLang] = useState<"EN" | "TH">("EN");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const u = localStorage.getItem("mt_user");
    const f = localStorage.getItem("mt_fav");
    const t = (localStorage.getItem("mt_theme") as "light" | "dark") || "light";
    if (u) setUser(JSON.parse(u));
    if (f) setFavorites(JSON.parse(f));
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
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
  const toggleLang = () => setLang((l) => (l === "EN" ? "TH" : "EN"));
  const switchRole = () => {
    if (!user) return;
    const next: User = { ...user, role: user.role === "renter" ? "landlord" : "renter" };
    setUser(next);
    localStorage.setItem("mt_user", JSON.stringify(next));
  };

  return (
    <AppContext.Provider value={{ user, favorites, theme, lang, login, logout, toggleFavorite, toggleTheme, toggleLang, switchRole }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
