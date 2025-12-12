-- Drop existing policies if they exist
drop policy if exists "Users can upload their own avatars" on storage.objects;
drop policy if exists "Users can update their own avatars" on storage.objects;
drop policy if exists "Users can delete their own avatars" on storage.objects;

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

