-- Enable RLS on all tables
ALTER TABLE about_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- about_cards
CREATE POLICY "Enable read access for all users" ON about_cards FOR SELECT USING (true);
CREATE POLICY "Enable write access for admins only" ON about_cards FOR ALL USING (has_role('admin', auth.uid()));

-- education
CREATE POLICY "Enable read access for all users" ON education FOR SELECT USING (true);
CREATE POLICY "Enable write access for admins only" ON education FOR ALL USING (has_role('admin', auth.uid()));

-- projects
CREATE POLICY "Enable read access for all users" ON projects FOR SELECT USING (true);
CREATE POLICY "Enable write access for admins only" ON projects FOR ALL USING (has_role('admin', auth.uid()));

-- site_settings
CREATE POLICY "Enable read access for all users" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Enable write access for admins only" ON site_settings FOR ALL USING (has_role('admin', auth.uid()));

-- skills
CREATE POLICY "Enable read access for all users" ON skills FOR SELECT USING (true);
CREATE POLICY "Enable write access for admins only" ON skills FOR ALL USING (has_role('admin', auth.uid()));

-- user_roles
CREATE POLICY "Enable read access for admins" ON user_roles FOR SELECT USING (has_role('admin', auth.uid()));
CREATE POLICY "Enable write access for admins" ON user_roles FOR ALL USING (has_role('admin', auth.uid()));

-- contact_messages
CREATE POLICY "Enable insert for all users" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read/write for admins" ON contact_messages FOR SELECT USING (has_role('admin', auth.uid()));
CREATE POLICY "Enable update for admins" ON contact_messages FOR UPDATE USING (has_role('admin', auth.uid()));
CREATE POLICY "Enable delete for admins" ON contact_messages FOR DELETE USING (has_role('admin', auth.uid()));
