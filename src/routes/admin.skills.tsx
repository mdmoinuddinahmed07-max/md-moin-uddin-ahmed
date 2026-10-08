import { createFileRoute } from "@tanstack/react-router";
import { ResourceAdmin, type Column, type Field } from "@/components/admin/ResourceAdmin";
import { SKILL_CATEGORIES } from "@/lib/content";
import { routeMeta } from "@/lib/route-meta";

export const Route = createFileRoute("/admin/skills")({ head: () => routeMeta("Skills CMS — MD Moin Uddin Ahmed", "Manage portfolio skills and categories."), component: SkillsAdmin });
const fields: Field[] = [
  { key: "name", label: "Name", required: true },
  { key: "category", label: "Category", type: "select", options: SKILL_CATEGORIES, required: true },
  { key: "description", label: "Description", type: "textarea" },
  { key: "icon", label: "Icon name" },
  { key: "proficiency", label: "Proficiency (optional)", type: "number", hint: "Leave blank unless you want a percentage shown." },
  { key: "sort_order", label: "Sort order", type: "number" },
  { key: "published", label: "Published", type: "bool" },
];
const columns: Column[] = [
  { label: "Name", render: (r) => <span className="font-medium">{r["name"]}</span> },
  { label: "Category", render: (r) => <span className="text-muted-foreground">{r["category"]}</span> },
  { label: "Description", render: (r) => <span className="block max-w-xs truncate text-muted-foreground">{r["description"]}</span> },
];
function SkillsAdmin() {
  return <ResourceAdmin table="skills" title="Skills" fields={fields} columns={columns} defaults={{ name: "", category: SKILL_CATEGORIES[0], description: "", icon: "", proficiency: null, sort_order: 0, published: false }} searchKeys={["name", "category", "description"]} filters={[{ key: "category", label: "Category", options: SKILL_CATEGORIES }, { key: "published", label: "Published", options: ["true", "false"] }]} />;
}