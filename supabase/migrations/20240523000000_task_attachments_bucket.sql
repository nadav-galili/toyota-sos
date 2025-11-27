-- Create task-attachments bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('task-attachments', 'task-attachments', true)
on conflict (id) do nothing;

-- Set up RLS for task-attachments bucket

-- 1. Allow authenticated uploads (drivers/admins)
-- Ideally we would check assignment, but storage RLS is often simpler. 
-- We'll allow any authenticated user to upload, and application logic + file path conventions handles organization.
create policy "Authenticated users can upload task attachments"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'task-attachments' );

-- 2. Allow authenticated users to view all task attachments
-- (Simplification: drivers can see all attachments, in a real app might restrict to assigned tasks)
create policy "Authenticated users can view task attachments"
on storage.objects for select
to authenticated
using ( bucket_id = 'task-attachments' );

-- 3. Allow authenticated users to update/delete their own uploads
create policy "Users can update their own task attachments"
on storage.objects for update
to authenticated
using ( bucket_id = 'task-attachments' and owner = auth.uid() );

create policy "Users can delete their own task attachments"
on storage.objects for delete
to authenticated
using ( bucket_id = 'task-attachments' and owner = auth.uid() );

