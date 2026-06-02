
-- Recompute dao_proposals tallies from dao_votes (authoritative source)
CREATE OR REPLACE FUNCTION public.recompute_dao_proposal_tally()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pid uuid := COALESCE(NEW.proposal_id, OLD.proposal_id);
BEGIN
  UPDATE public.dao_proposals p
  SET
    votes_for = (SELECT COUNT(*) FROM public.dao_votes WHERE proposal_id = pid AND vote = 'for'),
    votes_against = (SELECT COUNT(*) FROM public.dao_votes WHERE proposal_id = pid AND vote = 'against'),
    updated_at = now()
  WHERE p.id = pid;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS dao_votes_recompute_tally ON public.dao_votes;
CREATE TRIGGER dao_votes_recompute_tally
AFTER INSERT OR UPDATE OR DELETE ON public.dao_votes
FOR EACH ROW EXECUTE FUNCTION public.recompute_dao_proposal_tally();

-- Block direct manipulation of vote tally columns by clients (proposers etc.)
CREATE OR REPLACE FUNCTION public.prevent_dao_tally_manipulation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims_role text;
BEGIN
  IF NEW.votes_for IS DISTINCT FROM OLD.votes_for
     OR NEW.votes_against IS DISTINCT FROM OLD.votes_against
     OR NEW.total_voters IS DISTINCT FROM OLD.total_voters
  THEN
    BEGIN
      claims_role := current_setting('request.jwt.claims', true)::jsonb ->> 'role';
    EXCEPTION WHEN OTHERS THEN
      claims_role := NULL;
    END;

    -- Allow only the trigger-driven recompute (running as definer with no JWT) or service role.
    IF claims_role IS NULL OR claims_role = 'service_role' THEN
      RETURN NEW;
    END IF;

    RAISE EXCEPTION 'Vote tallies cannot be modified directly; cast a vote via dao_votes.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS dao_proposals_block_tally_manipulation ON public.dao_proposals;
CREATE TRIGGER dao_proposals_block_tally_manipulation
BEFORE UPDATE ON public.dao_proposals
FOR EACH ROW EXECUTE FUNCTION public.prevent_dao_tally_manipulation();
