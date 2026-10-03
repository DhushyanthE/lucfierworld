/**
 * Proof of Dharmic State (PoDS) — consensus over simulated cell nodes.
 *
 * Score per cell = bellGate(S) * reputation * stakeWeight, where
 *   bellGate:    0 unless 2.0 < S <= 2.828 (classical / Tsirelson bounds), else (S-2)/0.828
 *   reputation:  starts 1.0; +0.05 for a valid on-time result, -0.2 rejected, -0.1 late; clamped 0..2
 *   stakeWeight: sqrt(stake / maxStake) minus 0.25 per slash, floored at 0
 * Round: every cell signs its proposal (ML-DSA-87 over SHA3-512). The highest
 * score proposal wins only if it beats the network best AND > 2/3 of cells
 * independently verify its signature + Bell bounds. Mirrors LeviathanCoin.sol.
 * Cells are software nodes — a simulation, not biological tissue.
 */
import { canonical, sha3 } from "./fabric.ts";
import { mlDsa } from "./pqc.ts";

export const BELL_MIN = 2.0;
export const BELL_MAX = 2 * Math.SQRT2; // 2.828...

export interface Cell {
  id: string; stake: number; reputation: number; slashes: number;
  public_key_b64: string; secret_key_b64: string; honest: boolean;
}

export const bellGate = (s: number) => (s > BELL_MIN && s <= 2.828 ? (s - BELL_MIN) / (2.828 - BELL_MIN) : 0);
export const stakeWeight = (stake: number, maxStake: number, slashes: number) =>
  Math.max(0, Math.sqrt(maxStake > 0 ? stake / maxStake : 0) - 0.25 * slashes);
export const dharmicScore = (s: number, c: Pick<Cell, "stake" | "reputation" | "slashes">, maxStake: number) =>
  Math.round(bellGate(s) * c.reputation * stakeWeight(c.stake, maxStake, c.slashes) * 1e4) / 1e4;
const clampRep = (r: number) => Math.min(2, Math.max(0, Math.round(r * 1000) / 1000));

export function makeCells(n: number, seed = 7): Cell[] {
  if (!Number.isInteger(n) || n < 3 || n > 16) throw new Error("cells must be 3..16");
  let s = seed;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; };
  return Array.from({ length: n }, (_, i) => {
    const k = mlDsa.keygen();
    return {
      id: `cell-${i}`, stake: Math.round(100 + rnd() * 900), reputation: 1, slashes: 0,
      public_key_b64: k.public_key_b64, secret_key_b64: k.secret_key_b64,
      honest: i !== n - 1, // last cell is adversarial: claims impossible Bell scores
    };
  });
}

function measuredBell(honest: boolean, r: () => number) {
  // honest cells: noisy measurement near Tsirelson; adversary claims > bound
  return honest ? Math.round((2.55 + r() * 0.27) * 1000) / 1000 : Math.round((2.9 + r() * 0.3) * 1000) / 1000;
}

export function runRounds(opts: { cells?: number; rounds?: number; lateCell?: number }) {
  const rounds = opts.rounds ?? 5;
  if (!Number.isInteger(rounds) || rounds < 1 || rounds > 20) throw new Error("rounds must be 1..20");
  const cells = makeCells(opts.cells ?? 7);
  const maxStake = Math.max(...cells.map((c) => c.stake));
  let best = 0, prev = "0".repeat(128);
  let seed = 99;
  const r = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 2 ** 32; };
  const history = [];

  for (let round = 1; round <= rounds; round++) {
    const proposals = cells.map((c) => {
      const bell = measuredBell(c.honest, r);
      const late = opts.lateCell !== undefined && cells.indexOf(c) === opts.lateCell && round % 2 === 0;
      const payload = { round, cell: c.id, bell_score: bell, prev_hash: prev, late };
      const hash = sha3(canonical(payload));
      const signature_b64 = mlDsa.sign(c.secret_key_b64, hash).signature_b64;
      return { cell: c, payload, hash, signature_b64, score: late ? 0 : dharmicScore(bell, c, maxStake) };
    });
    const ranked = [...proposals].sort((a, b) => b.score - a.score);
    const leader = ranked[0];
    const votes = cells.map((v) => {
      const sigOk = mlDsa.verify(leader.cell.public_key_b64, leader.hash, leader.signature_b64);
      const hashOk = sha3(canonical(leader.payload)) === leader.hash;
      return { cell: v.id, accept: sigOk && hashOk && bellGate(leader.payload.bell_score) > 0 };
    });
    const yes = votes.filter((v) => v.accept).length;
    const quorum = yes * 3 > cells.length * 2;
    const beatsBest = leader.score > best;
    const accepted = quorum && beatsBest && leader.score > 0;
    let block_hash: string | null = null;
    if (accepted) { best = leader.score; block_hash = sha3(prev + leader.hash); prev = block_hash; }

    // reputation updates
    for (const p of proposals) {
      if (p.payload.late) p.cell.reputation = clampRep(p.cell.reputation - 0.1);
      else if (bellGate(p.payload.bell_score) === 0) { p.cell.reputation = clampRep(p.cell.reputation - 0.2); p.cell.slashes++; }
      else p.cell.reputation = clampRep(p.cell.reputation + 0.05);
    }

    history.push({
      round, leader: leader.cell.id, leader_score: leader.score, network_best: best,
      accept_votes: yes, quorum, beats_best: beatsBest, accepted, block_hash,
      payloads: proposals.map((p) => ({
        cell: p.cell.id, bell_score: p.payload.bell_score, score: p.score, late: p.payload.late,
        hash: p.hash.slice(0, 32), signature_bytes: Math.round((p.signature_b64.length * 3) / 4),
        within_bell_bounds: bellGate(p.payload.bell_score) > 0,
      })),
    });
  }

  return {
    rule: "score = BellGate(2.0<S<=2.828) x reputation x stake weight; highest wins if it beats network best AND >2/3 cells verify ML-DSA-87 signature",
    cells: cells.map((c) => ({
      id: c.id, stake: c.stake, reputation: c.reputation, slashes: c.slashes,
      honest: c.honest, stake_weight: Math.round(stakeWeight(c.stake, maxStake, c.slashes) * 1e4) / 1e4,
      public_key_bytes: Math.round((c.public_key_b64.length * 3) / 4),
    })),
    rounds: history,
    network_best: best,
    status: "Simulation. Cells are software nodes with real ML-DSA-87 keys; LeviathanCoin.sol enforces the same rule on-chain once deployed.",
  };
}
