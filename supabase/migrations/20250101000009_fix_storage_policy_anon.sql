-- Allow anonymous users to upload to task-attachments
-- This is required because the driver auth system has a fallback to "local session"
-- where the Supabase Auth user might not be signed in (anon).

-- Drop policies if they exist to allow re-running this migration without errors
drop policy if exists "Anon can upload task attachments" on storage.objects;
drop policy if exists "Anon can update task attachments" on storage.objects;
drop policy if exists "Anon can view task attachments" on storage.objects;

-- INSERT: Allow anon to upload new files
create policy "Anon can upload task attachments"
on storage.objects for insert
to anon
with check ( bucket_id = 'task-attachments' );

-- UPDATE: Allow anon to update files (needed for upsert: true)
-- We restrict this to task-attachments bucket.
-- Note: Since filenames contain UUIDs, the risk of blind overwrites is low.
create policy "Anon can update task attachments"
on storage.objects for update
to anon
using ( bucket_id = 'task-attachments' );

-- SELECT: Allow anon to view files (needed for verification/preview)
create policy "Anon can view task attachments"
on storage.objects for select
to anon
using ( bucket_id = 'task-attachments' );
