-- Create table for quantum firewall threat logs
CREATE TABLE public.quantum_firewall_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('threat_detected', 'threat_neutralized', 'honeypot_triggered', 'defense_action', 'scan_completed', 'firewall_initialized')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  threat_type TEXT,
  threat_signature TEXT,
  defense_action TEXT,
  qnn_layer TEXT,
  success BOOLEAN DEFAULT true,
  quantum_fidelity DECIMAL(5,4),
  subspace_id TEXT,
  honeypot_id TEXT,
  block_hash TEXT,
  merkle_root TEXT,
  metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quantum_firewall_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own firewall logs" 
ON public.quantum_firewall_logs 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own firewall logs" 
ON public.quantum_firewall_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create index for faster queries
CREATE INDEX idx_quantum_firewall_logs_session ON public.quantum_firewall_logs(session_id);
CREATE INDEX idx_quantum_firewall_logs_event_type ON public.quantum_firewall_logs(event_type);
CREATE INDEX idx_quantum_firewall_logs_created_at ON public.quantum_firewall_logs(created_at DESC);

-- Enable realtime for threat alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.quantum_firewall_logs;