import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Trash,
  Upload,
  Download,
  Search,
  Mail,
  Phone,
  Calendar,
  Eye,
  X,
  RefreshCw,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { StateBox } from "@/components/site/Shared";
import { MESSAGE_STATUSES } from "@/lib/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/messages")({
  component: AdminMessages,
});

const STATUS_BADGE = {
  New: "border-primary/40 bg-primary/15 text-primary",
  Contacted: "border-blue-500/40 bg-blue-500/15 text-blue-400",
  "In Progress": "border-amber-500/40 bg-amber-500/15 text-amber-400",
  Completed: "border-emerald-500/40 bg-emerald-500/15 text-emerald-400",
  Archived: "border-border bg-muted text-muted-foreground",
  read: "border-emerald-500/40 bg-emerald-500/15 text-emerald-400",
};

function normalizeStatus(status) {
  if (!status || status === "unread") return "New";
  if (status === "read") return "Completed";
  return MESSAGE_STATUSES.includes(status) ? status : "New";
}

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
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

function parseLeadsCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim());
  return lines
    .slice(1)
    .map((line) => {
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
    })
    .filter((r) => r.name && r.email && r.message);
}

export function BookingsTableSection({ showHeader = true }) {
  const qc = useQueryClient();
  const fileRef = useRef(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedLead, setSelectedLead] = useState(null);

  const { data: messages = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin_messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const importCsvMutation = useMutation({
    mutationFn: async (rows) => {
      const { error } = await supabase.from("contact_messages").insert(rows);
      if (error) throw error;
      return rows.length;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ["admin_messages"] });
      qc.invalidateQueries({ queryKey: ["admin_dashboard_stats"] });
      toast.success(`Imported ${count} booking/lead(s) into Supabase`);
    },
    onError: (err) => toast.error(err.message || "Failed to import CSV"),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const { error } = await supabase
        .from("contact_messages")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["admin_messages"] });
      qc.invalidateQueries({ queryKey: ["admin_dashboard_stats"] });
      if (selectedLead && selectedLead.id === vars.id) {
        setSelectedLead({ ...selectedLead, status: vars.status });
      }
      toast.success(`Status updated to "${vars.status}"`);
    },
    onError: (err) => toast.error(err.message || "Failed to update status"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, deletedId) => {
      qc.invalidateQueries({ queryKey: ["admin_messages"] });
      qc.invalidateQueries({ queryKey: ["admin_dashboard_stats"] });
      if (selectedLead?.id === deletedId) setSelectedLead(null);
      toast.success("Booking / Lead deleted");
    },
    onError: (err) => toast.error(err.message || "Failed to delete message"),
  });

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
    const header = "name,email,phone,subject,message,status,created_at\n";
    const body = messages
      .map((m) =>
        [
          m.name,
          m.email,
          m.phone || "",
          m.subject || "",
          m.message,
          normalizeStatus(m.status),
          m.created_at || "",
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bookings_and_leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const term = search.trim().toLowerCase();
  const filtered = messages.filter((m) => {
    const norm = normalizeStatus(m.status);
    const matchesStatus = statusFilter === "All" || norm === statusFilter;
    const matchesSearch =
      !term ||
      [m.name, m.email, m.phone, m.subject, m.message, norm]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    return matchesStatus && matchesSearch;
  });

  const counts = messages.reduce(
    (acc, m) => {
      const s = normalizeStatus(m.status);
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    { All: messages.length },
  );

  if (isLoading) return <StateBox>Loading booking & lead submissions...</StateBox>;

  return (
    <div className="space-y-5">
      {showHeader && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Booking & Lead Form Submissions</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              View, search, filter, and update the status of all leads submitted from your website Contact / Booking form.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-muted"
            >
              <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} /> Refresh
            </button>
            <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFileChange} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={importCsvMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Upload size={14} /> {importCsvMutation.isPending ? "Importing..." : "Import CSV"}
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-muted"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>
      )}

      {/* Search + Status Filter Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {["All", ...MESSAGE_STATUSES].map((st) => {
            const count = st === "All" ? messages.length : counts[st] || 0;
            const active = statusFilter === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background/60 text-muted-foreground hover:text-foreground",
                )}
              >
                {st}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 font-mono text-[10px]",
                    active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone, subject..."
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-xs focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Bookings / Leads Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3.5 font-semibold">Client / Sender</th>
              <th className="p-3.5 font-semibold">Booking Subject & Message</th>
              <th className="p-3.5 font-semibold">Submitted</th>
              <th className="p-3.5 font-semibold">Status</th>
              <th className="p-3.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!filtered.length ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-muted-foreground">
                  {messages.length
                    ? "No bookings or leads match your current filter."
                    : "No bookings or lead submissions yet. Submit the Contact form on the website or click Import CSV."}
                </td>
              </tr>
            ) : (
              filtered.map((m) => {
                const normStatus = normalizeStatus(m.status);
                return (
                  <tr key={m.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                    <td className="p-3.5 align-top">
                      <p className="font-semibold text-foreground">{m.name}</p>
                      <a
                        href={`mailto:${m.email}`}
                        className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                      >
                        <Mail size={12} /> {m.email}
                      </a>
                      {m.phone && (
                        <a
                          href={`tel:${m.phone}`}
                          className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                        >
                          <Phone size={12} /> {m.phone}
                        </a>
                      )}
                    </td>
                    <td className="max-w-md p-3.5 align-top">
                      <p className="font-medium text-foreground">{m.subject || "General Booking / Inquiry"}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{m.message}</p>
                    </td>
                    <td className="whitespace-nowrap p-3.5 align-top text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} />
                        {m.created_at ? new Date(m.created_at).toLocaleString() : "Just now"}
                      </span>
                    </td>
                    <td className="p-3.5 align-top">
                      <select
                        value={normStatus}
                        onChange={(e) => statusMutation.mutate({ id: m.id, status: e.target.value })}
                        aria-label={`Change status for ${m.name}`}
                        className={cn(
                          "cursor-pointer rounded-full border px-2.5 py-1 text-xs font-semibold focus:outline-none",
                          STATUS_BADGE[normStatus] || STATUS_BADGE.New,
                        )}
                      >
                        {MESSAGE_STATUSES.map((st) => (
                          <option key={st} value={st} className="bg-card text-foreground">
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3.5 text-right align-top">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedLead(m)}
                          title="View Full Booking Details"
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:border-primary/50 hover:text-primary"
                        >
                          <Eye size={13} /> View
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete booking from ${m.name}?`)) deleteMutation.mutate(m.id);
                          }}
                          title="Delete Booking"
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                        >
                          <Trash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedLead(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
              <div>
                <p className="eyebrow">Booking / Lead Details</p>
                <h3 className="mt-1 text-xl font-bold">{selectedLead.name}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Submitted {selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleString() : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-background/50 p-3.5 text-xs">
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <a href={`mailto:${selectedLead.email}`} className="mt-0.5 block font-medium text-primary hover:underline">
                    {selectedLead.email}
                  </a>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p className="mt-0.5 font-medium">{selectedLead.phone || "Not provided"}</p>
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-muted-foreground">Subject</span>
                <p className="mt-1 font-semibold">{selectedLead.subject || "General Booking / Inquiry"}</p>
              </div>

              <div>
                <span className="text-xs font-medium text-muted-foreground">Message</span>
                <div className="mt-1.5 whitespace-pre-wrap rounded-xl border border-border bg-background/60 p-4 text-sm leading-relaxed">
                  {selectedLead.message}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Status:</span>
                  <select
                    value={normalizeStatus(selectedLead.status)}
                    onChange={(e) => statusMutation.mutate({ id: selectedLead.id, status: e.target.value })}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-semibold",
                      STATUS_BADGE[normalizeStatus(selectedLead.status)] || STATUS_BADGE.New,
                    )}
                  >
                    {MESSAGE_STATUSES.map((st) => (
                      <option key={st} value={st} className="bg-card text-foreground">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedLead.email}?subject=Re: ${encodeURIComponent(selectedLead.subject || "Your Inquiry")}`}
                    className="rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Reply via Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminMessages() {
  return <BookingsTableSection showHeader={true} />;
}
