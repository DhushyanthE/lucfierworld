-- Allow all authenticated users to read mining_history for leaderboard
CREATE POLICY "Leaderboard public read" ON public.mining_history
FOR SELECT TO authenticated
USING (true);