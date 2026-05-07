-- Drop existing leaderboard view to allow column rename
DROP VIEW IF EXISTS public.mining_leaderboard CASCADE;

CREATE SCHEMA IF NOT EXISTS security;

CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID,
  action TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'hardening',
  target TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view audit log" ON public.security_audit_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert audit log" ON public.security_audit_log
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND auth.uid() = actor_user_id);

CREATE TABLE IF NOT EXISTS public.security_memory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.security_memory_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view memory snapshots" ON public.security_memory_snapshots
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert memory snapshots" ON public.security_memory_snapshots
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND created_by = auth.uid());

CREATE TABLE IF NOT EXISTS public.dao_eligible_voters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  added_by UUID,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dao_eligible_voters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated reads voter list" ON public.dao_eligible_voters
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage voters" ON public.dao_eligible_voters
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.is_eligible_voter(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.dao_eligible_voters WHERE user_id = _user_id)
$$;
REVOKE EXECUTE ON FUNCTION public.is_eligible_voter(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_eligible_voter(UUID) TO authenticated;

DROP POLICY IF EXISTS "Users can cast votes" ON public.dao_votes;
CREATE POLICY "Eligible voters can cast votes" ON public.dao_votes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.is_eligible_voter(auth.uid()));

CREATE OR REPLACE FUNCTION security.assert_rls_integrity()
RETURNS TABLE(check_name TEXT, status TEXT, detail TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, security AS $$
DECLARE
  v_table TEXT;
  v_sensitive TEXT[] := ARRAY['user_secrets','quantum_firewall_logs','quantum_transfer_history','dao_votes','notifications','password_reset_tokens','user_roles','profiles','price_alerts','watchlist','portfolio_holdings','portfolio_snapshots','mining_history','security_audit_log','security_memory_snapshots','dao_eligible_voters'];
  v_rls BOOLEAN;
  v_count INT;
BEGIN
  FOREACH v_table IN ARRAY v_sensitive LOOP
    SELECT relrowsecurity INTO v_rls FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relname=v_table;
    IF v_rls IS NULL THEN
      check_name := 'rls_enabled:'||v_table; status := 'SKIP'; detail := 'table missing';
      RETURN NEXT;
    ELSIF NOT v_rls THEN
      check_name := 'rls_enabled:'||v_table; status := 'FAIL'; detail := 'RLS disabled';
      RETURN NEXT;
      RAISE EXCEPTION 'RLS regression: % has RLS disabled', v_table;
    ELSE
      check_name := 'rls_enabled:'||v_table; status := 'PASS'; detail := '';
      RETURN NEXT;
    END IF;
  END LOOP;

  SELECT count(*) INTO v_count FROM pg_policies WHERE schemaname='public' AND tablename='user_secrets'
    AND (qual <> 'false' OR (with_check IS NOT NULL AND with_check <> 'false'));
  IF v_count > 0 THEN
    check_name := 'user_secrets_deny_all'; status := 'FAIL'; detail := 'permissive policy';
    RETURN NEXT;
    RAISE EXCEPTION 'user_secrets has permissive policies';
  END IF;
  check_name := 'user_secrets_deny_all'; status := 'PASS'; detail := ''; RETURN NEXT;

  SELECT count(*) INTO v_count FROM information_schema.role_table_grants
    WHERE grantee='anon' AND table_schema='public'
      AND table_name = ANY(v_sensitive) AND privilege_type IN ('SELECT','INSERT','UPDATE','DELETE');
  IF v_count > 0 THEN
    check_name := 'anon_no_grants_on_sensitive'; status := 'FAIL'; detail := v_count::text||' grants';
    RETURN NEXT;
    RAISE EXCEPTION 'anon has direct grants on sensitive tables';
  END IF;
  check_name := 'anon_no_grants_on_sensitive'; status := 'PASS'; detail := ''; RETURN NEXT;
END $$;

REVOKE EXECUTE ON FUNCTION security.assert_rls_integrity() FROM PUBLIC;

CREATE OR REPLACE VIEW public.security_access_summary
WITH (security_invoker = true) AS
SELECT
  date_trunc('hour', created_at) AS bucket,
  'firewall_logs'::text AS source,
  COALESCE(user_id::text,'<anon>') AS principal,
  count(*) AS events,
  count(*) FILTER (WHERE user_id IS NULL) AS anon_events,
  count(DISTINCT session_id) AS sessions
FROM public.quantum_firewall_logs
WHERE created_at > now() - interval '7 days'
GROUP BY 1,2,3
UNION ALL
SELECT
  date_trunc('hour', created_at), 'dao_votes', user_id::text,
  count(*), 0, count(DISTINCT proposal_id)
FROM public.dao_votes
WHERE created_at > now() - interval '7 days'
GROUP BY 1,2,3;

REVOKE ALL ON public.security_access_summary FROM PUBLIC;
GRANT SELECT ON public.security_access_summary TO authenticated;

CREATE OR REPLACE VIEW public.mining_leaderboard AS
SELECT
  substr(md5(user_id::text), 1, 10) AS miner_alias,
  count(*) AS total_blocks,
  sum(reward) AS total_reward,
  avg(quantum_boost) AS avg_quantum_boost,
  avg(hash_rate) AS avg_hash_rate,
  max(quantum_boost) AS best_quantum_boost
FROM public.mining_history
GROUP BY user_id
ORDER BY total_reward DESC
LIMIT 50;

GRANT SELECT ON public.mining_leaderboard TO anon, authenticated;