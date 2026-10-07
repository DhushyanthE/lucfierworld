/**
 * leviathan-chain — read-only view of the deployed LeviathanCoin contract.
 *
 * Routes (relative to /functions/v1/leviathan-chain):
 *   GET  /                          configuration status
 *   GET  /state?address=0x..        totalSupply, attestationCount, optional balance
 *   GET  /attestations?window=500   recent AttestationAccepted events
 *   GET  /dharmic?window=2000       recent PoDS finalization logs
 *   GET  /market?window=7200         live LVTH/ETH AMM price + recent swap volume
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

async function rpcRead(rpcUrl: string, method: "eth_chainId" | "eth_blockNumber", params: unknown[] = []): Promise<string> {
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



async function ethLogs(
  rpcUrl: string,
  address: string,
  fromBlock: number,
  toBlock: number,
  topic0: string,
): Promise<{ data: string }[]> {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_getLogs",
      params: [{
        address,
        fromBlock: "0x" + fromBlock.toString(16),
        toBlock: "0x" + toBlock.toString(16),
        topics: [topic0],
      }],
    }),
  });
  if (!res.ok) throw new Error(`eth_getLogs failed with HTTP ${res.status}`);
  const body = await res.json();
  if (body.error) throw new Error(`eth_getLogs error: ${body.error.message ?? "unknown"}`);
  return body.result as { data: string }[];
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
      const chainId = config.rpcUrl ? Number.parseInt(await rpcRead(config.rpcUrl, "eth_chainId"), 16) : null;
      return json({
        status: "ok",
        configured: Boolean(config.rpcUrl && config.contractAddress),
        rpc_configured: Boolean(config.rpcUrl),
        contract: config.contractAddress,
        chain_id: chainId,
        network: chainId === 11155111 ? "sepolia" : chainId ? `chain-${chainId}` : null,
        read_only: true,
        write_capabilities: [],
      });
    }

    if (path === "/deployer") {
      const { ethers } = await import("npm:ethers@6");
      const k = Deno.env.get("DEPLOYER_PRIVATE_KEY")?.trim();
      if (!k || !config.rpcUrl) return json({ configured: false });
      if (!/^(0x)?[0-9a-fA-F]{64}$/.test(k)) {
        return json({ configured: false, error: "DEPLOYER_PRIVATE_KEY is not a valid 32-byte hex wallet key" }, 400);
      }
      const address = new ethers.Wallet(k.startsWith("0x") ? k : `0x${k}`).address;
      const provider = new ethers.JsonRpcProvider(config.rpcUrl);
      const bal = await provider.getBalance(address);
      return json({ address, balance_eth: ethers.formatEther(bal), chain_id: Number((await provider.getNetwork()).chainId) });
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
      const [supplyHex, countHex, dharmicRoundHex, dharmicBestHex, dharmicHeadHex, validatorCountHex] = await Promise.all([
        ethCall(config.rpcUrl, config.contractAddress, selector("totalSupply()")),
        ethCall(config.rpcUrl, config.contractAddress, selector("attestationCount()")),
        ethCall(config.rpcUrl, config.contractAddress, selector("dharmicRound()")),
        ethCall(config.rpcUrl, config.contractAddress, selector("dharmicBestMilli()")),
        ethCall(config.rpcUrl, config.contractAddress, selector("dharmicHead()")),
        ethCall(config.rpcUrl, config.contractAddress, selector("validatorCount()")),
      ]);
      let balanceWei: bigint | null = null;
      if (holder) {
        const data = selector("balanceOf(address)") + holder.slice(2).toLowerCase().padStart(64, "0");
        balanceWei = toBigInt(await ethCall(config.rpcUrl, config.contractAddress, data));
      }
      const chainId = Number.parseInt(await rpcRead(config.rpcUrl, "eth_chainId"), 16);
      return json({
        configured: true,
        contract: config.contractAddress,
        chain_id: chainId,
        network: chainId === 11155111 ? "sepolia" : `chain-${chainId}`,
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
        read_only: true,
      });
    }

    if (path === "/market") {
      const window = Math.min(Math.max(Number(url.searchParams.get("window") ?? 7200), 1), 50_000);
      const [ethReserveHex, lvthReserveHex, priceHex, ethVolumeHex, lvthVolumeHex, sharesHex] = await Promise.all([
        ethCall(config.rpcUrl, config.contractAddress, selector("poolEthReserve()")),
        ethCall(config.rpcUrl, config.contractAddress, selector("poolLvthReserve()")),
        ethCall(config.rpcUrl, config.contractAddress, selector("spotPriceWeiPerLvth()")),
        ethCall(config.rpcUrl, config.contractAddress, selector("cumulativeEthVolumeWei()")),
        ethCall(config.rpcUrl, config.contractAddress, selector("cumulativeLvthVolumeWei()")),
        ethCall(config.rpcUrl, config.contractAddress, selector("totalLiquidityShares()")),
      ]);
      const head = Number.parseInt(await rpcRead(config.rpcUrl, "eth_blockNumber"), 16);
      const fromBlock = Math.max(0, head - window);
      const swapLogs = await ethLogs(
        config.rpcUrl,
        config.contractAddress,
        fromBlock,
        head,
        eventTopic(LEVIATHAN_EVENTS.Swap),
      );

      let recentEthVolume = 0n;
      let recentLvthVolume = 0n;
      let swapCount = 0;
      for (const event of swapLogs) {
        const data = event.data.replace(/^0x/, "");
        if (data.length < 64 * 5) continue;
        const word = (i: number) => BigInt("0x" + data.slice(i * 64, (i + 1) * 64));
        const ethToLvth = word(0) !== 0n;
        const amountIn = word(1);
        const amountOut = word(2);
        if (ethToLvth) {
          recentEthVolume += amountIn;
          recentLvthVolume += amountOut;
        } else {
          recentLvthVolume += amountIn;
          recentEthVolume += amountOut;
        }
        swapCount++;
      }

      const chainId = Number.parseInt(await rpcRead(config.rpcUrl, "eth_chainId"), 16);
      return json({
        configured: true,
        contract: config.contractAddress,
        chain_id: chainId,
        network: chainId === 11155111 ? "sepolia" : `chain-${chainId}`,
        symbol: "LVTH",
        quote_symbol: "ETH",
        fee_bps: 30,
        pool_eth_reserve_wei: toBigInt(ethReserveHex).toString(),
        pool_lvth_reserve_wei: toBigInt(lvthReserveHex).toString(),
        spot_price_wei_per_lvth: toBigInt(priceHex).toString(),
        cumulative_eth_volume_wei: toBigInt(ethVolumeHex).toString(),
        cumulative_lvth_volume_wei: toBigInt(lvthVolumeHex).toString(),
        total_liquidity_shares: toBigInt(sharesHex).toString(),
        recent_window_blocks: window,
        recent_swap_count: swapCount,
        recent_eth_volume_wei: recentEthVolume.toString(),
        recent_lvth_volume_wei: recentLvthVolume.toString(),
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
    console.error("leviathan-chain error:", e instanceof Error ? e.name : "unknown");
    return json({ error: "chain request failed", configured: true }, 502);
  }
});
