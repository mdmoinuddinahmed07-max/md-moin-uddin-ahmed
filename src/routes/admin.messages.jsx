import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trash, CheckCircle, Upload, Download } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { StateBox } from "@/components/site/Shared";
export const Route = createFileRoute("/admin/messages")({
    component: AdminMessages,
});
function parseCsvLine(line) {
    const result = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                cur += '"';
                i++;
            }
            else {
                inQuotes = !inQuotes;
            }
        }
        else if (ch === "," && !inQuotes) {
            result.push(cur.trim());
            cur = "";
        }
        else {
            cur += ch;
        }
    }
    result.push(cur.trim());
    return result;
}
function parseLeadsCsv(text) {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2)
        return [];
    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim());
    return lines.slice(1).map((line) => {
        const cols = parseCsvLine(line);
        const row = {};
        headers.forEach((h, i) => {
            row[h] = cols[i] ?? "";
        });
        return {
            name: row.name || "Unknown",
            email: row.email || "",
            phone: row.phone || null,
            subject: row.subject || null,
            message: row.message || "",
            status: row.status || "New",
        };
    }).filter((r) => r.name && r.email && r.message);
}
function AdminMessages() {
    const qc = useQueryClient();
    const fileRef = useRef(null);
    const { data: messages, isLoading } = useQuery({
        queryKey: ["admin_messages"],
        queryFn: async () => {
            const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
            if (error)
                throw error;
            return data || [];
        },
    });
    const importCsvMutation = useMutation({
        mutationFn: async (rows) => {
            const { error } = await supabase.from("contact_messages").insert(rows);
            if (error)
                throw error;
            return rows.length;
        },
        onSuccess: (count) => {
            qc.invalidateQueries({ queryKey: ["admin_messages"] });
            qc.invalidateQueries({ queryKey: ["admin_dashboard_stats"] });
            toast.success(`Imported ${count} lead(s) from CSV to Supabase`);
        },
        onError: (err) => toast.error(err.message || "Failed to import CSV"),
    });
    const markReadMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from("contact_messages").update({ status: "read" }).eq("id", id);
            if (error)
                throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin_messages"] });
            qc.invalidateQueries({ queryKey: ["admin_dashboard_stats"] });
            toast.success("Message marked as read");
        },
    });
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from("contact_messages").delete().eq("id", id);
            if (error)
                throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin_messages"] });
            qc.invalidateQueries({ queryKey: ["admin_dashboard_stats"] });
            toast.success("Message deleted successfully");
        },
        onError: (err) => toast.error(err.message || "Failed to delete message"),
    });
    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const text = await file.text();
        const rows = parseLeadsCsv(text);
        e.target.value = "";
        if (!rows.length) {
            toast.error("No valid rows found. Make sure CSV has headers: name,email,phone,subject,message,status");
            return;
        }
        importCsvMutation.mutate(rows);
    };
    const handleExportCsv = () => {
        const header = "name,email,phone,subject,message,status\n";
        const body = (messages || [])
            .map((m) => [m.name, m.email, m.phone || "", m.subject || "", m.message, m.status || "New"]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(","))
            .join("\n");
        const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "contact_messages_leads.csv";
        a.click();
        URL.revokeObjectURL(url);
    };
    if (isLoading)
        return <StateBox>Loading messages...</StateBox>;
    return (<div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Contact Messages</h1>
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFileChange} className="hidden"/>
          <button type="button" onClick={() => fileRef.current?.click()} disabled={importCsvMutation.isPending} className="inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
            <Upload size={14}/> {importCsvMutation.isPending ? "Importing..." : "Import CSV"}
          </button>
          <button type="button" onClick={handleExportCsv} className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-muted">
            <Download size={14}/> Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-3 font-medium">Sender</th>
              <th className="p-3 font-medium">Subject / Message</th>
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!messages?.length ? (<tr>
                <td colSpan={5} className="p-4 text-center text-muted-foreground">
                  No messages found.
                </td>
              </tr>) : (messages.map((m) => (<tr key={m.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-3">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                    {m.phone && <p className="text-xs text-muted-foreground">{m.phone}</p>}
                  </td>
                  <td className="p-3">
                    <p className="font-medium">{m.subject || "No Subject"}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{m.message}</p>
                  </td>
                  <td className="p-3 whitespace-nowrap text-muted-foreground text-xs">
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${m.status === 'read' ? "bg-gray-100 text-gray-700" : "bg-blue-100 text-blue-700"}`}>
                      {m.status === 'read' ? "Read" : "Unread"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {m.status !== 'read' && (<button onClick={() => markReadMutation.mutate(m.id)} title="Mark as Read" className="rounded p-1 text-blue-500 hover:bg-blue-500/10">
                          <CheckCircle size={16}/>
                        </button>)}
                      <button onClick={() => { if (confirm("Are you sure you want to delete this message?"))
            deleteMutation.mutate(m.id); }} title="Delete Message" className="rounded p-1 text-red-500 hover:bg-red-500/10">
                        <Trash size={16}/>
                      </button>
                    </div>
                  </td>
                </tr>)))}
          </tbody>
        </table>
      </div>
    </div>);
}
