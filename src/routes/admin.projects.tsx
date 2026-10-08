import { createFileRoute } from "@tanstack/react-router";
import { ResourceAdmin, type Column, type Field } from "@/components/admin/ResourceAdmin";
import { slugify, PROJECT_CATEGORIES } from "@/lib/content";
import { routeMeta } from "@/lib/route-meta";

export const Route = createFileRoute("/admin/projects")({
  head: () => routeMeta("Projects CMS — MD Moin Uddin Ahmed", "Create and update portfolio projects."),
  component: ProjectsAdmin,
});

const fields: Field[] = [
  { key: "title", label: "Title", required: true, group: "Basic Information" },
  { key: "slug", label: "Slug", required: true, group: "Basic Information", hint: "Used in the project page URL; keep it unique." },
  { key: "short_description", label: "Short description", type: "textarea", group: "Basic Information" },
  { key: "category", label: "Category", type: "select", options: PROJECT_CATEGORIES, group: "Basic Information" },
  { key: "description", label: "Description", type: "textarea", group: "Content" },
  { key: "long_description", label: "Overview", type: "textarea", group: "Content" },
  { key: "problem", label: "Problem", type: "textarea", group: "Content" },
  { key: "approach", label: "Approach", type: "textarea", group: "Content" },
  { key: "features", label: "Features", type: "tags", group: "Content" },
  { key: "learning", label: "Results / Learning", type: "textarea", group: "Content" },
  { key: "technologies", label: "Technologies", type: "tags", group: "Technologies" },
  { key: "cover_image", label: "Cover image", type: "image", group: "Images" },
  { key: "gallery", label: "Project screenshots", type: "images", group: "Images" },
  { key: "project_url", label: "Live project URL", type: "url", group: "Links" },
  { key: "github_url", label: "Source code URL", type: "url", group: "Links" },
  { key: "seo_title", label: "SEO title", group: "SEO" },
  { key: "seo_description", label: "SEO description", type: "textarea", group: "SEO" },
  { key: "featured", label: "Featured", type: "bool", group: "Publishing" },
  { key: "published", label: "Published", type: "bool", group: "Publishing" },
  { key: "sort_order", label: "Sort order", type: "number", group: "Publishing" },
];
const columns: Column[] = [
  { label: "Image", render: (r) => r["cover_image"] ? <img src={r["cover_image"]} alt="" className="h-10 w-14 rounded object-cover" /> : <span className="text-muted-foreground">—</span> },
  { label: "Title", render: (r) => <span className="font-medium">{r["title"]}</span> },
  { label: "Category", render: (r) => <span className="text-muted-foreground">{r["category"]}</span> },
  { label: "Featured", render: (r) => <span>{r["featured"] ? "Yes" : "—"}</span> },
  { label: "Created", render: (r) => <span className="text-xs text-muted-foreground">{new Date(r["created_at"]).toLocaleDateString()}</span> },
];

function ProjectsAdmin() {
  return <ResourceAdmin table="projects" title="Projects" fields={fields} columns={columns} defaults={{ title: "", slug: "", category: "AI & Automation", description: "", short_description: "", long_description: "", technologies: [], features: [], gallery: [], featured: false, published: false, sort_order: 0 }} searchKeys={["title", "category", "slug", "short_description", "technologies"]} filters={[{ key: "category", label: "Category", options: PROJECT_CATEGORIES }, { key: "published", label: "Published", options: ["true", "false"] }, { key: "featured", label: "Featured", options: ["true", "false"] }]} beforeSave={(v) => ({ ...v, slug: v["slug"]?.trim() || slugify(v["title"] ?? "") })} viewHref={(r) => r["published"] ? `/projects/${r["slug"]}` : null} />;
}