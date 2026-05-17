
-- Tighten dao_eligible_voters: remove public-list read; allow self-lookup + admin only
DROP POLICY IF EXISTS "Anyone authenticated reads voter list" ON public.dao_eligible_voters;

CREATE POLICY "Users see own voter eligibility"
ON public.dao_eligible_voters
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- Simplify avatars SELECT policy: bucket is public, drop the request.method shortcut
DROP POLICY IF EXISTS "Public can read avatar files by direct path" ON storage.objects;
CREATE POLICY "Public can read avatar files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');
