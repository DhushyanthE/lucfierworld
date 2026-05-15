
CREATE TABLE IF NOT EXISTS public.security_alert_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_key text NOT NULL UNIQUE,
  label text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  threshold integer NOT NULL DEFAULT 1,
  window_minutes integer NOT NULL DEFAULT 5,
  channels jsonb NOT NULL DEFAULT '["slack","email"]'::jsonb,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.security_alert_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view alert settings" ON public.security_alert_settings
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert alert settings" ON public.security_alert_settings
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update alert settings" ON public.security_alert_settings
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete alert settings" ON public.security_alert_settings
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER security_alert_settings_updated_at
  BEFORE UPDATE ON public.security_alert_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.security_alert_settings (alert_key, label, enabled, threshold, window_minutes) VALUES
  ('anon_firewall_writes', 'Anonymous firewall_logs inserts', true, 1, 5),
  ('cross_user_session', 'Session ID used across multiple users', true, 1, 5),
  ('ineligible_dao_vote', 'DAO vote from non-eligible user', true, 1, 5)
ON CONFLICT (alert_key) DO NOTHING;
