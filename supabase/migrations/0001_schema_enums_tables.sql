-- Supabase schema (Task 3.1): enums + core tables + indexes
-- Safe to re-run: uses IF NOT EXISTS where appropriate

-- Extensions (usually enabled in Supabase, kept here for clarity)
create extension if not exists pgcrypto;

-- =========================
-- Enums
-- =========================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'role') then
    create type role as enum ('driver', 'admin', 'manager', 'viewer');
  end if;
  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type task_status as enum ('pending', 'in_progress', 'blocked', 'completed');
  end if;
  if not exists (select 1 from pg_type where typname = 'task_priority') then
    create type task_priority as enum ('low', 'medium', 'high');
  end if;
  if not exists (select 1 from pg_type where typname = 'task_type') then
    create type task_type as enum (
      'pickup_or_dropoff_car',
      'replacement_car_delivery',
      'drive_client_home',
      'drive_client_to_dealership',
      'licence_test',
      'rescue_stuck_car',
      'other'
    );
  end if;
end$$;

-- =========================
-- Tables
-- =========================

-- Profiles (application profile mapped to auth.users)
create table if not exists public.profiles (
  id uuid primary key, -- typically equals auth.users.id
  email text unique,
  role role not null default 'driver',
  name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_id_fk_auth
    foreign key (id) references auth.users (id) on delete cascade
);

-- Clients
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

-- Vehicles
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  license_plate text not null unique,
  model text,
  vin text unique,
  created_at timestamptz not null default now()
);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type task_type not null,
  priority task_priority not null default 'medium',
  status task_status not null default 'pending',
  estimated_start timestamptz,
  estimated_end timestamptz,
  address text,
  details text,
  client_id uuid references public.clients(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  checklist_schema jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Task assignees (driver assignments)
create table if not exists public.task_assignees (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  driver_id uuid not null references public.profiles(id) on delete cascade,
  is_lead boolean not null default false,
  assigned_at timestamptz not null default now(),
  unique (task_id, driver_id)
);

-- Forms submitted by drivers for a task
create table if not exists public.task_forms (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  driver_id uuid not null references public.profiles(id) on delete cascade,
  form_data jsonb not null default '{}'::jsonb,
  gps_location jsonb,
  submitted_at timestamptz not null default now()
);

-- Signatures captured for a task
create table if not exists public.signatures (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  driver_id uuid not null references public.profiles(id) on delete cascade,
  signature_url text not null,
  signed_by_name text,
  signed_at timestamptz not null default now()
);

-- Images uploaded for a task
create table if not exists public.images (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  driver_id uuid references public.profiles(id) on delete set null,
  image_url text not null,
  description text,
  uploaded_at timestamptz not null default now()
);

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  task_id uuid references public.tasks(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Feature flags
create table if not exists public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  flag_name text not null unique,
  enabled boolean not null default false,
  created_at timestamptz not null default now()
);

-- Task audit log
create table if not exists public.task_audit_log (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null, -- created | updated | status_changed | etc.
  before_data jsonb,
  after_data jsonb,
  changed_at timestamptz not null default now()
);

-- =========================
-- Indexes
-- =========================
create index if not exists idx_tasks_status_end on public.tasks (status, estimated_end);
create index if not exists idx_task_assignees_task on public.task_assignees (task_id);
create index if not exists idx_task_assignees_driver on public.task_assignees (driver_id);
create index if not exists idx_notifications_user_read on public.notifications (user_id, read);
create index if not exists idx_audit_task_changed on public.task_audit_log (task_id, changed_at);

-- Note: RLS policies, triggers, and views are defined in later migrations.


