-- Allow anonymous users (drivers with local session) to insert signatures
-- We rely on foreign key constraints to ensure valid data

drop policy if exists "Anon can insert signatures" on public.signatures;

create policy "Anon can insert signatures"
on public.signatures for insert
to anon
with check (true);

-- Also allow them to select their own signatures?
-- Usually needed if the client returns the inserted row
-- But for anon, we can't filter by auth.uid().
-- We can filter by the task_id if needed, but for now let's just allow insert.
-- If the client doesn't select back, this is enough.

