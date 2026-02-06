-- Add push_subscription column to profiles for storing web push subscriptions
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS push_subscription JSONB DEFAULT NULL;