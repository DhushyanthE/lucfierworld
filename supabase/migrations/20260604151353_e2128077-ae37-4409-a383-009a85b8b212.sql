
CREATE TABLE public.stripe_webhook_replay_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  event_id text NOT NULL,
  status text NOT NULL,
  error text,
  ip_hash text,
  user_agent text,
  origin text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_swra_admin_created ON public.stripe_webhook_replay_audit(admin_user_id, created_at DESC);
CREATE INDEX idx_swra_event_created ON public.stripe_webhook_replay_audit(event_id, created_at DESC);

GRANT SELECT ON public.stripe_webhook_replay_audit TO authenticated;
GRANT ALL ON public.stripe_webhook_replay_audit TO service_role;

ALTER TABLE public.stripe_webhook_replay_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view replay audit"
ON public.stripe_webhook_replay_audit FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.check_stripe_replay_rate_limit(
  p_user_id uuid,
  p_event_id text,
  p_per_minute int DEFAULT 5,
  p_per_hour int DEFAULT 30,
  p_event_cooldown_seconds int DEFAULT 30
) RETURNS TABLE(allowed boolean, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_minute_count int;
  v_hour_count int;
  v_last_event timestamptz;
BEGIN
  IF p_user_id IS NULL OR p_event_id IS NULL OR length(p_event_id) = 0 THEN
    RETURN QUERY SELECT false, 'invalid_input'::text; RETURN;
  END IF;

  SELECT count(*) INTO v_minute_count
  FROM public.stripe_webhook_replay_audit
  WHERE admin_user_id = p_user_id AND created_at > now() - interval '1 minute';
  IF v_minute_count >= p_per_minute THEN
    RETURN QUERY SELECT false, 'rate_limited_minute'::text; RETURN;
  END IF;

  SELECT count(*) INTO v_hour_count
  FROM public.stripe_webhook_replay_audit
  WHERE admin_user_id = p_user_id AND created_at > now() - interval '1 hour';
  IF v_hour_count >= p_per_hour THEN
    RETURN QUERY SELECT false, 'rate_limited_hour'::text; RETURN;
  END IF;

  SELECT max(created_at) INTO v_last_event
  FROM public.stripe_webhook_replay_audit
  WHERE event_id = p_event_id;
  IF v_last_event IS NOT NULL AND v_last_event > now() - make_interval(secs => p_event_cooldown_seconds) THEN
    RETURN QUERY SELECT false, 'event_cooldown'::text; RETURN;
  END IF;

  RETURN QUERY SELECT true, NULL::text;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_stripe_replay_rate_limit(uuid, text, int, int, int) FROM public, anon, authenticated;
