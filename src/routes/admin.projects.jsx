import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Plus, Pencil, Trash, X } from "lucide-react";
import { toast } from "sonner";
import { StateBox } from "@/components/site/Shared";
export const Route = createFileRoute("/admin/projects")({
    component: AdminProjects,
});
function AdminProjects() {
    const qc = useQueryClient();
    const [editing, setEditing] = useState(null);
    const [isNew, setIsNew] = useState(false);
    // Queries
    const { data: projects, isLoading } = useQuery({
        queryKey: ["admin_projects"],
        queryFn: async () => {
            const { data, error } = await supabase.from("projects").select("*").order("sort_order", { ascending: true });
            if (error)
                throw error;
            return data || [];
        },
    });
    // Mutations
    const createMutation = useMutation({
        mutationFn: async (newProject) => {
            const { data, error } = await supabase.from("projects").insert(newProject).select().single();
            if (error)
                throw error;
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin_projects"] });
            setIsNew(false);
            setEditing(null);
            toast.success("Project created successfully");
        },
        onError: (err) => toast.error(err.message || "Failed to create project"),
    });
    const updateMutation = useMutation({
        mutationFn: async (updated) => {
            const { id, ...rest } = updated;
            const { data, error } = await supabase.from("projects").update(rest).eq("id", id).select().single();
            if (error)
                throw error;
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin_projects"] });
            setEditing(null);
            toast.success("Project updated successfully");
        },
        onError: (err) => toast.error(err.message || "Failed to update project"),
    });
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from("projects").delete().eq("id", id);
            if (error)
                throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin_projects"] });
            toast.success("Project deleted successfully");
        },
        onError: (err) => toast.error(err.message || "Failed to delete project"),
    });
    const handleSave = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get("title"),
            slug: formData.get("slug"),
            category: formData.get("category"),
            short_description: formData.get("short_description"),
            description: formData.get("description"),
            sort_order: parseInt(formData.get("sort_order")) || 0,
            published: formData.get("published") === "on",
            technologies: formData.get("technologies").split(",").map((s) => s.trim()).filter(Boolean),
        };
        if (isNew) {
            createMutation.mutate(data);
        }
        else {
            updateMutation.mutate({ ...data, id: editing.id });
        }
    };
    if (isLoading)
        return <StateBox>Loading projects...</StateBox>;
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Projects</h1>
        <button onClick={() => {
            setIsNew(true);
            setEditing({
                title: "",
                slug: "",
                category: "Web App",
                short_description: "",
                description: "",
                sort_order: (projects?.length || 0) + 1,
                published: false,
                technologies: [],
            });
        }} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
          <Plus size={16}/> New Project
        </button>
      </div>

      {editing && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-background shadow-lg">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">{isNew ? "Create Project" : "Edit Project"}</h2>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground">
                <X size={20}/>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Title</label>
                  <input name="title" required defaultValue={editing.title} className="w-full rounded-md border p-2"/>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Slug</label>
                  <input name="slug" required defaultValue={editing.slug} className="w-full rounded-md border p-2"/>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Category</label>
                  <input name="category" required defaultValue={editing.category} className="w-full rounded-md border p-2"/>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Sort Order</label>
                  <input name="sort_order" type="number" required defaultValue={editing.sort_order} className="w-full rounded-md border p-2"/>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Short Description</label>
                <input name="short_description" defaultValue={editing.short_description} className="w-full rounded-md border p-2"/>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <textarea name="description" rows={4} defaultValue={editing.description} className="w-full rounded-md border p-2"/>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Technologies (comma separated)</label>
                <input name="technologies" defaultValue={editing.technologies?.join(", ")} className="w-full rounded-md border p-2"/>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" name="published" id="published" defaultChecked={editing.published}/>
                <label htmlFor="published" className="text-sm font-medium">Published (Visible to public)</label>
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
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!projects?.length ? (<tr>
                <td colSpan={4} className="p-4 text-center text-muted-foreground">
                  No projects found.
                </td>
              </tr>) : (projects.map((p) => (<tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-3 font-medium">{p.title}</td>
                  <td className="p-3 text-muted-foreground">{p.category}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${p.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setIsNew(false); setEditing(p); }} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                        <Pencil size={16}/>
                      </button>
                      <button onClick={() => { if (confirm("Are you sure you want to delete this project?"))
            deleteMutation.mutate(p.id); }} className="rounded p-1 text-red-500 hover:bg-red-500/10">
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
