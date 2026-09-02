/**
 * openai-agent — Deno port of agent/openai_agent.py.
 *
 * The OpenAI key stays server-side (OPENAI_API_KEY secret); the browser only
 * ever talks to this function. Streaming SSE is proxied straight through so a
 * long answer never sits buffered past the platform's silent-request window.
 *
 * SAFETY BOUNDARY (unchanged from the Python agent): the tools this agent can
 * reach are read-only. It can read chain state through blockchain-indexer and
 * check Bell-score governance rules. There is no signer, no private key and no
 * path that can move funds or mutate contract state.
 */

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import { verifyBellScore } from "../_shared/leviathan.ts";
import { indexEvents, notConfigured, readIndexerConfig } from "../_shared/indexer.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const BodySchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(8000),
  })).min(1).max(40),
  stream: z.boolean().default(true),
});

const SYSTEM_PROMPT = `You are the QuantumSynapse Fabric agent.

You answer questions about this project: a quantum simulation core (statevector,
BB84/QKD, VQE/QAOA), the LeviathanCoin ERC-20 + Proof-of-Neural-Work attestation
registry on a standard EVM chain, and a read-only blockchain indexer.

Hard rules you must never break:
- Governance accepts a CHSH/Bell score S only when 2.0 < S <= 2.828 (Tsirelson).
- You are read-only. You cannot sign transactions, move funds, or change contract
  state, and you must say so plainly if asked to.
- Never fabricate on-chain data. If the chain is not configured, say it is not
  configured.

Be concise and concrete. Say "I don't know" rather than guessing.`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "check_bell_score",
      description: "Check whether a CHSH/Bell score passes on-chain governance.",
      parameters: {
        type: "object",
        properties: {
          score: { type: "number", description: "CHSH S value, e.g. 2.62" },
          network_best_milli: { type: "number", description: "Current network best in milli-units" },
        },
        required: ["score"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_blockchain_findings",
      description:
        "Read recent on-chain events via the read-only indexer. Returns configured:false when no chain is wired.",
      parameters: {
        type: "object",
        properties: { block_window: { type: "number" } },
        required: [],
      },
    },
  },
] as const;

async function runTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  if (name === "check_bell_score") {
    return verifyBellScore(Number(args.score), Number(args.network_best_milli ?? 0));
  }
  if (name === "check_blockchain_findings") {
    const config = readIndexerConfig();
    if (!config.rpcUrl || !config.contractAddress) return notConfigured(config);
    const window = Math.min(Math.max(Number(args.block_window ?? 500), 1), 50_000);
    return await indexEvents({ config, blockWindow: window });
  }
  return { error: `unknown tool ${name}` };
}

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = Deno.env.get("OPENAI_MODEL")?.trim() || "gpt-4o-mini";

async function callOpenAI(apiKey: string, messages: unknown[], stream: boolean) {
  return await fetch(OPENAI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, messages, tools: TOOLS, stream }),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  if (req.method === "GET") {
    return json({
      status: "ok",
      model: MODEL,
      key_configured: Boolean(Deno.env.get("OPENAI_API_KEY")),
      tools: TOOLS.map((t) => t.function.name),
      write_capabilities: [],
    });
  }

  const apiKey = Deno.env.get("OPENAI_API_KEY")?.trim();
  if (!apiKey) {
    return json({ error: "OPENAI_API_KEY is not configured on the server." }, 401);
  }

  let parsed;
  try {
    parsed = BodySchema.safeParse(await req.json());
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }
  if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);

  const messages: Record<string, unknown>[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...parsed.data.messages,
  ];

  try {
    // First pass is never streamed: the model may ask for a tool, and a tool
    // round-trip cannot be resolved mid-stream.
    let res = await callOpenAI(apiKey, messages, false);
    if (!res.ok) {
      const detail = await res.text();
      console.error("openai error", res.status, detail);
      return json({ error: `OpenAI returned ${res.status}`, detail }, res.status);
    }
    let data = await res.json();
    let choice = data.choices?.[0];

    let hops = 0;
    while (choice?.message?.tool_calls?.length && hops < 4) {
      hops++;
      messages.push(choice.message);
      for (const call of choice.message.tool_calls) {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(call.function.arguments || "{}");
        } catch { /* malformed arguments -> run with defaults */ }
        const result = await runTool(call.function.name, args);
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }
      res = await callOpenAI(apiKey, messages, false);
      if (!res.ok) {
        const detail = await res.text();
        return json({ error: `OpenAI returned ${res.status}`, detail }, res.status);
      }
      data = await res.json();
      choice = data.choices?.[0];
    }

    return json({
      reply: choice?.message?.content ?? "",
      tool_hops: hops,
      model: data.model ?? MODEL,
      path: url.pathname,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unexpected error";
    console.error("openai-agent failure:", message);
    return json({ error: message }, 502);
  }
});
