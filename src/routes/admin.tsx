import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Cog, ExternalLink, FolderKanban, GraduationCap, Image, LayoutDashboard, LogOut, Mail, Menu, Search, User, Wrench } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/admin/login" });
    const { data: ok } = await supabase.rpc("claim_owner_admin");
    if (!ok) throw redirect({ to: "/admin/login" });
    return { user: data.user };
  },
  head: () => ({ meta: [{ title: "Admin — MD Moin Uddin Ahmed" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const LINKS = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { to: "/admin/projects", label: "Projects", Icon: FolderKanban },
  { to: "/admin/skills", label: "Skills", Icon: Wrench },
  { to: "/admin/education", label: "Education", Icon: GraduationCap },
  { to: "/admin/about", label: "About cards", Icon: BookOpen },
  { to: "/admin/messages", label: "Messages", Icon: Mail },
  { to: "/admin/profile", label: "Profile", Icon: User },
  { to: "/admin/media", label: "Media", Icon: Image },
  { to: "/admin/seo", label: "SEO", Icon: Search },
  { to: "/admin/settings", label: "Settings", Icon: Cog },
] as const;

function AdminLayout() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function logout() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  return (
    <div className="min-h-screen bg-sidebar text-sm">
      <aside className={cn("fixed inset-y-0 left-0 z-40 w-60 border-r border-sidebar-border bg-sidebar p-4 transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <p className="mb-6 px-2 font-bold">MMA <span className="font-normal text-muted-foreground">CMS</span></p>
        <nav className="space-y-1">
          {LINKS.map(({ to, label, Icon, ...r }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} activeOptions={{ exact: "exact" in r }} className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground" activeProps={{ className: "bg-sidebar-accent !text-foreground" }}>
              <Icon size={16} /> {label}
            </Link>
          ))}
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"><LogOut size={16} /> Logout</button>
        </nav>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-background/70 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur">
          <button className="lg:hidden" aria-label="Open sidebar" onClick={() => setOpen(true)}><Menu size={20} /></button>
          <span className="hidden text-muted-foreground lg:block">{user.email}</span>
          <a href="/" target="_blank" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">View site <ExternalLink size={14} /></a>
        </header>
        <main className="mx-auto max-w-6xl p-4 sm:p-8">
          <DashboardOrOutlet />
        </main>
      </div>
    </div>
  );
}

function DashboardOrOutlet() {
  const pathname = typeof window === "undefined" ? "" : window.location.pathname;
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    enabled: pathname === "/admin",
    queryFn: async () => {
      const [projects, skills, education, messages, unread, recentProjects, recentMessages] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("skills").select("id", { count: "exact", head: true }),
        supabase.from("education").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "New"),
        supabase.from("projects").select("id,title,created_at,published").order("created_at", { ascending: false }).limit(5),
        supabase.from("contact_messages").select("id,name,subject,created_at,status").order("created_at", { ascending: false }).limit(5),
      ]);
      if ([projects, skills, education, messages, unread, recentProjects, recentMessages].some((x) => x.error)) throw new Error("Dashboard data unavailable");
      const published = await supabase.from("projects").select("id", { count: "exact", head: true }).eq("published", true);
      return { projects: projects.count ?? 0, skills: skills.count ?? 0, education: education.count ?? 0, messages: messages.count ?? 0, unread: unread.count ?? 0, published: published.count ?? 0, recentProjects: recentProjects.data ?? [], recentMessages: recentMessages.data ?? [] };
    },
  });
  if (pathname !== "/admin") return <Outlet />;
  const cards = [
    ["Total projects", data?.projects], ["Published projects", data?.published], ["Total skills", data?.skills],
    ["Education records", data?.education], ["Unread messages", data?.unread], ["Total messages", data?.messages],
  ] as const;
  return (
    <div>
      <div className="mb-6"><p className="eyebrow">Workspace</p><h1 className="mt-2 text-2xl font-bold">Dashboard</h1></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value]) => <div key={label} className="rounded-lg border border-border bg-background p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-bold">{isLoading ? "—" : value ?? 0}</p></div>)}
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section><h2 className="mb-3 text-lg font-semibold">Recent projects</h2><div className="divide-y divide-border rounded-lg border border-border bg-background">
          {(data?.recentProjects ?? []).map((p) => <div key={p.id} className="flex justify-between gap-4 p-3"><span>{p.title}</span><span className="text-xs text-muted-foreground">{p.published ? "Published" : "Draft"}</span></div>)}
          {!data?.recentProjects.length && <p className="p-4 text-muted-foreground">No projects found.</p>}
        </div></section>
        <section><h2 className="mb-3 text-lg font-semibold">Recent messages</h2><div className="divide-y divide-border rounded-lg border border-border bg-background">
          {(data?.recentMessages ?? []).map((m) => <Link key={m.id} to="/admin/messages" className="flex justify-between gap-4 p-3 hover:bg-accent"><span>{m.name}{m.subject ? ` · ${m.subject}` : ""}</span><span className="text-xs text-muted-foreground">{m.status}</span></Link>)}
          {!data?.recentMessages.length && <p className="p-4 text-muted-foreground">No messages yet.</p>}
        </div></section>
      </div>
      <section className="mt-8"><h2 className="mb-3 text-lg font-semibold">Quick actions</h2><div className="flex flex-wrap gap-2">{LINKS.slice(1, 4).map((l) => <Link key={l.to} to={l.to} className="rounded-md border border-border bg-background px-4 py-2 hover:border-primary">Add {l.label.replace(/s$/, "")}</Link>)}<Link to="/admin/messages" className="rounded-md border border-border bg-background px-4 py-2 hover:border-primary">View messages</Link></div></section>
    </div>
  );
}
