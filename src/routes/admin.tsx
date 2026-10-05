import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
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
        <main className="mx-auto max-w-6xl p-4 sm:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
