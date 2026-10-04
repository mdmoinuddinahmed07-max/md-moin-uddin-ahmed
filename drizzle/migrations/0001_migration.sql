grant insert on public.contact_messages to anon, authenticated;
create policy "anyone can submit" on public.contact_messages for insert to anon, authenticated with check (status = 'New' and char_length(name) between 1 and 120 and char_length(email) between 3 and 255 and char_length(message) between 1 and 5000 and coalesce(char_length(subject),0) <= 200 and coalesce(char_length(phone),0) <= 40);
create policy "media read" on storage.objects for select using (bucket_id = 'media');
create policy "media admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.has_role(auth.uid(),'admin'));
create policy "media admin update" on storage.objects for update to authenticated using (bucket_id = 'media' and public.has_role(auth.uid(),'admin'));
create policy "media admin delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.has_role(auth.uid(),'admin'));