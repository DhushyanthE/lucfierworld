
-- Payments table (server-written only)
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  amount_total integer,
  currency text,
  status text NOT NULL DEFAULT 'pending',
  product text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own payments" ON public.payments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all payments" ON public.payments
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE TRIGGER tg_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Customer status (entitlements)
CREATE TABLE public.customer_status (
  user_id uuid PRIMARY KEY,
  tier text NOT NULL DEFAULT 'free',
  active boolean NOT NULL DEFAULT false,
  stripe_customer_id text,
  current_period_end timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.customer_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own status" ON public.customer_status
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all status" ON public.customer_status
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER tg_customer_status_updated_at BEFORE UPDATE ON public.customer_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER TABLE public.payments REPLICA IDENTITY FULL;
ALTER TABLE public.customer_status REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_status;

-- Alert delivery outcomes (for dedup + admin visibility)
CREATE TABLE public.security_alert_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_key text NOT NULL,
  channel text NOT NULL,
  status text NOT NULL,
  error text,
  payload_hash text NOT NULL,
  triggered_count integer NOT NULL DEFAULT 1,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.security_alert_outcomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view alert outcomes" ON public.security_alert_outcomes
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX idx_alert_outcomes_key_hash_time
  ON public.security_alert_outcomes(alert_key, payload_hash, created_at DESC);
CREATE INDEX idx_alert_outcomes_created
  ON public.security_alert_outcomes(created_at DESC);
