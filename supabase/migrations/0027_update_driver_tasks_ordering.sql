-- Update get_driver_tasks ordering to prioritize by estimated_start and status
-- Drop existing function
drop function if exists public.get_driver_tasks(text, integer, timestamptz, uuid, uuid);

create or replace function public.get_driver_tasks(
  p_tab text default 'today',
  p_limit integer default 10,
  p_cursor_start timestamptz default null,
  p_cursor_id uuid default null,
  p_driver_id uuid default null
)
returns table (
  id uuid,
  type public.task_type,
  priority public.task_priority,
  status public.task_status,
  estimated_start timestamptz,
  estimated_end timestamptz,
  address text,
  client_name text,
  vehicle_license_plate text,
  vehicle_model text,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_driver_id uuid;
  v_now timestamptz := now();
  v_today_start timestamptz;
  v_today_end timestamptz;
begin
  -- Get current driver's profile ID from auth context
  v_driver_id := auth.uid();

  -- If auth.uid() is null, try using the provided p_driver_id parameter
  if v_driver_id is null and p_driver_id is not null then
    v_driver_id := p_driver_id;
  end if;

  -- Verify this is actually a driver profile
  if v_driver_id is not null then
    select p.id into v_driver_id
    from public.profiles p
    where p.id = v_driver_id
    and p.role = 'driver'
    limit 1;
  end if;

  if v_driver_id is null then
    return;
  end if;

  -- Calculate today's range
  v_today_start := date_trunc('day', v_now at time zone 'Asia/Jerusalem') at time zone 'Asia/Jerusalem';
  v_today_end := v_today_start + interval '1 day' - interval '1 second';

  return query
  select
    t.id,
    t.type,
    t.priority,
    t.status,
    t.estimated_start,
    t.estimated_end,
    t.address,
    c.name as client_name,
    v.license_plate as vehicle_license_plate,
    v.model as vehicle_model,
    t.updated_at
  from public.tasks t
  inner join public.task_assignees ta on ta.task_id = t.id
  left join public.clients c on c.id = t.client_id
  left join public.vehicles v on v.id = t.vehicle_id
  where ta.driver_id = v_driver_id
  and (
    case p_tab
      when 'today' then
        (t.estimated_end >= v_today_start and t.estimated_end <= v_today_end)
        or (t.estimated_start >= v_today_start and t.estimated_start <= v_today_end)
        or (t.status::text = 'in_progress' and t.estimated_end >= v_today_start)
      when 'overdue' then
        t.status::text != 'completed'
        and t.estimated_end is not null
        and t.estimated_end < v_now
      when 'all' then
        true
      else
        (t.estimated_end >= v_today_start and t.estimated_end <= v_today_end)
        or (t.estimated_start >= v_today_start and t.estimated_start <= v_today_end)
        or (t.status::text = 'in_progress' and t.estimated_end >= v_today_start)
    end
  )
  and (
    p_cursor_start is null
    or p_cursor_id is null
    or (t.estimated_start > p_cursor_start)
    or (t.estimated_start = p_cursor_start and t.id > p_cursor_id)
  )
  order by 
    case t.status::text
      when 'בהמתנה' then 1    -- pending
      when 'בעבודה' then 2     -- in_progress
      when 'חסומה' then 3      -- blocked
      when 'הושלמה' then 4     -- completed
      else 5
    end,
    t.estimated_start asc nulls last,
    t.id asc
  limit p_limit;
end;
$$;

grant execute on function public.get_driver_tasks to authenticated;
grant execute on function public.get_driver_tasks to anon;

