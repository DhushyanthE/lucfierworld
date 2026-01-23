-- Fix critical security issues: Replace permissive RLS policies on quantum_transfer_history

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view transfer history" ON public.quantum_transfer_history;
DROP POLICY IF EXISTS "Anyone can log transfers" ON public.quantum_transfer_history;
DROP POLICY IF EXISTS "Anyone can update transfer status" ON public.quantum_transfer_history;

-- Create secure RLS policies that restrict access to authenticated users only

-- Users can only view their own transactions (as sender or receiver)
CREATE POLICY "Users can view own transfers" 
ON public.quantum_transfer_history 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    sender_address = auth.uid()::text OR 
    receiver_address = auth.uid()::text OR
    session_id = auth.uid()::text
  )
);

-- Admins can view all transfers
CREATE POLICY "Admins can view all transfers" 
ON public.quantum_transfer_history 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Only authenticated users can create transfers for their own session
CREATE POLICY "Authenticated users can create transfers" 
ON public.quantum_transfer_history 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    sender_address = auth.uid()::text OR
    session_id = auth.uid()::text
  )
);

-- Users can only update their own transfers
CREATE POLICY "Users can update own transfers" 
ON public.quantum_transfer_history 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND (
    sender_address = auth.uid()::text OR
    session_id = auth.uid()::text
  )
);

-- Admins can update any transfer
CREATE POLICY "Admins can update all transfers" 
ON public.quantum_transfer_history 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));