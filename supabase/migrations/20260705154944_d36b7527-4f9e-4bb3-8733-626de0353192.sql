CREATE TABLE public.realtime_pings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.realtime_pings TO authenticated;
GRANT SELECT ON public.realtime_pings TO anon;
GRANT ALL ON public.realtime_pings TO service_role;
ALTER TABLE public.realtime_pings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read pings" ON public.realtime_pings FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert own pings" ON public.realtime_pings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE public.realtime_pings;
ALTER TABLE public.realtime_pings REPLICA IDENTITY FULL;