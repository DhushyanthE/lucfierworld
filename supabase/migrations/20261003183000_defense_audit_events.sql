-- Durable, owner-scoped Sentinel defensive audit records.
create table if not exists public.defense_audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  correlation_id text not null,
  source text not null check (char_length(source) between 1 and 128),
  severity text not null check (severity in ('low','medium','high','critical')),
  recommendation text not null check (recommendation in ('observe','review','recommend_isolation')),
  score double precision not null check (score >= 0 and score <= 1),
  payload_hash text not null check (payload_hash ~ '^[0-9a-f]{128}$'),
  audit_hash text not null check (audit_hash ~ '^[0-9a-f]{128}$'),
  previous_audit_hash text not null check (previous_audit_hash ~ '^[0-9a-f]{128}$'),
  review_engine text not null,
  review_yes integer not null check (review_yes >= 0),
  review_total integer not null check (review_total > 0),
  quorum_met boolean not null default false,
  human_approval_required boolean not null default true check (human_approval_required = true),
  executed boolean not null default false check (executed = false),
  reasons jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, correlation_id),
  unique (user_id, audit_hash)
);

alter table public.defense_audit_events enable row level security;

drop policy if exists "defense audit owner read" on public.defense_audit_events;
create policy "defense audit owner read"
on public.defense_audit_events for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "defense audit owner insert" on public.defense_audit_events;
create policy "defense audit owner insert"
on public.defense_audit_events for insert
to authenticated
with check (auth.uid() = user_id and human_approval_required = true and executed = false);

-- Audit rows are append-only to authenticated clients: no update/delete policies.
create index if not exists defense_audit_events_user_created_idx
  on public.defense_audit_events(user_id, created_at desc);

alter table public.defense_audit_events replica identity full;
do $$
begin
  alter publication supabase_realtime add table public.defense_audit_events;
exception when duplicate_object then null;
end $$;
