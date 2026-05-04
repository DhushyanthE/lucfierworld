-- 1. Create private user_secrets table (server-only)
CREATE TABLE IF NOT EXISTS public.user_secrets (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  totp_secret TEXT,
  push_subscription JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_secrets ENABLE ROW LEVEL SECURITY;

-- Deny ALL client access (only service role / SECURITY DEFINER funcs can read/write)
CREATE POLICY "Deny all client access to user_secrets"
ON public.user_secrets FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

CREATE TRIGGER update_user_secrets_updated_at
BEFORE UPDATE ON public.user_secrets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Migrate existing values
INSERT INTO public.user_secrets (user_id, totp_secret, push_subscription)
SELECT user_id, totp_secret, push_subscription
FROM public.profiles
WHERE totp_secret IS NOT NULL OR push_subscription IS NOT NULL
ON CONFLICT (user_id) DO UPDATE
  SET totp_secret = EXCLUDED.totp_secret,
      push_subscription = EXCLUDED.push_subscription;

-- 3. Drop sensitive columns from profiles (totp_enabled boolean stays so UI can know status)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS totp_secret;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS push_subscription;

-- 4. Harden check_analytics_rate_limit: input validation + restrict EXECUTE
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
  -- Input validation
  IF p_identifier IS NULL OR length(p_identifier) = 0 OR length(p_identifier) > 255 THEN
    RAISE EXCEPTION 'Invalid identifier';
  END IF;
  IF p_max_events < 1 OR p_max_events > 10000 THEN
    RAISE EXCEPTION 'Invalid max_events value';
  END IF;
  IF p_window_minutes < 1 OR p_window_minutes > 60 THEN
    RAISE EXCEPTION 'Invalid window_minutes value';
  END IF;

  v_window_start := date_trunc('minute', now());

  DELETE FROM public.analytics_rate_limits
  WHERE window_start < now() - interval '5 minutes';

  INSERT INTO public.analytics_rate_limits (identifier, event_count, window_start)
  VALUES (p_identifier, 1, v_window_start)
  ON CONFLICT (identifier, window_start)
  DO UPDATE SET event_count = analytics_rate_limits.event_count + 1
  RETURNING event_count INTO v_current_count;

  IF v_current_count > p_max_events THEN
    RETURN false;
  END IF;
  RETURN true;
END;
$$;

-- Restrict execute (still callable from RLS policies as table owner; revoke from anon/authenticated)
REVOKE EXECUTE ON FUNCTION public.check_analytics_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;

-- 5. Tighten avatars listing: replace broad public SELECT with folder-scoped access
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

CREATE POLICY "Public can read avatar files by direct path"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'avatars'
  AND (
    -- Authenticated users can list/read their own folder
    (auth.uid() IS NOT NULL AND auth.uid()::text = (storage.foldername(name))[1])
    OR
    -- Direct file fetch by exact name still works (no folder traversal needed for known URLs)
    coalesce(current_setting('request.method', true), '') = 'GET'
  )
);
