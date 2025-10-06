-- Remove materialized view from API by revoking access
REVOKE ALL ON public.analytics_daily_summary FROM anon, authenticated;

-- Grant access only to service role for internal use
GRANT SELECT ON public.analytics_daily_summary TO service_role;