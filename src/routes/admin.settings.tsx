import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { settingsQuery } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageTitle } from "@/components/admin/ResourceAdmin";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Site settings — MD Moin Uddin Ahmed" }, { name: "description", content: "Manage portfolio display and analytics settings." }, { property: "og:title", content: "Portfolio site settings" }, { property: "og:description", content: "Manage portfolio display and analytics settings." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: SettingsAdmin,
});

function SettingsAdmin() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery(settingsQuery);
  const [analytics, setAnalytics] = useState<string | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [roles, setRoles] = useState<string | null>(null);
  const [languages, setLanguages] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("site_settings").update({
        analytics_id: analytics ?? data?.analytics_id ?? null,
        available_for_projects: available ?? data?.available_for_projects ?? true,
        rotating_roles: (roles ?? data?.rotating_roles?.join(", ") ?? "").split(",").map((x) => x.trim()).filter(Boolean),
        languages: (languages ?? data?.languages?.join(", ") ?? "").split(",").map((x) => x.trim()).filter(Boolean),
      }).eq("id", 1);
      if (error) throw new Error("Could not save site settings.");
    },
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ["public"] }); toast.success("Settings saved"); setAnalytics(null); setAvailable(null); setRoles(null); setLanguages(null); },
    onError: (e) => toast.error(e.message),
  });
  return <>
    <PageTitle title="Settings" />
    {isLoading ? <p className="text-muted-foreground">Loading settings…</p> : error ? <p role="alert" className="text-destructive">Could not load site settings.</p> : <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="max-w-2xl space-y-6">
      <section className="space-y-4"><h2 className="text-lg font-semibold">Homepage</h2><div className="space-y-2"><Label htmlFor="roles">Rotating headline phrases</Label><Input id="roles" value={roles ?? data?.rotating_roles?.join(", ") ?? ""} onChange={(e) => setRoles(e.target.value)} /><p className="text-xs text-muted-foreground">Separate phrases with commas.</p></div><div className="space-y-2"><Label htmlFor="languages">Languages</Label><Input id="languages" value={languages ?? data?.languages?.join(", ") ?? ""} onChange={(e) => setLanguages(e.target.value)} /><p className="text-xs text-muted-foreground">Separate languages with commas.</p></div><div className="flex items-center justify-between rounded-md border border-border p-3"><Label htmlFor="available">Available for projects</Label><Switch id="available" checked={available ?? data?.available_for_projects ?? true} onCheckedChange={setAvailable} /></div></section>
      <section className="space-y-3"><h2 className="text-lg font-semibold">Analytics</h2><div className="space-y-2"><Label htmlFor="analytics">Google Analytics measurement ID</Label><Input id="analytics" value={analytics ?? data?.analytics_id ?? ""} onChange={(e) => setAnalytics(e.target.value)} placeholder="G-XXXXXXXXXX" /><p className="text-xs text-muted-foreground">Tracking only loads when this is a valid measurement ID.</p></div></section>
      <Button disabled={save.isPending}>{save.isPending && <Loader2 className="animate-spin" />} Save settings</Button>
    </form>}
  </>;
}