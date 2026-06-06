DROP POLICY IF EXISTS "Anyone can view proposals" ON public.dao_proposals;
CREATE POLICY "Authenticated users can view proposals" ON public.dao_proposals FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.dao_proposals FROM anon;