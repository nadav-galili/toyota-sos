-- Enforce driver status flow: pending -> in_progress -> completed
-- Drivers cannot skip from pending to completed
-- Admins can change status freely

create or replace function public.update_task_status(
  p_task_id uuid,
  p_status public.task_status,
  p_driver_id uuid default null,
  p_details text default null,
  p_advisor_name text default null
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
  v_is_admin boolean := false;
  v_user_role text;
begin
  -- 1. Determine the driver ID and check if user is admin
  v_driver_id := auth.uid();
  
  if v_driver_id is null and p_driver_id is not null then
    v_driver_id := p_driver_id;
  end if;

  -- Check if the current user (from auth.uid()) is an admin/manager
  if auth.uid() is not null then
    select role into v_user_role
    from public.profiles
    where id = auth.uid()
    limit 1;
    
    if v_user_role in ('admin', 'manager') then
      v_is_admin := true;
    end if;
  end if;

  -- 2. Verify the driver ID is valid (exists in profiles and is a driver)
  if v_driver_id is not null and not v_is_admin then
    select id into v_driver_id
    from public.profiles
    where id = v_driver_id
    and role = 'driver'
    limit 1;
  end if;

  if v_driver_id is null and not v_is_admin then
    raise exception 'Unauthorized: Valid driver ID required';
  end if;

  -- 3. Verify the driver is actually assigned to this task (if not admin)
  if not v_is_admin and v_driver_id is not null then
    if not exists (
      select 1 from public.task_assignees
      where task_id = p_task_id
      and driver_id = v_driver_id
    ) then
       raise exception 'Unauthorized: Driver is not assigned to this task';
    end if;
  end if;

  -- 4. Get current task status
  select status into v_current_status
  from public.tasks
  where id = p_task_id;

  if not found then
    raise exception 'Task not found';
  end if;

  -- 5. Enforce driver status flow (admins bypass this check)
  if not v_is_admin and v_driver_id is not null then
    -- Driver cannot skip from 'בהמתנה' (pending) directly to 'הושלמה' (completed)
    -- Must go through 'בעבודה' (in_progress) first
    if v_current_status::text = 'בהמתנה' and p_status::text = 'הושלמה' then
      raise exception 'INVALID_STATUS_FLOW: Task must be in progress before it can be completed';
    end if;
  end if;

  -- 6. Update the task
  update public.tasks
  set status = p_status,
      updated_at = now(),
      updated_by = coalesce(v_driver_id, auth.uid()), -- Track who updated it
      details = case 
        when p_details is not null and details is not null then details || E'\n\n' || p_details 
        when p_details is not null then p_details 
        else details 
      end,
      advisor_name = coalesce(p_advisor_name, advisor_name)
  where id = p_task_id
  returning status into v_current_status;

  if not found then
    raise exception 'Task not found';
  end if;

  -- 7. Return result
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

