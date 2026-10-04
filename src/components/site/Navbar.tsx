import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const NAV = [
  { label: "About", hash: "about" },
  { label: "Skills", hash: "skills" },
  { label: "Projects", hash: "projects" },
  { label: "Education", hash: "education" },
  { label: "AI & Automation", hash: "automation" },
  { label: "Contact", hash: "contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open ? "border-b border-border bg-background/85 backdrop-blur-md" : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8" aria-label="Main">
        <Link to="/" className="flex items-center gap-2.5 text-sm font-bold tracking-wide">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-gradient-brand font-mono text-[11px] text-primary-foreground">MMA</span>
          <span className="hidden sm:inline">MD MOIN UDDIN AHMED</span>
          <span className="sm:hidden">MOIN</span>
        </Link>
        <ul className="hidden items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <li key={n.hash}>
              <Link to="/" hash={n.hash} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            hash="contact"
            className="hidden rounded-lg border border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:inline-flex"
          >
            Let's Talk
          </Link>
          <button
            className="grid h-10 w-10 place-items-center rounded-md text-foreground lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
      {open && (
        <ul className="border-t border-border px-5 pb-5 lg:hidden">
          {NAV.map((n) => (
            <li key={n.hash}>
              <Link to="/" hash={n.hash} onClick={() => setOpen(false)} className="block py-3 text-base text-muted-foreground hover:text-foreground">
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
