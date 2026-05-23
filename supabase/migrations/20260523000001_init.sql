-- ezstemz-web initial schema.
--
-- Two tables:
--   profiles  — 1:1 with auth.users, holds the Stripe customer id and any
--               other app-managed user metadata. NEVER store authorization
--               data in auth.users.raw_user_meta_data, that field is
--               user-editable.
--   purchases — append-only ledger of completed Stripe Checkout sessions.
--               The /api/download gate just SELECTs from here.
--
-- All tables sit in `public` and therefore MUST have RLS enabled. The
-- webhook handler uses the service-role key, which bypasses RLS, so the
-- write-side policies below are conservative (only allow the user to look at
-- their own row).

create extension if not exists "pgcrypto";

-- =============================================================================
-- profiles
-- =============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Re-create policies idempotently so this migration is safe to re-run on a
-- shared dev DB.
drop policy if exists "profiles: owner can select" on public.profiles;
create policy "profiles: owner can select"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Intentionally NO insert/update/delete policies for end users. The webhook
-- + checkout route do all writes via the service-role client. If you want
-- users to edit their own profile fields later, add a row-level UPDATE
-- policy AND remember it also needs a matching SELECT policy (RLS UPDATE
-- requires SELECT to see the row first).


-- =============================================================================
-- purchases
-- =============================================================================
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  amount_total integer,
  currency text,
  status text not null default 'paid' check (status in ('paid', 'refunded')),
  created_at timestamptz not null default now()
);

create index if not exists purchases_user_id_idx
  on public.purchases (user_id, status, created_at desc);

alter table public.purchases enable row level security;

drop policy if exists "purchases: owner can select" on public.purchases;
create policy "purchases: owner can select"
  on public.purchases
  for select
  to authenticated
  using (auth.uid() = user_id);


-- =============================================================================
-- auto-create a profile row for every new auth user
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

-- security definer functions belong in a non-exposed schema if possible;
-- this one is only invoked by an internal auth trigger so leaving it in
-- public is acceptable, but we lock search_path to prevent hijacking via
-- malicious objects in the caller's path.

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- =============================================================================
-- updated_at trigger for profiles
-- =============================================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();
