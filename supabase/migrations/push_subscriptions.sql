-- Create push_subscriptions table for Web Push
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null,
  keys jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

-- Policies
create policy "Users can insert their own subscriptions"
  on public.push_subscriptions for insert
  with check (user_id = auth.uid());

create policy "Users can view their own subscriptions"
  on public.push_subscriptions for select
  using (user_id = auth.uid());

create policy "Users can delete their own subscriptions"
  on public.push_subscriptions for delete
  using (user_id = auth.uid());

-- Allow admins to view all subscriptions (for debugging or manual dispatch if needed, 
-- though usually dispatch happens via service role)
create policy "Admins can view all subscriptions"
  on public.push_subscriptions for select
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin', 'manager')
  );

