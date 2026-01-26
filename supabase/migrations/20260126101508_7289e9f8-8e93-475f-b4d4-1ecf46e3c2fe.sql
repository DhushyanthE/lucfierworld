-- Create portfolio_snapshots table for historical tracking
CREATE TABLE public.portfolio_snapshots (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    snapshot_date DATE NOT NULL,
    total_value DECIMAL(20, 8) NOT NULL DEFAULT 0,
    total_cost DECIMAL(20, 8) NOT NULL DEFAULT 0,
    total_profit_loss DECIMAL(20, 8) NOT NULL DEFAULT 0,
    holdings_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint for one snapshot per user per day
CREATE UNIQUE INDEX idx_portfolio_snapshots_user_date ON public.portfolio_snapshots(user_id, snapshot_date);

-- Create index for efficient date range queries
CREATE INDEX idx_portfolio_snapshots_date ON public.portfolio_snapshots(snapshot_date DESC);

-- Enable Row Level Security
ALTER TABLE public.portfolio_snapshots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own portfolio snapshots"
ON public.portfolio_snapshots
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolio snapshots"
ON public.portfolio_snapshots
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio snapshots"
ON public.portfolio_snapshots
FOR DELETE
USING (auth.uid() = user_id);

-- Enable pg_cron and pg_net extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;