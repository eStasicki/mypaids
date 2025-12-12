-- Create avatars bucket for storing user avatars
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB in bytes
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do nothing;

-- Create policy to allow authenticated users to upload their own avatars
-- File names are in format: avatars/{user_id}-{timestamp}.{ext}
create policy "Users can upload their own avatars"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars' and
  split_part(split_part(name, '/', 2), '-', 1) = auth.uid()::text
);

-- Create policy to allow authenticated users to update their own avatars
create policy "Users can update their own avatars"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars' and
  split_part(split_part(name, '/', 2), '-', 1) = auth.uid()::text
);

-- Create policy to allow authenticated users to delete their own avatars
create policy "Users can delete their own avatars"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars' and
  split_part(split_part(name, '/', 2), '-', 1) = auth.uid()::text
);

-- Create policy to allow public read access to avatars
create policy "Public can view avatars"
on storage.objects
for select
to public
using (bucket_id = 'avatars');

