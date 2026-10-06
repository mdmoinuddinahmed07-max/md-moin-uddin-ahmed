import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Github, Instagram, Linkedin, Youtube } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import type { Project, Settings } from "@/lib/content";
import { NAV } from "./Navbar";

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function SectionHeader({ index, eyebrow, title, subtitle }: { index: string; eyebrow: string; title: string; subtitle?: string }) {
  return (
    <Reveal className="mb-12 max-w-2xl">
      <p className="eyebrow mb-4">
        {index} / {eyebrow}
      </p>
      <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-muted-foreground">{subtitle}</p>}
    </Reveal>
  );
}

export function ProjectCard({ p }: { p: Project }) {
  return (
    <Link
      to="/projects/$slug"
      params={{ slug: p.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:border-primary/40"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
        {p.cover_image ? (
          <img src={p.cover_image} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="bg-grid absolute inset-0 grid place-items-center">
            <span className="font-mono text-xs text-muted-foreground">{p.category}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="eyebrow mb-3">{p.category}</p>
        <h3 className="flex items-start justify-between gap-3 text-lg font-semibold">
          {p.title}
          <ArrowUpRight size={18} className="mt-1 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{p.short_description}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {p.technologies.map((t) => (
            <li key={t} className="rounded-md border border-border bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}

export function SocialLinks({ s }: { s: Settings | null }) {
  const links = [
    { url: s?.linkedin_url, label: "LinkedIn", Icon: Linkedin },
    { url: s?.github_url, label: "GitHub", Icon: Github },
    { url: s?.youtube_url, label: "YouTube", Icon: Youtube },
    { url: s?.instagram_url, label: "Instagram", Icon: Instagram },
  ].filter((l) => l.url);
  if (!links.length) return null;
  return (
    <div className="flex gap-2">
      {links.map(({ url, label, Icon }) => (
        <a key={label} href={url ?? undefined} target="_blank" rel="noreferrer" aria-label={label} className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground hover:border-primary/50 hover:text-primary">
          <Icon size={16} />
        </a>
      ))}
    </div>
  );
}

export function Footer({ s }: { s: Settings | null }) {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-bold tracking-wide">{s?.full_name ?? "MD MOIN UDDIN AHMED"}</p>
          <p className="mt-2 text-sm text-muted-foreground">{s?.headline}</p>
          <p className="mt-1 text-sm text-muted-foreground">{s?.location}</p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {NAV.map((n) => (
              <li key={n.hash}>
                <Link to="/" hash={n.hash} className="text-muted-foreground hover:text-foreground">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/projects" className="text-muted-foreground hover:text-foreground">All projects</Link>
            </li>
          </ul>
        </nav>
        <div className="md:justify-self-end">
          <SocialLinks s={s} />
        </div>
      </div>
      <p className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MD Moin Uddin Ahmed. All rights reserved.
      </p>
    </footer>
  );
}

export function StateBox({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{children}</div>;
}
