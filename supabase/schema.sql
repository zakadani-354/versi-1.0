create table if not exists public.tpq_app_state (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.tpq_app_state enable row level security;
revoke all on public.tpq_app_state from anon, authenticated;
grant all on public.tpq_app_state to service_role;