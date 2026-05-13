import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Moon, Sun, Globe, LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";
import { Logo } from "./Logo";
import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, theme, lang, logout, toggleTheme, toggleLang } = useApp();
  const loc = useLocation();
  const link = (to: string, label: string) => {
    const active = loc.pathname === to;
    return (
      <Link
        to={to}
        className={`relative px-3 py-2 text-sm font-medium transition-colors ${
          active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {label}
        {active && (
          <motion.span
            layoutId="navUnderline"
            className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-primary"
          />
        )}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/"><Logo /></Link>
        <nav className="hidden items-center gap-1 md:flex">
          {link("/", "Discover")}
          {link("/dashboard", "Dashboard")}
          <a href="#features" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Features</a>
          <a href="#pricing" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Pricing</a>
        </nav>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={toggleLang} aria-label="Language" className="h-9 w-9">
            <Globe className="h-4 w-4" />
            <span className="sr-only">{lang}</span>
          </Button>
          <span className="hidden text-xs font-medium text-muted-foreground sm:inline">{lang}</span>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Theme" className="h-9 w-9">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={logout} className="h-9 w-9" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
              <Link to="/register"><Button size="sm" className="gap-1.5"><UserIcon className="h-4 w-4" />Get started</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
