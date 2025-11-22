-- RPC function to update task status
-- Allows drivers (including those with localStorage-only sessions) to update task status safely
-- Bypasses table-level RLS by using SECURITY DEFINER

create or replace function public.update_task_status(
  p_task_id uuid,
  p_status public.task_status,
  p_driver_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_driver_id uuid;
  v_result jsonb;
  v_current_status public.task_status;
begin
  -- 1. Determine the driver ID
  v_driver_id := auth.uid();
  
  if v_driver_id is null and p_driver_id is not null then
    v_driver_id := p_driver_id;
  end if;

  -- 2. Verify the driver ID is valid (exists in profiles and is a driver)
  -- Note: If auth.uid() is present, we assume they are valid user, but we should check role/assignment
  if v_driver_id is not null then
    select id into v_driver_id
    from public.profiles
    where id = v_driver_id
    and role = 'driver'
    limit 1;
  end if;

  if v_driver_id is null then
    -- Check if admin/manager (via auth.uid only)
    if auth.uid() is not null and exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'manager')) then
       -- Admin/Manager can update without being a "driver"
       null;
    else
       raise exception 'Unauthorized: Valid driver ID required';
    end if;
  else
    -- 3. Verify the driver is actually assigned to this task (if not admin)
    if not exists (
      select 1 from public.task_assignees
      where task_id = p_task_id
      and driver_id = v_driver_id
    ) then
       raise exception 'Unauthorized: Driver is not assigned to this task';
    end if;
  end if;

  -- 4. Update the task
  update public.tasks
  set status = p_status,
      updated_at = now(),
      updated_by = v_driver_id -- Track who updated it
  where id = p_task_id
  returning status into v_current_status;

  if not found then
    raise exception 'Task not found';
  end if;

  -- 5. Return result
  v_result := jsonb_build_object(
    'success', true,
    'status', v_current_status
  );

  return v_result;
end;
$$;

-- Grant permissions
grant execute on function public.update_task_status to authenticated;
grant execute on function public.update_task_status to anon;

