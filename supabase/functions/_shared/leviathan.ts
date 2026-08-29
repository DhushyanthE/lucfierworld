/**
 * LeviathanCoin off-chain mirror of the on-chain governance rules in
 * src/contracts/LeviathanCoin.sol, plus event-topic helpers for the read-only
 * indexer.
 *
 * SAFETY BOUNDARY: nothing here signs or sends a transaction. These are pure
 * functions plus keccak topic derivation, used to decode events the indexer
 * already fetched with eth_getLogs.
 */

import { keccak_256 } from "https://esm.sh/@noble/hashes@1.5.0/sha3";

export const BELL_CLASSICAL_LIMIT_MILLI = 2000;
export const BELL_TSIRELSON_LIMIT_MILLI = 2828;
export const EPOCH_REWARD_WEI = 5_000_000_000_000_000_000n;

export type BellVerdict =
  | { accepted: true; scoreMilli: number }
  | { accepted: false; scoreMilli: number; reason: string };

/** Same window the contract enforces: 2.0 < S <= 2.828 (Tsirelson). */
export function verifyBellScore(score: number, networkBestMilli = 0): BellVerdict {
  if (!Number.isFinite(score)) {
    return { accepted: false, scoreMilli: 0, reason: "bell score is not a finite number" };
  }
  const scoreMilli = Math.round(score * 1000);
  if (scoreMilli <= BELL_CLASSICAL_LIMIT_MILLI) {
    return { accepted: false, scoreMilli, reason: "bell: not better than classical" };
  }
  if (scoreMilli > BELL_TSIRELSON_LIMIT_MILLI) {
    return { accepted: false, scoreMilli, reason: "bell: above Tsirelson bound" };
  }
  if (scoreMilli <= networkBestMilli) {
    return { accepted: false, scoreMilli, reason: "must beat network best" };
  }
  return { accepted: true, scoreMilli };
}

const hex = (bytes: Uint8Array) =>
  "0x" + [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");

/** keccak256 of an event signature — the topic0 the indexer filters on. */
export function eventTopic(signature: string): string {
  return hex(keccak_256(new TextEncoder().encode(signature)));
}

export const LEVIATHAN_EVENTS = {
  Transfer: "Transfer(address,address,uint256)",
  AttestationAccepted: "AttestationAccepted(address,uint64,uint32,bytes32,uint256)",
  AttestationRejected: "AttestationRejected(address,uint64,string)",
} as const;

export const LEVIATHAN_TOPICS: Record<keyof typeof LEVIATHAN_EVENTS, string> = {
  Transfer: eventTopic(LEVIATHAN_EVENTS.Transfer),
  AttestationAccepted: eventTopic(LEVIATHAN_EVENTS.AttestationAccepted),
  AttestationRejected: eventTopic(LEVIATHAN_EVENTS.AttestationRejected),
};

export type RawLog = { topics: string[]; data: string; blockNumber?: string };

export type DecodedAttestation = {
  event: "AttestationAccepted";
  prover: string;
  epoch: number;
  bellScoreMilli: number;
  bellScore: number;
  modelHash: string;
  rewardWei: bigint;
  withinTsirelson: boolean;
};

const word = (data: string, i: number) => data.slice(2 + i * 64, 2 + (i + 1) * 64);

/**
 * Decodes an AttestationAccepted log. Indexed params (prover, epoch) live in
 * topics; the rest is ABI-encoded in `data` as three 32-byte words.
 * Returns null when the log is not this event, so callers never guess.
 */
export function decodeAttestationAccepted(log: RawLog): DecodedAttestation | null {
  if (log.topics?.[0]?.toLowerCase() !== LEVIATHAN_TOPICS.AttestationAccepted) return null;
  if (log.topics.length < 3) return null;

  const prover = "0x" + log.topics[1].slice(-40);
  const epoch = Number(BigInt(log.topics[2]));
  const bellScoreMilli = Number(BigInt("0x" + word(log.data, 0)));
  const modelHash = "0x" + word(log.data, 1);
  const rewardWei = BigInt("0x" + word(log.data, 2));

  return {
    event: "AttestationAccepted",
    prover,
    epoch,
    bellScoreMilli,
    bellScore: bellScoreMilli / 1000,
    modelHash,
    rewardWei,
    withinTsirelson: bellScoreMilli > BELL_CLASSICAL_LIMIT_MILLI &&
      bellScoreMilli <= BELL_TSIRELSON_LIMIT_MILLI,
  };
}
