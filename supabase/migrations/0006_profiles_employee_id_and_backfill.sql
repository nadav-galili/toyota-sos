-- Task 3.6 (part): Add employee_id to profiles and backfill from existing Auth users

-- 1) Add employee_id (unique, nullable so admins need not have it)
alter table public.profiles
  add column if not exists employee_id text unique;

-- 2) Backfill profiles for any auth users missing a profile row
--    Role defaults to 'viewer' unless present in raw_user_meta_data.role
insert into public.profiles (id, email, role, name)
select
  u.id,
  u.email,
  coalesce((u.raw_user_meta_data ->> 'role')::role, 'viewer'::role) as role,
  coalesce(u.raw_user_meta_data ->> 'name', null) as name
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 3) Helpful index for quick employee-id lookups
create index if not exists idx_profiles_employee_id on public.profiles (employee_id);


