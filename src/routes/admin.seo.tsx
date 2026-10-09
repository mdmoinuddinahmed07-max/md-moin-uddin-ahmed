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

export const Route = createFileRoute("/admin/seo")({
  head: () => routeMeta("SEO settings — MD Moin Uddin Ahmed", "Manage portfolio search and social-sharing metadata."),
  component: SeoAdmin,
});

function SeoAdmin() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery(settingsQuery);
  const [form, setForm] = useState<Record<string, string>>({});
  const settings = data as unknown as Settings | null;
  const values: Record<string, unknown> = { ...settings, ...form };
  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("site_settings").update({ seo_title: String(values["seo_title"] ?? "") || null, seo_description: String(values["seo_description"] ?? "") || null, og_image_url: String(values["og_image_url"] ?? "") || null }).eq("id", 1);
      if (error) throw new Error("Could not save SEO settings.");
    },
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ["public"] }); toast.success("SEO settings saved"); setForm({}); },
    onError: (e) => toast.error(e.message),
  });
  const set = (key: string, value: string) => setForm((old) => ({ ...old, [key]: value }));
  return <>
    <PageTitle title="SEO" />
    {isLoading ? <p className="text-muted-foreground">Loading settings…</p> : error ? <p role="alert" className="text-destructive">Could not load SEO settings.</p> : <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="max-w-2xl space-y-5">
      <div className="space-y-2"><Label htmlFor="seo_title">Page title</Label><Input id="seo_title" value={String(values["seo_title"] ?? "")} maxLength={70} onChange={(e) => set("seo_title", e.target.value)} />{String(values["seo_title"] ?? "").length > 60 && <p className="text-xs text-muted-foreground">Search titles are usually clearest under 60 characters.</p>}</div>
      <div className="space-y-2"><Label htmlFor="seo_description">Description</Label><Textarea id="seo_description" rows={4} maxLength={320} value={String(values["seo_description"] ?? "")} onChange={(e) => set("seo_description", e.target.value)} /><p className="text-xs text-muted-foreground">{String(values["seo_description"] ?? "").length} / 320 characters</p></div>
      <div className="space-y-2"><Label htmlFor="og_image_url">Social sharing image URL</Label><Input id="og_image_url" type="url" value={String(values["og_image_url"] ?? "")} onChange={(e) => set("og_image_url", e.target.value)} placeholder="https://…" /></div>
      {values["og_image_url"] && <img src={String(values["og_image_url"])} alt="Social sharing preview" className="max-h-56 max-w-full rounded-md border border-border object-cover" />}
      <Button disabled={save.isPending}>{save.isPending && <Loader2 className="animate-spin" />} Save SEO settings</Button>
    </form>}
  </>;
}