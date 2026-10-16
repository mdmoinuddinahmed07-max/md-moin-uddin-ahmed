import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FolderKanban, Wrench, GraduationCap, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";
export const Route = createFileRoute("/admin/")({
    component: AdminDashboard,
});
function AdminDashboard() {
    const { data: stats } = useQuery({
        queryKey: ["admin_dashboard_stats"],
        queryFn: async () => {
            const [projectsRes, skillsRes, eduRes, msgRes] = await Promise.all([
                supabase.from("projects").select("id", { count: "exact" }),
                supabase.from("skills").select("id", { count: "exact" }),
                supabase.from("education").select("id", { count: "exact" }),
                supabase.from("contact_messages").select("id", { count: "exact" }).neq("status", "read"),
            ]);
            return {
                projects: projectsRes.count || 0,
                skills: skillsRes.count || 0,
                education: eduRes.count || 0,
                unreadMessages: msgRes.count || 0,
            };
        },
    });
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Projects" value={stats?.projects ?? "-"} href="/admin/projects" icon={<FolderKanban className="text-muted-foreground" size={20}/>}/>
        <StatCard title="Skills" value={stats?.skills ?? "-"} href="/admin/skills" icon={<Wrench className="text-muted-foreground" size={20}/>}/>
        <StatCard title="Education Entries" value={stats?.education ?? "-"} href="/admin/education" icon={<GraduationCap className="text-muted-foreground" size={20}/>}/>
        <StatCard title="Unread Messages" value={stats?.unreadMessages ?? "-"} href="/admin/messages" icon={<Mail className="text-muted-foreground" size={20}/>} highlight={stats?.unreadMessages ? stats.unreadMessages > 0 : false}/>
      </div>
    </div>);
}
function StatCard({ title, value, href, icon, highlight }) {
    return (<Link to={href} className="flex items-center justify-between rounded-lg border bg-card p-6 shadow-sm transition-colors hover:bg-muted/50">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className={`text-3xl font-bold ${highlight ? 'text-blue-600' : ''}`}>{value}</p>
      </div>
      <div className="rounded-full bg-muted p-3">{icon}</div>
    </Link>);
}
