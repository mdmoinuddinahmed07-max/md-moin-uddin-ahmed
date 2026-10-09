import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { settingsQuery, type Settings } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageTitle } from "@/components/admin/ResourceAdmin";
import { Loader2 } from "lucide-react";
import { routeMeta } from "@/lib/route-meta";

export const Route = createFileRoute("/admin/profile")({
  head: () => routeMeta("Profile — MD Moin Uddin Ahmed", "Manage public portfolio profile information."),
  component: ProfileAdmin,
});

function ProfileAdmin() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery(settingsQuery);
  const [form, setForm] = useState<Record<string, string>>({});
  const settings = data as unknown as Settings | null;
  const values: Record<string, unknown> = { ...settings, ...form };
  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("site_settings").update({
        full_name: String(values["full_name"] ?? ""), headline: String(values["headline"] ?? ""), hero_description: String(values["hero_description"] ?? ""),
        about_summary: String(values["about_summary"] ?? ""), location: String(values["location"] ?? ""), email: String(values["email"] ?? ""), phone: String(values["phone"] ?? ""),
        linkedin_url: String(values["linkedin_url"] ?? "") || null, github_url: String(values["github_url"] ?? "") || null, youtube_url: String(values["youtube_url"] ?? "") || null, instagram_url: String(values["instagram_url"] ?? "") || null,
        portrait_url: String(values["portrait_url"] ?? "") || null,
      }).eq("id", 1);
      if (error) throw new Error("Could not save profile changes.");
    },
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ["public"] }); toast.success("Profile saved"); setForm({}); },
    onError: (e) => toast.error(e.message),
  });
  const set = (key: string, value: string) => setForm((old) => ({ ...old, [key]: value }));
  const input = (key: keyof Settings, label: string, type = "text") => <div className="space-y-2"><Label htmlFor={key}>{label}</Label><Input id={key} type={type} value={String(values[key] ?? "")} onChange={(e) => set(key, e.target.value)} /></div>;
  return <>
    <PageTitle title="Profile" />
    {isLoading ? <p className="text-muted-foreground">Loading profile…</p> : error ? <p role="alert" className="text-destructive">Could not load profile.</p> : <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="max-w-3xl space-y-6">
      <section className="grid gap-4 sm:grid-cols-2"><h2 className="sm:col-span-2 text-lg font-semibold">Identity</h2>{input("full_name", "Full name")}{input("headline", "Professional headline")}{input("location", "Location")}{input("email", "Public email", "email")}{input("phone", "Public phone", "tel")}</section>
      <section className="space-y-4"><h2 className="text-lg font-semibold">Introduction</h2><div className="space-y-2"><Label htmlFor="hero_description">Hero description</Label><Textarea id="hero_description" rows={3} value={String(values["hero_description"] ?? "")} onChange={(e) => set("hero_description", e.target.value)} /></div><div className="space-y-2"><Label htmlFor="about_summary">About summary</Label><Textarea id="about_summary" rows={5} value={String(values["about_summary"] ?? "")} onChange={(e) => set("about_summary", e.target.value)} /></div></section>
      <section className="grid gap-4 sm:grid-cols-2"><h2 className="sm:col-span-2 text-lg font-semibold">Social links</h2>{input("linkedin_url", "LinkedIn URL", "url")}{input("github_url", "GitHub URL", "url")}{input("youtube_url", "YouTube URL", "url")}{input("instagram_url", "Instagram URL", "url")}{input("portrait_url", "Portrait image URL", "url")}</section>
      <Button disabled={save.isPending}>{save.isPending && <Loader2 className="animate-spin" />} Save profile</Button>
    </form>}
  </>;
}