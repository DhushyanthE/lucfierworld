/**
 * quantum-core — TypeScript/Deno port of the Python FastAPI service described in
 * DEVELOPMENT.md §5.1 and §5b. Same paths, same request/response shapes.
 *
 * Honest deviation from the document: Qiskit / Cirq / Braket are Python SDKs and
 * cannot run on Deno, so every "provider" is served by the native statevector
 * engine in ../_shared/statevector.ts (the TS port of engine.py). Responses say
 * so in their `caveat` / `engine` fields rather than implying SDK involvement.
 *
 * Routes (relative to /functions/v1/quantum-core):
 *   GET  /health
 *   POST /v1/quantum/qrng                 { num_bits, provider? }
 *   POST /v1/quantum/entangle             { num_qubits, shots }
 *   POST /v1/quantum/bb84/simulate        { num_bits, simulate_eavesdropper, sample_fraction }
 *   GET  /v1/quantum/ibm-hardware-info
 *   POST /v1/native-engine/ghz            { num_qubits, shots }
 *   POST /v1/native-engine/run-circuit    { num_qubits, gates, shots }
 *   POST /v1/pqc/ml-kem/keygen | /encapsulate | /decapsulate | /demo
 *   POST /v1/pqc/ml-dsa/keygen | /sign | /verify | /demo
 */

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";
import { ghz, MAX_QUBITS, randomBit, Statevector, type Gate } from "../_shared/statevector.ts";
import { simulateBB84 } from "../_shared/bb84.ts";
import { mlDsa, mlKem } from "../_shared/pqc.ts";
import { runQAOAMaxCut, runVQE, trainQuantumClassifier } from "../_shared/variational.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const bad = (error: unknown, status = 400) =>
  json({ error: typeof error === "string" ? error : error }, status);

const GateSchema = z.union([
  z.object({
    gate: z.enum(["h", "x", "y", "z", "s", "t"]),
    qubit: z.number().int().min(0).max(MAX_QUBITS - 1),
  }),
  z.object({
    gate: z.enum(["rz", "rx", "ry"]),
    qubit: z.number().int().min(0).max(MAX_QUBITS - 1),
    theta: z.number().finite(),
  }),
  z.object({
    gate: z.enum(["cx", "cz"]),
    control: z.number().int().min(0).max(MAX_QUBITS - 1),
    target: z.number().int().min(0).max(MAX_QUBITS - 1),
  }),
]);

const schemas = {
  qrng: z.object({
    num_bits: z.number().int().min(1).max(4096).default(32),
    provider: z.enum(["native", "qiskit", "cirq", "braket"]).default("native"),
  }),
  circuitRun: z.object({
    num_qubits: z.number().int().min(1).max(MAX_QUBITS),
    gates: z.array(GateSchema).max(512),
    shots: z.number().int().min(1).max(20000).default(1024),
  }),
  entangle: z.object({
    num_qubits: z.number().int().min(2).max(MAX_QUBITS).default(3),
    shots: z.number().int().min(1).max(20000).default(1024),
  }),
  bb84: z.object({
    num_bits: z.number().int().min(8).max(4096).default(256),
    simulate_eavesdropper: z.boolean().default(false),
    sample_fraction: z.number().min(0.01).max(0.9).default(0.25),
  }),
  kemEncapsulate: z.object({ public_key_b64: z.string().min(1) }),
  kemDecapsulate: z.object({
    secret_key_b64: z.string().min(1),
    ciphertext_b64: z.string().min(1),
  }),
  dsaSign: z.object({
    secret_key_b64: z.string().min(1),
    message: z.string().min(1).max(10000),
  }),
  dsaVerify: z.object({
    public_key_b64: z.string().min(1),
    message: z.string().min(1).max(10000),
    signature_b64: z.string().min(1),
  }),
  vqe: z.object({
    num_qubits: z.number().int().min(2).max(8).default(2),
    layers: z.number().int().min(1).max(4).default(2),
    j: z.number().finite().default(1),
    h: z.number().finite().default(1),
    max_iterations: z.number().int().min(1).max(400).default(120),
  }),
  qaoa: z.object({
    num_nodes: z.number().int().min(2).max(10).default(4),
    edges: z.array(z.object({
      u: z.number().int().min(0).max(9),
      v: z.number().int().min(0).max(9),
      weight: z.number().positive().max(100).optional(),
    })).min(1).max(45),
    depth: z.number().int().min(1).max(4).default(2),
    max_iterations: z.number().int().min(1).max(300).default(80),
    shots: z.number().int().min(1).max(20000).default(1024),
  }),
  qml: z.object({
    samples: z.array(z.object({
      x: z.number().finite(),
      label: z.union([z.literal(0), z.literal(1)]),
    })).min(4).max(400),
    layers: z.number().int().min(1).max(4).default(2),
    max_iterations: z.number().int().min(1).max(400).default(150),
    test_split: z.number().min(0).max(0.5).default(0.3),
  }),
};

async function parse<T extends z.ZodTypeAny>(req: Request, schema: T): Promise<z.infer<T>> {
  let raw: unknown = {};
  try {
    const text = await req.text();
    raw = text ? JSON.parse(text) : {};
  } catch {
    throw new Response(JSON.stringify({ error: "invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  return parsed.data;
}

/** Strip the /functions/v1/<name> prefix so route matching mirrors FastAPI. */
function routePath(url: URL): string {
  const p = url.pathname.replace(/^\/functions\/v1/, "").replace(/^\/quantum-core/, "");
  return p === "" ? "/" : p.replace(/\/+$/, "") || "/";
}

async function handle(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = routePath(url);

  if (req.method === "GET" && (path === "/health" || path === "/")) {
    return json({
      status: "ok",
      engines: {
        native_statevector: "built",
        max_qubits: MAX_QUBITS,
        ml_kem_1024: "built",
        ml_dsa_87: "built",
        qiskit: "unavailable — Python SDK, cannot run on Deno",
        cirq: "unavailable — Python SDK, cannot run on Deno",
        braket: "unavailable — Python SDK, cannot run on Deno",
      },
    });
  }

  if (req.method === "GET" && path === "/v1/quantum/ibm-hardware-info") {
    return json({
      note:
        "This endpoint does not call IBM. Real hardware submission lives in the separate quantum-run function, which POSTs OpenQASM 2.0 to IBM's Sampler primitive using the IBM_QUANTUM_TOKEN secret.",
      default_backend: "ibm_brisbane",
      submit_via: "/functions/v1/quantum-run",
    });
  }

  if (req.method !== "POST") return bad("method not allowed", 405);

  switch (path) {
    case "/v1/quantum/qrng": {
      const { num_bits, provider } = await parse(req, schemas.qrng);
      // A Hadamard on |0> measured once per bit — a genuine 50/50 quantum
      // measurement on the simulator, seeded by crypto.getRandomValues.
      let bitstring = "";
      for (let i = 0; i < num_bits; i++) {
        const sv = new Statevector(1);
        sv.h(0);
        bitstring += sv.measureQubit(0);
      }
      return json({
        bitstring,
        integer_value: num_bits <= 53 ? parseInt(bitstring, 2) : null,
        provider_requested: provider,
        engine: "native-statevector",
        caveat:
          "Simulated randomness. The measurement is a real Hadamard-basis projection on a simulator, but its entropy comes from the host CSPRNG, not from a physical quantum device.",
      });
    }

    case "/v1/quantum/entangle":
    case "/v1/native-engine/ghz": {
      const { num_qubits, shots } = await parse(req, schemas.entangle);
      const sv = ghz(num_qubits);
      const counts = sv.sample(shots);
      const allZeros = "0".repeat(num_qubits);
      const allOnes = "1".repeat(num_qubits);
      const correlated = Object.keys(counts).every((k) => k === allZeros || k === allOnes);
      return json({
        counts,
        amplitudes: sv.amplitudes(),
        all_outcomes_perfectly_correlated: correlated,
        engine: "native-statevector",
        explanation:
          `GHZ state on ${num_qubits} qubits: h(0) followed by cx(0,k) for every other qubit. Only ${allZeros} and ${allOnes} can occur — any other outcome would mean the entanglement broke.`,
      });
    }

    case "/v1/native-engine/run-circuit": {
      const { num_qubits, gates, shots } = await parse(req, schemas.circuitRun);
      const sv = new Statevector(num_qubits);
      for (const g of gates) {
        if ("qubit" in g && g.qubit >= num_qubits) return bad(`qubit ${g.qubit} out of range`);
        if ("control" in g && (g.control >= num_qubits || g.target >= num_qubits)) {
          return bad("control/target out of range");
        }
        sv.applyGate(g as Gate);
      }
      return json({
        counts: sv.sample(shots),
        amplitudes: sv.amplitudes(),
        gate_count: gates.length,
        engine: "native-statevector",
      });
    }

    case "/v1/quantum/bb84/simulate": {
      const b = await parse(req, schemas.bb84);
      return json(simulateBB84(b.num_bits, b.simulate_eavesdropper, b.sample_fraction));
    }

    case "/v1/pqc/ml-kem/keygen":
      return json({ ...(await mlKem.keygen()), algorithm: "ML-KEM-1024" });

    case "/v1/pqc/ml-kem/encapsulate": {
      const { public_key_b64 } = await parse(req, schemas.kemEncapsulate);
      return json({ ...(await mlKem.encapsulate(public_key_b64)), algorithm: "ML-KEM-1024" });
    }

    case "/v1/pqc/ml-kem/decapsulate": {
      const { secret_key_b64, ciphertext_b64 } = await parse(req, schemas.kemDecapsulate);
      return json({
        ...(await mlKem.decapsulate(secret_key_b64, ciphertext_b64)),
        algorithm: "ML-KEM-1024",
      });
    }

    case "/v1/pqc/ml-kem/demo": {
      const keys = await mlKem.keygen();
      const enc = await mlKem.encapsulate(keys.public_key_b64);
      const dec = await mlKem.decapsulate(keys.secret_key_b64, enc.ciphertext_b64);
      return json({
        algorithm: "ML-KEM-1024",
        shared_secrets_match: enc.shared_secret_b64 === dec.shared_secret_b64,
        encapsulated_secret_b64: enc.shared_secret_b64,
        decapsulated_secret_b64: dec.shared_secret_b64,
        public_key_bytes: keys.public_key_bytes,
        ciphertext_bytes: enc.ciphertext_bytes,
        caveat:
          "Demo only: keys are generated per request and never persisted. Do not treat these as long-lived key material.",
      });
    }

    case "/v1/pqc/ml-dsa/keygen":
      return json({ ...(await mlDsa.keygen()), algorithm: "ML-DSA-87" });

    case "/v1/pqc/ml-dsa/sign": {
      const { secret_key_b64, message } = await parse(req, schemas.dsaSign);
      return json({ ...(await mlDsa.sign(secret_key_b64, message)), algorithm: "ML-DSA-87" });
    }

    case "/v1/pqc/ml-dsa/verify": {
      const { public_key_b64, message, signature_b64 } = await parse(req, schemas.dsaVerify);
      return json({
        valid: await mlDsa.verify(public_key_b64, message, signature_b64),
        algorithm: "ML-DSA-87",
        note: "Check this boolean. A false result is a verification failure, not an exception.",
      });
    }

    case "/v1/pqc/ml-dsa/demo": {
      const message = url.searchParams.get("message") ?? "quantumsynapse-fabric";
      const keys = await mlDsa.keygen();
      const sig = await mlDsa.sign(keys.secret_key_b64, message);
      const validCorrect = await mlDsa.verify(keys.public_key_b64, message, sig.signature_b64);
      const validTampered = await mlDsa.verify(
        keys.public_key_b64,
        message + "!",
        sig.signature_b64,
      );
      return json({
        algorithm: "ML-DSA-87",
        message,
        signature_bytes: sig.signature_bytes,
        verify_correct_message: validCorrect,
        verify_tampered_message: validTampered,
        behaves_correctly: validCorrect === true && validTampered === false,
      });
    }

    case "/v1/vqe/run": {
      const v = await parse(req, schemas.vqe);
      return json(runVQE({
        numQubits: v.num_qubits,
        layers: v.layers,
        j: v.j,
        h: v.h,
        maxIterations: v.max_iterations,
      }));
    }

    case "/v1/qaoa/maxcut": {
      const q = await parse(req, schemas.qaoa);
      for (const e of q.edges) {
        if (e.u >= q.num_nodes || e.v >= q.num_nodes) return bad("edge references unknown node");
        if (e.u === e.v) return bad("self-loops are not valid Max-Cut edges");
      }
      return json(runQAOAMaxCut({
        numNodes: q.num_nodes,
        edges: q.edges,
        depth: q.depth,
        maxIterations: q.max_iterations,
        shots: q.shots,
      }));
    }

    case "/v1/qml/classify": {
      const c = await parse(req, schemas.qml);
      return json(trainQuantumClassifier({
        samples: c.samples,
        layers: c.layers,
        maxIterations: c.max_iterations,
        testSplit: c.test_split,
      }));
    }
  }

  return bad(`no route for ${req.method} ${path}`, 404);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    return await handle(req);
  } catch (e) {
    if (e instanceof Response) return e;
    const message = e instanceof Error ? e.message : "unexpected error";
    console.error("quantum-core error:", message);
    return bad(message, 400);
  }
});
