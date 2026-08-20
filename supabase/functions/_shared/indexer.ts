/**
 * Read-only blockchain event indexer — TypeScript/Deno port of the `indexer.py`
 * described in DEVELOPMENT.md §5b.
 *
 * SAFETY BOUNDARY (deliberate, mirrors agent/README.md): this module can ONLY
 * read. It issues `eth_blockNumber`, `eth_getLogs` and `eth_call` and nothing
 * else. There is no signer, no private key, no `eth_sendRawTransaction`, and no
 * code path that can move funds or mutate contract state. Write access to
 * value-moving functions needs its own design (confirmation flow, spending
 * limits, audit trail) and is intentionally out of scope here.
 *
 * When no RPC endpoint is configured the indexer reports `configured: false`
 * with an explanation instead of fabricating findings.
 */

export type IndexerConfig = {
  rpcUrl: string | null;
  contractAddress: string | null;
};

export function readIndexerConfig(): IndexerConfig {
  const rpcUrl = Deno.env.get("EVM_RPC_URL")?.trim() || null;
  const contractAddress = Deno.env.get("PONW_CONTRACT_ADDRESS")?.trim() || null;
  return { rpcUrl, contractAddress };
}

export type NotConfigured = {
  configured: false;
  reason: string;
  missing: string[];
  findings: [];
  events_indexed_this_run: 0;
};

export function notConfigured(config: IndexerConfig): NotConfigured {
  const missing: string[] = [];
  if (!config.rpcUrl) missing.push("EVM_RPC_URL");
  if (!config.contractAddress) missing.push("PONW_CONTRACT_ADDRESS");
  return {
    configured: false,
    reason:
      "No chain is configured, so there is nothing to index. This is an honest empty result, not a failure and not simulated data.",
    missing,
    findings: [],
    events_indexed_this_run: 0,
  };
}

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

async function rpc<T>(rpcUrl: string, method: string, params: unknown[]): Promise<T> {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!res.ok) throw new Error(`RPC ${method} failed with HTTP ${res.status}`);
  const body = await res.json();
  if (body.error) throw new Error(`RPC ${method} error: ${body.error.message ?? "unknown"}`);
  return body.result as T;
}

/** Only these read-only methods may ever be sent. */
const ALLOWED_METHODS = new Set(["eth_blockNumber", "eth_getLogs", "eth_call", "eth_chainId"]);

async function safeRpc<T>(rpcUrl: string, method: string, params: unknown[]): Promise<T> {
  if (!ALLOWED_METHODS.has(method)) {
    throw new Error(`method ${method} is not read-only and is refused by the indexer`);
  }
  return await rpc<T>(rpcUrl, method, params);
}

export type IndexedEvent = {
  block_number: number;
  transaction_hash: string;
  log_index: number;
  topics: string[];
  data: string;
  topic0: string;
};

export type IndexResult = {
  configured: true;
  chain_id: number | null;
  contract: string;
  from_block: number;
  to_block: number;
  events_indexed_this_run: number;
  events: IndexedEvent[];
  findings: { severity: "info" | "warning"; kind: string; detail: string; block_number: number }[];
  read_only: true;
};

export async function indexEvents(opts: {
  config: IndexerConfig;
  blockWindow?: number;
  topics?: (string | null)[];
}): Promise<IndexResult | NotConfigured> {
  const { config } = opts;
  if (!config.rpcUrl || !config.contractAddress) return notConfigured(config);
  if (!ADDRESS_RE.test(config.contractAddress)) {
    throw new Error("PONW_CONTRACT_ADDRESS is not a valid 20-byte hex address");
  }

  const window = Math.min(Math.max(opts.blockWindow ?? 2000, 1), 50_000);
  const chainIdHex = await safeRpc<string>(config.rpcUrl, "eth_chainId", []).catch(() => null);
  const headHex = await safeRpc<string>(config.rpcUrl, "eth_blockNumber", []);
  const head = Number.parseInt(headHex, 16);
  const fromBlock = Math.max(0, head - window);

  const logs = await safeRpc<
    { blockNumber: string; transactionHash: string; logIndex: string; topics: string[]; data: string }[]
  >(config.rpcUrl, "eth_getLogs", [{
    address: config.contractAddress,
    fromBlock: "0x" + fromBlock.toString(16),
    toBlock: "0x" + head.toString(16),
    ...(opts.topics ? { topics: opts.topics } : {}),
  }]);

  const events: IndexedEvent[] = logs.map((l) => ({
    block_number: Number.parseInt(l.blockNumber, 16),
    transaction_hash: l.transactionHash,
    log_index: Number.parseInt(l.logIndex, 16),
    topics: l.topics,
    data: l.data,
    topic0: l.topics[0] ?? "",
  }));

  const byTopic = new Map<string, number>();
  for (const e of events) byTopic.set(e.topic0, (byTopic.get(e.topic0) ?? 0) + 1);

  const findings = events.slice(-25).map((e) => ({
    severity: "info" as const,
    kind: "onchain_event",
    detail: `event ${e.topic0.slice(0, 10)} in tx ${e.transaction_hash.slice(0, 12)}…`,
    block_number: e.block_number,
  }));

  return {
    configured: true,
    chain_id: chainIdHex ? Number.parseInt(chainIdHex, 16) : null,
    contract: config.contractAddress,
    from_block: fromBlock,
    to_block: head,
    events_indexed_this_run: events.length,
    events: events.slice(-50),
    findings,
    read_only: true,
  };
}
