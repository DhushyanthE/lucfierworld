/**
 * leviathan-chain — read-only view of the deployed LeviathanCoin contract.
 *
 * Routes (relative to /functions/v1/leviathan-chain):
 *   GET  /                          configuration status
 *   GET  /state?address=0x..        totalSupply, attestationCount, optional balance
 *   GET  /attestations?window=500   recent AttestationAccepted events
 *   GET  /dharmic?window=2000       recent PoDS finalization logs
 *   GET  /wallet                     configured Sepolia deployer address + ETH balance
 *   GET  /market                     live LVTH/ETH reserves, price and cumulative volume
 *   GET  /trades?window=2000         recent Swap logs
 *
 * SAFETY BOUNDARY: only eth_call / eth_getLogs / eth_chainId / eth_blockNumber
 * are ever sent. No signer, no private key, no eth_sendRawTransaction. The backend
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

async function rpcRead(rpcUrl: string, method: string, params: unknown[]) {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!res.ok) throw new Error(`${method} failed with HTTP ${res.status}`);
  const body = await res.json();
  if (body.error) throw new Error(`${method} error: ${body.error.message ?? "unknown"}`);
  return body.result as string;
}

const format18 = (value: bigint) => {
  const whole = value / 10n ** 18n;
  const frac = (value % 10n ** 18n).toString().padStart(18, "0").replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : whole.toString();
};

function uintWords(data: string, count: number): bigint[] {
  const hex = data.startsWith("0x") ? data.slice(2) : data;
  if (hex.length < count * 64) throw new Error("eth_call returned short ABI data");
  return Array.from({ length: count }, (_, i) => BigInt("0x" + hex.slice(i * 64, (i + 1) * 64)));
}

const SEPOLIA_CHAIN_ID = 11155111;
const EXPLORER_BASE = Deno.env.get("SEPOLIA_EXPLORER_BASE_URL")?.trim() || "https://sepolia.etherscan.io";

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

    if (path === "/wallet" || path === "/deployer") {
      const address = Deno.env.get("LEVIATHAN_DEPLOYER_ADDRESS")?.trim() || "";
      if (!config.rpcUrl || !ADDRESS_RE.test(address)) {
        return json({
          configured: false,
          address: ADDRESS_RE.test(address) ? address : null,
          rpc_configured: Boolean(config.rpcUrl),
          missing: [
            ...(config.rpcUrl ? [] : ["EVM_RPC_URL"]),
            ...(ADDRESS_RE.test(address) ? [] : ["LEVIATHAN_DEPLOYER_ADDRESS"]),
          ],
          signer_present: false,
        });
      }
      const [balanceHex, chainHex] = await Promise.all([
        rpcRead(config.rpcUrl, "eth_getBalance", [address, "latest"]),
        rpcRead(config.rpcUrl, "eth_chainId", []),
      ]);
      const balance = toBigInt(balanceHex);
      const chainId = Number(toBigInt(chainHex));
      return json({
        configured: true,
        address,
        balance_wei: balance.toString(),
        balance_eth: format18(balance),
        chain_id: chainId,
        network: chainId === SEPOLIA_CHAIN_ID ? "sepolia" : `chain-${chainId}`,
        explorer_url: chainId === SEPOLIA_CHAIN_ID ? `${EXPLORER_BASE}/address/${address}` : null,
        explorer_base_url: chainId === SEPOLIA_CHAIN_ID ? EXPLORER_BASE : null,
        signer_present: false,
        read_only: true,
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

    if (path === "/market") {
      const [marketHex, chainHex] = await Promise.all([
        ethCall(config.rpcUrl, config.contractAddress, selector("marketState()")),
        rpcRead(config.rpcUrl, "eth_chainId", []),
      ]);
      const [reserveLVTH, reserveETH, priceWeiPerLVTH, volumeLVTH, volumeETH, liquidity] =
        uintWords(marketHex, 6);
      const chainId = Number(toBigInt(chainHex));
      return json({
        configured: true,
        contract: config.contractAddress,
        chain_id: chainId,
        network: chainId === SEPOLIA_CHAIN_ID ? "sepolia" : `chain-${chainId}`,
        reserve_lvth_wei: reserveLVTH.toString(),
        reserve_eth_wei: reserveETH.toString(),
        reserve_lvth: format18(reserveLVTH),
        reserve_eth: format18(reserveETH),
        price_wei_per_lvth: priceWeiPerLVTH.toString(),
        price_eth_per_lvth: format18(priceWeiPerLVTH),
        cumulative_volume_lvth_wei: volumeLVTH.toString(),
        cumulative_volume_eth_wei: volumeETH.toString(),
        cumulative_volume_lvth: format18(volumeLVTH),
        cumulative_volume_eth: format18(volumeETH),
        total_liquidity_shares: liquidity.toString(),
        explorer_url: chainId === SEPOLIA_CHAIN_ID ? `${EXPLORER_BASE}/address/${config.contractAddress}` : null,
        explorer_base_url: chainId === SEPOLIA_CHAIN_ID ? EXPLORER_BASE : null,
        read_only: true,
      });
    }

    if (path === "/trades") {
      const window = Number(url.searchParams.get("window") ?? 2000);
      const result = await indexEvents({
        config: { rpcUrl: config.rpcUrl, contractAddress: config.contractAddress },
        blockWindow: Number.isFinite(window) ? window : 2000,
        topics: [eventTopic(LEVIATHAN_EVENTS.Swap)],
      });
      return json({ ...result, event: "Swap", read_only: true });
    }

    if (path === "/state") {
      const holder = url.searchParams.get("address");
      if (holder && !ADDRESS_RE.test(holder)) {
        return json({ error: "address must be a 20-byte hex address" }, 400);
      }
      const [supplyHex, countHex, dharmicRoundHex, dharmicBestHex, dharmicHeadHex, validatorCountHex, chainHex] = await Promise.all([
        ethCall(config.rpcUrl, config.contractAddress, selector("totalSupply()")),
        ethCall(config.rpcUrl, config.contractAddress, selector("attestationCount()")),
        ethCall(config.rpcUrl, config.contractAddress, selector("dharmicRound()")),
        ethCall(config.rpcUrl, config.contractAddress, selector("dharmicBestMilli()")),
        ethCall(config.rpcUrl, config.contractAddress, selector("dharmicHead()")),
        ethCall(config.rpcUrl, config.contractAddress, selector("validatorCount()")),
        rpcRead(config.rpcUrl, "eth_chainId", []),
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
        dharmic_round: Number(toBigInt(dharmicRoundHex)),
        dharmic_best_milli: toBigInt(dharmicBestHex).toString(),
        dharmic_head: dharmicHeadHex,
        validator_count: Number(toBigInt(validatorCountHex)),
        holder: holder ?? null,
        balance_wei: balanceWei === null ? null : balanceWei.toString(),
        chain_id: Number(toBigInt(chainHex)),
        network: Number(toBigInt(chainHex)) === SEPOLIA_CHAIN_ID ? "sepolia" : `chain-${Number(toBigInt(chainHex))}`,
        explorer_url: Number(toBigInt(chainHex)) === SEPOLIA_CHAIN_ID ? `${EXPLORER_BASE}/address/${config.contractAddress}` : null,
        explorer_base_url: Number(toBigInt(chainHex)) === SEPOLIA_CHAIN_ID ? EXPLORER_BASE : null,
        read_only: true,
      });
    }

    if (path === "/dharmic") {
      const window = Number(url.searchParams.get("window") ?? 2000);
      const result = await indexEvents({
        config: { rpcUrl: config.rpcUrl, contractAddress: config.contractAddress },
        blockWindow: Number.isFinite(window) ? window : 2000,
        topics: [eventTopic(LEVIATHAN_EVENTS.DharmicRoundFinalized)],
      });
      return json({ ...result, event: "DharmicRoundFinalized", read_only: true });
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
