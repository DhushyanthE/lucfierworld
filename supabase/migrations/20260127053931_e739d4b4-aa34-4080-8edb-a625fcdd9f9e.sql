-- Fix the overly permissive notifications INSERT policy
-- Drop the old policy and create a proper one

DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;

-- Create a proper INSERT policy - notifications can only be inserted for the authenticated user
-- This is safe because edge functions use service role which bypasses RLS
CREATE POLICY "Users can receive notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);