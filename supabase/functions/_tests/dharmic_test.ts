import { assert, assertEquals } from "jsr:@std/assert@1";
import { bellGate, dharmicScore, runRounds, strictQuorum } from "../_shared/dharmic.ts";

Deno.test("Bell gate rejects classical and super-Tsirelson scores", () => {
  assertEquals(bellGate(2.0), 0);
  assertEquals(bellGate(2.8281), 0);
  assert(bellGate(2.7) > 0);
});

Deno.test("score combines Bell, reputation, stake and slash penalty", () => {
  const low = dharmicScore(2.7, { stake: 100, reputation: 1, slashes: 0 }, 1000);
  const high = dharmicScore(2.7, { stake: 1000, reputation: 1.5, slashes: 0 }, 1000);
  const slashed = dharmicScore(2.7, { stake: 1000, reputation: 1.5, slashes: 2 }, 1000);
  assert(high > low);
  assert(slashed < high);
});

Deno.test("strict quorum requires more than two thirds", () => {
  const exactlySix = Array.from({ length: 9 }, (_, i) => ({ cell: `cell-${i}`, accept: i < 6 }));
  const seven = Array.from({ length: 9 }, (_, i) => ({ cell: `cell-${i}`, accept: i < 7 }));
  assertEquals(strictQuorum(exactlySix, 9).met, false);
  assertEquals(strictQuorum(seven, 9).met, true);
});

Deno.test("duplicate validator ids never increase quorum", () => {
  const votes = [
    { cell: "a", accept: true }, { cell: "a", accept: true },
    { cell: "b", accept: true }, { cell: "c", accept: false },
  ];
  const q = strictQuorum(votes, 3);
  assertEquals(q.yes, 2);
  assertEquals(q.met, false); // exactly 2/3 is not enough
});

Deno.test("valid round is accepted with strict quorum", () => {
  const r = runRounds({ cells: 9, rounds: 1 });
  assert(r.rounds[0].accepted);
  assertEquals(r.rounds[0].accept_votes, 9);
});

Deno.test("forged signature and tampered payload are rejected without advancing head", () => {
  const zero = "0".repeat(128);
  for (const opts of [{ forgeSignature: true }, { tamperPayload: true }]) {
    const r = runRounds({ cells: 9, rounds: 1, ...opts });
    assert(!r.rounds[0].accepted);
    assertEquals(r.chain_head, zero);
    assertEquals(r.network_best, 0);
  }
});

Deno.test("insecure QKD cannot enter PoDS", () => {
  const r = runRounds({ cells: 9, rounds: 1, qkdSecure: false });
  assert(!r.rounds[0].accepted);
  assertEquals(r.rounds[0].rejection_reason, "insecure_qkd");
});

Deno.test("replay/invalid round linkage is rejected", () => {
  const r = runRounds({ cells: 9, rounds: 2, replayRound: true });
  assert(r.rounds[0].accepted);
  assert(!r.rounds[1].accepted);
  assertEquals(r.rounds[1].rejection_reason, "tampered_payload");
});

Deno.test("late result lowers reputation; valid on-time raises it", () => {
  const late = runRounds({ cells: 9, rounds: 1, lateCell: 1 });
  const normal = runRounds({ cells: 9, rounds: 1 });
  assert(late.cells[1].reputation < 1);
  assert(normal.cells[1].reputation > 1);
});

Deno.test("impossible Bell proposal scores zero and is slashed", () => {
  const r = runRounds({ cells: 9, rounds: 1, impossibleBell: true });
  const bad = r.cells[8];
  assertEquals(r.rounds[0].payloads.find((p: any) => p.cell === "cell-8").score, 0);
  assert(bad.slashes >= 1);
  assert(bad.reputation < 1);
});

Deno.test("accepted rounds strictly improve best; rejected rounds do not advance head", () => {
  const r = runRounds({ cells: 9, rounds: 6 });
  let best = 0;
  let head = "0".repeat(128);
  for (const round of r.rounds) {
    if (round.accepted) {
      assert(round.leader_score > best);
      best = round.leader_score;
      head = round.round_hash;
    } else {
      assertEquals(round.block_hash, null);
    }
  }
  assertEquals(r.network_best, best);
  assertEquals(r.chain_head, head);
});

Deno.test("tie break is deterministic by cell id", () => {
  const a = runRounds({ cells: 9, rounds: 1 });
  const b = runRounds({ cells: 9, rounds: 1 });
  assertEquals(a.rounds[0].leader, b.rounds[0].leader);
  assertEquals(a.rounds[0].leader_score, b.rounds[0].leader_score);
});
