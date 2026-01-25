-- Create update timestamp function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create price alerts table
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  symbol text NOT NULL,
  target_price numeric NOT NULL,
  condition text NOT NULL CHECK (condition IN ('above', 'below')),
  is_active boolean NOT NULL DEFAULT true,
  triggered_at timestamp with time zone,
  notification_method text NOT NULL DEFAULT 'in_app' CHECK (notification_method IN ('in_app', 'email', 'both')),
  email_sent boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on price_alerts
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for price_alerts
CREATE POLICY "Users can view their own alerts"
ON public.price_alerts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alerts"
ON public.price_alerts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
ON public.price_alerts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
ON public.price_alerts FOR DELETE
USING (auth.uid() = user_id);

-- Create portfolio holdings table
CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  symbol text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  purchase_price numeric NOT NULL CHECK (purchase_price >= 0),
  purchase_date timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on portfolio_holdings
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;

-- RLS policies for portfolio_holdings
CREATE POLICY "Users can view their own holdings"
ON public.portfolio_holdings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own holdings"
ON public.portfolio_holdings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own holdings"
ON public.portfolio_holdings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own holdings"
ON public.portfolio_holdings FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_active ON public.price_alerts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_price_alerts_symbol ON public.price_alerts(symbol, is_active);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_user ON public.portfolio_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_symbol ON public.portfolio_holdings(user_id, symbol);

-- Create update timestamp trigger for price_alerts
DROP TRIGGER IF EXISTS update_price_alerts_updated_at ON public.price_alerts;
CREATE TRIGGER update_price_alerts_updated_at
BEFORE UPDATE ON public.price_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create update timestamp trigger for portfolio_holdings
DROP TRIGGER IF EXISTS update_portfolio_holdings_updated_at ON public.portfolio_holdings;
CREATE TRIGGER update_portfolio_holdings_updated_at
BEFORE UPDATE ON public.portfolio_holdings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();