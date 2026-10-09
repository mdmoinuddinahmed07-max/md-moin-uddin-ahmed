import { Loader2, Mail, MapPin, Phone } from "lucide-react";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Settings } from "@/lib/content";
import { Reveal, SectionHeader } from "./Shared";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(10, "Message should be at least 10 characters").max(5000),
});

const field = "w-full rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none";

export function Contact({ s }: { s: Settings | null }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "loading" || state === "success") return;
    const form = e.currentTarget;
    const parsed = schema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0] as string, i.message])));
      return;
    }
    setErrors({});
    setState("loading");
    const d = parsed.data;
    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: d.name, email: d.email, phone: d.phone || null, subject: d.subject || null, message: d.message,
      });
      if (error) {
        setState("error");
        return;
      }
      form.reset();
      setState("success");
    } catch {
      setState("error");
    }
  }

  return (
    <section id="contact" className="scroll-mt-20 border-t border-border bg-surface py-24">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-[1fr_1.2fr] lg:px-8">
        <div>
          <SectionHeader
            index="06"
            eyebrow="Contact"
            title="Let's Build Something Together"
            subtitle="Have a project, idea, or automation challenge? Let's discuss how technology can turn it into something practical."
          />
          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-3"><MapPin size={17} className="text-primary" />{s?.location}</li>
            {s?.email && <li><a href={`mailto:${s.email}`} className="flex items-center gap-3 hover:text-primary"><Mail size={17} className="text-primary" />{s.email}</a></li>}
            {s?.phone && <li><a href={`tel:${s.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 hover:text-primary"><Phone size={17} className="text-primary" />{s.phone}</a></li>}
          </ul>
        </div>
        <Reveal>
          <form onSubmit={submit} onChange={() => { if (state === "success") setState("idle"); }} noValidate className="grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-card sm:grid-cols-2 sm:p-8">
            {[
              { n: "name", l: "Name *", t: "text", ac: "name" },
              { n: "email", l: "Email *", t: "email", ac: "email" },
              { n: "phone", l: "Phone", t: "tel", ac: "tel" },
              { n: "subject", l: "Subject", t: "text", ac: "off" },
            ].map((f) => (
              <label key={f.n} className="text-sm">
                <span className="mb-1.5 block text-muted-foreground">{f.l}</span>
                <input name={f.n} type={f.t} autoComplete={f.ac} className={field} aria-invalid={!!errors[f.n]} />
                {errors[f.n] && <span className="mt-1 block text-xs text-destructive">{errors[f.n]}</span>}
              </label>
            ))}
            <label className="text-sm sm:col-span-2">
              <span className="mb-1.5 block text-muted-foreground">Message *</span>
              <textarea name="message" rows={5} className={field} aria-invalid={!!errors["message"]} />
              {errors["message"] && <span className="mt-1 block text-xs text-destructive">{errors["message"]}</span>}
            </label>
            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
              <button disabled={state === "loading" || state === "success"} className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-brand px-6 py-3 font-semibold text-primary-foreground shadow-glow disabled:opacity-60">
                {state === "loading" && <Loader2 size={16} className="animate-spin" />} Send Message
              </button>
              <p role="status" className="text-sm">
                {state === "success" && <span className="text-success">Thanks! Your message has been received.</span>}
                {state === "error" && <span className="text-destructive">Something went wrong. Please try again or email directly.</span>}
              </p>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
