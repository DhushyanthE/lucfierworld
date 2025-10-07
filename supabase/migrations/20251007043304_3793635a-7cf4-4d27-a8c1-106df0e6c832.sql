-- Fix Critical Security Issue: Restrict analytics data access to own data only

-- 1. Create user roles system for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Only admins can manage roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Fix analytics_events policies
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can read all analytics events" ON public.analytics_events;

-- Create restrictive policies
CREATE POLICY "Users can view their own analytics events"
ON public.analytics_events
FOR SELECT
USING (
  auth.uid() = user_id 
  OR public.has_role(auth.uid(), 'admin')
);

-- 3. Fix analytics_sessions policies
DROP POLICY IF EXISTS "Authenticated users can read all analytics sessions" ON public.analytics_sessions;

CREATE POLICY "Users can view their own analytics sessions"
ON public.analytics_sessions
FOR SELECT
USING (
  auth.uid() = user_id 
  OR public.has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Authenticated users can update analytics sessions" ON public.analytics_sessions;

CREATE POLICY "Users can update their own analytics sessions"
ON public.analytics_sessions
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR public.has_role(auth.uid(), 'admin')
);

-- 4. Create a helper function to get current user's analytics safely
CREATE OR REPLACE FUNCTION public.get_user_analytics_summary(target_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_events BIGINT,
  total_sessions BIGINT,
  unique_pages BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  query_user_id UUID;
BEGIN
  -- Determine which user's data to query
  IF target_user_id IS NULL THEN
    query_user_id := auth.uid();
  ELSIF public.has_role(auth.uid(), 'admin') THEN
    query_user_id := target_user_id;
  ELSE
    -- Non-admins can only query their own data
    query_user_id := auth.uid();
  END IF;

  RETURN QUERY
  SELECT 
    COUNT(DISTINCT e.id)::BIGINT AS total_events,
    COUNT(DISTINCT s.id)::BIGINT AS total_sessions,
    COUNT(DISTINCT e.page_url)::BIGINT AS unique_pages
  FROM analytics_events e
  LEFT JOIN analytics_sessions s ON s.session_id = e.session_id
  WHERE e.user_id = query_user_id OR s.user_id = query_user_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_analytics_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated;