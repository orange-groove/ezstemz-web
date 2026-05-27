-- Backfill profile rows for auth users created before the initial migration.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;
