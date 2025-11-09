-- Task 3.6: Seed initial feature flags and demo data
-- Idempotent: uses upserts or insert-if-not-exists guards

-- Feature flags (all ON by default)
insert into public.feature_flags (flag_name, enabled)
values
  ('signature_required', true),
  ('multi_driver_assignment', true),
  ('bulk_operations', true),
  ('pdf_generation', true)
on conflict (flag_name) do update set enabled = excluded.enabled;

-- Demo clients (guard by name)
with ins as (
  select 'לקוח א'::text as name, '050-000-0000'::text as phone, 'client.a@example.com'::text as email
  union all
  select 'לקוח ב', '050-111-1111', 'client.b@example.com'
)
insert into public.clients (id, name, phone, email)
select gen_random_uuid(), i.name, i.phone, i.email
from ins i
where not exists (select 1 from public.clients c where c.name = i.name);

-- Demo vehicles (license_plate is unique → safe to upsert-do-nothing)
insert into public.vehicles (license_plate, model, vin)
values
  ('12-345-67', 'Corolla', 'VIN-TEST-1234567'),
  ('89-012-34', 'Yaris', 'VIN-TEST-8901234')
on conflict (license_plate) do nothing;

-- Fetch IDs for associations
with
  c1 as (select id from public.clients where name = 'לקוח א' limit 1),
  c2 as (select id from public.clients where name = 'לקוח ב' limit 1),
  v1 as (select id from public.vehicles where license_plate = '12-345-67' limit 1),
  v2 as (select id from public.vehicles where license_plate = '89-012-34' limit 1),
  sample_checklist as (
    select '{
      "type": "object",
      "title": "בדיקת משימה לפני יציאה",
      "required": ["car_license", "client_license"],
      "properties": {
        "car_license": { "type": "boolean", "title": "לקחת רישיון רכב" },
        "client_license": { "type": "boolean", "title": "לקחת רישיון לקוח" },
        "notes": { "type": "string", "title": "הערות" }
      }
    }'::jsonb as schema
  )
insert into public.tasks (
  title, type, priority, status,
  estimated_start, estimated_end,
  address, details,
  client_id, vehicle_id,
  created_by, updated_by,
  checklist_schema
)
select
  x.title, x.type, x.priority, x.status,
  x.estimated_start, x.estimated_end,
  x.address, x.details,
  x.client_id, x.vehicle_id,
  null::uuid as created_by, null::uuid as updated_by,
  (select schema from sample_checklist)
from (
  -- Overdue pending task
  select
    'מסירת רכב ללקוח'::text as title,
    'pickup_or_dropoff_car'::task_type as type,
    'high'::task_priority as priority,
    'pending'::task_status as status,
    now() - interval '3 hours' as estimated_start,
    now() - interval '2 hours' as estimated_end,
    'תל אביב, דיזנגוף 100'::text as address,
    'לאסוף רכב מהלקוח ולהחזיר למוסך'::text as details,
    (select id from c1) as client_id,
    (select id from v1) as vehicle_id
  union all
  -- In-progress (not overdue)
  select
    'הסעת לקוח למוסך',
    'drive_client_to_dealership'::task_type,
    'medium'::task_priority,
    'in_progress'::task_status,
    now() - interval '30 minutes',
    now() + interval '1 hour',
    'חולון, רחוב הראשונים 5',
    'להסיע את הלקוח למוסך לצורך בדיקה',
    (select id from c2),
    (select id from v2)
  union all
  -- Completed (past)
  select
    'מסירת רכב חלופי',
    'replacement_car_delivery'::task_type,
    'low'::task_priority,
    'completed'::task_status,
    now() - interval '5 hours',
    now() - interval '3 hours',
    'רמת גן, ביאליק 20',
    'מסירת רכב חלופי ללקוח',
    (select id from c1),
    (select id from v2)
) x
-- crude idempotency: avoid duplicating by same title if already exists
where not exists (select 1 from public.tasks t where t.title = x.title);


