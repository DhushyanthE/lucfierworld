/**
 * Indexer tests. The "configured" path is exercised against a stub JSON-RPC
 * server rather than a real chain: only the HTTP endpoint is substituted, the
 * real code path (env reading, method allow-list, log normalisation) runs.
 *
 * Run: deno test --allow-net --allow-env supabase/functions/_tests/indexer_test.ts
 */

import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { indexEvents, notConfigured, readIndexerConfig } from "../_shared/indexer.ts";

const CONTRACT = "0x1234567890abcdef1234567890abcdef12345678";

Deno.test("unconfigured indexer reports honestly instead of fabricating findings", () => {
  const out = notConfigured({ rpcUrl: null, contractAddress: null });
  assertEquals(out.configured, false);
  assertEquals(out.findings.length, 0);
  assertEquals(out.events_indexed_this_run, 0);
  assert(out.missing.includes("EVM_RPC_URL"));
  assert(out.missing.includes("PONW_CONTRACT_ADDRESS"));
});

Deno.test("readIndexerConfig reads both env vars", () => {
  Deno.env.set("EVM_RPC_URL", "http://127.0.0.1:1/rpc");
  Deno.env.set("PONW_CONTRACT_ADDRESS", CONTRACT);
  const cfg = readIndexerConfig();
  assertEquals(cfg.rpcUrl, "http://127.0.0.1:1/rpc");
  assertEquals(cfg.contractAddress, CONTRACT);
  Deno.env.delete("EVM_RPC_URL");
  Deno.env.delete("PONW_CONTRACT_ADDRESS");
});

Deno.test("indexEvents normalises real eth_getLogs output and only sends read-only methods", async () => {
  const seenMethods: string[] = [];
  const server = Deno.serve({ port: 0, onListen: () => {} }, async (req) => {
    const body = await req.json();
    seenMethods.push(body.method);
    const result = body.method === "eth_chainId"
      ? "0x7a69"
      : body.method === "eth_blockNumber"
      ? "0x64"
      : [{
        blockNumber: "0x63",
        transactionHash: "0x" + "ab".repeat(32),
        logIndex: "0x0",
        topics: ["0x" + "cd".repeat(32)],
        data: "0x01",
      }];
    return Response.json({ jsonrpc: "2.0", id: 1, result });
  });
  const url = `http://127.0.0.1:${(server.addr as Deno.NetAddr).port}`;

  const out = await indexEvents({
    config: { rpcUrl: url, contractAddress: CONTRACT },
    blockWindow: 50,
  });

  await server.shutdown();

  assert(out.configured === true);
  assertEquals(out.events_indexed_this_run, 1);
  assertEquals(out.chain_id, 31337);
  assertEquals(out.to_block, 100);
  assertEquals(out.from_block, 50);
  assertEquals(out.events[0].block_number, 99);
  assertEquals(out.findings.length, 1);
  assertEquals(out.read_only, true);
  for (const m of seenMethods) {
    assert(["eth_chainId", "eth_blockNumber", "eth_getLogs"].includes(m), `unexpected method ${m}`);
  }
});

Deno.test("indexEvents rejects a malformed contract address", async () => {
  let threw = false;
  try {
    await indexEvents({ config: { rpcUrl: "http://127.0.0.1:1", contractAddress: "nope" } });
  } catch (e) {
    threw = true;
    assert((e as Error).message.includes("valid 20-byte hex address"));
  }
  assert(threw, "expected a validation error");
});
