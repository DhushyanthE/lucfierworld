/**
 * Independent-policy defensive review simulation.
 * Nine deterministic policy perspectives evaluate the same signed finding.
 * This is NOT distributed consensus: all reviews run in one Edge Function.
 * No review grants permission to execute a containment action.
 */
import { canonical, sha3 } from "./fabric.ts";
import { mlDsa } from "./pqc.ts";
import { classify, recommendation, threatScore, type SentinelFinding, type Telemetry } from "./defense.ts";

export type ReviewVote = {
  cell: string;
  accept: boolean;
  rationale: string;
  evidence_digest: string;
};
export type DefenseReview = {
  engine: "Sentinel-Review-v1";
  mode: "single-process-policy-simulation";
  verified: boolean;
  votes: ReviewVote[];
  yes: number;
  quorum_required: number;
  quorum_met: boolean;
  decision: "escalate_to_human" | "needs_manual_review";
  executable: false;
};

const POLICY = [
  { name: "auth", weight: 0.12 },
  { name: "process", weight: 0.10 },
  { name: "network", weight: 0.18 },
  { name: "entropy", weight: 0.15 },
  { name: "privilege", weight: 0.20 },
  { name: "indicator", weight: 0.25 },
  { name: "correlation", weight: 0 },
  { name: "integrity", weight: 0 },
  { name: "safety", weight: 0 },
] as const;

export function verifyFinding(f: SentinelFinding, telemetry: Telemetry) {
  const { id, payload_hash, payload_sha3_256, signature_b64, public_key_b64, ...signed } = f;
  const digestMatches = sha3(canonical(signed)) === payload_hash;
  const { sha3_256 } = await import("npm:@noble/hashes@2.3.0/sha3.js");
  const { bytesToHex } = await import("npm:@noble/hashes@2.3.0/utils.js");
  const digest256Matches = bytesToHex(sha3_256(new TextEncoder().encode(canonical(signed)))) === payload_sha3_256;
  let signatureValid = false;
  try { signatureValid = mlDsa.verify(public_key_b64, payload_sha3_256, signature_b64); }
  catch { signatureValid = false; }
  const score = threatScore(telemetry);
  const telemetryMatches =
    signed.source === telemetry.source &&
    signed.score === score &&
    signed.severity === classify(score) &&
    signed.recommendation === recommendation(score) &&
    signed.requires_human_approval === true;
  return digestMatches && digest256Matches && signatureValid && telemetryMatches && id === payload_hash.slice(0, 24);
}

export function reviewDefensiveFinding(f: SentinelFinding, telemetry: Telemetry): DefenseReview {
  const verified = verifyFinding(f, telemetry);
  const digest = sha3(canonical(telemetry));
  const highSignal = [
    telemetry.failed_auth >= 10,
    telemetry.new_processes >= 15,
    telemetry.outbound_spike >= 0.7,
    telemetry.file_entropy >= 0.7,
    telemetry.privilege_change,
    telemetry.known_ioc_match,
  ].filter(Boolean).length;
  const votes: ReviewVote[] = POLICY.map((policy, i) => {
    // Distinct conservative policy perspectives, not independent machines.
    const evidence = [
      telemetry.failed_auth >= 10,
      telemetry.new_processes >= 15,
      telemetry.outbound_spike >= 0.7,
      telemetry.file_entropy >= 0.7,
      telemetry.privilege_change,
      telemetry.known_ioc_match,
      highSignal >= 2,
      verified,
      f.requires_human_approval === true,
    ][i];
    const accept = verified && f.score >= 0.6 && evidence;
    return {
      cell: `review-${i}`,
      accept,
      rationale: !verified ? "signature/evidence mismatch" : evidence ? "policy signal present" : "policy signal absent",
      evidence_digest: digest,
    };
  });
  const yes = votes.filter(v => v.accept).length;
  const quorum_required = Math.floor(votes.length * 2 / 3) + 1;
  const quorum_met = verified && yes >= quorum_required;
  return {
    engine: "Sentinel-Review-v1",
    mode: "single-process-policy-simulation",
    verified, votes, yes, quorum_required, quorum_met,
    decision: quorum_met ? "escalate_to_human" : "needs_manual_review",
    executable: false,
  };
}
