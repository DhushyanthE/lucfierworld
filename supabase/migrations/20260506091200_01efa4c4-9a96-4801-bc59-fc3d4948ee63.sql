-- 1. Firewall logs — auth required
DROP POLICY IF EXISTS "Users can view their own firewall logs" ON public.quantum_firewall_logs;
DROP POLICY IF EXISTS "Users can insert their own firewall logs" ON public.quantum_firewall_logs;

CREATE POLICY "Authenticated users view their own firewall logs"
ON public.quantum_firewall_logs FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users insert their own firewall logs"
ON public.quantum_firewall_logs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

-- 2. Mining history — owner-only + aggregated leaderboard view
DROP POLICY IF EXISTS "Leaderboard public read" ON public.mining_history;

DROP VIEW IF EXISTS public.mining_leaderboard;
CREATE VIEW public.mining_leaderboard
WITH (security_invoker = true) AS
SELECT
  p.display_name,
  COUNT(m.id)::bigint        AS blocks_mined,
  SUM(m.reward)::numeric     AS total_reward,
  AVG(m.hash_rate)::numeric  AS avg_hash_rate,
  MAX(m.created_at)          AS last_mined_at
FROM public.mining_history m
LEFT JOIN public.profiles p ON p.user_id = m.user_id
GROUP BY p.display_name
ORDER BY total_reward DESC NULLS LAST
LIMIT 100;

GRANT SELECT ON public.mining_leaderboard TO anon, authenticated;

-- 3. DAO votes — private
DROP POLICY IF EXISTS "Users can view votes" ON public.dao_votes;
CREATE POLICY "Users can view their own votes"
ON public.dao_votes FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 4. SECURITY DEFINER function EXECUTE revokes
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_user_analytics_summary(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_user_analytics_summary(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.refresh_analytics_summary() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_analytics_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;

-- 5. Move pg_net out of public (drop + recreate in extensions schema)
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO postgres, service_role;

DO $$
DECLARE
  ext_schema text;
BEGIN
  SELECT n.nspname INTO ext_schema
  FROM pg_extension e
  JOIN pg_namespace n ON n.oid = e.extnamespace
  WHERE e.extname = 'pg_net';

  IF ext_schema = 'public' THEN
    EXECUTE 'DROP EXTENSION pg_net CASCADE';
    EXECUTE 'CREATE EXTENSION pg_net WITH SCHEMA extensions';
  END IF;
END $$;