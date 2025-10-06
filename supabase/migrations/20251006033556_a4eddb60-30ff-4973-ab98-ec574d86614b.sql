-- Create analytics events table
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_session_id ON public.analytics_events(session_id);

-- Create analytics sessions table
CREATE TABLE public.analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  page_views INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  entry_page TEXT,
  exit_page TEXT,
  device_type TEXT,
  browser TEXT,
  country TEXT
);

-- Create index for sessions
CREATE INDEX idx_analytics_sessions_started_at ON public.analytics_sessions(started_at DESC);
CREATE INDEX idx_analytics_sessions_user_id ON public.analytics_sessions(user_id);

-- Enable Row Level Security
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_events (public can insert, only authenticated can read)
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read all analytics events"
  ON public.analytics_events
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- RLS Policies for analytics_sessions
CREATE POLICY "Anyone can insert analytics sessions"
  ON public.analytics_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read all analytics sessions"
  ON public.analytics_sessions
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update analytics sessions"
  ON public.analytics_sessions
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create materialized view for daily analytics summary
CREATE MATERIALIZED VIEW public.analytics_daily_summary AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_events,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) FILTER (WHERE event_name = 'page_view') as page_views,
  jsonb_object_agg(event_name, event_count) as events_breakdown
FROM (
  SELECT 
    created_at,
    session_id,
    user_id,
    event_name,
    COUNT(*) as event_count
  FROM public.analytics_events
  GROUP BY DATE(created_at), session_id, user_id, event_name, created_at
) grouped_events
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_analytics_daily_summary_date ON public.analytics_daily_summary(date);

-- Function to refresh analytics summary
CREATE OR REPLACE FUNCTION public.refresh_analytics_summary()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.analytics_daily_summary;
END;
$$;