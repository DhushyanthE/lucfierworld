import { assert, assertEquals } from "jsr:@std/assert@1";
import { correlationId } from "../_shared/backend-contracts.ts";
import { integrationRegistry } from "../_shared/integration-registry.ts";

Deno.test("correlation ids sanitize untrusted source names", () => {
  const id = correlationId("../../ sensor 01 ", 123456);
  assert(!id.includes("/"));
  assert(id.length < 80);
});

Deno.test("integration registry exposes explicit safety boundaries", () => {
  const registry = integrationRegistry();
  assert(registry.length >= 7);
  const evm = registry.find(x => x.name === "EVM Indexer");
  assertEquals(evm?.boundary, "read-only RPC methods");
  const sentinel = registry.find(x => x.name === "Sentinel");
  assertEquals(sentinel?.boundary, "recommendation only");
});
