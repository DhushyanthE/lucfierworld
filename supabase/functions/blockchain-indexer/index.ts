/**
 * blockchain-indexer — read-only bridge between the chain and the rest of the
 * fabric (DEVELOPMENT.md §5b-2, Priority 2 of the completion plan).
 *
 * Routes (relative to /functions/v1/blockchain-indexer):
 *   GET  /health                      configuration status, never fabricated data
 *   POST /v1/blockchain/indexer/scan  { block_window?, topics? }
 *   GET  /v1/blockchain/indexer/demo  a scan over the last blocks, findings normalised
 *
 * The boundary is read-only in both directions: nothing here can sign a
 * transaction, call a state-changing contract function, or move funds.
 */

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import { indexEvents, notConfigured, readIndexerConfig } from "../_shared/indexer.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const ScanSchema = z.object({
  block_window: z.number().int().min(1).max(50_000).default(2000),
  topics: z.array(z.union([z.string().regex(/^0x[0-9a-fA-F]{64}$/), z.null()])).max(4).optional(),
});

function routePath(url: URL): string {
  const p = url.pathname
    .replace(/^\/functions\/v1/, "")
    .replace(/^\/blockchain-indexer/, "");
  return p === "" ? "/" : p.replace(/\/+$/, "") || "/";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const path = routePath(url);
  const config = readIndexerConfig();

  try {
    if (req.method === "GET" && (path === "/" || path === "/health")) {
      return json({
        status: "ok",
        configured: Boolean(config.rpcUrl && config.contractAddress),
        rpc_configured: Boolean(config.rpcUrl),
        contract_configured: Boolean(config.contractAddress),
        capabilities: ["eth_chainId", "eth_blockNumber", "eth_getLogs", "eth_call"],
        write_capabilities: [],
        note:
          "Read-only by design. Signing and state-changing calls are deliberately absent, per the safety boundary documented in DEVELOPMENT.md §5b-2.",
      });
    }

    if (path === "/v1/blockchain/indexer/demo" && req.method === "GET") {
      if (!config.rpcUrl || !config.contractAddress) return json(notConfigured(config));
      return json(await indexEvents({ config, blockWindow: 500 }));
    }

    if (path === "/v1/blockchain/indexer/scan" && req.method === "POST") {
      if (!config.rpcUrl || !config.contractAddress) return json(notConfigured(config));
      const text = await req.text();
      const parsed = ScanSchema.safeParse(text ? JSON.parse(text) : {});
      if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
      return json(await indexEvents({
        config,
        blockWindow: parsed.data.block_window,
        topics: parsed.data.topics,
      }));
    }

    return json({ error: `no route for ${req.method} ${path}` }, 404);
  } catch (e) {
    const message = e instanceof Error ? e.message : "unexpected error";
    console.error("blockchain-indexer error:", message);
    return json({ error: message, configured: Boolean(config.rpcUrl) }, 502);
  }
});
