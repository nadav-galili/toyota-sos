-- RPC function to submit a task form
-- Allows drivers (including those with localStorage-only sessions) to submit forms safely
-- Bypasses table-level RLS by using SECURITY DEFINER

create or replace function public.submit_task_form(
  p_task_id uuid,
  p_form_data jsonb,
  p_gps_location jsonb default null,
  p_driver_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_driver_id uuid;
  v_new_id uuid;
  v_result jsonb;
begin
  -- 1. Determine the driver ID
  v_driver_id := auth.uid();
  
  if v_driver_id is null and p_driver_id is not null then
    v_driver_id := p_driver_id;
  end if;

  -- 2. Verify the driver ID is valid (exists in profiles and is a driver)
  if v_driver_id is not null then
    select id into v_driver_id
    from public.profiles
    where id = v_driver_id
    and role = 'driver'
    limit 1;
  end if;

  if v_driver_id is null then
    raise exception 'Unauthorized: Valid driver ID required';
  end if;

  -- 3. Verify the driver is actually assigned to this task
  if not exists (
    select 1 from public.task_assignees
    where task_id = p_task_id
    and driver_id = v_driver_id
  ) then
    -- Optional: Allow admin override or fail. For now, fail if not assigned.
    -- You might want to relax this if managers submit on behalf of drivers, but the function name implies driver submission.
    -- If admins use this, we should check their role too.
    -- Let's assume admins might use the direct table insert, but if they use this RPC:
    if auth.uid() is not null then
       if exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'manager')) then
         -- Allow admin/manager to submit without assignment check
         null; 
       else
         raise exception 'Unauthorized: Driver is not assigned to this task';
       end if;
    else
       raise exception 'Unauthorized: Driver is not assigned to this task';
    end if;
  end if;

  -- 4. Insert the form
  insert into public.task_forms (
    task_id,
    driver_id,
    form_data,
    gps_location
  ) values (
    p_task_id,
    v_driver_id,
    p_form_data,
    p_gps_location
  )
  returning id into v_new_id;

  -- 5. Return result
  v_result := jsonb_build_object(
    'success', true,
    'id', v_new_id
  );

  return v_result;
end;
$$;

-- Grant permissions
grant execute on function public.submit_task_form to authenticated;
grant execute on function public.submit_task_form to anon;

