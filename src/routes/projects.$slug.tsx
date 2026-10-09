import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ArrowRight, ExternalLink, Github } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer, ProjectCard } from "@/components/site/Shared";
import { projectQuery, settingsQuery, SITE_URL } from "@/lib/content";

export const Route = createFileRoute("/projects/$slug")({
  loader: async ({ context, params }) => {
    const [data] = await Promise.all([context.queryClient.ensureQueryData(projectQuery(params.slug)), context.queryClient.ensureQueryData(settingsQuery)]);
    if (!data?.project) throw notFound();
    return data;
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.project;
    const title = p ? `${p.seo_title || p.title} — MD Moin Uddin Ahmed` : "Project unavailable — MD Moin Uddin Ahmed";
    const desc = p?.seo_description || p?.short_description || "Explore projects by MD Moin Uddin Ahmed.";
    const img = p?.cover_image?.startsWith("http") ? p.cover_image : null;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(!p ? [{ name: "robots", content: "noindex" }] : []),
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/projects/${params.slug}` }],
    };
  },
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center text-center">
      <div><h1 className="text-3xl font-bold">Project not found</h1><Link to="/projects" className="mt-4 inline-block text-primary">Back to projects</Link></div>
    </div>
  ),
  errorComponent: () => <p className="p-20 text-center text-muted-foreground">This project could not load.</p>,
  component: ProjectPage,
});

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-border py-10">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      <div className="leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function ProjectPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(projectQuery(slug));
  const { data: s } = useSuspenseQuery(settingsQuery);
  const p = data.project;
  if (!p) return <p className="p-20 text-center text-muted-foreground">Project not found.</p>;
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-5 pb-20 pt-28 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link> / <Link to="/projects" className="hover:text-foreground">Projects</Link> / <span className="text-foreground">{p.title}</span>
        </nav>
        <p className="eyebrow mb-4">{p.category}</p>
        <h1 className="text-4xl font-bold sm:text-5xl">{p.title}</h1>
        <p className="mt-5 text-lg text-muted-foreground">{p.short_description}</p>
        {p.cover_image && <img src={p.cover_image} alt={p.title} className="mt-10 w-full rounded-2xl border border-border object-cover" />}

        <Block title="Overview"><p className="whitespace-pre-line">{p.long_description || p.description}</p></Block>
        {p.problem && <Block title="Problem"><p className="whitespace-pre-line">{p.problem}</p></Block>}
        {p.approach && <Block title="Approach"><p className="whitespace-pre-line">{p.approach}</p></Block>}
        <Block title="Technology">
          <ul className="flex flex-wrap gap-2">{p.technologies.map((t) => <li key={t} className="rounded-md border border-border bg-card px-3 py-1.5 font-mono text-xs">{t}</li>)}</ul>
        </Block>
        {!!p.features.length && <Block title="Features"><ul className="list-disc space-y-1 pl-5">{p.features.map((f) => <li key={f}>{f}</li>)}</ul></Block>}
        {!!p.gallery.length && (
          <Block title="Screenshots">
            <div className="grid gap-4 sm:grid-cols-2">{p.gallery.map((g) => <img key={g} src={g} alt={`${p.title} screenshot`} loading="lazy" className="rounded-xl border border-border" />)}</div>
          </Block>
        )}
        {p.learning && <Block title="Results / Learning"><p className="whitespace-pre-line">{p.learning}</p></Block>}
        {(p.project_url || p.github_url) && (
          <Block title="Project links">
            <div className="flex flex-wrap gap-3">
              {p.project_url && <a href={p.project_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-foreground hover:border-primary"><ExternalLink size={16} /> Live project</a>}
              {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-foreground hover:border-primary"><Github size={16} /> Source code</a>}
            </div>
          </Block>
        )}
        <div className="mt-10 rounded-2xl border border-border bg-card p-8 text-center shadow-card">
          <h2 className="text-2xl font-bold">Let's Work Together</h2>
          <p className="mt-2 text-muted-foreground">Have a similar idea or automation challenge?</p>
          <Link to="/" hash="contact" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-6 py-3 font-semibold text-primary-foreground">Contact MD Moin Uddin Ahmed <ArrowRight size={16} /></Link>
        </div>
      </main>
      {!!data.related.length && (
        <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold">Related projects</h2>
          <div className="grid gap-6 md:grid-cols-3">{data.related.map((r) => <ProjectCard key={r.id} p={r} />)}</div>
        </section>
      )}
      <Footer s={s} />
    </>
  );
}
