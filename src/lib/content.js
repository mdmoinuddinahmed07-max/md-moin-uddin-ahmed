import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
export const SITE_URL = "https://id-preview--63b97c9b-d689-493a-a4d5-5df8d6e2d377.lovable.app";
export const PROJECT_CATEGORIES = ["AI & Automation", "Web Development", "Creative Technology", "API & Integrations"];
export const SKILL_CATEGORIES = ["AI & Automation", "Web & Design", "Integrations & Data", "Creative Technology", "Productivity"];
export const MESSAGE_STATUSES = ["New", "Contacted", "In Progress", "Completed", "Archived"];
const DEFAULT_PROJECT_COVERS = {
    "ai-agent-workflow-automation": "/projects/ai-agent-workflow-automation.jpg",
    "modern-website-design-development": "/projects/modern-website-design-development.jpg",
    "ai-powered-creative-content": "/projects/ai-powered-creative-content.jpg",
};
const CATEGORY_COVERS = {
    "AI & Automation": "/projects/ai-agent-workflow-automation.jpg",
    "Web Development": "/projects/modern-website-design-development.jpg",
    "Creative Technology": "/projects/ai-powered-creative-content.jpg",
};
const FALLBACK_SETTINGS = {
    id: 1,
    full_name: "MOHAMMED MOINUDDIN AHMED",
    headline: "BCA Student | AI & Automation | Web Development",
    hero_description: "I build digital experiences, automation workflows, and AI-powered solutions that turn ideas into practical business solutions.",
    about_summary: "BCA student interested in AI development, workflow automation, and modern web development. Exploring AI agents, n8n, API integrations, responsive website design, and AI-powered creative content. Focused on applying emerging technologies to practical business problems and continuously improving through hands-on projects.",
    location: "Hyderabad, India",
    email: "mdmoinuddinahmed07@gmail.com",
    phone: "+91 6301849129",
    portrait_url: "/portrait.jpg",
    rotating_roles: ["AI & Automation", "AI Developer", "Web Developer", "Automation Specialist", "Creative Technologist"],
    languages: ["English", "Hindi", "Urdu"],
    linkedin_url: null,
    github_url: null,
    youtube_url: null,
    instagram_url: null,
    seo_title: "Mohammed Moinuddin Ahmed — AI & Automation | Web Development",
    seo_description: "Official portfolio of Mohammed Moinuddin Ahmed, a BCA student in Hyderabad building practical digital solutions with AI, automation, and modern web technology.",
    og_image_url: null,
    analytics_id: null,
    available_for_projects: true,
    updated_at: new Date().toISOString(),
};
const FALLBACK_ABOUT = [
    { id: "about-1", title: "BCA Student", description: "Pursuing a Bachelor of Computer Applications at Jain University.", sort_order: 1, published: true, created_at: "", updated_at: "" },
    { id: "about-2", title: "AI & Automation", description: "Exploring AI agents, n8n workflows and business process automation.", sort_order: 2, published: true, created_at: "", updated_at: "" },
    { id: "about-3", title: "Web Development", description: "Designing and building responsive, modern websites.", sort_order: 3, published: true, created_at: "", updated_at: "" },
    { id: "about-4", title: "Creative Technology", description: "Experimenting with AI video and UGC-style ad concepts.", sort_order: 4, published: true, created_at: "", updated_at: "" },
];
const FALLBACK_SKILLS = [
    { id: "skill-1", name: "Generative AI", category: "AI & Automation", description: null, icon: null, proficiency: null, sort_order: 1, published: true, created_at: "", updated_at: "" },
    { id: "skill-2", name: "AI Agents", category: "AI & Automation", description: null, icon: null, proficiency: null, sort_order: 2, published: true, created_at: "", updated_at: "" },
    { id: "skill-3", name: "n8n Workflow Automation", category: "AI & Automation", description: null, icon: null, proficiency: null, sort_order: 3, published: true, created_at: "", updated_at: "" },
    { id: "skill-4", name: "Business Process Automation", category: "AI & Automation", description: null, icon: null, proficiency: null, sort_order: 4, published: true, created_at: "", updated_at: "" },
    { id: "skill-5", name: "Web Development", category: "Web & Design", description: null, icon: null, proficiency: null, sort_order: 1, published: true, created_at: "", updated_at: "" },
    { id: "skill-6", name: "Responsive UI/UX", category: "Web & Design", description: null, icon: null, proficiency: null, sort_order: 2, published: true, created_at: "", updated_at: "" },
    { id: "skill-7", name: "Website Design", category: "Web & Design", description: null, icon: null, proficiency: null, sort_order: 3, published: true, created_at: "", updated_at: "" },
    { id: "skill-8", name: "API Integrations", category: "Integrations & Data", description: null, icon: null, proficiency: null, sort_order: 1, published: true, created_at: "", updated_at: "" },
    { id: "skill-9", name: "Database Concepts", category: "Integrations & Data", description: null, icon: null, proficiency: null, sort_order: 2, published: true, created_at: "", updated_at: "" },
    { id: "skill-10", name: "Backend Concepts", category: "Integrations & Data", description: null, icon: null, proficiency: null, sort_order: 3, published: true, created_at: "", updated_at: "" },
    { id: "skill-11", name: "AI Video Creation", category: "Creative Technology", description: null, icon: null, proficiency: null, sort_order: 1, published: true, created_at: "", updated_at: "" },
    { id: "skill-12", name: "UGC Ad Concepts", category: "Creative Technology", description: null, icon: null, proficiency: null, sort_order: 2, published: true, created_at: "", updated_at: "" },
    { id: "skill-13", name: "Digital Marketing", category: "Creative Technology", description: null, icon: null, proficiency: null, sort_order: 3, published: true, created_at: "", updated_at: "" },
    { id: "skill-14", name: "Microsoft Word", category: "Productivity", description: null, icon: null, proficiency: null, sort_order: 1, published: true, created_at: "", updated_at: "" },
    { id: "skill-15", name: "Microsoft Excel", category: "Productivity", description: null, icon: null, proficiency: null, sort_order: 2, published: true, created_at: "", updated_at: "" },
];
const FALLBACK_PROJECTS = [
    {
        id: "proj-1",
        title: "AI Agent & Workflow Automation",
        slug: "ai-agent-workflow-automation",
        short_description: "Exploring conversational AI agents and n8n workflows for automated business communication and lead-management use cases.",
        description: "Exploring conversational AI agents and n8n workflows for automated business communication and lead-management use cases.",
        long_description: null,
        problem: null,
        approach: null,
        features: [],
        learning: null,
        category: "AI & Automation",
        technologies: ["AI Agents", "n8n", "APIs", "Automation"],
        cover_image: "/projects/ai-agent-workflow-automation.jpg",
        gallery: [],
        project_url: null,
        github_url: null,
        featured: true,
        published: true,
        sort_order: 1,
        seo_title: null,
        seo_description: null,
        created_at: "",
        updated_at: "",
    },
    {
        id: "proj-2",
        title: "Modern Website Design & Development",
        slug: "modern-website-design-development",
        short_description: "Working on concepts for responsive websites, improved user experiences, and AI-assisted website development.",
        description: "Working on concepts for responsive websites, improved user experiences, and AI-assisted website development.",
        long_description: null,
        problem: null,
        approach: null,
        features: [],
        learning: null,
        category: "Web Development",
        technologies: ["React", "TypeScript", "Tailwind CSS", "UI/UX"],
        cover_image: "/projects/modern-website-design-development.jpg",
        gallery: [],
        project_url: null,
        github_url: null,
        featured: true,
        published: true,
        sort_order: 2,
        seo_title: null,
        seo_description: null,
        created_at: "",
        updated_at: "",
    },
    {
        id: "proj-3",
        title: "AI-Powered Creative Content",
        slug: "ai-powered-creative-content",
        short_description: "Experimenting with AI video workflows and UGC-style advertising concepts for digital marketing.",
        description: "Experimenting with AI video workflows and UGC-style advertising concepts for digital marketing.",
        long_description: null,
        problem: null,
        approach: null,
        features: [],
        learning: null,
        category: "Creative Technology",
        technologies: ["Generative AI", "AI Video", "UGC", "Digital Marketing"],
        cover_image: "/projects/ai-powered-creative-content.jpg",
        gallery: [],
        project_url: null,
        github_url: null,
        featured: true,
        published: true,
        sort_order: 3,
        seo_title: null,
        seo_description: null,
        created_at: "",
        updated_at: "",
    },
];
const FALLBACK_EDUCATION = [
    { id: "edu-1", degree: "Bachelor of Computer Applications (BCA)", institution: "Jain University", year: null, status: "Pursuing", description: null, sort_order: 1, published: true, created_at: "", updated_at: "" },
    { id: "edu-2", degree: "Intermediate", institution: "M.S Junior College", year: "2023", status: "Completed", description: null, sort_order: 2, published: true, created_at: "", updated_at: "" },
    { id: "edu-3", degree: "School Certificate (SSC)", institution: "Crown High School", year: "2021", status: "Completed", description: null, sort_order: 3, published: true, created_at: "", updated_at: "" },
];
function withCover(p) {
    if (p.cover_image && !p.cover_image.startsWith("/__l5e/"))
        return p;
    const cover = DEFAULT_PROJECT_COVERS[p.slug] ?? CATEGORY_COVERS[p.category] ?? p.cover_image;
    return { ...p, cover_image: cover };
}
async function safeSingle(p, fallback) {
    const { data, error } = await p;
    if (error || !data)
        return fallback;
    return data;
}
async function safeList(p, fallback) {
    const { data, error } = await p;
    if (error || !data || data.length === 0)
        return fallback;
    return data;
}
export const homeQuery = queryOptions({
    queryKey: ["public", "home"],
    queryFn: async () => {
        const [settings, about, skills, projects, education] = await Promise.all([
            safeSingle(supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(), FALLBACK_SETTINGS),
            safeList(supabase.from("about_cards").select("*").eq("published", true).order("sort_order"), FALLBACK_ABOUT),
            safeList(supabase.from("skills").select("*").eq("published", true).order("sort_order"), FALLBACK_SKILLS),
            safeList(supabase.from("projects").select("*").eq("published", true).order("featured", { ascending: false }).order("sort_order"), FALLBACK_PROJECTS),
            safeList(supabase.from("education").select("*").eq("published", true).order("sort_order"), FALLBACK_EDUCATION),
        ]);
        return { settings, about, skills, projects: projects.map(withCover), education };
    },
});
export const projectsQuery = queryOptions({
    queryKey: ["public", "projects"],
    queryFn: async () => (await safeList(supabase.from("projects").select("*").eq("published", true).order("sort_order"), FALLBACK_PROJECTS)).map(withCover),
});
export const settingsQuery = queryOptions({
    queryKey: ["public", "settings"],
    queryFn: () => safeSingle(supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(), FALLBACK_SETTINGS),
});
export const projectQuery = (slug) => queryOptions({
    queryKey: ["public", "project", slug],
    queryFn: async () => {
        const fallbackProject = FALLBACK_PROJECTS.find((p) => p.slug === slug) ?? null;
        const fallbackRelated = FALLBACK_PROJECTS.filter((p) => p.slug !== slug).slice(0, 3);
        const { data: project, error } = await supabase.from("projects").select("*").eq("slug", slug).eq("published", true).maybeSingle();
        if (error || !project) {
            return { project: fallbackProject ? withCover(fallbackProject) : null, related: fallbackRelated.map(withCover) };
        }
        const related = await safeList(supabase.from("projects").select("*").eq("published", true).neq("id", project.id).order("sort_order").limit(3), fallbackRelated);
        return { project: withCover(project), related: related.map(withCover) };
    },
});
export function slugify(s) {
    return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
