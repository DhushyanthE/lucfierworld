-- Serialize each user's audit chain and append one event atomically.
create or replace function public.append_defense_audit_event(
  p_correlation_id text,
  p_source text,
  p_severity text,
  p_recommendation text,
  p_score double precision,
  p_payload_hash text,
  p_audit_hash text,
  p_previous_audit_hash text,
  p_review_engine text,
  p_review_yes integer,
  p_review_total integer,
  p_quorum_met boolean,
  p_reasons jsonb
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
  if v_user is null then raise exception 'authentication required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 0));
  select audit_hash into v_head
  from public.defense_audit_events
  where user_id = v_user
  order by created_at desc, id desc
  limit 1;

  v_head := coalesce(v_head, repeat('0',128));
  if p_previous_audit_hash <> v_head then
    raise exception 'audit head conflict';
  end if;

  insert into public.defense_audit_events(
    user_id,correlation_id,source,severity,recommendation,score,payload_hash,
    audit_hash,previous_audit_hash,review_engine,review_yes,review_total,
    quorum_met,human_approval_required,executed,reasons
  ) values (
    v_user,p_correlation_id,p_source,p_severity,p_recommendation,p_score,p_payload_hash,
    p_audit_hash,p_previous_audit_hash,p_review_engine,p_review_yes,p_review_total,
    p_quorum_met,true,false,p_reasons
  ) returning * into v_row;
  return v_row;
end $$;

revoke all on function public.append_defense_audit_event(text,text,text,text,double precision,text,text,text,text,integer,integer,boolean,jsonb) from public;
grant execute on function public.append_defense_audit_event(text,text,text,text,double precision,text,text,text,text,integer,integer,boolean,jsonb) to authenticated;
