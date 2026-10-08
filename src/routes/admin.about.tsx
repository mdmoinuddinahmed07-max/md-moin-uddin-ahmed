import { createFileRoute } from "@tanstack/react-router";
import { ResourceAdmin, type Column, type Field } from "@/components/admin/ResourceAdmin";
import { routeMeta } from "@/lib/route-meta";

export const Route = createFileRoute("/admin/about")({ head: () => routeMeta("About cards CMS — MD Moin Uddin Ahmed", "Manage the public profile introduction cards."), component: AboutAdmin });
const fields: Field[] = [
  { key: "title", label: "Title", required: true },
  { key: "description", label: "Description", type: "textarea" },
  { key: "sort_order", label: "Sort order", type: "number" },
  { key: "published", label: "Published", type: "bool" },
];
const columns: Column[] = [
  { label: "Title", render: (r) => <span className="font-medium">{r["title"]}</span> },
  { label: "Description", render: (r) => <span className="block max-w-md truncate text-muted-foreground">{r["description"]}</span> },
];
function AboutAdmin() {
  return <ResourceAdmin table="about_cards" title="About cards" fields={fields} columns={columns} defaults={{ title: "", description: "", sort_order: 0, published: false }} searchKeys={["title", "description"]} />;
}