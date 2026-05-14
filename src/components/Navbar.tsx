import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Moon, Sun, Globe, LogOut, Menu, X, LayoutDashboard } from "lucide-react";
import { Logo } from "./Logo";
import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user, theme, lang, logout, toggleTheme, toggleLang } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const SettingsItems = (
    <>
      <DropdownMenuLabel>Preferences</DropdownMenuLabel>
      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); toggleLang(); }} className="gap-2">
        <Globe className="h-4 w-4" />
        <span className="flex-1">Language</span>
        <span className="text-xs font-semibold text-muted-foreground">{lang}</span>
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); toggleTheme(); }} className="gap-2">
        {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        <span className="flex-1">{theme === "light" ? "Dark mode" : "Light mode"}</span>
      </DropdownMenuItem>
      {user && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => logout()} className="gap-2 text-destructive focus:text-destructive">
            <LogOut className="h-4 w-4" /> Sign out
          </DropdownMenuItem>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Home"><Logo /></Link>

        {/* Desktop: settings + single CTA */}
        <div className="hidden items-center gap-2 md:flex">
          {!user && (
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {SettingsItems}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile/tablet: hamburger only */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="h-9 w-9"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="border-t border-border/60 bg-background md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
              <button
                onClick={toggleLang}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Globe className="h-4 w-4" />
                <span className="flex-1 text-left">Language</span>
                <span className="text-xs font-semibold text-muted-foreground">{lang}</span>
              </button>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span className="flex-1 text-left">{theme === "light" ? "Dark mode" : "Light mode"}</span>
              </button>
              <div className="my-1 h-px bg-border" />
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-destructive transition-colors hover:bg-accent"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </>
              ) : (
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <Button size="lg" className="mt-1 w-full">Get Started</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
