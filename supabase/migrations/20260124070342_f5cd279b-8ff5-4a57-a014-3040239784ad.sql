-- Create rate limiting function for analytics events
-- This prevents data flooding attacks by limiting insertions per session/user

-- Create a table to track rate limits
CREATE TABLE IF NOT EXISTS public.analytics_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  event_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(identifier, window_start)
);

-- Enable RLS on rate limits table
ALTER TABLE public.analytics_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_analytics_rate_limits_identifier ON public.analytics_rate_limits(identifier, window_start);

-- Create cleanup policy - no direct access needed, managed by functions
CREATE POLICY "System only access for rate limits"
ON public.analytics_rate_limits
FOR ALL
USING (false);

-- Create rate limiting function
CREATE OR REPLACE FUNCTION public.check_analytics_rate_limit(
  p_identifier text,
  p_max_events integer DEFAULT 100,
  p_window_minutes integer DEFAULT 1
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start timestamp with time zone;
  v_current_count integer;
BEGIN
  -- Calculate window start (truncate to minute boundary)
  v_window_start := date_trunc('minute', now());
  
  -- Clean up old entries (older than 5 minutes)
  DELETE FROM public.analytics_rate_limits 
  WHERE window_start < now() - interval '5 minutes';
  
  -- Get or create rate limit entry
  INSERT INTO public.analytics_rate_limits (identifier, event_count, window_start)
  VALUES (p_identifier, 1, v_window_start)
  ON CONFLICT (identifier, window_start) 
  DO UPDATE SET event_count = analytics_rate_limits.event_count + 1
  RETURNING event_count INTO v_current_count;
  
  -- Check if rate limit exceeded
  IF v_current_count > p_max_events THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Update analytics_events INSERT policy to include rate limiting
DROP POLICY IF EXISTS "Users can insert their own analytics events" ON public.analytics_events;

CREATE POLICY "Users can insert analytics events with rate limit"
ON public.analytics_events
FOR INSERT
WITH CHECK (
  -- Existing auth check
  (
    ((auth.uid() IS NOT NULL) AND (auth.uid() = user_id)) 
    OR 
    ((auth.uid() IS NULL) AND (user_id IS NULL))
  )
  -- Rate limit check: max 100 events per minute per session
  AND public.check_analytics_rate_limit(COALESCE(session_id, 'anonymous-' || COALESCE(user_id::text, 'unknown')), 100, 1)
);

-- Update analytics_sessions INSERT policy to include rate limiting
DROP POLICY IF EXISTS "Users can insert their own analytics sessions" ON public.analytics_sessions;

CREATE POLICY "Users can insert analytics sessions with rate limit"
ON public.analytics_sessions
FOR INSERT
WITH CHECK (
  -- Existing auth check
  (
    ((auth.uid() IS NOT NULL) AND (auth.uid() = user_id)) 
    OR 
    ((auth.uid() IS NULL) AND (user_id IS NULL))
  )
  -- Rate limit check: max 10 sessions per minute per user
  AND public.check_analytics_rate_limit('session-' || COALESCE(user_id::text, session_id), 10, 1)
);