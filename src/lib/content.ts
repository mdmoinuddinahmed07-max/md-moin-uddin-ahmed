import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Settings = Tables<"site_settings">;
export type Project = Tables<"projects">;
export type Skill = Tables<"skills">;
export type Education = Tables<"education">;
export type AboutCard = Tables<"about_cards">;
export type Message = Tables<"contact_messages">;

export const SITE_URL = "https://id-preview--63b97c9b-d689-493a-a4d5-5df8d6e2d377.lovable.app";
export const PROJECT_CATEGORIES = ["AI & Automation", "Web Development", "Creative Technology", "API & Integrations"];
export const SKILL_CATEGORIES = ["AI & Automation", "Web & Design", "Integrations & Data", "Creative Technology", "Productivity"];
export const MESSAGE_STATUSES = ["New", "Contacted", "In Progress", "Completed", "Archived"];

async function must<T>(p: PromiseLike<{ data: T | null; error: unknown }>): Promise<T> {
  const { data, error } = await p;
  if (error) throw new Error("Could not load content");
  return data as T;
}

export const homeQuery = queryOptions({
  queryKey: ["public", "home"],
  queryFn: async () => {
    const [sr, ar, kr, pr, er] = await Promise.all([
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("about_cards").select("*").eq("published", true).order("sort_order"),
      supabase.from("skills").select("*").eq("published", true).order("sort_order"),
      supabase.from("projects").select("*").eq("published", true).order("featured", { ascending: false }).order("sort_order"),
      supabase.from("education").select("*").eq("published", true).order("sort_order"),
    ]);
    if (sr.error || ar.error || kr.error || pr.error || er.error) throw new Error("Could not load content");
    return {
      settings: sr.data as unknown as Settings | null,
      about: ar.data as unknown as AboutCard[],
      skills: kr.data as unknown as Skill[],
      projects: pr.data as unknown as Project[],
      education: er.data as unknown as Education[],
    };
  },
});

export const projectsQuery = queryOptions({
  queryKey: ["public", "projects"],
  queryFn: async () => {
    const { data, error } = await supabase.from("projects").select("*").eq("published", true).order("sort_order");
    if (error) throw new Error("Could not load projects");
    return data as unknown as Project[];
  },
});

export const settingsQuery = queryOptions({
  queryKey: ["public", "settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw new Error("Could not load settings");
    return data as unknown as Settings | null;
  },
});

export const projectQuery = (slug: string) =>
  queryOptions({
    queryKey: ["public", "project", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("slug", slug).eq("published", true).maybeSingle();
      if (error) throw new Error("Could not load project");
      const project = data as unknown as Project | null;
      const related = project
        ? await (async () => {
            const { data: rows, error: relatedError } = await supabase.from("projects").select("*").eq("published", true).neq("id", project.id).order("sort_order").limit(3);
            if (relatedError) throw new Error("Could not load related projects");
            return rows as unknown as Project[];
          })()
        : [];
      return { project, related };
    },
  });

export function slugify(s: string) {
  return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
