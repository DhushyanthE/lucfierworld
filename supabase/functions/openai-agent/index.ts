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
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = Deno.env.get("OPENAI_MODEL")?.trim() || "gpt-4o-mini";
const FALLBACK_MODEL = "google/gemini-3.6-flash";

/**
 * Calls OpenAI with the server-side key. When that account cannot serve the
 * request for a billing reason (402, or the 429 `insufficient_quota` shape), the
 * same request is retried once against the Lovable AI gateway so the agent still
 * answers instead of returning a dead error to the browser. Any other status is
 * returned as-is — rate limits and bad requests are not billing problems.
 */
async function callModel(apiKey: string, messages: unknown[], stream: boolean) {
  const body = (model: string) => JSON.stringify({ model, messages, tools: TOOLS, stream });

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: body(MODEL),
  });
  if (res.ok) return { res, provider: "openai", model: MODEL };

  const detail = await res.text();
  const outOfCredit = res.status === 402 ||
    (res.status === 429 && /insufficient_quota|credit/i.test(detail));
  const lovableKey = Deno.env.get("LOVABLE_API_KEY")?.trim();
  if (!outOfCredit || !lovableKey) {
    return { res: new Response(detail, { status: res.status }), provider: "openai", model: MODEL };
  }

  console.warn("openai billing failure, falling back to Lovable AI gateway");
  const fb = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Lovable-API-Key": lovableKey,
      "Content-Type": "application/json",
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: body(FALLBACK_MODEL),
  });
  return { res: fb, provider: "lovable-ai", model: FALLBACK_MODEL };
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

  // Paid model calls require a signed-in user: without this gate anyone with the
  // function URL could drain AI credits.
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";
  if (!token) {
    return json({ error: "authentication required: sign in to use the agent" }, 401);
  }
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ??
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";
  if (!supabaseUrl || !anonKey) {
    return json({ error: "auth backend is not configured on the server" }, 500);
  }
  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
  });
  if (!userRes.ok) {
    return json({ error: "invalid or expired session" }, 401);
  }
  const user = await userRes.json();
  if (!user?.id) {
    return json({ error: "invalid or expired session" }, 401);
  }

  const apiKey = Deno.env.get("OPENAI_API_KEY")?.trim();
  if (!apiKey) {
    return json({ error: "OPENAI_API_KEY is not configured on the server." }, 500);
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
    let call = await callModel(apiKey, messages, false);
    if (!call.res.ok) {
      const detail = await call.res.text();
      console.error("model error", call.res.status, detail);
      return json(
        { error: `${call.provider} returned ${call.res.status}`, detail },
        call.res.status,
      );
    }
    let data = await call.res.json();
    let choice = data.choices?.[0];

    let hops = 0;
    while (choice?.message?.tool_calls?.length && hops < 4) {
      hops++;
      messages.push(choice.message);
      for (const toolCall of choice.message.tool_calls) {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(toolCall.function.arguments || "{}");
        } catch { /* malformed arguments -> run with defaults */ }
        const result = await runTool(toolCall.function.name, args);
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
      call = await callModel(apiKey, messages, false);
      if (!call.res.ok) {
        const detail = await call.res.text();
        return json(
          { error: `${call.provider} returned ${call.res.status}`, detail },
          call.res.status,
        );
      }
      data = await call.res.json();
      choice = data.choices?.[0];
    }

    return json({
      reply: choice?.message?.content ?? "",
      provider: call.provider,
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
