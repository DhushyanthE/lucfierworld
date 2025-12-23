-- Drop the existing function and recreate with admin role check
CREATE OR REPLACE FUNCTION public.refresh_analytics_summary()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if the calling user is an admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Only admins can refresh analytics summary';
  END IF;
  
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.analytics_daily_summary;
END;
$$;