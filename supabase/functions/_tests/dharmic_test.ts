import { assert, assertEquals } from "jsr:@std/assert@1";
import { bellGate, dharmicScore, runRounds } from "../_shared/dharmic.ts";

Deno.test("bell gate rejects classical and super-Tsirelson scores", () => {
  assertEquals(bellGate(2.0), 0);
  assertEquals(bellGate(2.9), 0);
  assert(bellGate(2.7) > 0);
});

Deno.test("score scales with reputation and stake", () => {
  const lo = dharmicScore(2.7, { stake: 100, reputation: 1, slashes: 0 }, 1000);
  const hi = dharmicScore(2.7, { stake: 1000, reputation: 1.5, slashes: 0 }, 1000);
  assert(hi > lo);
});

Deno.test("adversarial cell is slashed and never leads", () => {
  const r = runRounds({ cells: 5, rounds: 4 });
  const bad = r.cells.find((c) => !c.honest)!;
  assert(bad.slashes >= 4 && bad.reputation < 1);
  for (const round of r.rounds) assert(round.leader !== bad.id);
});

Deno.test("accepted rounds strictly improve network best and chain hashes", () => {
  const r = runRounds({ cells: 7, rounds: 6 });
  let best = 0;
  for (const round of r.rounds) if (round.accepted) { assert(round.leader_score > best); best = round.leader_score; assert(round.block_hash); }
  assertEquals(best, r.network_best);
  assert(r.rounds[0].accepted);
});
