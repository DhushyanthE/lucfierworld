ALTER TABLE public.defense_audit_events
  ADD COLUMN IF NOT EXISTS payload_sha3_256 text;

ALTER TABLE public.defense_audit_events
  DROP CONSTRAINT IF EXISTS defense_audit_events_payload_sha3_256_check,
  ADD CONSTRAINT defense_audit_events_payload_sha3_256_check
    CHECK (payload_sha3_256 IS NULL OR payload_sha3_256 ~ '^[0-9a-f]{64}$');

CREATE OR REPLACE FUNCTION public.append_defense_audit_event(
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
) RETURNS public.defense_audit_events
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_head text;
  v_row public.defense_audit_events;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  IF p_payload_hash !~ '^[0-9a-f]{128}$' THEN RAISE EXCEPTION 'invalid SHA3-512 digest'; END IF;
  IF p_payload_sha3_256 !~ '^[0-9a-f]{64}$' THEN RAISE EXCEPTION 'invalid SHA3-256 digest'; END IF;
  IF coalesce(char_length(p_signature_b64), 0) < 16 OR coalesce(char_length(p_public_key_b64), 0) < 16 THEN
    RAISE EXCEPTION 'ML-DSA-87 signature evidence required';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(v_user::text, 0));

  SELECT audit_hash INTO v_head
  FROM public.defense_audit_events
  WHERE user_id = v_user
  ORDER BY created_at DESC, id DESC
  LIMIT 1;

  v_head := coalesce(v_head, repeat('0', 128));
  IF p_previous_audit_hash <> v_head THEN RAISE EXCEPTION 'audit head conflict'; END IF;

  INSERT INTO public.defense_audit_events(
    user_id, correlation_id, source, severity, recommendation, score,
    payload_hash, payload_sha3_256, audit_hash, previous_audit_hash,
    review_engine, review_yes, review_total, quorum_met,
    human_approval_required, executed, reasons, signature_b64, public_key_b64
  ) VALUES (
    v_user, p_correlation_id, p_source, p_severity, p_recommendation, p_score,
    p_payload_hash, p_payload_sha3_256, p_audit_hash, p_previous_audit_hash,
    p_review_engine, p_review_yes, p_review_total, p_quorum_met,
    true, false, p_reasons, p_signature_b64, p_public_key_b64
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END $$;

REVOKE ALL ON FUNCTION public.append_defense_audit_event(
  text,text,text,text,double precision,text,text,text,text,text,integer,integer,boolean,jsonb,text,text
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.append_defense_audit_event(
  text,text,text,text,double precision,text,text,text,text,text,integer,integer,boolean,jsonb,text,text
) TO authenticated;

DO $$
DECLARE
  v_table text;
  v_sensitive text[] := ARRAY[
    'user_secrets','quantum_firewall_logs','quantum_transfer_history','dao_votes',
    'notifications','password_reset_tokens','user_roles','profiles','price_alerts',
    'watchlist','portfolio_holdings','portfolio_snapshots','mining_history',
    'security_audit_log','security_memory_snapshots','dao_eligible_voters'
  ];
BEGIN
  FOREACH v_table IN ARRAY v_sensitive LOOP
    IF to_regclass(format('public.%I', v_table)) IS NOT NULL THEN
      EXECUTE format(
        'REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I FROM anon',
        v_table
      );
    END IF;
  END LOOP;
END $$;
