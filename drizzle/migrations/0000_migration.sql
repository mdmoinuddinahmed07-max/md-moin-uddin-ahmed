create type public.app_role as enum ('admin','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid not null, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$ begin new.updated_at = now(); return new; end $$;

create table public.site_settings (
 id int primary key default 1 check (id = 1),
 full_name text not null default 'MD MOIN UDDIN AHMED',
 headline text not null default 'BCA Student | AI & Automation | Web Development',
 hero_description text not null default '',
 about_summary text not null default '',
 location text default 'Hyderabad, India',
 email text, phone text,
 portrait_url text,
 rotating_roles text[] not null default '{}',
 languages text[] not null default '{}',
 linkedin_url text, github_url text, youtube_url text, instagram_url text,
 seo_title text, seo_description text, og_image_url text,
 analytics_id text,
 available_for_projects boolean not null default true,
 updated_at timestamptz not null default now());
create table public.about_cards (id uuid primary key default gen_random_uuid(), title text not null, description text, sort_order int not null default 0, published boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.skills (id uuid primary key default gen_random_uuid(), name text not null, category text not null, description text, icon text, proficiency int, sort_order int not null default 0, published boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.projects (id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique, short_description text, description text, long_description text, problem text, approach text, features text[] not null default '{}', learning text, category text not null default 'AI & Automation', technologies text[] not null default '{}', cover_image text, gallery text[] not null default '{}', project_url text, github_url text, featured boolean not null default false, published boolean not null default true, sort_order int not null default 0, seo_title text, seo_description text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.education (id uuid primary key default gen_random_uuid(), degree text not null, institution text not null, year text, status text, description text, sort_order int not null default 0, published boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.contact_messages (id uuid primary key default gen_random_uuid(), name text not null, email text not null, phone text, subject text, message text not null, status text not null default 'New', created_at timestamptz not null default now(), updated_at timestamptz not null default now());

grant select on public.site_settings, public.about_cards, public.skills, public.projects, public.education to anon, authenticated;
grant insert, update, delete on public.site_settings, public.about_cards, public.skills, public.projects, public.education to authenticated;
grant select, update, delete on public.contact_messages to authenticated;
grant all on public.site_settings, public.about_cards, public.skills, public.projects, public.education, public.contact_messages to service_role;

alter table public.site_settings enable row level security;
alter table public.about_cards enable row level security;
alter table public.skills enable row level security;
alter table public.projects enable row level security;
alter table public.education enable row level security;
alter table public.contact_messages enable row level security;

create policy "public read" on public.site_settings for select using (true);
create policy "admin write" on public.site_settings for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "public read" on public.about_cards for select using (published or public.has_role(auth.uid(),'admin'));
create policy "admin write" on public.about_cards for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "public read" on public.skills for select using (published or public.has_role(auth.uid(),'admin'));
create policy "admin write" on public.skills for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "public read" on public.projects for select using (published or public.has_role(auth.uid(),'admin'));
create policy "admin write" on public.projects for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "public read" on public.education for select using (published or public.has_role(auth.uid(),'admin'));
create policy "admin write" on public.education for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin read" on public.contact_messages for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin update" on public.contact_messages for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin delete" on public.contact_messages for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create trigger t1 before update on public.site_settings for each row execute function public.touch_updated_at();
create trigger t1 before update on public.about_cards for each row execute function public.touch_updated_at();
create trigger t1 before update on public.skills for each row execute function public.touch_updated_at();
create trigger t1 before update on public.projects for each row execute function public.touch_updated_at();
create trigger t1 before update on public.education for each row execute function public.touch_updated_at();
create trigger t1 before update on public.contact_messages for each row execute function public.touch_updated_at();

insert into public.site_settings (id, hero_description, about_summary, email, phone, rotating_roles, languages, seo_title, seo_description) values (1,
'I build digital experiences, automation workflows, and AI-powered solutions that turn ideas into practical business solutions.',
'BCA student interested in AI development, workflow automation, and modern web development. Exploring AI agents, n8n, API integrations, responsive website design, and AI-powered creative content. Focused on applying emerging technologies to practical business problems and continuously improving through hands-on projects.',
'mdmoinuddinahmed07@gmail.com','+91 6301849129',
array['AI & Automation','AI Developer','Web Developer','Automation Specialist','Creative Technologist'],
array['English','Hindi','Urdu'],
'MD Moin Uddin Ahmed — AI & Automation | Web Development',
'Official portfolio of MD Moin Uddin Ahmed, a BCA student in Hyderabad building practical digital solutions with AI, automation, and modern web technology.');

insert into public.about_cards (title, description, sort_order) values
('BCA Student','Pursuing a Bachelor of Computer Applications at Jain University.',1),
('AI & Automation','Exploring AI agents, n8n workflows and business process automation.',2),
('Web Development','Designing and building responsive, modern websites.',3),
('Creative Technology','Experimenting with AI video and UGC-style ad concepts.',4);

insert into public.skills (name, category, sort_order) values
('Generative AI','AI & Automation',1),('AI Agents','AI & Automation',2),('n8n Workflow Automation','AI & Automation',3),('Business Process Automation','AI & Automation',4),
('Web Development','Web & Design',1),('Responsive UI/UX','Web & Design',2),('Website Design','Web & Design',3),
('API Integrations','Integrations & Data',1),('Database Concepts','Integrations & Data',2),('Backend Concepts','Integrations & Data',3),
('AI Video Creation','Creative Technology',1),('UGC Ad Concepts','Creative Technology',2),('Digital Marketing','Creative Technology',3),
('Microsoft Word','Productivity',1),('Microsoft Excel','Productivity',2);

insert into public.projects (title, slug, short_description, description, category, technologies, featured, sort_order) values
('AI Agent & Workflow Automation','ai-agent-workflow-automation','Exploring conversational AI agents and n8n workflows for automated business communication and lead-management use cases.','Exploring conversational AI agents and n8n workflows for automated business communication and lead-management use cases.','AI & Automation',array['AI Agents','n8n','APIs','Automation'],true,1),
('Modern Website Design & Development','modern-website-design-development','Working on concepts for responsive websites, improved user experiences, and AI-assisted website development.','Working on concepts for responsive websites, improved user experiences, and AI-assisted website development.','Web Development',array['React','TypeScript','Tailwind CSS','UI/UX'],true,2),
('AI-Powered Creative Content','ai-powered-creative-content','Experimenting with AI video workflows and UGC-style advertising concepts for digital marketing.','Experimenting with AI video workflows and UGC-style advertising concepts for digital marketing.','Creative Technology',array['Generative AI','AI Video','UGC','Digital Marketing'],true,3);

insert into public.education (degree, institution, year, status, sort_order) values
('Bachelor of Computer Applications (BCA)','Jain University',null,'Pursuing',1),
('Intermediate','M.S Junior College','2023','Completed',2),
('School Certificate (SSC)','Crown High School','2021','Completed',3);