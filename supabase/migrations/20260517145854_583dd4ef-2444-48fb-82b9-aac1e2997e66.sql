CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  stripe_session_id text,
  payment_intent_id text,
  user_id uuid,
  status text NOT NULL DEFAULT 'received',
  error text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view Stripe webhook events" ON public.stripe_webhook_events;
CREATE POLICY "Admins view Stripe webhook events"
ON public.stripe_webhook_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_created_at
ON public.stripe_webhook_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_status
ON public.stripe_webhook_events(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_session
ON public.stripe_webhook_events(stripe_session_id);

DROP TRIGGER IF EXISTS tg_stripe_webhook_events_updated_at ON public.stripe_webhook_events;
CREATE TRIGGER tg_stripe_webhook_events_updated_at
BEFORE UPDATE ON public.stripe_webhook_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.password_reset_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash text NOT NULL,
  requester_hash text NOT NULL,
  attempted_at timestamp with time zone NOT NULL DEFAULT now(),
  allowed boolean NOT NULL DEFAULT false,
  reason text NOT NULL DEFAULT 'unknown'
);

ALTER TABLE public.password_reset_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System only password reset attempts" ON public.password_reset_attempts;
CREATE POLICY "System only password reset attempts"
ON public.password_reset_attempts
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE INDEX IF NOT EXISTS idx_password_reset_attempts_email_time
ON public.password_reset_attempts(email_hash, attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_password_reset_attempts_requester_time
ON public.password_reset_attempts(requester_hash, attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_password_reset_attempts_cleanup
ON public.password_reset_attempts(attempted_at);
