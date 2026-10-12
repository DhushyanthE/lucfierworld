"""
Nine-software-cell registry and six-of-nine signed certificate.

This is a single-host research consensus simulation.
"""
from __future__ import annotations

from dataclasses import dataclass

from bbb8_crypto import DOMAINS, SigningIdentity, digest, new_identity, sign, verify

POLICY_VERSION = "bbb8-policy-v1"
NETWORK_ID = "BBB8-LOCAL"
CELL_COUNT = 9
QUORUM = 6


@dataclass(frozen=True)
class Cell:
    index: int
    identity: SigningIdentity

    @property
    def cell_id(self) -> str:
        return f"cell-{self.index:02d}"


def make_registry() -> list[Cell]:
    return [Cell(i, new_identity()) for i in range(CELL_COUNT)]


def vote_payload(
    cell_id: str,
    height: int,
    prev_hash: str,
    proposal_digest: bytes,
    approve: bool,
) -> dict:
    return {
        "cell_id": cell_id,
        "network": NETWORK_ID,
        "height": height,
        "prev_hash": prev_hash,
        "proposal_digest": proposal_digest.hex(),
        "approval": bool(approve),
        "policy_version": POLICY_VERSION,
    }


def make_certificate(
    cells: list[Cell],
    height: int,
    prev_hash: str,
    proposal_digest: bytes,
    approve: bool,
    offline: list[int],
) -> dict:
    offline_set = set(offline)
    votes = []
    for cell in cells:
        if cell.index in offline_set:
            continue
        payload = vote_payload(cell.cell_id, height, prev_hash, proposal_digest, approve)
        vote_digest, signature = sign(cell.identity, "vote", payload)
        votes.append({
            "cell_id": cell.cell_id,
            "algorithm": cell.identity.algorithm,
            "payload": payload,
            "digest": vote_digest.hex(),
            "signature": signature.hex(),
        })
    return {
        "votes": votes,
        "height": height,
        "prev_hash": prev_hash,
        "proposal_digest": proposal_digest.hex(),
        "approval": bool(approve),
        "policy_version": POLICY_VERSION,
        "network": NETWORK_ID,
    }


def block_hash(block: dict) -> str:
    return digest(DOMAINS["block"], block).hex()


def _find_cell(registry: list[Cell], cell_id: str) -> Cell | None:
    return next((cell for cell in registry if cell.cell_id == cell_id), None)


def verify_block(block: dict, registry: list[Cell]) -> tuple[bool, str]:
    try:
        height = int(block["height"])
        prev_hash = str(block["prev_hash"])
        proposal = block["proposal"]
        proposal_digest_hex = str(block["proposal_digest"])
        proposal_digest = bytes.fromhex(proposal_digest_hex)
        proposer_cell_id = str(block["proposer_cell_id"])
        proposer_algorithm = str(block["proposer_algorithm"])
        proposal_signature = bytes.fromhex(str(block["proposal_signature"]))
        proposal_signature_digest = bytes.fromhex(str(block["proposal_signature_digest"]))
        certificate = block["certificate"]
        votes = certificate["votes"]
    except (KeyError, TypeError, ValueError):
        return False, "malformed_block"

    if height <= 0:
        return False, "invalid_height"
    if len(prev_hash) != 128:
        return False, "invalid_prev_hash"

    if proposal.get("network") != NETWORK_ID:
        return False, "proposal_network_mismatch"
    if proposal.get("height") != height:
        return False, "proposal_height_mismatch"
    if proposal.get("prev_hash") != prev_hash:
        return False, "proposal_prev_hash_mismatch"
    if proposal.get("policy_version") != POLICY_VERSION:
        return False, "proposal_policy_mismatch"

    recomputed_proposal_digest = digest(DOMAINS["proposal"], proposal)
    if recomputed_proposal_digest != proposal_digest:
        return False, "proposal_digest_mismatch"
    if proposal_signature_digest != proposal_digest:
        return False, "proposal_signature_digest_mismatch"

    proposer = _find_cell(registry, proposer_cell_id)
    if proposer is None:
        return False, "unknown_proposer"
    if proposer.identity.algorithm != proposer_algorithm:
        return False, "proposer_algorithm_mismatch"
    if not verify(
        proposer.identity.public_key,
        proposer.identity.algorithm,
        "proposal",
        proposal,
        proposal_signature,
        expected_digest=proposal_digest,
    ):
        return False, "bad_proposal_signature"

    if certificate.get("network") != NETWORK_ID:
        return False, "certificate_network_mismatch"
    if certificate.get("policy_version") != POLICY_VERSION:
        return False, "certificate_policy_mismatch"
    if certificate.get("height") != height:
        return False, "certificate_height_mismatch"
    if certificate.get("prev_hash") != prev_hash:
        return False, "certificate_prev_hash_mismatch"
    if certificate.get("proposal_digest") != proposal_digest_hex:
        return False, "certificate_digest_mismatch"
    if certificate.get("approval") is not True:
        return False, "not_approved"
    if not isinstance(votes, list):
        return False, "malformed_votes"

    seen: set[str] = set()
    valid = 0
    for vote in votes:
        try:
            cell_id = str(vote["cell_id"])
            algorithm = str(vote["algorithm"])
            payload = vote["payload"]
            signature = bytes.fromhex(str(vote["signature"]))
            vote_digest = bytes.fromhex(str(vote["digest"]))
        except (KeyError, TypeError, ValueError):
            return False, "malformed_vote"

        if cell_id in seen:
            return False, "duplicate_cell_id"
        seen.add(cell_id)

        cell = _find_cell(registry, cell_id)
        if cell is None:
            return False, "unknown_cell"
        if algorithm != cell.identity.algorithm:
            return False, f"algorithm_mismatch:{cell_id}"

        expected_payload = vote_payload(cell_id, height, prev_hash, proposal_digest, True)
        if payload != expected_payload:
            return False, f"vote_context_mismatch:{cell_id}"

        if not verify(
            cell.identity.public_key,
            cell.identity.algorithm,
            "vote",
            payload,
            signature,
            expected_digest=vote_digest,
        ):
            return False, f"bad_signature:{cell_id}"
        valid += 1

    if valid < QUORUM:
        return False, f"quorum_not_met:{valid}"
    return True, "ok"
