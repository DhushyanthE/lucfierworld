
-- NFT table for persistent marketplace
CREATE TABLE public.nfts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  collection TEXT NOT NULL DEFAULT 'Uncategorized',
  image TEXT NOT NULL DEFAULT '🎨',
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'ETH',
  owner TEXT NOT NULL,
  creator TEXT NOT NULL,
  listed BOOLEAN NOT NULL DEFAULT false,
  likes INTEGER NOT NULL DEFAULT 0,
  rarity TEXT NOT NULL DEFAULT 'common',
  attributes JSONB NOT NULL DEFAULT '[]'::jsonb,
  blockchain_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.nfts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view listed NFTs" ON public.nfts FOR SELECT USING (listed = true OR auth.uid() = user_id);
CREATE POLICY "Users can mint NFTs" ON public.nfts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update their NFTs" ON public.nfts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners can delete their NFTs" ON public.nfts FOR DELETE USING (auth.uid() = user_id);

-- DAO proposals table
CREATE TABLE public.dao_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  proposer TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  votes_for INTEGER NOT NULL DEFAULT 0,
  votes_against INTEGER NOT NULL DEFAULT 0,
  total_voters INTEGER NOT NULL DEFAULT 0,
  quorum INTEGER NOT NULL DEFAULT 60,
  category TEXT NOT NULL DEFAULT 'General',
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dao_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view proposals" ON public.dao_proposals FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create proposals" ON public.dao_proposals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Proposers can update their proposals" ON public.dao_proposals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Proposers can delete their proposals" ON public.dao_proposals FOR DELETE USING (auth.uid() = user_id);

-- DAO votes table
CREATE TABLE public.dao_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  proposal_id UUID NOT NULL REFERENCES public.dao_proposals(id) ON DELETE CASCADE,
  vote TEXT NOT NULL CHECK (vote IN ('for', 'against')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, proposal_id)
);

ALTER TABLE public.dao_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view votes" ON public.dao_votes FOR SELECT USING (true);
CREATE POLICY "Users can cast votes" ON public.dao_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mining history table
CREATE TABLE public.mining_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  block_hash TEXT NOT NULL,
  nonce BIGINT NOT NULL DEFAULT 0,
  difficulty INTEGER NOT NULL DEFAULT 4,
  reward NUMERIC NOT NULL DEFAULT 0,
  mining_time INTEGER NOT NULL DEFAULT 0,
  hash_rate NUMERIC NOT NULL DEFAULT 0,
  energy_used NUMERIC NOT NULL DEFAULT 0,
  quantum_boost NUMERIC NOT NULL DEFAULT 1.0,
  pool_size INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.mining_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their mining history" ON public.mining_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can record mining" ON public.mining_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_nfts_updated_at BEFORE UPDATE ON public.nfts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dao_proposals_updated_at BEFORE UPDATE ON public.dao_proposals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
