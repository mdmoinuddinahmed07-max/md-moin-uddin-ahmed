import { Link } from "@tanstack/react-router";
import { ArrowRight, Code2, Lightbulb, MapPin, Settings2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import portrait from "@/assets/portrait.webp.asset.json";
import type { Settings } from "@/lib/content";

const PILLARS = [
  { label: "AI Solutions", Icon: Sparkles },
  { label: "Web Development", Icon: Code2 },
  { label: "Automation", Icon: Settings2 },
  { label: "Creative Tech", Icon: Lightbulb },
];

export function Hero({ s }: { s: Settings | null }) {
  const roles = s?.rotating_roles?.length ? s.rotating_roles : ["AI & Automation"];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % roles.length), 2800);
    return () => clearInterval(t);
  }, [roles.length]);
  const img = s?.portrait_url || portrait.url;

  return (
    <section className="relative overflow-hidden pt-16">
      <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_1fr] lg:px-8 lg:py-24">
        <div className="animate-fade-up">
          <p className="mb-6 flex items-center gap-3 text-muted-foreground">
            Hello, I'm <span className="h-px w-8 bg-primary" />
          </p>
          <h1 className="text-[2.6rem] font-extrabold leading-[1.02] sm:text-6xl xl:text-7xl">
            <span className="sr-only">MD Moin Uddin Ahmed — AI & Automation | Web Development</span>
            <span aria-hidden>
              Md Moin Uddin <span className="text-gradient">Ahmed</span>
            </span>
          </h1>
          <p className="mt-6 text-lg font-semibold sm:text-xl">{s?.headline}</p>
          <p className="mt-2 h-7 font-mono text-sm text-primary" aria-live="polite">
            <span key={i} className="animate-role inline-block">
              › {roles[i]}
            </span>
          </p>
          <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">{s?.hero_description}</p>

          <ul className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
            {PILLARS.map(({ label, Icon }) => (
              <li key={label} className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card/60 px-2 py-4 text-center text-xs">
                <Icon size={20} className="text-primary" />
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link to="/" hash="projects" className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-brand px-6 py-3 font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5">
              View My Work <ArrowRight size={18} />
            </Link>
            <Link to="/" hash="contact" className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 font-semibold hover:border-primary/50">
              Let's Connect
            </Link>
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin size={15} className="text-primary" /> Based in {s?.location ?? "Hyderabad, India"}
          </p>
        </div>

        <div className="relative animate-fade-up [animation-delay:150ms]">
          <div className="relative overflow-hidden rounded-2xl border border-border shadow-card">
            <img
              src={img}
              alt="MD Moin Uddin Ahmed, BCA student and AI automation developer"
              width={976}
              height={1024}
              fetchPriority="high"
              className="aspect-[976/1024] w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          </div>
          {s?.available_for_projects && (
            <div className="absolute -left-3 top-8 flex items-center gap-2 rounded-full border border-border bg-background/85 px-4 py-2 text-xs backdrop-blur sm:-left-6">
              <span className="animate-node h-2 w-2 rounded-full bg-success" /> Available for Projects
            </div>
          )}
          <div className="absolute -right-2 bottom-8 rounded-full border border-border bg-background/85 px-4 py-2 font-mono text-xs text-primary backdrop-blur sm:-right-5">
            AI • Web • Automation
          </div>
        </div>
      </div>
    </section>
  );
}
