-- Migration: Create driver_breaks table
-- This allows drivers to log their breaks

create table if not exists public.driver_breaks (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists idx_driver_breaks_driver_id on public.driver_breaks(driver_id);
create index if not exists idx_driver_breaks_active on public.driver_breaks(driver_id) where ended_at is null;

-- Enable RLS
alter table public.driver_breaks enable row level security;

-- Policies
drop policy if exists "Admins and managers can see all breaks" on public.driver_breaks;
create policy "Admins and managers can see all breaks"
on public.driver_breaks for select
using ( app_user_role() = 'admin'::role OR app_user_role() = 'manager'::role );

drop policy if exists "Drivers can see own breaks" on public.driver_breaks;
create policy "Drivers can see own breaks"
on public.driver_breaks for select
using ( driver_id = auth.uid() );

drop policy if exists "Drivers can start breaks" on public.driver_breaks;
create policy "Drivers can start breaks"
on public.driver_breaks for insert
with check ( driver_id = auth.uid() );

drop policy if exists "Drivers can end own breaks" on public.driver_breaks;
create policy "Drivers can end own breaks"
on public.driver_breaks for update
using ( driver_id = auth.uid() )
with check ( driver_id = auth.uid() );

-- Grant permissions
grant all on public.driver_breaks to service_role;
grant select, insert, update on public.driver_breaks to authenticated;
grant select on public.driver_breaks to anon;
