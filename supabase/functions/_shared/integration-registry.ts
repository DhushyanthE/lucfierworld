import type { TechnologyStatus } from "./backend-contracts.ts";

export function integrationRegistry(): TechnologyStatus[] {
  return [
    { name: "Supabase", role: "auth + Edge Functions + data plane", status: Deno.env.get("SUPABASE_URL") ? "ready" : "unconfigured", boundary: "authenticated application backend" },
    { name: "SHA3-512", role: "canonical payload integrity", status: "ready", boundary: "hashing, not encryption" },
    { name: "ML-DSA-87", role: "post-quantum signatures", status: "ready", boundary: "authenticity/integrity" },
    { name: "Sentinel", role: "defensive telemetry triage", status: "ready", boundary: "recommendation only" },
    { name: "Policy Review", role: "nine-perspective defensive review", status: "ready", boundary: "single-process simulation; not distributed consensus" },
    { name: "Quantum Fabric", role: "research QKD/decision simulation", status: "ready", boundary: "simulation; not physical QKD" },
    { name: "EVM Indexer", role: "LeviathanCoin observation", status: Deno.env.get("LEVIATHAN_RPC_URL") && Deno.env.get("LEVIATHAN_CONTRACT_ADDRESS") ? "ready" : "unconfigured", boundary: "read-only RPC methods" },
    { name: "OpenAI", role: "optional analyst assistance", status: Deno.env.get("OPENAI_API_KEY") ? "ready" : "unconfigured", boundary: "advisory; no action authority" },
  ];
}
