import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Cog,
  ExternalLink,
  FolderKanban,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ADMIN_SESSION_KEY } from "./admin_.login";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(ADMIN_SESSION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.email) {
            return { user: { email: parsed.email } };
          }
        }
      } catch {
        // ignore storage parse error
      }
    }
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      return { user: data.user };
    }
    throw redirect({ to: "/admin/login" });
  },
  head: () => ({
    meta: [
      { title: "Admin Panel — MD Moin Uddin Ahmed" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const LINKS = [
  { to: "/admin", label: "Dashboard & Overview", Icon: LayoutDashboard, exact: true },
  { to: "/admin/messages", label: "Bookings & Leads", Icon: Inbox },
  { to: "/admin/projects", label: "Projects", Icon: FolderKanban },
  { to: "/admin/skills", label: "Skills", Icon: Wrench },
  { to: "/admin/education", label: "Education", Icon: GraduationCap },
  { to: "/admin/about", label: "About Cards", Icon: BookOpen },
  { to: "/admin/settings", label: "Site Settings", Icon: Cog },
];

function AdminLayout() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function logout() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut().catch(() => {});
    navigate({ to: "/admin/login", replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-sm text-foreground">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card p-4 transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-6 flex items-center gap-2.5 px-2 pt-1">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand font-mono text-xs font-bold text-primary-foreground">
            MMA
          </span>
          <div>
            <p className="font-bold leading-none">Admin Panel</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Bookings & Portfolio CMS</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {LINKS.map(({ to, label, Icon, ...r }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: "exact" in r }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "bg-primary/15 !text-primary font-semibold border border-primary/30" }}
            >
              <Icon size={17} /> {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border pt-3">
          <div className="mb-2 px-3 py-1 text-xs text-muted-foreground">
            Signed in as <span className="block truncate font-medium text-foreground">{user?.email}</span>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-background/70 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded-md border border-border p-2 lg:hidden" aria-label="Open sidebar" onClick={() => setOpen(true)}>
              <Menu size={18} />
            </button>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <ShieldCheck size={15} className="text-primary" /> Connected to Supabase (`pnexylsgqbgexdqoccst`)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/messages"
              className="rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/25"
            >
              Bookings / Leads
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
            >
              View Live Website <ExternalLink size={13} />
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-6xl p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
