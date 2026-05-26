import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Moon, Sun, Globe, LogOut, Menu, X, LayoutDashboard, LogIn, User, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  const { user, theme, logout, toggleTheme, toggleLang } = useApp();
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const langLabel = i18n.language === "th" ? "TH" : "EN";

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const SettingsItems = (
    <>
      <DropdownMenuLabel>{t("nav.preferences")}</DropdownMenuLabel>
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault();
          toggleLang();
        }}
        className="gap-2"
      >
        <Globe className="h-4 w-4" />
        <span className="flex-1">{t("nav.language")}</span>
        <span className="text-xs font-semibold text-muted-foreground">{langLabel}</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault();
          toggleTheme();
        }}
        className="gap-2"
      >
        {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        <span className="flex-1">{theme === "light" ? t("nav.darkMode") : t("nav.lightMode")}</span>
      </DropdownMenuItem>
      {user ? (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" /> {t("nav.dashboard")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/profile/$id" params={{ id: "me" }} className="gap-2">
              <User className="h-4 w-4" /> My profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => logout()} className="gap-2 text-destructive focus:text-destructive">
            <LogOut className="h-4 w-4" /> {t("nav.signOut")}
          </DropdownMenuItem>
        </>
      ) : (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/login" className="gap-2">
              <LogIn className="h-4 w-4" /> {t("nav.loginOrSignUp")}
            </Link>
          </DropdownMenuItem>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Home">
          <Logo />
        </Link>

        <div className="hidden items-center gap-3 sm:flex">
          {user && (
            <Link to="/dashboard">
              <Button className="gap-2 px-4 py-2 rounded-xl font-semibold shadow-md hover:shadow-xl hover:scale-[1.02] transition-all">
                <LayoutDashboard className="h-4 w-4" /> My Dashboard
              </Button>
            </Link>
          )}
          {!user && (
            <Link to="/login">
              <Button>{t("nav.getStarted")}</Button>
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t("nav.menu")} className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {SettingsItems}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="sm:hidden flex items-center gap-2">
          {user && (
            <Link to="/dashboard">
              <Button 
                className="h-9 w-9 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                variant="ghost" 
                size="icon"
              >
                <LayoutDashboard className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("nav.menu")}
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
            className="border-t border-border/60 bg-background sm:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
              <button
                onClick={toggleLang}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Globe className="h-4 w-4" />
                <span className="flex-1 text-left">{t("nav.language")}</span>
                <span className="text-xs font-semibold text-muted-foreground">{langLabel}</span>
              </button>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span className="flex-1 text-left">{theme === "light" ? t("nav.darkMode") : t("nav.lightMode")}</span>
              </button>
              <div className="my-1 h-px bg-border" />
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block"
                  >
                    <Button size="lg" className="mt-1 w-full gap-2 shadow-md hover:shadow-lg transition-all">
                      <LayoutDashboard className="h-4 w-4" /> My Dashboard
                    </Button>
                  </Link>
                  <Link
                    to="/profile/$id"
                    params={{ id: "me" }}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <User className="h-4 w-4" /> My profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-destructive transition-colors hover:bg-accent"
                  >
                    <LogOut className="h-4 w-4" /> {t("nav.signOut")}
                  </button>
                </>
              ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <LogIn className="h-4 w-4" /> {t("nav.loginOrSignUp")}
                </Link>
              </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
