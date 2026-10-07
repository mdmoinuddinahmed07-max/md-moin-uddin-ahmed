import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, FolderKanban, GraduationCap, Mail, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — MD Moin Uddin Ahmed" }, { name: "description", content: "Portfolio content management dashboard." }, { property: "og:title", content: "Portfolio CMS dashboard" }, { property: "og:description", content: "Manage portfolio projects, skills, education, and messages." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

const links = [
  { to: "/admin/projects", title: "Projects", Icon: FolderKanban },
  { to: "/admin/skills", title: "Skills", Icon: Wrench },
  { to: "/admin/education", title: "Education", Icon: GraduationCap },
  { to: "/admin/about", title: "About cards", Icon: BookOpen },
  { to: "/admin/messages", title: "Messages", Icon: Mail },
] as const;

function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const [projects, published, skills, education, messages, unread, recentProjects, recentMessages] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("published", true),
        supabase.from("skills").select("id", { count: "exact", head: true }),
        supabase.from("education").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "New"),
        supabase.from("projects").select("id,title,created_at,published").order("created_at", { ascending: false }).limit(5),
        supabase.from("contact_messages").select("id,name,subject,created_at,status").order("created_at", { ascending: false }).limit(5),
      ]);
      if ([projects, published, skills, education, messages, unread, recentProjects, recentMessages].some((x) => x.error)) throw new Error("Dashboard data unavailable");
      return { projects: projects.count ?? 0, published: published.count ?? 0, skills: skills.count ?? 0, education: education.count ?? 0, messages: messages.count ?? 0, unread: unread.count ?? 0, recentProjects: recentProjects.data ?? [], recentMessages: recentMessages.data ?? [] };
    },
  });
  const cards = [["Total projects", data?.projects], ["Published projects", data?.published], ["Total skills", data?.skills], ["Education records", data?.education], ["Unread messages", data?.unread], ["Total messages", data?.messages]] as const;
  return (
    <div>
      <div className="mb-6"><p className="eyebrow">Workspace</p><h1 className="mt-2 text-2xl font-bold">Dashboard</h1></div>
      {error && <p role="alert" className="mb-4 text-sm text-destructive">Dashboard data could not be loaded.</p>}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value]) => <div key={label} className="rounded-lg border border-border bg-background p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-bold">{isLoading ? "—" : value ?? 0}</p></div>)}
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section><h2 className="mb-3 text-lg font-semibold">Recent projects</h2><div className="divide-y divide-border rounded-lg border border-border bg-background">
          {(data?.recentProjects ?? []).map((p) => <div key={p.id} className="flex justify-between gap-4 p-3"><span>{p.title}</span><span className="text-xs text-muted-foreground">{p.published ? "Published" : "Draft"}</span></div>)}
          {!isLoading && !data?.recentProjects.length && <p className="p-4 text-muted-foreground">No projects found.</p>}
        </div></section>
        <section><h2 className="mb-3 text-lg font-semibold">Recent messages</h2><div className="divide-y divide-border rounded-lg border border-border bg-background">
          {(data?.recentMessages ?? []).map((m) => <Link key={m.id} to="/admin/messages" className="flex justify-between gap-4 p-3 hover:bg-accent"><span>{m.name}{m.subject ? ` · ${m.subject}` : ""}</span><span className="text-xs text-muted-foreground">{m.status}</span></Link>)}
          {!isLoading && !data?.recentMessages.length && <p className="p-4 text-muted-foreground">No messages yet.</p>}
        </div></section>
      </div>
      <section className="mt-8"><h2 className="mb-3 text-lg font-semibold">Quick actions</h2><div className="flex flex-wrap gap-2">{links.slice(0, 3).map((l) => <Link key={l.to} to={l.to} className="rounded-md border border-border bg-background px-4 py-2 hover:border-primary">Add {l.title.replace(/s$/, "")}</Link>)}<Link to="/admin/messages" className="rounded-md border border-border bg-background px-4 py-2 hover:border-primary">View messages</Link></div></section>
    </div>
  );
}