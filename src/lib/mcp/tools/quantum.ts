import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

/**
 * Read-only quantum tools for the agent layer (DEVELOPMENT.md §5f / agent/tools.py).
 *
 * SAFETY BOUNDARY: every tool here is a read or a pure simulation. None of them
 * signs a transaction, calls a state-changing contract function, or moves funds.
 * Write access to value-moving contracts needs its own explicit design
 * (confirmation flow, spending limits, audit trail) and is intentionally absent.
 */

const FUNCTIONS_BASE = `https://${
  Deno.env.get("SUPABASE_PROJECT_ID") ?? ""
}.supabase.co/functions/v1`;

function baseUrl(): string {
  const url = Deno.env.get("SUPABASE_URL");
  return url ? `${url.replace(/\/+$/, "")}/functions/v1` : FUNCTIONS_BASE;
}

async function callFunction(path: string, body?: unknown, method: "GET" | "POST" = "POST") {
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const res = await fetch(`${baseUrl()}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(anon ? { Authorization: `Bearer ${anon}`, apikey: anon } : {}),
    },
    ...(method === "POST" ? { body: JSON.stringify(body ?? {}) } : {}),
  });
  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = { raw: text };
  }
  return { ok: res.ok, status: res.status, data: parsed };
}

function result(payload: unknown, ok = true) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload as Record<string, unknown>,
    ...(ok ? {} : { isError: true as const }),
  };
}

const readOnly = { readOnlyHint: true, idempotentHint: false, openWorldHint: false };

export const runQrngTool = defineTool({
  name: "run_qrng",
  title: "Quantum random number generator",
  description:
    "Generate random bits by measuring Hadamard-prepared qubits on the native statevector engine. Returns the bitstring and its integer value.",
  inputSchema: {
    numBits: z.number().int().min(1).max(512).default(32).describe("How many bits to generate."),
  },
  annotations: readOnly,
  handler: async ({ numBits }) => {
    const r = await callFunction("/quantum-core/v1/quantum/qrng", { num_bits: numBits });
    return result(r.data, r.ok);
  },
});

export const runBb84Tool = defineTool({
  name: "run_bb84_simulation",
  title: "BB84 QKD simulation",
  description:
    "Run a BB84 quantum key distribution simulation, optionally with an intercept-resend eavesdropper, and return the sifted key length and measured QBER.",
  inputSchema: {
    numBits: z.number().int().min(8).max(2048).default(256).describe("Raw qubits exchanged."),
    simulateEavesdropper: z.boolean().default(false).describe("Insert an intercept-resend Eve."),
  },
  annotations: readOnly,
  handler: async ({ numBits, simulateEavesdropper }) => {
    const r = await callFunction("/quantum-core/v1/quantum/bb84/simulate", {
      num_bits: numBits,
      simulate_eavesdropper: simulateEavesdropper,
    });
    return result(r.data, r.ok);
  },
});

export const runVqeTool = defineTool({
  name: "run_vqe",
  title: "VQE ground state",
  description:
    "Estimate the ground-state energy of a transverse-field Ising ring with a variational quantum eigensolver, using analytic parameter-shift gradients. Also reports the best unentangled ansatz for comparison.",
  inputSchema: {
    numQubits: z.number().int().min(2).max(6).default(2).describe("System size."),
    layers: z.number().int().min(1).max(3).default(2).describe("Ansatz depth."),
  },
  annotations: readOnly,
  handler: async ({ numQubits, layers }) => {
    const r = await callFunction("/quantum-core/v1/vqe/run", {
      num_qubits: numQubits,
      layers,
    });
    return result(r.data, r.ok);
  },
});

export const runQaoaTool = defineTool({
  name: "run_qaoa",
  title: "QAOA Max-Cut",
  description:
    "Solve a Max-Cut instance with QAOA on the native engine and compare the sampled cut against the brute-force optimum.",
  inputSchema: {
    numNodes: z.number().int().min(2).max(8).default(4).describe("Number of graph nodes."),
    edges: z
      .array(z.object({ u: z.number().int().min(0), v: z.number().int().min(0) }))
      .min(1)
      .max(28)
      .describe("Edge list, node indices are 0-based."),
    depth: z.number().int().min(1).max(3).default(2).describe("QAOA depth p."),
  },
  annotations: readOnly,
  handler: async ({ numNodes, edges, depth }) => {
    const r = await callFunction("/quantum-core/v1/qaoa/maxcut", {
      num_nodes: numNodes,
      edges,
      depth,
    });
    return result(r.data, r.ok);
  },
});

export const checkBlockchainFindingsTool = defineTool({
  name: "check_blockchain_findings",
  title: "Check on-chain findings (read-only)",
  description:
    "Read recent on-chain events for the configured ProofOfNeuralWork contract through the read-only indexer. Reports `configured: false` honestly when no chain is configured instead of inventing findings. This tool cannot sign transactions or change contract state.",
  inputSchema: {
    blockWindow: z
      .number()
      .int()
      .min(1)
      .max(20000)
      .default(2000)
      .describe("How many blocks back from the chain head to scan."),
  },
  annotations: readOnly,
  handler: async ({ blockWindow }) => {
    const r = await callFunction("/blockchain-indexer/v1/blockchain/indexer/scan", {
      block_window: blockWindow,
    });
    return result(r.data, r.ok);
  },
});

export default [
  runQrngTool,
  runBb84Tool,
  runVqeTool,
  runQaoaTool,
  checkBlockchainFindingsTool,
];
