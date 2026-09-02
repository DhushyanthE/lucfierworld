/**
 * leviathan-chain — read-only view of the deployed LeviathanCoin contract.
 *
 * Routes (relative to /functions/v1/leviathan-chain):
 *   GET  /                          configuration status
 *   GET  /state?address=0x..        totalSupply, attestationCount, optional balance
 *   GET  /attestations?window=500   recent AttestationAccepted events, decoded
 *
 * SAFETY BOUNDARY: only eth_call / eth_getLogs / eth_chainId / eth_blockNumber
 * are ever sent. No signer, no private key, no eth_sendRawTransaction. When no
 * RPC URL or contract address is configured this reports configured:false rather
 * than inventing balances.
 */

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { indexEvents, notConfigured, readIndexerConfig } from "../_shared/indexer.ts";
import { eventTopic, LEVIATHAN_EVENTS } from "../_shared/leviathan.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

/** First 4 bytes of keccak256(signature) — the function selector. */
const selector = (sig: string) => eventTopic(sig).slice(0, 10);

function readConfig() {
  const base = readIndexerConfig();
  const contractAddress = Deno.env.get("LEVIATHAN_CONTRACT_ADDRESS")?.trim() ||
    base.contractAddress;
  return { rpcUrl: base.rpcUrl, contractAddress };
}

async function ethCall(rpcUrl: string, to: string, data: string): Promise<string> {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_call",
      params: [{ to, data }, "latest"],
    }),
  });
  if (!res.ok) throw new Error(`eth_call failed with HTTP ${res.status}`);
  const body = await res.json();
  if (body.error) throw new Error(`eth_call error: ${body.error.message ?? "unknown"}`);
  return body.result as string;
}

const toBigInt = (hex: string) => (hex && hex !== "0x" ? BigInt(hex) : 0n);

function routePath(url: URL): string {
  const p = url.pathname
    .replace(/^\/functions\/v1/, "")
    .replace(/^\/leviathan-chain/, "");
  return p === "" ? "/" : p.replace(/\/+$/, "") || "/";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const path = routePath(url);
  const config = readConfig();

  try {
    if (path === "/" || path === "/health") {
      return json({
        status: "ok",
        configured: Boolean(config.rpcUrl && config.contractAddress),
        rpc_configured: Boolean(config.rpcUrl),
        contract: config.contractAddress,
        read_only: true,
        write_capabilities: [],
      });
    }

    if (!config.rpcUrl || !config.contractAddress) {
      return json({
        ...notConfigured({ rpcUrl: config.rpcUrl, contractAddress: config.contractAddress }),
        missing_secrets: [
          ...(config.rpcUrl ? [] : ["EVM_RPC_URL"]),
          ...(config.contractAddress ? [] : ["LEVIATHAN_CONTRACT_ADDRESS"]),
        ],
      });
    }

    if (path === "/state") {
      const holder = url.searchParams.get("address");
      if (holder && !ADDRESS_RE.test(holder)) {
        return json({ error: "address must be a 20-byte hex address" }, 400);
      }
      const [supplyHex, countHex] = await Promise.all([
        ethCall(config.rpcUrl, config.contractAddress, selector("totalSupply()")),
        ethCall(config.rpcUrl, config.contractAddress, selector("attestationCount()")),
      ]);
      let balanceWei: bigint | null = null;
      if (holder) {
        const data = selector("balanceOf(address)") + holder.slice(2).toLowerCase().padStart(64, "0");
        balanceWei = toBigInt(await ethCall(config.rpcUrl, config.contractAddress, data));
      }
      return json({
        configured: true,
        contract: config.contractAddress,
        symbol: "LVTH",
        decimals: 18,
        total_supply_wei: toBigInt(supplyHex).toString(),
        attestation_count: Number(toBigInt(countHex)),
        holder: holder ?? null,
        balance_wei: balanceWei === null ? null : balanceWei.toString(),
        read_only: true,
      });
    }

    if (path === "/attestations") {
      const window = Number(url.searchParams.get("window") ?? 2000);
      const result = await indexEvents({
        config: { rpcUrl: config.rpcUrl, contractAddress: config.contractAddress },
        blockWindow: Number.isFinite(window) ? window : 2000,
        topics: [eventTopic(LEVIATHAN_EVENTS.AttestationAccepted)],
      });
      return json(result);
    }

    return json({ error: `no route for ${req.method} ${path}` }, 404);
  } catch (e) {
    const message = e instanceof Error ? e.message : "unexpected error";
    console.error("leviathan-chain error:", message);
    return json({ error: message, configured: true }, 502);
  }
});
