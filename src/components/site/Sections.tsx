import { Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, Languages } from "lucide-react";
import { useMemo, useState } from "react";
import type { AboutCard, Education, Project, Settings, Skill } from "@/lib/content";
import { SKILL_CATEGORIES } from "@/lib/content";
import { cn } from "@/lib/utils";
import { ProjectCard, Reveal, SectionHeader, StateBox } from "./Shared";

const wrap = "mx-auto max-w-7xl px-5 lg:px-8";

export function About({ s, cards }: { s: Settings | null; cards: AboutCard[] }) {
  return (
    <section id="about" className="scroll-mt-20 py-24">
      <div className={wrap}>
        <SectionHeader index="01" eyebrow="About" title="About Me" />
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <p className="text-lg leading-relaxed text-muted-foreground">{s?.about_summary}</p>
            <p className="mt-6 border-l-2 border-primary pl-4 font-medium">
              Building practical digital solutions with AI, automation, and modern web technology.
            </p>
            {!!s?.languages?.length && (
              <div className="mt-8 flex flex-wrap items-center gap-2 text-sm">
                <Languages size={16} className="text-primary" />
                <span className="mr-1 text-muted-foreground">Languages:</span>
                {s.languages.map((l) => (
                  <span key={l} className="rounded-md border border-border px-2.5 py-1">{l}</span>
                ))}
              </div>
            )}
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map((c, i) => (
              <Reveal key={c.id} delay={i * 80}>
                <div className="h-full rounded-xl border border-border bg-card p-6 shadow-card">
                  <p className="font-mono text-sm text-primary">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-3 font-semibold">{c.title}</h3>
                  {c.description && <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Skills({ skills }: { skills: Skill[] }) {
  const cats = SKILL_CATEGORIES.filter((c) => skills.some((s) => s.category === c)).concat(
    [...new Set(skills.map((s) => s.category))].filter((c) => !SKILL_CATEGORIES.includes(c)),
  );
  const [active, setActive] = useState("All");
  const shown = active === "All" ? cats : [active];
  return (
    <section id="skills" className="scroll-mt-20 border-y border-border bg-surface py-24">
      <div className={wrap}>
        <SectionHeader index="02" eyebrow="Skills" title="Technical Skills" />
        <div className="mb-10 flex flex-wrap gap-2" role="tablist">
          {["All", ...cats].map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={active === c}
              onClick={() => setActive(c)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                active === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        {!skills.length ? (
          <StateBox>No skills published yet.</StateBox>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((c) => (
              <div key={c} className="rounded-xl border border-border bg-card p-6 shadow-card">
                <p className="eyebrow mb-5">{c}</p>
                <ul className="space-y-3">
                  {skills.filter((s) => s.category === c).map((s) => (
                    <li key={s.id}>
                      <h3 className="flex items-center gap-3 text-sm font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {s.name}
                        {s.proficiency != null && <span className="ml-auto font-mono text-xs text-muted-foreground">{s.proficiency}%</span>}
                      </h3>
                      {s.description && <p className="ml-[18px] mt-1 text-xs text-muted-foreground">{s.description}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function Projects({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="scroll-mt-20 py-24">
      <div className={wrap}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader
            index="03"
            eyebrow="Work"
            title="Selected Projects"
            subtitle="Exploring technology through practical projects, experiments, and real-world problem solving."
          />
          <Link to="/projects" className="mb-12 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            View all projects <ArrowRight size={16} />
          </Link>
        </div>
        {!projects.length ? (
          <StateBox>No projects published yet.</StateBox>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 6).map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <ProjectCard p={p} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function EducationTimeline({ items }: { items: Education[] }) {
  return (
    <section id="education" className="scroll-mt-20 border-y border-border bg-surface py-24">
      <div className={wrap}>
        <SectionHeader index="04" eyebrow="Education" title="Education" />
        {!items.length ? (
          <StateBox>No education records yet.</StateBox>
        ) : (
          <ol className="relative max-w-3xl border-l border-border pl-8">
            {items.map((e, i) => (
              <Reveal key={e.id} delay={i * 80} className="mb-10 last:mb-0">
                <li>
                  <span className="absolute -left-[13px] grid h-6 w-6 place-items-center rounded-full border border-primary/50 bg-background">
                    <GraduationCap size={12} className="text-primary" />
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold">{e.degree}</h3>
                    {e.status && <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs text-accent-foreground">{e.status}</span>}
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {e.institution}
                    {e.year && <span className="font-mono text-sm"> · {e.year}</span>}
                  </p>
                  {e.description && <p className="mt-2 text-sm text-muted-foreground">{e.description}</p>}
                </li>
              </Reveal>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

const FLOW = ["Idea", "AI", "Automation", "Integration", "Business Solution"];
const HIGHLIGHTS = ["AI Agents", "Workflow Automation", "n8n", "API Integrations", "Web Development", "AI Creative Technology"];

export function AutomationFlow() {
  const items = useMemo(() => FLOW, []);
  return (
    <section id="automation" className="scroll-mt-20 py-24">
      <div className={`${wrap} grid gap-14 lg:grid-cols-2 lg:items-center`}>
        <div>
          <SectionHeader
            index="05"
            eyebrow="AI & Automation"
            title="Building With AI & Automation"
            subtitle="Turning ideas into useful digital experiences — connecting AI models, automation workflows and APIs into systems that solve practical problems."
          />
          <ul className="grid grid-cols-2 gap-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="rounded-lg border border-border bg-card px-4 py-3 text-sm">{h}</li>
            ))}
          </ul>
        </div>
        <Reveal>
          <ol className="mx-auto flex max-w-sm flex-col items-center" aria-label="Idea to business solution flow">
            {items.map((f, i) => (
              <li key={f} className="flex w-full flex-col items-center">
                <div
                  className={cn(
                    "w-full rounded-xl border px-6 py-4 text-center font-mono text-sm uppercase tracking-[0.2em]",
                    i === items.length - 1 ? "border-primary bg-gradient-brand font-bold text-primary-foreground shadow-glow" : "border-border bg-card",
                  )}
                >
                  {f}
                </div>
                {i < items.length - 1 && <span className="flow-line my-1 h-8 w-0.5" aria-hidden />}
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
