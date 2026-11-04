-- Tighten realtime_pings: the shared ping feed is for signed-in users only;
-- anonymous visitors must not read user-generated ping messages.
DROP POLICY IF EXISTS "Anyone can read pings" ON public.realtime_pings;
CREATE POLICY "Signed-in users can read pings"
  ON public.realtime_pings
  FOR SELECT
  TO authenticated
  USING (true);
REVOKE SELECT ON public.realtime_pings FROM anon;

-- Mining rewards are computed and persisted by the mining engine edge function
-- using service-role privileges; direct client inserts are no longer allowed.
DROP POLICY IF EXISTS "Users can record mining" ON public.mining_history;
REVOKE INSERT ON public.mining_history FROM authenticated;
GRANT INSERT ON public.mining_history TO service_role;
