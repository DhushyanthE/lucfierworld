-- Persist cryptographic evidence for new Sentinel audit rows.
-- Existing legacy rows remain nullable: we never invent signatures or digests.
-- SHA3-512 remains the audit-chain hash; ML-DSA-87 signs canonical SHA3-256.

alter table public.defense_audit_events
  add column if not exists payload_sha3_256 text,
  add column if not exists signature_b64 text,
  add column if not exists public_key_b64 text;

alter table public.defense_audit_events
  drop constraint if exists defense_audit_events_payload_sha3_256_check,
  add constraint defense_audit_events_payload_sha3_256_check
    check (payload_sha3_256 is null or payload_sha3_256 ~ '^[0-9a-f]{64}$'),
  drop constraint if exists defense_audit_events_signature_b64_check,
  add constraint defense_audit_events_signature_b64_check
    check (signature_b64 is null or char_length(signature_b64) between 16 and 20000),
  drop constraint if exists defense_audit_events_public_key_b64_check,
  add constraint defense_audit_events_public_key_b64_check
    check (public_key_b64 is null or char_length(public_key_b64) between 16 and 12000);

drop function if exists public.append_defense_audit_event(
  text,text,text,text,double precision,text,text,text,text,integer,integer,boolean,jsonb
);

drop function if exists public.append_defense_audit_event(
  text,text,text,text,double precision,text,text,text,text,integer,integer,boolean,jsonb,text,text
);

create or replace function public.append_defense_audit_event(
  p_correlation_id text,
  p_source text,
  p_severity text,
  p_recommendation text,
  p_score double precision,
  p_payload_hash text,
  p_payload_sha3_256 text,
  p_audit_hash text,
  p_previous_audit_hash text,
  p_review_engine text,
  p_review_yes integer,
  p_review_total integer,
  p_quorum_met boolean,
  p_reasons jsonb,
  p_signature_b64 text,
  p_public_key_b64 text
) returns public.defense_audit_events
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_head text;
  v_row public.defense_audit_events;
begin
  if v_user is null then
    raise exception 'authentication required';
  end if;

  if p_payload_sha3_256 !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid SHA3-256 digest';
  end if;
  if char_length(p_signature_b64) < 16 or char_length(p_public_key_b64) < 16 then
    raise exception 'signature evidence required';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 0));

  select audit_hash into v_head
  from public.defense_audit_events
  where user_id = v_user
  order by created_at desc, id desc
  limit 1;

  v_head := coalesce(v_head, repeat('0', 128));
  if p_previous_audit_hash <> v_head then
    raise exception 'audit head conflict';
  end if;

  insert into public.defense_audit_events(
    user_id,
    correlation_id,
    source,
    severity,
    recommendation,
    score,
    payload_hash,
    payload_sha3_256,
    audit_hash,
    previous_audit_hash,
    review_engine,
    review_yes,
    review_total,
    quorum_met,
    human_approval_required,
    executed,
    reasons,
    signature_b64,
    public_key_b64
  ) values (
    v_user,
    p_correlation_id,
    p_source,
    p_severity,
    p_recommendation,
    p_score,
    p_payload_hash,
    p_payload_sha3_256,
    p_audit_hash,
    p_previous_audit_hash,
    p_review_engine,
    p_review_yes,
    p_review_total,
    p_quorum_met,
    true,
    false,
    p_reasons,
    p_signature_b64,
    p_public_key_b64
  )
  returning * into v_row;

  return v_row;
end $$;

revoke all on function public.append_defense_audit_event(
  text,text,text,text,double precision,text,text,text,text,text,integer,integer,boolean,jsonb,text,text
) from public;

grant execute on function public.append_defense_audit_event(
  text,text,text,text,double precision,text,text,text,text,text,integer,integer,boolean,jsonb,text,text
) to authenticated;
