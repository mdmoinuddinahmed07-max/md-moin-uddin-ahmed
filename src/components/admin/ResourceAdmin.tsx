import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Eye, Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { uploadMedia } from "./upload";

type Row = Record<string, any> & { id: string };
export type Field = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "bool" | "select" | "tags" | "image" | "images" | "url";
  options?: string[];
  required?: boolean;
  group?: string;
  hint?: string;
};
export type Column = { label: string; render: (r: Row) => ReactNode };
type Table = "projects" | "skills" | "education" | "about_cards";

export function PageTitle({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold">{title}</h1>
      {children}
    </div>
  );
}

export function ResourceAdmin({
  table, title, fields, columns, defaults, searchKeys, filters = [], viewHref, beforeSave,
}: {
  table: Table; title: string; fields: Field[]; columns: Column[]; defaults: Record<string, any>;
  searchKeys: string[]; filters?: { key: string; label: string; options: string[] }[];
  viewHref?: (r: Row) => string | null; beforeSave?: (v: Record<string, any>) => Record<string, any>;
}) {
  const qc = useQueryClient();
  const key = ["admin", table];
  const { data, isLoading, error } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").order("sort_order").order("created_at");
      if (error) throw error;
      return data as Row[];
    },
  });
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [toDelete, setToDelete] = useState<Row | null>(null);
  const [q, setQ] = useState("");
  const [f, setF] = useState<Record<string, string>>({});

  const invalidate = () => { qc.invalidateQueries({ queryKey: key }); qc.invalidateQueries({ queryKey: ["public"] }); };

  const save = useMutation({
    mutationFn: async (v: Record<string, any>) => {
      const { id, created_at, updated_at, ...rest } = beforeSave ? beforeSave(v) : v;
      const res = id
        ? await supabase.from(table).update(rest as never).eq("id", id)
        : await supabase.from(table).insert(rest as never);
      if (res.error) throw new Error(res.error.code === "23505" ? "That slug is already used." : "Could not save. Check required fields.");
    },
    onSuccess: () => { toast.success("Saved"); setEditing(null); invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from(table).delete().eq("id", id); if (error) throw new Error("Delete failed"); },
    onSuccess: () => { toast.success("Deleted"); setToDelete(null); invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const quick = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, any> }) => { const { error } = await supabase.from(table).update(patch as never).eq("id", id); if (error) throw new Error("Update failed"); },
    onSuccess: invalidate,
    onError: (e) => toast.error(e.message),
  });

  async function move(list: Row[], i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const a = list[i], b = list[j];
    await Promise.all([
      supabase.from(table).update({ sort_order: j } as never).eq("id", a.id),
      supabase.from(table).update({ sort_order: i } as never).eq("id", b.id),
    ]);
    // normalize others
    invalidate();
  }

  const term = q.toLowerCase();
  const rows = (data ?? []).filter(
    (r) =>
      (!term || searchKeys.some((k) => String(Array.isArray(r[k]) ? r[k].join(" ") : r[k] ?? "").toLowerCase().includes(term))) &&
      filters.every((fl) => !f[fl.key] || String(r[fl.key]) === f[fl.key]),
  );
  const groups = [...new Set(fields.map((x) => x.group ?? "Details"))];

  return (
    <>
      <PageTitle title={title}>
        <Button onClick={() => setEditing({ ...defaults, sort_order: data?.length ?? 0 })}><Plus /> Add</Button>
      </PageTitle>
      <div className="mb-4 flex flex-wrap gap-2">
        <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        {filters.map((fl) => (
          <select key={fl.key} value={f[fl.key] ?? ""} onChange={(e) => setF({ ...f, [fl.key]: e.target.value })} className="h-9 rounded-md border border-input bg-background px-3">
            <option value="">{fl.label}: All</option>
            {fl.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
      </div>
      <div className="overflow-x-auto rounded-lg border border-border bg-background">
        {isLoading ? (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : error ? (
          <p className="p-10 text-center text-destructive">Could not load records.</p>
        ) : !rows.length ? (
          <p className="p-10 text-center text-muted-foreground">No records found. Create your first one.</p>
        ) : (
          <table className="w-full text-left">
            <thead className="border-b border-border text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">Order</th>{columns.map((c) => <th key={c.label} className="p-3">{c.label}</th>)}<th className="p-3">Published</th><th className="p-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="p-3"><div className="flex gap-1">
                    <button aria-label="Move up" onClick={() => move(rows, i, -1)} className="text-muted-foreground hover:text-foreground"><ArrowUp size={14} /></button>
                    <button aria-label="Move down" onClick={() => move(rows, i, 1)} className="text-muted-foreground hover:text-foreground"><ArrowDown size={14} /></button>
                  </div></td>
                  {columns.map((c) => <td key={c.label} className="p-3">{c.render(r)}</td>)}
                  <td className="p-3"><Switch checked={r.published} onCheckedChange={(v) => quick.mutate({ id: r.id, patch: { published: v } })} /></td>
                  <td className="p-3"><div className="flex justify-end gap-1">
                    {viewHref?.(r) && <Button size="icon" variant="ghost" asChild><a href={viewHref(r)!} target="_blank" aria-label="View"><Eye /></a></Button>}
                    <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => setEditing(r)}><Pencil /></Button>
                    <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => setToDelete(r)}><Trash2 className="text-destructive" /></Button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "Add"} {title.replace(/s$/, "").toLowerCase()}</DialogTitle></DialogHeader>
          {editing && (
            <form onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }} className="space-y-4">
              {groups.length > 1 ? (
                <Tabs defaultValue={groups[0]}>
                  <TabsList className="flex h-auto flex-wrap">{groups.map((g) => <TabsTrigger key={g} value={g}>{g}</TabsTrigger>)}</TabsList>
                  {groups.map((g) => (
                    <TabsContent key={g} value={g} className="space-y-4 pt-2">
                      {fields.filter((x) => (x.group ?? "Details") === g).map((x) => <FieldInput key={x.key} field={x} value={editing[x.key]} onChange={(v) => setEditing({ ...editing, [x.key]: v })} />)}
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                fields.map((x) => <FieldInput key={x.key} field={x} value={editing[x.key]} onChange={(v) => setEditing({ ...editing, [x.key]: v })} />)
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button disabled={save.isPending}>{save.isPending && <Loader2 className="animate-spin" />} Save</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDelete open={!!toDelete} onCancel={() => setToDelete(null)} onConfirm={() => toDelete && del.mutate(toDelete.id)} pending={del.isPending} />
    </>
  );
}

export function ConfirmDelete({ open, onCancel, onConfirm, pending }: { open: boolean; onCancel: () => void; onConfirm: () => void; pending?: boolean }) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Delete this item?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => { e.preventDefault(); onConfirm(); }} disabled={pending} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function FieldInput({ field, value, onChange }: { field: Field; value: any; onChange: (v: any) => void }) {
  const [busy, setBusy] = useState(false);
  const id = `f-${field.key}`;
  const t = field.type ?? "text";
  async function up(files: FileList | null, multi: boolean) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const urls = await Promise.all([...files].map((f) => uploadMedia(f)));
      onChange(multi ? [...(value ?? []), ...urls] : urls[0]);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Upload failed"); }
    finally { setBusy(false); }
  }
  if (t === "bool")
    return <div className="flex items-center justify-between rounded-md border border-border p-3"><Label htmlFor={id}>{field.label}</Label><Switch id={id} checked={!!value} onCheckedChange={onChange} /></div>;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{field.label}{field.required && " *"}</Label>
      {t === "textarea" ? <Textarea id={id} rows={4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required} />
      : t === "select" ? (
        <select id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
          {field.options!.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : t === "tags" ? (
        <Input id={id} value={(value ?? []).join(", ")} onChange={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="Comma separated" />
      ) : t === "number" ? (
        <Input id={id} type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} />
      ) : t === "image" || t === "images" ? (
        <div className="space-y-2">
          {t === "image" ? (
            <Input id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} placeholder="Image URL or upload" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {(value ?? []).map((u: string) => (
                <div key={u} className="relative"><img src={u} alt="" className="h-16 w-24 rounded object-cover" />
                  <button type="button" aria-label="Remove image" onClick={() => onChange(value.filter((x: string) => x !== u))} className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"><X size={12} /></button></div>
              ))}
            </div>
          )}
          {t === "image" && value && <img src={value} alt="" className="h-24 rounded object-cover" />}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Upload
            <input type="file" accept="image/*" multiple={t === "images"} className="sr-only" onChange={(e) => up(e.target.files, t === "images")} />
          </label>
        </div>
      ) : (
        <Input id={id} type={t === "url" ? "url" : "text"} value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required} />
      )}
      {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
    </div>
  );
}
