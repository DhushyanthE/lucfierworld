// Proxies an OpenQASM 2.0 circuit to the IBM Quantum Platform REST API.
// Requires the IBM_QUANTUM_TOKEN secret (IBM Cloud IAM API key with a
// Quantum service instance). We only submit the job here; the client polls
// job status through this same function with ?jobId=... .
//
// Reference: https://quantum.cloud.ibm.com/api/documentation
// This is a thin proxy; IBM's API surface changes — surface their errors verbatim.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const IBM_BASE = "https://quantum.cloud.ibm.com/api/v1";

interface SubmitBody {
  qasm: string;
  backend?: string;
  shots?: number;
  instance?: string; // CRN of the quantum service instance
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const token = Deno.env.get("IBM_QUANTUM_TOKEN");
  if (!token) {
    return json({ error: "IBM_QUANTUM_TOKEN is not configured" }, 500);
  }

  try {
    const url = new URL(req.url);
    const jobId = url.searchParams.get("jobId");

    // Poll a job
    if (req.method === "GET" && jobId) {
      const r = await fetch(`${IBM_BASE}/jobs/${encodeURIComponent(jobId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await r.text();
      return new Response(body, {
        status: r.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    const raw = (await req.json()) as SubmitBody;
    const qasm = (raw?.qasm ?? "").trim();
    if (!qasm || qasm.length > 20_000) {
      return json({ error: "qasm is required (1..20000 chars)" }, 400);
    }
    const shots = Math.max(1, Math.min(100_000, Math.floor(raw?.shots ?? 1024)));
    const backend = (raw?.backend ?? "ibm_brisbane").slice(0, 64);
    const instance = raw?.instance;

    const payload: Record<string, unknown> = {
      program_id: "sampler",
      backend,
      params: {
        pubs: [[qasm]],
        options: { default_shots: shots },
        version: 2,
      },
    };
    if (instance) payload.hub = instance;

    const r = await fetch(`${IBM_BASE}/jobs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const body = await r.text();
    return new Response(body, {
      status: r.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
