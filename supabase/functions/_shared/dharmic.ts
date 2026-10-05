/**
 * Proof of Dharmic State (PoDS) — research consensus over simulated cell nodes.
 *
 * DharmicScore = BellGate(S) * reputation * stakeWeight
 *   BellGate(S) = 0 unless 2.0 < S <= 2.828, otherwise (S - 2) / 0.828
 *   reputation = [0, 2], +0.05 valid/on-time, -0.10 late, -0.20 invalid/rejected
 *   stakeWeight = max(0, sqrt(stake / maxStake) - 0.25 * slashes)
 *
 * A round finalizes only when the highest-scoring candidate:
 *   - has a valid canonical SHA3-512 digest and ML-DSA-87 signature,
 *   - is inside the Bell/CHSH bounds,
 *   - links to the current round/head,
 *   - is accepted by STRICTLY more than 2/3 of distinct cells,
 *   - strictly beats the previous network-best score.
 *
 * Cells are software nodes. This is not biological computation or physical QKD.
 */
import { canonical, sha3, verifyRecord, type SignedRecord } from "./fabric.ts";
import { mlDsa } from "./pqc.ts";
import { fieldCoherence, harmonicResonance, phaseLabel, resonanceVector } from "./resonance.ts";

export const BELL_MIN = 2.0;
export const BELL_MAX = 2.828;
export const ON_TIME_LIMIT_MS = 500;

export interface Cell {
  id: string;
  stake: number;
  reputation: number;
  slashes: number;
  public_key_b64: string;
  secret_key_b64: string;
}

export interface DharmicVote {
  cell: string;
  accept: boolean;
  hash_ok: boolean;
  signature_ok: boolean;
  bell_ok: boolean;
  link_ok: boolean;
  round_ok: boolean;
  qkd_ok: boolean;
}

export interface RunRoundOptions {
  cells?: number;
  rounds?: number;
  lateCell?: number;
  forgeSignature?: boolean;
  tamperPayload?: boolean;
  impossibleBell?: boolean;
  replayRound?: boolean;
  qkdSecure?: boolean;
  /** Extra LVTH staked per cell id (e.g. {"cell-0": 500}). */
  stakes?: Record<string, number>;
}

export const bellGate = (s: number) =>
  s > BELL_MIN && s <= BELL_MAX ? (s - BELL_MIN) / (BELL_MAX - BELL_MIN) : 0;

export const stakeWeight = (stake: number, maxStake: number, slashes: number) =>
  Math.max(0, Math.sqrt(maxStake > 0 ? stake / maxStake : 0) - 0.25 * slashes);

export const dharmicScore = (
  s: number,
  c: Pick<Cell, "stake" | "reputation" | "slashes">,
  maxStake: number,
) => Math.round(bellGate(s) * c.reputation * stakeWeight(c.stake, maxStake, c.slashes) * 1e4) / 1e4;

export function strictQuorum(votes: Array<{ cell: string; accept: boolean }>, totalCells: number) {
  const distinct = new Map<string, boolean>();
  for (const vote of votes) {
    // A duplicate id can never add a second approval.
    distinct.set(vote.cell, (distinct.get(vote.cell) ?? false) || vote.accept);
  }
  const yes = [...distinct.values()].filter(Boolean).length;
  return { yes, distinct: distinct.size, met: yes * 3 > totalCells * 2 };
}

const clampRep = (r: number) => Math.min(2, Math.max(0, Math.round(r * 1000) / 1000));

export function makeCells(n: number, seed = 7): Cell[] {
  if (!Number.isInteger(n) || n < 3 || n > 16) throw new Error("cells must be 3..16");
  let s = seed;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
  return Array.from({ length: n }, (_, i) => {
    const k = mlDsa.keygen();
    return {
      id: `cell-${i}`,
      stake: Math.round(100 + rnd() * 900),
      reputation: 1,
      slashes: 0,
      public_key_b64: k.public_key_b64,
      secret_key_b64: k.secret_key_b64,
    };
  });
}

function measuredBell(r: () => number) {
  return Math.round((2.55 + r() * 0.27) * 1000) / 1000;
}

function latency(r: () => number) {
  return Math.round(60 + r() * 180);
}

function reasonForVote(v: DharmicVote) {
  if (!v.qkd_ok) return "insecure_qkd";
  if (!v.hash_ok) return "tampered_payload";
  if (!v.signature_ok) return "invalid_signature";
  if (!v.bell_ok) return "invalid_bell_score";
  if (!v.link_ok || !v.round_ok) return "invalid_round_link";
  return null;
}

export function runRounds(opts: RunRoundOptions = {}) {
  const roundCount = opts.rounds ?? 5;
  if (!Number.isInteger(roundCount) || roundCount < 1 || roundCount > 20) {
    throw new Error("rounds must be 1..20");
  }

  const cells = makeCells(opts.cells ?? 9);
  for (const c of cells) {
    const add = Number(opts.stakes?.[c.id] ?? 0);
    if (!Number.isFinite(add) || add < 0 || add > 1e9) throw new Error("stake must be 0..1e9");
    c.stake += Math.round(add);
  }
  const maxStake = Math.max(...cells.map((c) => c.stake));
  const qkdSecure = opts.qkdSecure !== false;
  let best = 0;
  let head = "0".repeat(128);
  let seed = 99;
  const r = () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return seed / 2 ** 32;
  };
  const history: any[] = [];

  for (let round = 1; round <= roundCount; round++) {
    const prevHash = head;
    const proposals = cells.map((cell, index) => {
      let bell = measuredBell(r);
      if (opts.impossibleBell && index === cells.length - 1) bell = 2.95;
      const isLate = opts.lateCell === index;
      const latencyMs = isLate ? 900 + round : latency(r);
      const onTime = latencyMs <= ON_TIME_LIMIT_MS;
      const payload: Record<string, unknown> = {
        round,
        cell: cell.id,
        bell_score: bell,
        prev_hash: prevHash,
        latency_ms: latencyMs,
        on_time: onTime,
      };
      const hash = sha3(canonical(payload));
      const signature_b64 = mlDsa.sign(cell.secret_key_b64, hash).signature_b64;
      return {
        cell,
        payload,
        hash,
        signature_b64,
        public_key_b64: cell.public_key_b64,
        score: dharmicScore(bell, cell, maxStake),
        bell_score: bell,
        latency_ms: latencyMs,
        on_time: onTime,
      };
    });

    // Dharmic Resonance Engine: every proposal becomes a six-axis state vector.
    // The harmonic score is bottleneck-sensitive: stake cannot overpower a weak
    // security/quality dimension.
    const resonanceVectors = proposals.map((p) => {
      const vector = resonanceVector({
        bellGate: bellGate(p.bell_score),
        hashOk: true,
        signatureOk: true,
        qkdOk: qkdSecure,
        latencyMs: p.latency_ms,
        onTimeLimitMs: ON_TIME_LIMIT_MS,
        reputation: p.cell.reputation,
        stakeWeight: stakeWeight(p.cell.stake, maxStake, p.cell.slashes),
        slashes: p.cell.slashes,
        prevHash,
        round,
        cellId: p.cell.id,
      });
      const resonance = harmonicResonance(vector);
      return { cell: p.cell.id, vector, resonance, phase: phaseLabel(resonance) };
    });
    const resonanceByCell = new Map(resonanceVectors.map((x) => [x.cell, x]));

    // Highest resonance wins; ties are deterministic by lexicographic cell id.
    const ranked = [...proposals].sort((a, b) =>
      (resonanceByCell.get(b.cell.id)?.resonance ?? 0) -
        (resonanceByCell.get(a.cell.id)?.resonance ?? 0) ||
      a.cell.id.localeCompare(b.cell.id)
    );
    const networkCoherence = fieldCoherence(resonanceVectors.map((x) => x.vector));
    const leader = ranked[0];

    // Fault injection targets the winning candidate so the rejection path is observable.
    const checked: SignedRecord = {
      payload: { ...leader.payload },
      hash: leader.hash,
      signature_b64: leader.signature_b64,
      public_key_b64: leader.public_key_b64,
    };

    if (opts.tamperPayload) {
      checked.payload = { ...checked.payload, tampered_after_signing: true };
    }
    if (opts.replayRound && round > 1) {
      checked.payload = { ...checked.payload, round: round - 1 };
    }
    if (opts.forgeSignature) {
      const forged = mlDsa.keygen();
      checked.signature_b64 = mlDsa.sign(forged.secret_key_b64, checked.hash).signature_b64;
    }

    const leaderVerification = verifyRecord(checked);
    const checkedBell = Number(checked.payload.bell_score);
    const votes: DharmicVote[] = cells.map((validator) => {
      const hashOk = leaderVerification.hash_matches;
      const signatureOk = leaderVerification.signature_valid;
      const bellOk = bellGate(checkedBell) > 0;
      const linkOk = checked.payload.prev_hash === prevHash;
      const roundOk = checked.payload.round === round;
      const qkdOk = qkdSecure;
      return {
        cell: validator.id,
        accept: hashOk && signatureOk && bellOk && linkOk && roundOk && qkdOk,
        hash_ok: hashOk,
        signature_ok: signatureOk,
        bell_ok: bellOk,
        link_ok: linkOk,
        round_ok: roundOk,
        qkd_ok: qkdOk,
      };
    });

    const quorum = strictQuorum(votes, cells.length);
    const leaderResonance = resonanceByCell.get(leader.cell.id)?.resonance ?? 0;
    const beatsBest = leaderResonance > best;
    const candidateValid = leaderVerification.valid &&
      bellGate(checkedBell) > 0 &&
      checked.payload.prev_hash === prevHash &&
      checked.payload.round === round &&
      qkdSecure;
    const accepted = candidateValid && quorum.met && beatsBest && leaderResonance > 0;

    const roundHash = sha3(
      canonical({
        round,
        prev_hash: prevHash,
        leader: leader.cell.id,
        leader_score: leaderResonance,
        payload_digest: leader.hash,
      }),
    );

    let rejectionReason: string | null = null;
    if (!accepted) {
      const firstVoteReason = reasonForVote(votes[0]);
      rejectionReason = firstVoteReason ??
        (!quorum.met ? "strict_quorum_not_met" :
          !beatsBest ? "did_not_beat_network_best" :
            leaderResonance <= 0 ? "zero_resonance" : "candidate_rejected");
    }

    if (accepted) {
      best = leaderResonance;
      head = roundHash;
    }

    const voteByCell = new Map(votes.map((v) => [v.cell, v.accept]));
    for (const proposal of proposals) {
      const isLeader = proposal.cell.id === leader.cell.id;
      const leaderInvalid = isLeader && !candidateValid;
      if (!proposal.on_time) {
        proposal.cell.reputation = clampRep(proposal.cell.reputation - 0.1);
      } else if (bellGate(proposal.bell_score) === 0 || leaderInvalid) {
        proposal.cell.reputation = clampRep(proposal.cell.reputation - 0.2);
        proposal.cell.slashes += 1;
      } else {
        proposal.cell.reputation = clampRep(proposal.cell.reputation + 0.05);
      }
    }

    history.push({
      round,
      leader: leader.cell.id,
      leader_score: leaderResonance,
      legacy_dharmic_score: leader.score,
      resonance_phase: phaseLabel(leaderResonance),
      field_coherence: networkCoherence,
      resonance_vector: resonanceByCell.get(leader.cell.id)?.vector ?? null,
      network_best: best,
      previous_hash: prevHash,
      round_hash: roundHash,
      block_hash: accepted ? roundHash : null,
      payload_digest: leader.hash,
      signature_valid: leaderVerification.signature_valid,
      hash_matches: leaderVerification.hash_matches,
      accept_votes: quorum.yes,
      total_cells: cells.length,
      distinct_voters: quorum.distinct,
      quorum_required: Math.floor((cells.length * 2) / 3) + 1,
      quorum: quorum.met,
      beats_best: beatsBest,
      qkd_secure: qkdSecure,
      accepted,
      rejection_reason: rejectionReason,
      votes,
      payloads: proposals.map((p) => ({
        cell: p.cell.id,
        bell_score: p.bell_score,
        score: p.score,
        resonance_score: resonanceByCell.get(p.cell.id)?.resonance ?? 0,
        resonance_phase: resonanceByCell.get(p.cell.id)?.phase ?? "COLLAPSED",
        resonance_vector: resonanceByCell.get(p.cell.id)?.vector ?? null,
        latency_ms: p.latency_ms,
        on_time: p.on_time,
        hash: p.hash,
        signature_preview: p.signature_b64.slice(0, 72),
        signature_bytes: Math.round((p.signature_b64.length * 3) / 4),
        signature_valid: p.cell.id === leader.cell.id ? leaderVerification.signature_valid : true,
        hash_matches: p.cell.id === leader.cell.id ? leaderVerification.hash_matches : true,
        within_bell_bounds: bellGate(p.bell_score) > 0,
        vote: voteByCell.get(p.cell.id) ?? false,
      })),
    });
  }

  const latestPayloads = history.length ? history[history.length - 1].payloads : [];
  const lastByCell = new Map(latestPayloads.map((p: any) => [p.cell, p]));

  return {
    rule: "DRE v1: six-axis Dharmic Resonance (quantum, integrity, temporal, reputation, stake, deterministic challenge) uses a bottleneck-sensitive harmonic score; winner must beat network best and receive STRICTLY >2/3 distinct ML-DSA-87-verified votes.",
    engine: "DRE-v1",
    qkd_secure: qkdSecure,
    cells: cells.map((c) => {
      const last: any = lastByCell.get(c.id);
      return {
        id: c.id,
        stake: c.stake,
        reputation: c.reputation,
        slashes: c.slashes,
        stake_weight: Math.round(stakeWeight(c.stake, maxStake, c.slashes) * 1e4) / 1e4,
        public_key_bytes: Math.round((c.public_key_b64.length * 3) / 4),
        last_bell_score: last?.bell_score ?? null,
        last_dharmic_score: last?.score ?? null,
        last_resonance_score: last?.resonance_score ?? null,
        last_resonance_phase: last?.resonance_phase ?? null,
        last_resonance_vector: last?.resonance_vector ?? null,
        last_signature_valid: last?.signature_valid ?? null,
        last_vote: last?.vote ?? null,
        last_latency_ms: last?.latency_ms ?? null,
        last_on_time: last?.on_time ?? null,
      };
    }),
    rounds: history,
    network_best: best,
    chain_head: head,
    total_locked_lvth: cells.reduce((sum, c) => sum + c.stake, 0),
    accepted_rounds: history.filter((x) => x.accepted).length,
    rejected_rounds: history.filter((x) => !x.accepted).length,
    status: "Dharmic Resonance Engine is a project-specific research simulation. Cells are software nodes using SHA3-512 + ML-DSA-87 primitives; resonance is an experimental consensus metric, not a physical law, biological computation, or proof that a payload is truthful.",
  };
}
