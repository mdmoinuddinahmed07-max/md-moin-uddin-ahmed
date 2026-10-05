import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer, ProjectCard, StateBox } from "@/components/site/Shared";
import { PROJECT_CATEGORIES, projectsQuery, settingsQuery, SITE_URL } from "@/lib/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects/")({
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(projectsQuery), context.queryClient.ensureQueryData(settingsQuery)]),
  head: () => ({
    meta: [
      { title: "Projects — MD Moin Uddin Ahmed" },
      { name: "description", content: "AI agents, workflow automation, web development and creative technology projects by MD Moin Uddin Ahmed." },
      { property: "og:title", content: "Projects — MD Moin Uddin Ahmed" },
      { property: "og:description", content: "AI, automation, web and creative technology projects." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/projects" }],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data: projects } = useSuspenseQuery(projectsQuery);
  const { data: s } = useSuspenseQuery(settingsQuery);
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const term = q.toLowerCase();
  const list = projects.filter(
    (p) =>
      (cat === "All" || p.category === cat) &&
      (!term || [p.title, p.short_description, p.description, p.category, ...p.technologies].join(" ").toLowerCase().includes(term)),
  );
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 pb-24 pt-32 lg:px-8">
        <p className="eyebrow mb-4">Work</p>
        <h1 className="text-4xl font-bold sm:text-5xl">Projects</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">Exploring technology through practical projects, experiments, and real-world problem solving.</p>
        <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {["All", ...PROJECT_CATEGORIES].map((c) => (
              <button key={c} onClick={() => setCat(c)} className={cn("rounded-full border px-4 py-2 text-sm", cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground")}>
                {c}
              </button>
            ))}
          </div>
          <label className="relative block lg:w-72">
            <span className="sr-only">Search projects</span>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects…" className="w-full rounded-lg border border-input bg-card py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none" />
          </label>
        </div>
        <div className="mt-10">
          {!list.length ? (
            <StateBox>{projects.length ? "No projects match your search." : "No projects published yet."}</StateBox>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{list.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
          )}
        </div>
      </main>
      <Footer s={s} />
    </>
  );
}
