/**
 * quantum-gateway — TypeScript/Deno port of the api-gateway signature layer in
 * DEVELOPMENT.md (§5.2). Verifies a post-quantum ML-DSA-87 signature over the
 * request before forwarding it to the quantum-core function, and returns 401
 * with a machine-readable reason when verification fails.
 *
 * Required headers on every forwarded request:
 *   x-client-pubkey : base64 ML-DSA-87 public key of the caller
 *   x-timestamp     : unix milliseconds, must be within CLOCK_SKEW_MS of now
 *   x-signature     : base64 ML-DSA-87 signature over `${x-timestamp}.${rawBody}`
 *   x-target        : the quantum-core route to invoke, e.g. /v1/quantum/qrng
 *
 * Optional hardening: set the QUANTUM_GATEWAY_ALLOWED_KEYS secret to a
 * comma-separated list of base64 public keys to restrict the gateway to known
 * clients. When it is unset the gateway verifies the signature but accepts any
 * self-declared key — useful for the demo console, not for production.
 */

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { mlDsa } from "../_shared/pqc.ts";

const CLOCK_SKEW_MS = 60_000;
const REPLAY_TTL_MS = 5 * 60_000;
const ALLOWED_TARGETS = new Set([
  "/v1/quantum/qrng",
  "/v1/quantum/entangle",
  "/v1/quantum/bb84/simulate",
  "/v1/native-engine/ghz",
  "/v1/native-engine/run-circuit",
  "/v1/pqc/ml-kem/demo",
  "/v1/pqc/ml-dsa/demo",
]);

/** Seen signatures, per instance. Cold starts reset this — documented, not hidden. */
const seen = new Map<string, number>();

function pruneSeen(now: number) {
  for (const [sig, at] of seen) {
    if (now - at > REPLAY_TTL_MS) seen.delete(sig);
  }
}

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const deny = (reason: string, detail: string, status = 401) => {
  console.warn(`quantum-gateway denial: ${reason} — ${detail}`);
  return json({ error: "request_denied", reason, detail }, status);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/functions\/v1\/quantum-gateway/, "") || "/";

  if (req.method === "GET" && (path === "/" || path === "/health")) {
    return json({
      status: "ok",
      signature_algorithm: "ML-DSA-87",
      required_headers: ["x-client-pubkey", "x-timestamp", "x-signature", "x-target"],
      signed_payload: "`${x-timestamp}.${rawBody}`",
      clock_skew_ms: CLOCK_SKEW_MS,
      allowed_targets: [...ALLOWED_TARGETS],
      allowlist_enforced: Boolean(Deno.env.get("QUANTUM_GATEWAY_ALLOWED_KEYS")),
    });
  }

  if (req.method !== "POST") return deny("method_not_allowed", `${req.method} not accepted`, 405);

  const pubkey = req.headers.get("x-client-pubkey");
  const timestamp = req.headers.get("x-timestamp");
  const signature = req.headers.get("x-signature");
  const target = req.headers.get("x-target");

  if (!pubkey) return deny("missing_client_key", "x-client-pubkey header is required");
  if (!timestamp) return deny("missing_timestamp", "x-timestamp header is required");
  if (!signature) return deny("missing_signature", "x-signature header is required");
  if (!target) return deny("missing_target", "x-target header is required");

  if (!ALLOWED_TARGETS.has(target)) {
    return deny("target_not_allowed", `${target} is not a forwardable quantum-core route`, 403);
  }

  const allowlist = Deno.env.get("QUANTUM_GATEWAY_ALLOWED_KEYS");
  if (allowlist) {
    const keys = allowlist.split(",").map((k) => k.trim()).filter(Boolean);
    if (!keys.includes(pubkey.trim())) {
      return deny("client_not_allowlisted", "public key is not in QUANTUM_GATEWAY_ALLOWED_KEYS", 403);
    }
  }

  const ts = Number(timestamp);
  const now = Date.now();
  if (!Number.isFinite(ts)) return deny("bad_timestamp", "x-timestamp is not a number");
  if (Math.abs(now - ts) > CLOCK_SKEW_MS) {
    return deny(
      "stale_timestamp",
      `x-timestamp is ${Math.round(Math.abs(now - ts) / 1000)}s away from server time (max ${CLOCK_SKEW_MS / 1000}s)`,
    );
  }

  pruneSeen(now);
  if (seen.has(signature)) {
    return deny("replayed_signature", "this signature was already accepted by this instance");
  }

  const rawBody = await req.text();
  const payload = `${timestamp}.${rawBody}`;

  let valid = false;
  try {
    valid = mlDsa.verify(pubkey, payload, signature);
  } catch (e) {
    return deny("malformed_credentials", e instanceof Error ? e.message : "could not decode headers");
  }
  if (!valid) {
    return deny("invalid_signature", "ML-DSA-87 verification failed for the signed payload");
  }

  seen.set(signature, now);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!supabaseUrl) return json({ error: "gateway_misconfigured" }, 500);

  const upstream = await fetch(`${supabaseUrl}/functions/v1/quantum-core${target}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: req.headers.get("Authorization") ?? "",
      apikey: req.headers.get("apikey") ?? "",
    },
    body: rawBody || "{}",
  });

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "x-gateway-verified": "ml-dsa-87",
    },
  });
});
