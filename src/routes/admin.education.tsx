import { createFileRoute } from "@tanstack/react-router";
import { ResourceAdmin, type Column, type Field } from "@/components/admin/ResourceAdmin";

export const Route = createFileRoute("/admin/education")({ head: () => ({ meta: [{ title: "Education CMS — MD Moin Uddin Ahmed" }, { name: "robots", content: "noindex" }] }), component: EducationAdmin });
const fields: Field[] = [
  { key: "degree", label: "Degree / certificate", required: true },
  { key: "institution", label: "Institution", required: true },
  { key: "year", label: "Year" },
  { key: "status", label: "Status" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "sort_order", label: "Sort order", type: "number" },
  { key: "published", label: "Published", type: "bool" },
];
const columns: Column[] = [
  { label: "Degree", render: (r) => <span className="font-medium">{r["degree"]}</span> },
  { label: "Institution", render: (r) => <span className="text-muted-foreground">{r["institution"]}</span> },
  { label: "Year", render: (r) => <span>{r["year"] || "—"}</span> },
  { label: "Status", render: (r) => <span>{r["status"] || "—"}</span> },
];
function EducationAdmin() {
  return <ResourceAdmin table="education" title="Education" fields={fields} columns={columns} defaults={{ degree: "", institution: "", year: "", status: "", description: "", sort_order: 0, published: false }} searchKeys={["degree", "institution", "year", "status"]} />;
}