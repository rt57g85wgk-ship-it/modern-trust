import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Twitter, Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Smart rental platform connecting verified renters and landlords across Thailand.
            </p>
            <div className="mt-4 flex gap-3 text-muted-foreground">
              <a href="#" className="hover:text-foreground"><Twitter className="h-4 w-4" /></a>
              <a href="#" className="hover:text-foreground"><Github className="h-4 w-4" /></a>
              <a href="#" className="hover:text-foreground"><Linkedin className="h-4 w-4" /></a>
            </div>
          </div>
          {[
            { title: "Product", links: [["Discover", "/"], ["Dashboard", "/dashboard"], ["Sign in", "/login"]] as const },
            { title: "Company", links: [["About", "#"], ["Careers", "#"], ["Press", "#"]] as const },
            { title: "Legal", links: [["Terms", "#"], ["Privacy", "#"], ["Contact", "#"]] as const },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
              <ul className="mt-4 space-y-2 text-sm">
                {col.links.map(([label, href]) =>
                  href.startsWith("/") ? (
                    <li key={label}><Link to={href} className="text-muted-foreground hover:text-foreground">{label}</Link></li>
                  ) : (
                    <li key={label}><a href={href} className="text-muted-foreground hover:text-foreground">{label}</a></li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Modern Trust. All rights reserved.</p>
          <p>Built with care in Bangkok 🇹🇭</p>
        </div>
      </div>
    </footer>
  );
}
