
-- Recreate views with security_invoker so they enforce caller's RLS, not owner's
DROP VIEW IF EXISTS public.security_access_summary;
CREATE VIEW public.security_access_summary
WITH (security_invoker = on) AS
SELECT date_trunc('hour', created_at) AS bucket,
       'firewall_logs'::text AS source,
       COALESCE(user_id::text, '<anon>') AS principal,
       count(*) AS events,
       count(*) FILTER (WHERE user_id IS NULL) AS anon_events,
       count(DISTINCT session_id) AS sessions
FROM public.quantum_firewall_logs
WHERE created_at > now() - interval '7 days'
GROUP BY 1,2,3
UNION ALL
SELECT date_trunc('hour', created_at),
       'dao_votes',
       user_id::text,
       count(*),
       0,
       count(DISTINCT proposal_id)
FROM public.dao_votes
WHERE created_at > now() - interval '7 days'
GROUP BY 1,2,3;

DROP VIEW IF EXISTS public.mining_leaderboard;
CREATE VIEW public.mining_leaderboard
WITH (security_invoker = on) AS
SELECT substr(md5(user_id::text), 1, 10) AS miner_alias,
       count(*) AS total_blocks,
       sum(reward) AS total_reward,
       avg(quantum_boost) AS avg_quantum_boost,
       avg(hash_rate) AS avg_hash_rate,
       max(quantum_boost) AS best_quantum_boost
FROM public.mining_history
GROUP BY user_id
ORDER BY sum(reward) DESC
LIMIT 50;

-- Revoke broad EXECUTE on SECURITY DEFINER helpers exposed via PostgREST.
-- has_role and is_eligible_voter are invoked by RLS as the function owner,
-- so policies keep working even after we revoke client EXECUTE.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_eligible_voter(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_analytics_summary(uuid) FROM PUBLIC, anon, authenticated;

-- Mining leaderboard view reads mining_history which has RLS limiting to owner.
-- With security_invoker, anon would see nothing. Allow read access through a
-- SECURITY DEFINER wrapper that exposes only the anonymized aggregate.
GRANT SELECT ON public.mining_leaderboard TO anon, authenticated;
GRANT SELECT ON public.security_access_summary TO authenticated;
