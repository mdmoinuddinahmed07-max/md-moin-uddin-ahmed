import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MESSAGE_STATUSES } from "@/lib/content";
import { PageTitle } from "@/components/admin/ResourceAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDelete } from "@/components/admin/ResourceAdmin";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/messages")({ head: () => ({ meta: [{ title: "Messages — MD Moin Uddin Ahmed" }, { name: "robots", content: "noindex" }] }), component: MessagesAdmin });

function MessagesAdmin() {
  const qc = useQueryClient();
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [del, setDel] = useState<any>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin", "messages"] }); qc.invalidateQueries({ queryKey: ["admin", "dashboard"] }); };
  const change = useMutation({ mutationFn: async ({ id, status }: { id: string; status: string }) => { const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id); if (error) throw new Error("Could not update message"); }, onSuccess: refresh, onError: (e) => toast.error(e.message) });
  const remove = useMutation({ mutationFn: async (id: string) => { const { error } = await supabase.from("contact_messages").delete().eq("id", id); if (error) throw new Error("Could not delete message"); }, onSuccess: () => { setDel(null); toast.success("Message deleted"); refresh(); }, onError: (e) => toast.error(e.message) });
  const filtered = (data ?? []).filter((m) => (!status || m.status === status) && (!term || [m.name, m.email, m.subject].join(" ").toLowerCase().includes(term.toLowerCase())));
  return <>
    <PageTitle title="Messages" />
    <div className="mb-4 flex flex-wrap gap-2"><Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search name, email or subject…" className="max-w-sm" /><select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3"><option value="">All statuses</option>{MESSAGE_STATUSES.map((x) => <option key={x}>{x}</option>)}</select></div>
    <div className="overflow-x-auto rounded-lg border border-border bg-background">
      {isLoading ? <p className="p-10 text-center text-muted-foreground">Loading messages…</p> : error ? <p className="p-10 text-center text-destructive">Could not load messages.</p> : !filtered.length ? <p className="p-10 text-center text-muted-foreground">No messages found.</p> :
        <table className="w-full text-left"><thead className="border-b border-border text-xs uppercase text-muted-foreground"><tr>{["Received", "Name", "Email", "Subject", "Status", "Actions"].map((x) => <th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>
          {filtered.map((m) => <tr key={m.id} className="border-b border-border last:border-0"><td className="whitespace-nowrap p-3 text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</td><td className="p-3">{m.name}</td><td className="p-3"><a href={`mailto:${m.email}`} className="text-primary">{m.email}</a></td><td className="max-w-[180px] truncate p-3">{m.subject || "—"}</td><td className="p-3"><select aria-label={`Status for ${m.name}`} value={m.status} onChange={(e) => change.mutate({ id: m.id, status: e.target.value })} className="h-8 rounded border border-input bg-background px-2">{MESSAGE_STATUSES.map((x) => <option key={x}>{x}</option>)}</select></td><td className="p-3"><div className="flex gap-1"><Button variant="outline" size="sm" onClick={() => setSelected(m)}>Read</Button><Button variant="ghost" size="icon" aria-label={`Delete message from ${m.name}`} onClick={() => setDel(m)}><Trash2 className="text-destructive" /></Button></div></td></tr>)}
        </tbody></table>}
    </div>
    <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}><DialogContent><DialogHeader><DialogTitle>{selected?.subject || "Message"}</DialogTitle></DialogHeader><div className="space-y-3 text-sm"><p><strong>{selected?.name}</strong> · <a className="text-primary" href={`mailto:${selected?.email}`}>{selected?.email}</a></p>{selected?.phone && <p>Phone: {selected.phone}</p>}<p className="whitespace-pre-wrap rounded-md bg-muted p-4">{selected?.message}</p></div></DialogContent></Dialog>
    <ConfirmDelete open={!!del} onCancel={() => setDel(null)} onConfirm={() => del && remove.mutate(del.id)} pending={remove.isPending} />
  </>;
}