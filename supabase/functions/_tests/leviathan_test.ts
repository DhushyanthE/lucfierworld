/**
 * LeviathanCoin governance + event decoding tests.
 *
 * Run: deno test --allow-net --allow-env supabase/functions/_tests/leviathan_test.ts
 */

import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  BELL_TSIRELSON_LIMIT_MILLI,
  decodeAttestationAccepted,
  EPOCH_REWARD_WEI,
  eventTopic,
  LEVIATHAN_TOPICS,
  verifyBellScore,
} from "../_shared/leviathan.ts";
import { indexEvents } from "../_shared/indexer.ts";

const pad = (v: bigint) => v.toString(16).padStart(64, "0");
const PROVER = "0x" + "11".repeat(20);
const MODEL_HASH = "ab".repeat(32);

function acceptedLog(scoreMilli: number, epoch = 7) {
  return {
    blockNumber: "0x63",
    transactionHash: "0x" + "cd".repeat(32),
    logIndex: "0x0",
    topics: [
      LEVIATHAN_TOPICS.AttestationAccepted,
      "0x" + "00".repeat(12) + PROVER.slice(2),
      "0x" + pad(BigInt(epoch)),
    ],
    data: "0x" + pad(BigInt(scoreMilli)) + MODEL_HASH + pad(EPOCH_REWARD_WEI),
  };
}

Deno.test("event topics match the canonical keccak256 signature hashes", () => {
  // Transfer(address,address,uint256) is a fixed, publicly known value.
  assertEquals(
    eventTopic("Transfer(address,address,uint256)"),
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  );
  assert(LEVIATHAN_TOPICS.AttestationAccepted.startsWith("0x"));
  assertEquals(LEVIATHAN_TOPICS.AttestationAccepted.length, 66);
  assert(LEVIATHAN_TOPICS.AttestationAccepted !== LEVIATHAN_TOPICS.AttestationRejected);
});

Deno.test("classical Bell scores are rejected, never silently accepted", () => {
  for (const s of [0, 1.4, 2.0]) {
    const v = verifyBellScore(s);
    assertEquals(v.accepted, false);
    if (!v.accepted) assertEquals(v.reason, "bell: not better than classical");
  }
});

Deno.test("scores above the Tsirelson bound are rejected as physically impossible", () => {
  const v = verifyBellScore(2.9);
  assertEquals(v.accepted, false);
  if (!v.accepted) assertEquals(v.reason, "bell: above Tsirelson bound");
  // The bound itself is inclusive.
  assertEquals(verifyBellScore(BELL_TSIRELSON_LIMIT_MILLI / 1000).accepted, true);
});

Deno.test("a valid score must still beat the network best", () => {
  assertEquals(verifyBellScore(2.5, 2600).accepted, false);
  assertEquals(verifyBellScore(2.7, 2600).accepted, true);
});

Deno.test("NaN / non-finite scores are rejected instead of coercing to a number", () => {
  assertEquals(verifyBellScore(Number.NaN).accepted, false);
  assertEquals(verifyBellScore(Number.POSITIVE_INFINITY).accepted, false);
});

Deno.test("decodeAttestationAccepted reads indexed and non-indexed params correctly", () => {
  const decoded = decodeAttestationAccepted(acceptedLog(2701, 7));
  assert(decoded !== null);
  assertEquals(decoded!.prover.toLowerCase(), PROVER);
  assertEquals(decoded!.epoch, 7);
  assertEquals(decoded!.bellScoreMilli, 2701);
  assertEquals(decoded!.bellScore, 2.701);
  assertEquals(decoded!.modelHash, "0x" + MODEL_HASH);
  assertEquals(decoded!.rewardWei, EPOCH_REWARD_WEI);
  assertEquals(decoded!.withinTsirelson, true);
});

Deno.test("decodeAttestationAccepted returns null for unrelated logs rather than guessing", () => {
  assertEquals(
    decodeAttestationAccepted({ topics: [LEVIATHAN_TOPICS.Transfer], data: "0x" }),
    null,
  );
  assertEquals(decodeAttestationAccepted({ topics: [], data: "0x" }), null);
});

Deno.test("indexed LeviathanCoin logs decode end-to-end through the read-only indexer", async () => {
  const methods: string[] = [];
  const server = Deno.serve({ port: 0, onListen: () => {} }, async (req) => {
    const body = await req.json();
    methods.push(body.method);
    const result = body.method === "eth_chainId"
      ? "0x7a69"
      : body.method === "eth_blockNumber"
      ? "0x64"
      : [acceptedLog(2820, 9)];
    return Response.json({ jsonrpc: "2.0", id: 1, result });
  });
  const url = `http://127.0.0.1:${(server.addr as Deno.NetAddr).port}`;

  const out = await indexEvents({
    config: { rpcUrl: url, contractAddress: "0x" + "22".repeat(20) },
    blockWindow: 50,
    topics: [LEVIATHAN_TOPICS.AttestationAccepted],
  });
  await server.shutdown();

  assertEquals(out.configured, true);
  assert(out.events_indexed_this_run >= 1);
  // Only read-only JSON-RPC methods may ever be issued.
  assert(methods.every((m) => ["eth_chainId", "eth_blockNumber", "eth_getLogs", "eth_call"].includes(m)));

  const decoded = decodeAttestationAccepted(acceptedLog(2820, 9));
  assertEquals(decoded!.bellScore, 2.82);
  assertEquals(verifyBellScore(decoded!.bellScore).accepted, true);
});
