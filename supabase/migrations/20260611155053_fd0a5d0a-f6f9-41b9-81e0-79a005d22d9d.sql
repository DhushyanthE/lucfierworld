
DROP POLICY IF EXISTS "Users can insert analytics events with rate limit" ON public.analytics_events;

CREATE POLICY "Authenticated users can insert their own analytics events"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND auth.uid() = user_id
  AND public.check_analytics_rate_limit(
    COALESCE(session_id, ('user-' || auth.uid()::text)),
    100,
    1
  )
);
