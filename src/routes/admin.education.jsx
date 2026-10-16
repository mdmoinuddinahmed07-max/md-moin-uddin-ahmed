import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Plus, Pencil, Trash, X } from "lucide-react";
import { toast } from "sonner";
import { StateBox } from "@/components/site/Shared";
export const Route = createFileRoute("/admin/education")({
    component: AdminEducation,
});
function AdminEducation() {
    const qc = useQueryClient();
    const [editing, setEditing] = useState(null);
    const [isNew, setIsNew] = useState(false);
    const { data: educationList, isLoading } = useQuery({
        queryKey: ["admin_education"],
        queryFn: async () => {
            const { data, error } = await supabase.from("education").select("*").order("sort_order", { ascending: true });
            if (error)
                throw error;
            return data || [];
        },
    });
    const createMutation = useMutation({
        mutationFn: async (newItem) => {
            const { data, error } = await supabase.from("education").insert(newItem).select().single();
            if (error)
                throw error;
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin_education"] });
            setIsNew(false);
            setEditing(null);
            toast.success("Education entry created successfully");
        },
        onError: (err) => toast.error(err.message || "Failed to create entry"),
    });
    const updateMutation = useMutation({
        mutationFn: async (updated) => {
            const { id, ...rest } = updated;
            const { data, error } = await supabase.from("education").update(rest).eq("id", id).select().single();
            if (error)
                throw error;
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin_education"] });
            setEditing(null);
            toast.success("Education entry updated successfully");
        },
        onError: (err) => toast.error(err.message || "Failed to update entry"),
    });
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from("education").delete().eq("id", id);
            if (error)
                throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin_education"] });
            toast.success("Education entry deleted successfully");
        },
        onError: (err) => toast.error(err.message || "Failed to delete entry"),
    });
    const handleSave = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            degree: formData.get("degree"),
            institution: formData.get("institution"),
            year: formData.get("year"),
            status: formData.get("status"),
            description: formData.get("description"),
            sort_order: parseInt(formData.get("sort_order")) || 0,
            published: formData.get("published") === "on",
        };
        if (isNew) {
            createMutation.mutate(data);
        }
        else {
            updateMutation.mutate({ ...data, id: editing.id });
        }
    };
    if (isLoading)
        return <StateBox>Loading education...</StateBox>;
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Education</h1>
        <button onClick={() => {
            setIsNew(true);
            setEditing({
                degree: "",
                institution: "",
                year: "",
                status: "Completed",
                description: "",
                sort_order: (educationList?.length || 0) + 1,
                published: true,
            });
        }} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
          <Plus size={16}/> New Entry
        </button>
      </div>

      {editing && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-background shadow-lg">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">{isNew ? "Create Entry" : "Edit Entry"}</h2>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground">
                <X size={20}/>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Degree</label>
                  <input name="degree" required defaultValue={editing.degree} className="w-full rounded-md border p-2"/>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Institution</label>
                  <input name="institution" required defaultValue={editing.institution} className="w-full rounded-md border p-2"/>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Year</label>
                  <input name="year" defaultValue={editing.year || ""} className="w-full rounded-md border p-2"/>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Status</label>
                  <input name="status" defaultValue={editing.status || ""} className="w-full rounded-md border p-2"/>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Sort Order</label>
                  <input name="sort_order" type="number" required defaultValue={editing.sort_order} className="w-full rounded-md border p-2"/>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <textarea name="description" rows={3} defaultValue={editing.description || ""} className="w-full rounded-md border p-2"/>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" name="published" id="published" defaultChecked={editing.published}/>
                <label htmlFor="published" className="text-sm font-medium">Published</label>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <button type="button" onClick={() => setEditing(null)} className="rounded-md px-4 py-2 hover:bg-muted">
                  Cancel
                </button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>)}

      <div className="rounded-lg border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-3 font-medium">Degree & Institution</th>
              <th className="p-3 font-medium">Year</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!educationList?.length ? (<tr>
                <td colSpan={4} className="p-4 text-center text-muted-foreground">
                  No education entries found.
                </td>
              </tr>) : (educationList.map((e) => (<tr key={e.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-3">
                    <p className="font-medium">{e.degree}</p>
                    <p className="text-xs text-muted-foreground">{e.institution}</p>
                  </td>
                  <td className="p-3 text-muted-foreground">{e.year || "-"}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${e.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {e.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setIsNew(false); setEditing(e); }} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                        <Pencil size={16}/>
                      </button>
                      <button onClick={() => { if (confirm("Are you sure you want to delete this entry?"))
            deleteMutation.mutate(e.id); }} className="rounded p-1 text-red-500 hover:bg-red-500/10">
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
