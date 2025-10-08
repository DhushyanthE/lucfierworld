-- Fix analytics_events INSERT policy to prevent inserting events with arbitrary user_ids
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON analytics_events;

CREATE POLICY "Users can insert their own analytics events"
ON analytics_events
FOR INSERT
WITH CHECK (
  -- Authenticated users can only insert events with their own user_id
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  -- Unauthenticated users can only insert events with null user_id
  (auth.uid() IS NULL AND user_id IS NULL)
);

-- Fix analytics_sessions INSERT policy to prevent inserting sessions with arbitrary user_ids
DROP POLICY IF EXISTS "Anyone can insert analytics sessions" ON analytics_sessions;

CREATE POLICY "Users can insert their own analytics sessions"
ON analytics_sessions
FOR INSERT
WITH CHECK (
  -- Authenticated users can only insert sessions with their own user_id
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  -- Unauthenticated users can only insert sessions with null user_id
  (auth.uid() IS NULL AND user_id IS NULL)
);

-- Add DELETE policy for analytics_events to allow users to delete their own data (GDPR compliance)
CREATE POLICY "Users can delete their own analytics events"
ON analytics_events
FOR DELETE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Add DELETE policy for analytics_sessions for consistency
CREATE POLICY "Users can delete their own analytics sessions"
ON analytics_sessions
FOR DELETE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));