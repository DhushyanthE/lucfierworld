-- Create comprehensive quantum circuit and cryptography database schema

-- Create quantum circuits table
CREATE TABLE public.quantum_circuits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  circuit_data JSONB NOT NULL,
  optimization_level INTEGER DEFAULT 1,
  quantum_resistance_level INTEGER DEFAULT 1,
  cryptographic_strength TEXT DEFAULT 'standard',
  blockchain_hash TEXT,
  agi_optimization_applied BOOLEAN DEFAULT false,
  fidelity_score DECIMAL(5,4) DEFAULT 0.9500,
  gate_count INTEGER DEFAULT 0,
  qubit_count INTEGER DEFAULT 3,
  circuit_depth INTEGER DEFAULT 0,
  entanglement_score DECIMAL(5,4) DEFAULT 0.0000,
  error_correction_applied BOOLEAN DEFAULT false,
  quantum_supremacy_achieved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quantum cryptography protocols table
CREATE TABLE public.quantum_crypto_protocols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  protocol_name TEXT NOT NULL,
  protocol_type TEXT NOT NULL CHECK (protocol_type IN ('qkd', 'post-quantum', 'quantum-resistant', 'lattice-based', 'hash-based')),
  key_length INTEGER DEFAULT 256,
  security_level INTEGER DEFAULT 128,
  quantum_resistance_rating INTEGER DEFAULT 1,
  implementation_status TEXT DEFAULT 'development',
  blockchain_integration BOOLEAN DEFAULT false,
  circuit_id UUID REFERENCES public.quantum_circuits(id) ON DELETE SET NULL,
  protocol_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AGI workflow executions table
CREATE TABLE public.agi_workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_name TEXT NOT NULL,
  circuit_id UUID REFERENCES public.quantum_circuits(id) ON DELETE CASCADE,
  execution_status TEXT DEFAULT 'pending' CHECK (execution_status IN ('pending', 'running', 'completed', 'failed', 'optimizing')),
  agi_model_used TEXT DEFAULT 'quantum-agi-v1',
  optimization_improvements JSONB DEFAULT '{}',
  execution_time_ms INTEGER DEFAULT 0,
  quantum_advantage_achieved BOOLEAN DEFAULT false,
  superintelligence_score DECIMAL(5,4) DEFAULT 0.0000,
  blockchain_verification_hash TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blockchain quantum records table
CREATE TABLE public.blockchain_quantum_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  circuit_id UUID REFERENCES public.quantum_circuits(id) ON DELETE CASCADE,
  crypto_protocol_id UUID REFERENCES public.quantum_crypto_protocols(id) ON DELETE SET NULL,
  block_hash TEXT NOT NULL UNIQUE,
  previous_block_hash TEXT,
  merkle_root TEXT NOT NULL,
  quantum_signature TEXT NOT NULL,
  quantum_proof JSONB NOT NULL,
  consensus_algorithm TEXT DEFAULT 'quantum-pos',
  mining_difficulty INTEGER DEFAULT 1,
  block_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'rejected')),
  quantum_resistance_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quantum resistance tests table
CREATE TABLE public.quantum_resistance_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  circuit_id UUID REFERENCES public.quantum_circuits(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL CHECK (test_type IN ('shor-resistance', 'grover-resistance', 'post-quantum-security', 'lattice-attack', 'multivariate-attack')),
  test_parameters JSONB DEFAULT '{}',
  resistance_score DECIMAL(5,4) DEFAULT 0.0000,
  vulnerabilities_found JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  test_duration_ms INTEGER DEFAULT 0,
  test_status TEXT DEFAULT 'pending' CHECK (test_status IN ('pending', 'running', 'completed', 'failed')),
  quantum_security_level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quantum_circuits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantum_crypto_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agi_workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_quantum_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantum_resistance_tests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quantum_circuits
CREATE POLICY "Users can view their own quantum circuits" 
ON public.quantum_circuits FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quantum circuits" 
ON public.quantum_circuits FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quantum circuits" 
ON public.quantum_circuits FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quantum circuits" 
ON public.quantum_circuits FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for quantum_crypto_protocols
CREATE POLICY "Users can manage their own crypto protocols" 
ON public.quantum_crypto_protocols FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for agi_workflow_executions
CREATE POLICY "Users can manage their own AGI workflows" 
ON public.agi_workflow_executions FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for blockchain_quantum_records
CREATE POLICY "Users can view quantum blockchain records" 
ON public.blockchain_quantum_records FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create quantum blockchain records" 
ON public.blockchain_quantum_records FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for quantum_resistance_tests
CREATE POLICY "Users can manage their own resistance tests" 
ON public.quantum_resistance_tests FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_quantum_circuits_user_id ON public.quantum_circuits(user_id);
CREATE INDEX idx_quantum_circuits_created_at ON public.quantum_circuits(created_at DESC);
CREATE INDEX idx_quantum_circuits_fidelity ON public.quantum_circuits(fidelity_score DESC);
CREATE INDEX idx_quantum_crypto_protocols_user_id ON public.quantum_crypto_protocols(user_id);
CREATE INDEX idx_quantum_crypto_protocols_type ON public.quantum_crypto_protocols(protocol_type);
CREATE INDEX idx_agi_workflow_executions_user_id ON public.agi_workflow_executions(user_id);
CREATE INDEX idx_agi_workflow_executions_status ON public.agi_workflow_executions(execution_status);
CREATE INDEX idx_blockchain_quantum_records_hash ON public.blockchain_quantum_records(block_hash);
CREATE INDEX idx_quantum_resistance_tests_user_id ON public.quantum_resistance_tests(user_id);
CREATE INDEX idx_quantum_resistance_tests_score ON public.quantum_resistance_tests(resistance_score DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_quantum_circuits_updated_at
  BEFORE UPDATE ON public.quantum_circuits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quantum_crypto_protocols_updated_at
  BEFORE UPDATE ON public.quantum_crypto_protocols
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agi_workflow_executions_updated_at
  BEFORE UPDATE ON public.agi_workflow_executions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quantum_resistance_tests_updated_at
  BEFORE UPDATE ON public.quantum_resistance_tests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();