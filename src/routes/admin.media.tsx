import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Loader2, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ConfirmDelete, PageTitle } from "@/components/admin/ResourceAdmin";
import { uploadMedia } from "@/components/admin/upload";

export const Route = createFileRoute("/admin/media")({
  head: () => ({ meta: [{ title: "Media library — MD Moin Uddin Ahmed" }, { name: "description", content: "Manage portfolio images." }, { property: "og:title", content: "Portfolio media library" }, { property: "og:description", content: "Manage portfolio images." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: MediaAdmin,
});

const BUCKET = "media";
function MediaAdmin() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "media"],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from(BUCKET).list("uploads", { limit: 100, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw new Error("Could not load media.");
      return (data ?? []).filter((item) => item.name && !item.name.endsWith("/"));
    },
  });
  const remove = useMutation({
    mutationFn: async (name: string) => { const { error } = await supabase.storage.from(BUCKET).remove([`uploads/${name}`]); if (error) throw new Error("Could not delete this image."); },
    onSuccess: () => { setDeleting(null); toast.success("Image deleted"); qc.invalidateQueries({ queryKey: ["admin", "media"] }); },
    onError: (e) => toast.error(e.message),
  });
  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      for (const file of [...files]) await uploadMedia(file);
      toast.success("Upload complete");
      await qc.invalidateQueries({ queryKey: ["admin", "media"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Upload failed"); }
    finally { setBusy(false); }
  }
  async function copyUrl(name: string) {
    const { data: signed, error } = await supabase.storage.from(BUCKET).createSignedUrl(`uploads/${name}`, 60 * 60 * 24 * 365 * 10);
    if (error || !signed) { toast.error("Could not create image link"); return; }
    try { await navigator.clipboard.writeText(signed.signedUrl); toast.success("Long-lived image link copied"); }
    catch { toast.error("Clipboard access is unavailable in this browser"); }
  }
  return <>
    <PageTitle title="Media library"><label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">{busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload images<input type="file" accept="image/*" multiple disabled={busy} className="sr-only" onChange={(e) => { void onUpload(e.target.files); e.currentTarget.value = ""; }} /></label></PageTitle>
    {isLoading ? <p className="py-12 text-center text-muted-foreground">Loading images…</p> : error ? <p role="alert" className="py-12 text-center text-destructive">Media could not be loaded. Check your access and try again.</p> : !data?.length ? <p className="py-12 text-center text-muted-foreground">No images uploaded yet.</p> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.map((item) => {
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(`uploads/${item.name}`);
      const fileUrl = urlData.publicUrl;
      return <article key={item.name} className="overflow-hidden rounded-md border border-border bg-background"><img src={fileUrl} alt={item.name} className="aspect-video w-full object-cover" /><div className="flex items-center justify-between gap-2 p-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.metadata?.size ? `${Math.round(item.metadata.size / 1024)} KB` : "Image"}</p></div><div className="flex shrink-0"><Button aria-label={`Copy URL for ${item.name}`} size="icon" variant="ghost" onClick={() => void copyUrl(item.name)}><Copy /></Button><Button aria-label={`Delete ${item.name}`} size="icon" variant="ghost" onClick={() => setDeleting(item.name)}><Trash2 className="text-destructive" /></Button></div></div></article>;
    })}</div>}
    <ConfirmDelete open={!!deleting} onCancel={() => setDeleting(null)} onConfirm={() => deleting && remove.mutate(deleting)} pending={remove.isPending} />
  </>;
}