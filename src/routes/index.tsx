import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { About, AutomationFlow, EducationTimeline, Projects, Skills } from "@/components/site/Sections";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Shared";
import { homeQuery, SITE_URL } from "@/lib/content";

const TITLE = "MD Moin Uddin Ahmed — AI & Automation | Web Development";
const DESC = "Official portfolio of MD Moin Uddin Ahmed, a BCA student in Hyderabad building practical digital solutions with AI, automation, and modern web technology.";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  head: ({ loaderData }) => ({
    meta: [
      { title: TITLE },
      { name: "description", content: loaderData?.settings?.seo_description || DESC },
      { property: "og:title", content: loaderData?.settings?.seo_title || "MD Moin Uddin Ahmed" },
      { property: "og:description", content: loaderData?.settings?.seo_description || "AI & Automation | Web Development" },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "MD Moin Uddin Ahmed",
          jobTitle: "BCA Student | AI & Automation | Web Development",
          email: "mailto:mdmoinuddinahmed07@gmail.com",
          address: { "@type": "PostalAddress", addressLocality: "Hyderabad", addressCountry: "IN" },
          knowsLanguage: ["English", "Hindi", "Urdu"],
          url: SITE_URL,
        }),
      },
    ],
  }),
  errorComponent: () => <p className="p-20 text-center text-muted-foreground">Content could not load. Please refresh.</p>,
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(homeQuery);
  return (
    <>
      <Navbar />
      <main>
        <Hero s={data.settings} />
        <About s={data.settings} cards={data.about} />
        <Skills skills={data.skills} />
        <Projects projects={data.projects} />
        <EducationTimeline items={data.education} />
        <AutomationFlow />
        <Contact s={data.settings} />
      </main>
      <Footer s={data.settings} />
    </>
  );
}
