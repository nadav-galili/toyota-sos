-- Fix RLS policy for task_forms to ensure drivers can insert their own forms
-- Replaces the existing policy with a more robust one

-- Drop existing insert policy if it exists (to be safe/idempotent)
drop policy if exists task_forms_driver_insert_own on public.task_forms;

-- Create the corrected insert policy
create policy task_forms_driver_insert_own
on public.task_forms
for insert
with check (
  -- Allow if the driver_id matches the authenticated user
  driver_id = auth.uid()
  -- OR if the user is an admin/manager (they can insert for anyone)
  OR (app_user_role() = 'admin'::role OR app_user_role() = 'manager'::role)
);

