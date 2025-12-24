-- Create quantum transfer history table for persisting transfer records
CREATE TABLE public.quantum_transfer_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  sender_address TEXT NOT NULL,
  receiver_address TEXT NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  data_payload TEXT,
  blockchain_hash TEXT,
  security_score DECIMAL(5, 2),
  layers_passed INTEGER DEFAULT 0,
  total_layers INTEGER DEFAULT 20,
  transfer_status TEXT DEFAULT 'pending' CHECK (transfer_status IN ('pending', 'in_progress', 'completed', 'failed')),
  quantum_fidelity DECIMAL(5, 4),
  entanglement_pairs INTEGER,
  network_nodes JSONB DEFAULT '[]'::jsonb,
  layer_results JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quantum_transfer_history ENABLE ROW LEVEL SECURITY;

-- Allow public read access for viewing transfer history
CREATE POLICY "Anyone can view transfer history" 
ON public.quantum_transfer_history 
FOR SELECT 
USING (true);

-- Allow public insert for logging transfers
CREATE POLICY "Anyone can log transfers" 
ON public.quantum_transfer_history 
FOR INSERT 
WITH CHECK (true);

-- Allow public update for updating transfer status
CREATE POLICY "Anyone can update transfer status" 
ON public.quantum_transfer_history 
FOR UPDATE 
USING (true);

-- Create index for faster queries
CREATE INDEX idx_quantum_transfer_session ON public.quantum_transfer_history(session_id);
CREATE INDEX idx_quantum_transfer_status ON public.quantum_transfer_history(transfer_status);
CREATE INDEX idx_quantum_transfer_created ON public.quantum_transfer_history(created_at DESC);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.quantum_transfer_history;