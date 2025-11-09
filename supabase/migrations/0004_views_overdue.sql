-- Task 3.4: overdue_tasks view
-- Shows tasks past their estimated_end and not completed, with seconds overdue

create or replace view public.overdue_tasks as
select
  t.id,
  t.title,
  t.type,
  t.priority,
  t.status,
  t.estimated_start,
  t.estimated_end,
  t.client_id,
  t.vehicle_id,
  t.created_by,
  t.updated_by,
  t.created_at,
  t.updated_at,
  greatest(0, extract(epoch from (now() - t.estimated_end)))::bigint as seconds_overdue
from public.tasks t
where
  t.estimated_end is not null
  and t.status <> 'completed'
  and t.estimated_end < now();


