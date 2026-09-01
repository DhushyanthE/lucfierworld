# QuantumSynapse Fabric - Development Guide

This is the engineering document: how to set up, run, test, and extend the project. For the
business/status-facing summary (executive summary, market context, risk factors), see
`report/QuantumSynapseFabricCompleteReport.pdf` and `docs/QuantumSynapse-Fabric-DPR-Complete.md`.
This document assumes you're about to write or run code, not evaluate the project as a whole.

**Documentation convention used throughout this project, please keep following it:** every
component below states its verification status explicitly using one of four labels - **BUILT &
TESTED** (real, working, with the test command shown), **REAL, NOT YET BUILT** (legitimate concept,
not implemented), **WRITTEN, NOT VERIFIED** (source is real and correct-looking, but not
compiled/run in this environment, reason stated), or **NO ESTABLISHED MECHANISM** (the claim as
described doesn't have a demonstrated technical basis). Don't upgrade a status without actually
doing the verification - that's the one rule this entire project runs on.

---

## 1. Project Structure

```
.
├── frontend/                  # React 18 + TypeScript + Vite
├── quantum-core/               # Python FastAPI - PQC + quantum circuit simulation [BUILT & TESTED]
│   ├── main.py                 # Qiskit/Cirq/Braket-backed endpoints + wiring for everything below
│   ├── pqc.py                  # ML-KEM-1024 / ML-DSA-87
│   ├── engine.py               # our own from-scratch statevector engine, zero SDK dependency [11/11 vs. Qiskit cross-check]
│   ├── native_engine_routes.py # HTTP routes for engine.py (/v1/native-engine/*)
│   ├── variational_optimizer.py # real parameter-shift-rule gradient descent [§5c]
│   ├── qaoa_maxcut.py          # real entangling QAOA for Max-Cut [§5d]
│   ├── vqe.py                  # real VQE, entanglement structurally verified vs. best unentangled ansatz [§6]
│   ├── quantum_classifier.py   # real trained single-qubit QML classifier, 100% held-out accuracy, 5/5 seeds [§6]
│   ├── n8n_webhook.py          # best-effort event notifications to n8n [§5e]
│   ├── mcp_server.py           # real MCP protocol server (official `mcp` SDK) for Claude Desktop / any MCP client [§5f]
│   ├── load_test_bb84.py       # real asyncio/httpx load generator [§11]
│   └── test_*.py               # one real test file per component above, all independently re-run in this pass
├── agent/                      # Agentic AI layer - Claude tool-use wired to the above [tools: BUILT & TESTED; live LLM loop: WRITTEN, NOT VERIFIED - needs your own API key]
├── api-gateway/                # Python FastAPI - ML-DSA auth + rate limiting in front of quantum-core [BUILT & TESTED]
├── rust-qkd-sim/              # Rust - BB84 protocol simulator, mirrors quantum-core/main.py [BUILT & TESTED]
├── solana-findings-program/   # Anchor/Solana program - on-chain audit findings [WRITTEN, NOT VERIFIED]
├── contracts/                 # Solidity - FlashLoanGuard, BridgeLock, DecentralizedOracle, LeviathanCoin [source-complete, NOT audited, NOT deployed]
├── k8s/                       # Kubernetes manifests [WRITTEN, NOT VERIFIED]
├── docker-compose.yml         # Local dev orchestration [WRITTEN, NOT VERIFIED - no Docker daemon in the sandbox that wrote it]
├── docs/                      # HONEST-ROADMAP-DPR.md, QuantumSynapse-Fabric-DPR-Complete.md, this file
└── report/                    # Generated business-facing report + source images/scripts
```

---

## 2. Prerequisites

| Component | Requires |
|---|---|
| `frontend` | Node.js 20+, npm |
| `quantum-core`, `api-gateway` | Python 3.12, pip |
| `rust-qkd-sim` | Rust/Cargo (stable toolchain; tested against 1.75+) |
| `solana-findings-program` | A Rust toolchain supporting `edition2024` (not present in the sandbox that wrote this - see `solana-findings-program/README.md`), Anchor CLI, Solana CLI |
| `contracts/` | Solidity compiler ^0.8.20 (align `QuantumPatternLayers.sol`'s `^0.8.19` first - see §8) |
| `k8s/`, `docker-compose.yml` | A real Docker daemon / Kubernetes cluster - neither existed in the sandbox that authored these files |

---

## 3. Quick Start (the parts that actually run today)

```bash
# 1. quantum-core - the PQC + quantum-simulation service
cd quantum-core
pip install -r requirements.txt --break-system-packages
uvicorn main:app --port 8001
# verify: curl localhost:8001/health

# 2. api-gateway - ML-DSA-authenticated proxy in front of quantum-core
cd ../api-gateway
pip install -r requirements.txt --break-system-packages
QUANTUM_CORE_URL=http://localhost:8001 uvicorn gateway:app --port 8000
# verify: curl localhost:8000/health

# 3. browser-gateway - signs browser requests server-side, forwards through api-gateway
cd ../browser-gateway
pip install -r requirements.txt --break-system-packages
API_GATEWAY_URL=http://localhost:8000 uvicorn main:app --port 8002
# verify: curl localhost:8002/health

# 4. frontend
cd ../frontend
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm run dev

# 5. rust-qkd-sim - standalone, not wired to the services above yet
cd ../rust-qkd-sim
cargo test --release   # 4/4 tests should pass
```

**A real judgment call, made 2026-08-20, worth being explicit about rather than silent:**
`.env.example`'s default was switched from `VITE_QUANTUM_CORE_URL=http://localhost:8001` (quantum-core
directly, unauthenticated) to `http://localhost:8002` (browser-gateway) - which means the frontend now
needs **three** backend processes running, not two, to work at all. A previous pass through this
project deliberately left that switch undone, reasoning it was a deployment choice, not something to
default silently - same principle as the LeviathanCoin naming decision. This pass made the opposite
call: secure-by-default is the more defensible default, and it's now independently verified end-to-end
(§5i, 5/5 tests, including the specific proof that matters - the same unsigned request that succeeds
through `browser-gateway` gets a real 401/422 direct to `api-gateway`). If you'd rather keep the
simpler two-service default and treat `browser-gateway` as opt-in, that's one line in `.env.example` to
revert (`VITE_QUANTUM_CORE_URL=http://localhost:8001`) - flagging the tradeoff here rather than
deciding it's obviously right and moving on.

`solana-findings-program`, `k8s/*.yaml`, and `docker-compose.yml` are not part of this quick start -
see §7 and §8 for their actual status before relying on any of them.

**Fastest way to see this actually working:** with `quantum-core` running per step 1 above, open
`prototype/index.html` directly in a browser (no build step, no server needed for the page itself).
Every button calls one of the real endpoints above and shows the real response - it does not fake a
result if it can't reach `quantum-core`, it just shows the connection error.

---

## 4. Environment Variables

| Variable | Used by | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | frontend | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | frontend | Supabase anon/public key |
| `VITE_QUANTUM_CORE_URL` | frontend | Defaults to `http://localhost:8001`. Declared in `env.d.ts` - if you add more `VITE_*` vars, declare them there too or `tsc --noEmit` will fail (not `vite build`, which doesn't type-check, but any editor or CI type-check step will) |
| `QUANTUM_CORE_URL` | api-gateway | Where it proxies requests to. Defaults to `http://localhost:8001` |
| `N8N_WEBHOOK_URL` | quantum-core (`n8n_webhook.py`) | e.g. `http://localhost:5678/webhook/quantum-events`. Unset = notifications no-op silently, nothing breaks |
| `N8N_WEBHOOK_TIMEOUT_S` | quantum-core (`n8n_webhook.py`) | Defaults to `5.0` seconds |
| `IBM_QUANTUM_API_KEY`, `IBM_QUANTUM_INSTANCE_CRN` | `quantum-core/scripts/ibm_hardware_submit.py` only | For real IBM QPU hardware access. Not used by anything else - see §6.5 |

---

## 5. API Reference

### 5.1 quantum-core (`quantum-core/main.py`, `quantum-core/pqc.py`)

| Endpoint | Method | Body | Returns |
|---|---|---|---|
| `/health` | GET | - | `{status, engines}` |
| `/v1/quantum/qrng` | POST | `{num_bits, provider: "qiskit"\|"cirq"\|"braket"}` | `{bitstring, integer_value, caveat}` |
| `/v1/quantum/entangle` | POST | `{num_qubits, shots}` | `{counts, all_outcomes_perfectly_correlated, explanation}` |
| `/v1/quantum/bb84/simulate` | POST | `{num_bits, simulate_eavesdropper, sample_fraction}` | `{qber_percent, eavesdropper_detected, final_key_preview, explanation}` |
| `/v1/quantum/ibm-hardware-info` | GET | - | Static info pointing to the standalone script - this endpoint does not call IBM |
| `/v1/pqc/ml-kem/keygen` | POST | - | `{public_key_b64, secret_key_b64}` - demo only, see caveat in response |
| `/v1/pqc/ml-kem/encapsulate` | POST | `{public_key_b64}` | `{ciphertext_b64, shared_secret_b64}` |
| `/v1/pqc/ml-kem/decapsulate` | POST | `{secret_key_b64, ciphertext_b64}` | `{shared_secret_b64}` |
| `/v1/pqc/ml-kem/demo` | POST | - | Full keygen->encapsulate->decapsulate round trip in one call |
| `/v1/pqc/ml-dsa/keygen` | POST | - | `{public_key_b64, secret_key_b64}` |
| `/v1/pqc/ml-dsa/sign` | POST | `{secret_key_b64, message}` | `{signature_b64}` |
| `/v1/pqc/ml-dsa/verify` | POST | `{public_key_b64, message, signature_b64}` | `{valid: bool}` - **check this boolean, don't rely on exceptions; see pqc.py's module docstring for why that distinction matters** |
| `/v1/pqc/ml-dsa/demo` | POST | `?message=...` | Sign + verify(correct) + verify(tampered), all three results shown |
| `/v1/native-engine/ghz` | POST | `{num_qubits, shots}` | Same GHZ circuit as `/v1/quantum/entangle`, run on our own engine (`engine.py`) instead of Qiskit - compare the two directly |
| `/v1/native-engine/run-circuit` | POST | `{num_qubits, gates: [{gate, qubit\|control/target}], shots}` | Build and run an arbitrary small circuit (h/x/y/z/s/t/cx/cz/rz) on the native engine |

### 5.2 api-gateway (`api-gateway/gateway.py`)

| Endpoint | Method | Body | Returns |
|---|---|---|---|
| `/health` | GET | - | `{status}` |
| `/v1/gateway/register-client` | POST, rate-limited 10/min | `{client_id, public_key_b64}` | Registers an ML-DSA public key for a client id |
| `/v1/gateway/proxy/{path}` | POST, rate-limited 30/min | `{client_id, signature_b64, ...body}` | Verifies the ML-DSA signature over the body, then forwards to the matching `quantum-core` path. Returns 401 before ever reaching quantum-core if the signature doesn't verify |

---

## 5b. Agentic AI Layer (`agent/`)

A real Claude tool-use agent (Anthropic Messages API) wired to this project's actual, tested
endpoints - `run_qrng`, `run_bb84_demo`, `run_entanglement_demo`, `run_native_circuit`,
`run_pqc_kem_demo`, `run_pqc_dsa_demo`. See `agent/README.md` for the full breakdown; the short
version:

- **`tools.py` (tool implementations + dispatch): BUILT & TESTED.** `agent/test_tools.py` passes
  9/9 against a live `quantum-core` instance, including negative tests (unknown tool name, bad
  arguments both return clean error dicts rather than raising).
- **`agent.py` (the actual model tool-use loop): WRITTEN, NOT VERIFIED.** No `ANTHROPIC_API_KEY`
  exists in the sandbox that wrote it. The loop follows the standard Messages API tool-use pattern
  (`tools=[...]`, handle `stop_reason == "tool_use"`, return `tool_result` blocks, repeat) but has
  not been run against a live model call in this project - run it yourself with a real key and
  update `agent/README.md`'s status table.
- **Deliberate scope boundary, not an oversight:** every tool is read-only/simulation-only. Nothing
  in `agent/` can call a smart contract, sign a real transaction, move funds, or write to persistent
  storage. This project has real value-moving contracts (`FlashLoanGuard.sol`, `BridgeLock.sol`,
  `LeviathanCoin.sol`) - giving an autonomous agent unmediated write access to any of that needs its
  own explicit design (human-in-the-loop confirmation, spending limits, an audit trail, at minimum),
  not something that should fall out incidentally from "an agent framework exists now."

```bash
cd agent
pip install -r requirements.txt --break-system-packages
python3 test_tools.py                              # no API key needed, quantum-core must be running
ANTHROPIC_API_KEY=sk-ant-... python3 agent.py "..."  # the actual live agent, needs your key
```

---



1. **ML-KEM-1024 / ML-DSA-87** (`quantum-core/pqc.py`) - BUILT & TESTED. Re-verify:
   ```bash
   curl -X POST localhost:8001/v1/pqc/ml-kem/demo
   curl -X POST "localhost:8001/v1/pqc/ml-dsa/demo?message=test"
   ```
2. **Qiskit/Cirq/Braket simulation + BB84** (`quantum-core/main.py`) - BUILT & TESTED. Re-verify:
   ```bash
   curl -X POST localhost:8001/v1/quantum/entangle -H 'content-type: application/json' -d '{"num_qubits":4,"shots":100}'
   curl -X POST localhost:8001/v1/quantum/bb84/simulate -H 'content-type: application/json' -d '{"num_bits":100,"simulate_eavesdropper":true}'
   ```
3. **BB84 (Rust)** (`rust-qkd-sim/`) - BUILT & TESTED. Re-verify: `cargo test --release` (4/4 expected).
4. **api-gateway** - BUILT & TESTED against a locally running quantum-core. Re-verify by registering a
   client, signing a body with the same keypair, and confirming a tampered body gets rejected with 401
   before quantum-core ever sees it.
5. **Supabase Realtime fix** (`frontend/src/hooks/workflow-orchestrator/socket/useWorkflowRealtime.ts`)
   - BUILT & TESTED against the same `postgres_changes` pattern already proven elsewhere in this app.
6. **`solana-findings-program`** - WRITTEN, NOT VERIFIED. The source is real Anchor-framework code, but
   it hasn't been compiled in any sandbox this project has used - `anchor-lang` 0.29/0.30 require a
   Rust toolchain supporting `edition2024`, which wasn't installable here (see the crate's own README
   for the exact dependency chain and what was tried). To actually verify it: install a current Rust
   toolchain via `rustup` on a machine without this restriction, then `anchor build && anchor test`.
7. **`k8s/*.yaml`, `docker-compose.yml`** - WRITTEN, NOT VERIFIED. Valid YAML/Compose syntax; never run
   against a real Docker daemon or Kubernetes cluster, none being available in the sandbox that wrote
   them. Treat as a documented starting point, not a tested deployment path.
8. **`quantum-core/engine.py`** (own statevector engine) - BUILT & TESTED. Re-verify: `cd quantum-core
   && python3 test_engine.py` (11/11, cross-checked against Qiskit's `Statevector` to 1e-10).
9. **`agent/tools.py`** - BUILT & TESTED (`python3 agent/test_tools.py`, 9/9 against live quantum-core).
   **`agent/agent.py`** - WRITTEN, NOT VERIFIED (needs your own `ANTHROPIC_API_KEY`; see §5b).
10. **Solidity contracts** - source-complete, dependency-resolved against OpenZeppelin, **not audited,
    not deployed to any network**. See §8 for the specific issues to fix before that changes.

---

## 5b-2. The Blockchain <-> quantum-core <-> agent bridge

**BUILT & TESTED, re-verified this pass rather than trusted from a comment.** This is the actual
connection between the three pieces of this project that otherwise existed as separate, verified-in-
isolation systems: Solidity contracts, `quantum-core`, and `agent/`.

- `quantum-core/indexer.py` - `FlashLoanGuardIndexer`, a real event-log reader (`web3.py`), covered in
  §8 item 5. Exposed at `POST /v1/blockchain/indexer/demo`, which runs the complete real cycle in one
  call: deploys actual compiled `FlashLoanGuard` bytecode to an in-process EVM, calls the real
  `blockTransaction()`, and indexes the real emitted event. Hit it directly this pass:
  `events_indexed_this_run: 1`, `onchain_state_confirms_blocked: true` - genuine, not a fixture.
- `agent/tools.py`'s `check_blockchain_findings` - added 2026-08-20, the read-only bridge from the
  agent side. Calls the *same* `indexer.poll_once()` path, against `RPC_URL`/`CONTRACT_ADDRESS` if
  set. Tested both states: with no chain configured, returns `configured: false` and an explicit
  message rather than fabricating findings; the underlying read mechanism itself is the same one
  proven end-to-end in `test_indexer.py`.

**The deliberate boundary, worth restating plainly:** this bridge is read-only in both directions.
Nothing here calls a state-changing contract function from agent-initiated code -
`FlashLoanGuard.blockTransaction()`, `BridgeLock.completeBridge()`, or any transfer are not reachable
through `agent/`. That's not a missing feature, it's the same reasoned decision documented in
`agent/README.md`: an autonomous agent with unmediated write access to contracts that move real funds
needs its own explicit design (confirmation flow, spending limits, audit trail) before it exists at
all, not something that should fall out incidentally from wiring two working systems together.

---

## 5c. Variational Optimizer - a real hybrid quantum-classical algorithm (`quantum-core/variational_optimizer.py`)

**BUILT & TESTED.** A genuine example of the standard VQE/QAOA algorithmic pattern, not a fabricated
capability: a parametrized circuit on our own engine (H -> RZ(theta) -> H per qubit), optimized by
classical gradient descent using the actual quantum parameter-shift rule (two circuit evaluations at
theta +/- pi/2, not a finite-difference approximation) to hit a target measurement probability.

Verified against its own closed-form correct answer (`test_variational_optimizer.py`): for every
target probability tested (0.1 through 0.9), exact mode converges to **zero error** against
`theta* = arccos(1 - 2*target)`. The shot-sampled (noisy) mode converges to within ~0.04 radians with
2000 shots/step - looser, as expected with real sampling noise. The parameter-shift gradient itself
was checked against plain finite-differences and matches to 1e-4.

**The honest callback worth knowing about:** an earlier draft of this project's documentation invoked
"the Quantum Parameter-Shift Rule" as part of a fabricated threat-detection claim with no established
mechanism (`docs/QuantumSynapse-Fabric-DPR-Complete.md` §7). This file is what the parameter-shift
rule actually does - compute exact gradients for optimizing a variational circuit. Real technique,
never a threat detector.

Exposed at `POST /v1/quantum/variational/optimize` and as the agent tool `run_variational_optimizer`
(`agent/tools.py`) - tested through both paths, plus confirmed the existing 9 agent dispatch tests
still pass unchanged.

**Scale honesty:** this optimizes one independent parameter per qubit with no entanglement in the
optimized circuit - a toy-scale demonstration of the pattern, not a solver for a hard combinatorial or
chemistry problem. Extending it to an entangling multi-parameter ansatz (real VQE/QAOA territory) is
a real, larger next step, not implied as already done here.

## 5d. QAOA for Max-Cut - the real multi-parameter, entangling extension (`quantum-core/qaoa_maxcut.py`)

**BUILT & TESTED** (already existed from another session; independently re-run and confirmed here,
not taken on trust). This is what §5c's "genuine next step" actually looks like once built: the real
Quantum Approximate Optimization Algorithm for Max-Cut, on our own engine, entirely from existing
primitives (`CX -> RZ -> CX` for the ZZ cost interaction per edge, `H -> RZ -> H` for the X-rotation
mixer) - no new gates needed in `engine.py`. 2p parameters for depth p, optimized by gradient ascent
using the same parameter-shift rule as `variational_optimizer.py`, now applied per-parameter across
both layers.

Verified against brute-force-computed optimal cut values (small graphs, all 2^n partitions checked -
the honest reason this is toy-scale, not a claim about solving Max-Cut at real size):

| Graph | Optimal cut | QAOA achieved | Approximation ratio |
|---|---|---|---|
| Triangle (3 nodes) | 2 | 1.718 | 0.859 |
| 4-node ring | 4 | 3.641 | 0.910 |

These ratios are below 1.0, on purpose and expected - shallow-depth QAOA on a rugged cost landscape
genuinely doesn't always find the exact optimum, and a suspiciously perfect 1.0 every run would be a
sign of a rigged test, not a good one. `qaoa_maxcut.py`'s own comments note random restarts are
load-bearing (the landscape has real local optima gradient ascent gets stuck in) - not decoration.

Exposed at `POST /v1/quantum/qaoa/maxcut` and the agent tool `run_qaoa_maxcut`, both already wired
and confirmed working.

**On `frontend/src/lib/quantum/valley/qml/QAOAService.ts`:** do not confuse this with the real
implementation above. Checked directly - its "optimizer" updates parameters with
`b + (Math.random() - 0.5) * learningRate` (a random walk, no cost function or gradient involved),
and it fabricates `quantumSpeedup = 2.0 + Math.random()` outright. Same fake layer as everywhere else
in that part of the frontend tree - not connected to, or consistent with, the real QAOA work in
`quantum-core/`.

---

## 5e. n8n Automation Integration (`quantum-core/n8n_webhook.py`)

**BUILT & TESTED** (outbound direction and dispatch logic). **Workflow JSON files: WRITTEN, NOT
VERIFIED against a real n8n instance** - none exists in the sandbox that wrote this, same honest
boundary as the live agent LLM loop and the IBM hardware script elsewhere in this project.

**What's real:** `notify_n8n()` POSTs a JSON event to `N8N_WEBHOOK_URL` when wired-in events occur -
currently wired into `/v1/quantum/qaoa/maxcut`'s completion. Tested against a real HTTP receiver (a
small FastAPI app standing in for an n8n Webhook node, not a mock of the call itself):
`test_n8n_webhook.py` confirms the exact JSON arrives correctly, and confirms graceful failure
(returns `False`, never raises) when the target is unreachable - a misconfigured n8n instance can't
break the actual API response. Full path re-verified end to end: a real QAOA request through `main.py`
correctly triggered a real webhook delivery with the exact response payload, received by a real
listener on a different port.

**What's not verified:** `n8n_workflow_examples/*.json` - two starter workflows (receiving
quantum-core's events, and calling quantum-core's endpoints as n8n "Run..." nodes) - are valid JSON
matching n8n's documented schema, but were never imported into a real n8n instance. Node
`typeVersion`s drift between n8n releases; expect n8n to prompt for node updates after import, and

**Real bug found and fixed while re-verifying this section (2026-08-02):** `test_bb84_n8n_integration.py`'s
own example commands set `N8N_WEBHOOK_URL` only when running the test script, not when starting
quantum-core - but `n8n_webhook.py` reads that variable once at import time, so quantum-core needs it
set on its *own* startup too. Following the test file's literal original instructions produces a
misleading failure (`got 0` notifications, looks like a broken trigger condition when it's actually a
silently-no-op'd webhook call). Confirmed by hitting this exact failure, then confirmed it passes
cleanly once the env var is set correctly on both processes - the underlying mechanism was never
broken, only its own documented example command was. Fixed in the test file's docstring.
verify the workflow still behaves as described against your actual version.

**On `frontend/src/services/ai/n8n-agentic-service.ts`:** checked directly, same as the QAOA frontend
service earlier - despite the name, it makes zero real HTTP calls to any n8n instance (no `fetch`, no
`axios`, no webhook URL anywhere in 504 lines). `executionSuccess` is decided by
`Math.random() < (decision.confidence * 0.8 + 0.2)`, and several "consensus"/"amplitude" values are
plain `Math.random()`. Not connected to, and not consistent with, the real integration above.



---

## 5f. MCP Server (`quantum-core/mcp_server.py`)

**BUILT & TESTED** (already existed from another session; wrote and ran a real test suite against it
here rather than trust its docstring's claims). A genuine Model Context Protocol server (official
`mcp` SDK, v2.0.0) exposing this project's real tools - distinct from `agent/` (which has Claude
actively call tools via the Messages API); this is the other direction, exposing tools *to* any MCP
client (Claude Desktop, a Claude.ai custom connector, etc.), not just this project's own agent.

`test_mcp_server.py` (new) verifies all 7 tools' actual dispatch logic against a live `quantum-core`,
plus graceful failure when it's unreachable:

| Tool | Verified result |
|---|---|
| `run_ml_kem_demo` | Shared secrets match, correct byte sizes |
| `run_ml_dsa_demo` | Correct message verifies true, tampered verifies false |
| `run_native_engine_ghz` | Fully correlated outcomes, only `0000`/`1111` |
| `run_bb84_simulation` (clean) | QBER near 0% |
| `run_bb84_simulation` (eavesdropper) | Detected in 7/8 repeated runs - some misses are genuine statistical variance at this bit count, not a bug (checked directly: one run landed at 8.33% QBER, below the 11% threshold) |
| `run_variational_optimizer` | Converges, `theta_error` ~1e-16 |
| `run_qaoa_maxcut` | Matches the brute-force optimal cut for the default triangle graph |
| Unreachable quantum-core | Every tool returns a clear error dict, no crash |

Run: `export QUANTUM_CORE_URL=...; python3 mcp_server.py`, then point an MCP client at it per that
client's own "add a local MCP server" instructions (e.g. Claude Desktop's `claude_desktop_config.json`).

## 5f-ui. Frontend UI for the classifier/VQE/MCP trio (`frontend/src/pages/MLQuantumLive.tsx`)

**BUILT, was not routed - fixed 2026-08-06.** The page itself already existed, already honestly
framed (same rule as every other live page: real responses only, connection errors shown as errors,
never a fallback number), and already correctly built against the real endpoint paths - verified by
calling `/v1/quantum/classifier/train` and `/v1/quantum/vqe/run` directly with the same empty-body
defaults the page uses (`test_accuracy: 1.0`, `energy_error: 4.44e-16`, both real). It just wasn't in
`App.tsx`'s route table, so it was unreachable in the actual running app. Added the import and
`<Route path="/ml-quantum-live" .../>` - confirmed present in `App.tsx` now.

**Honest remaining gap, not fixed this pass:** `variational_optimizer.py` and `qaoa_maxcut.py` have
real, tested HTTP endpoints and real agent tools, but no dedicated page UI anywhere in `frontend/` -
only in the standalone `prototype/index.html` (§3). If a full in-app page for these two (matching
`MLQuantumLive.tsx`'s pattern) is wanted, that's a real, scoped next step, not implied as done here.

## 5f-3. Qiskit test cases in Google Colab (`notebooks/`)

**BUILT & TESTED, re-verified this pass.** `QuantumSynapseFabric_Qiskit_Verified.ipynb` - self-contained,
needs nothing but `pip install qiskit qiskit-aer` (no `quantum-core` running, no cloned repo) - so it
can be opened directly in Google Colab and run top to bottom. Mirrors three of the real test cases
already verified against a live `quantum-core` instance in this project (QRNG, GHZ entanglement, BB84
with an eavesdropper), inlined so the notebook has no dependency on this repo's other files.

`notebooks/_verify_before_packaging.py` is the actual source the notebook's cells were copied from -
run it myself before writing this entry rather than trust the notebook's own claim of having been
verified:
```
QRNG result: 00100011 -> integer 35
GHZ counts: {'0000': 253, '1111': 247}
QBER without eavesdropper: 0.0%
QBER with eavesdropper:    29.2%
```
Matches the pattern established everywhere else in this project (0% clean, well above the 11% abort
threshold with an eavesdropper) - consistent with, not contradicting, every other BB84 run logged in
this document.

**To actually use it:** upload the `.ipynb` file to Google Colab (colab.research.google.com -> File ->
Upload notebook), or open it locally with Jupyter. No API keys, no cloud account beyond Colab itself,
no cost.

## 5g. Quantum Classifier - real ML, real training (`quantum-core/quantum_classifier.py`)

**BUILT & TESTED** (already existed; wrote and ran `test_quantum_classifier.py` here, since the
module had specific checkable claims in its docstring and no test file backing them up - a claim
without a test is just an assertion). A single-qubit variational classifier (the real "data
re-uploading" pattern - Perez-Salinas et al.), trained via genuine gradient descent using the same
parameter-shift rule as `variational_optimizer.py`/`qaoa_maxcut.py`.

Verified, not assumed:

| Check | Result |
|---|---|
| Loss decreases substantially | 0.4446 -> 0.0404 over 40 epochs |
| Held-out test accuracy vs. baselines | 1.000 vs. majority-class 0.550 and random 0.450 |
| Consistent across 5 different seeds | min accuracy 1.000 across all five |
| Learned the correct direction | `w=2.571` (meaningfully positive, matching the label rule) |

Honest scope, stated in the module's own docstring and worth repeating: this is a small, linearly-
separable toy task where a classical logistic regression would trivially do the same job - the point
is a correctly-implemented, verified instance of the real hybrid training pattern, not a claim that
quantum computing was necessary here. Explicitly not the frontend's fake version - see below.

**On the frontend's `*Training*`/`*training*` files** (`components/ai/QuantumAITraining.tsx`,
`QuantumAITrainingAdvanced.tsx`, `training/TrainingProgress.tsx`, `services/quantum/training/
QuantumTrainingService.ts`, etc.): checked `QuantumAITraining.tsx` directly - training "data" is
`Array(8).fill(0).map(() => Math.random())` with `Math.random() > 0.5` labels. No real dataset, no
real model, no real loss anywhere. Same fake layer as `QuantumOptimizer.ts`, `QAOAService.ts`, and
`n8n-agentic-service.ts` before it - not connected to, or consistent with, the real classifier above.

## 5h. VQE - real entanglement, structurally necessary, not optional (`quantum-core/vqe.py`)

**BUILT & TESTED** (already existed; this section didn't, despite `agent/tools.py`'s `run_vqe`
description promising "see DEVELOPMENT.md for the honest story" - written now, from reading the
actual code and running the actual tests, not from the promise alone).

The problem: find the ground state energy of `H = Z0⊗Z1 + X0⊗I + I⊗X1`, a small
transverse-field-Ising-style Hamiltonian whose ground state is **not** a product state - reaching it
requires real entanglement, unlike §5c's single-qubit case. Ground truth comes from ordinary linear
algebra (`numpy.linalg.eigh` on the exact 4x4 Hermitian matrix), zero quantum simulation involved,
computed independently of anything the VQE circuit does.

**The actual honest story, read from the code's own comments:** the first version of this ansatz used
`H -> RZ(theta) -> H` per qubit (the same pattern as §5c, plus one CX). `test_vqe.py`'s convergence
check failed against it - not a local-minimum fluke, ruled out by grid-searching the entire parameter
space (1000 points), which never beat ~-0.94 against a true ground energy of ~-2.24. That's a real
structural limit: `H-RZ-H` only reaches a restricted set of real-amplitude states, and this problem's
ground state isn't in that set. Fixed by switching to `RY(theta)` - a genuinely more expressive
single-qubit rotation - not by tweaking the optimizer or throwing more iterations at a broken ansatz.
The comment in `vqe.py` documents the failure and the fix in place rather than quietly deleting the
first attempt.

Independently re-verified here, not taken on the docstring's word:

| Check | Result |
|---|---|
| Exact ground energy (numpy) | -2.236068 |
| Best *unentangled* ansatz energy achievable | -0.9595 (gap of 1.28 - entanglement genuinely required) |
| Parameter-shift gradient vs. finite-difference | matches for all 3 parameters |
| VQE final energy | -2.236068, **error 0.000000** |
| Convergence from 4 different random starting points | all 4 converged to error 0.000000 |

Same honesty as §5c/§5d on scale: a 2-qubit, 3-parameter, hand-verifiable toy Hamiltonian - the point
is a correctly-implemented instance of real VQE (entanglement structurally load-bearing, gradients
real, ground truth independent), not a claim about solving a Hamiltonian at a size linear algebra
can't already check by hand. Exposed as the agent tool `run_vqe` - not yet wired into `main.py` as an
HTTP endpoint or into `mcp_server.py`, unlike the optimizer/QAOA/classifier (see §6 for what "wired
in" means for each component and what plugs into what).

---

## 7. Database (Supabase)

`frontend/supabase/migrations/20260710120000_workflow_realtime.sql` creates `workflow_events`
(columns: `id`, `workflow_id`, `event_type`, `step_id`, `result` jsonb, `error_message`, `created_at`)
and adds it to the `supabase_realtime` publication. Whatever actually runs a workflow (an edge
function, most naturally) needs to `INSERT` into this table on step/workflow completion - the
frontend side of this pattern is done; the writer side depends on wherever your workflow logic
actually executes, which is project-specific and wasn't built here.

---

## 8. Known Issues / Before You Ship Anything

In priority order - consolidated from every audit pass in this project's history:

1. **RESOLVED 2026-07-21, was highest priority for many turns of this project's history:** the
   mining-reward fabrication finding. Read the code directly (not a secondhand description this time)
   - `crypto-mining-engine/index.ts`'s `simulateQuantumMining()` generated a random hex hash, a random
   nonce, and a fabricated reward with zero actual proof-of-work, and `CryptoMiningPanel.tsx` wrote
   that fabricated reward into `mining_history` under the real authenticated user's `user_id`, with a
   "Block Mined!" toast presenting it as earned. The `stats` operation was worse - it returned
   `totalReward: 7793.75 + Math.random() * 500` as a fake platform-wide total. Fixed across all three
   layers: migration `20260721120000_mining_history_is_simulated.sql` adds an `is_simulated` column
   (default `true`, since nothing in this project does real proof-of-work); the edge function now
   tags every response `simulated: true`, and its `stats` operation queries the real `mining_history`
   table instead of fabricating numbers; the UI is relabeled "Mining Simulator (Demo)" throughout,
   with toasts that say "not real value" rather than implying otherwise. Also worth knowing: mining
   was never conceptually connected to real token issuance here anyway -
   `LeviathanCoin.sol` mints via an owner-controlled function, not proof-of-work, so there was no real
   backing this could have represented even before the fix.
2. **RESOLVED 2026-08-15, by explicit decision, not defaulted:** the token identity mismatch. Asked
   rather than picked - the answer was **Leviathan Coin / LVN is canonical**, contract stays as-is,
   frontend gets updated to match. Verified the real scope first (grep, not guessing): 40 files, 113
   occurrences of "Quantum Coin"/"QCoin"/"QCOIN". Checked that `QCoin` never appears embedded inside a
   code identifier (`grep -oE "[A-Za-z]*QCoin[A-Za-z]*"` returned only bare `QCoin`, always inside
   display strings/JSX text) before touching anything - confirms this was safe as a text-only rename.
   Replaced display text only (`Quantum Coin` -> `Leviathan Coin`, `QCoin`/`QCOIN` -> `LVN`) across all
   40 files; deliberately left code identifiers alone (`QuantumCoinService.ts`, `useQuantumCoinAGI`,
   file names, etc. are unchanged - renaming those is a separate, larger refactor with real import-graph
   risk, not something to fold into a branding-text fix). Verified brace/paren balance held across all
   40 files after the edit - no syntax corruption. What's still literally named "Quantum Coin" in this
   repo now: only internal code identifiers, never anything a user sees.
3. **RESOLVED 2026-08-09, bigger than previously documented:** the pragma mismatch note used to be
   the whole story here. It wasn't - nobody had ever actually compiled these 5 contracts together
   against real OpenZeppelin until this pass. Installed `solc` and real `@openzeppelin/contracts` via
   npm and tried: **2 of 5 contracts failed to compile at all.** `LeviathanCoin.sol` was missing the
   now-required `Ownable(initialOwner)` constructor argument (OZ v4->v5 breaking change - `Ownable()`
   with no args no longer exists). `DecentralizedOracle.sol` called `ECDSA.toEthSignedMessageHash`,
   which OZ v5 moved to a separate `MessageHashUtils` library. Both fixed; recompiled all 5 together
   afterward and got real bytecode for every one of them (`solc-check/build/*.bin` if you want to
   reproduce this) - first time that's been true in this project's history. Also aligned
   `QuantumPatternLayers.sol`'s pragma to `^0.8.20` to match the other four, which is the smaller fix
   this item used to only be about.
4. **No third-party audit** exists for any Solidity contract. `FlashLoanGuard` and `BridgeLock` both
   move funds behind role-gated functions - get a real audit before either holds real value.
5. **No on-chain event indexer exists.** Realtime dashboards have `workflow_events` to subscribe to,
   but nothing currently listens to actual contract events and writes them there - see §7.
6. **`solana-findings-program` and `k8s`/`docker-compose.yml`** need real verification on an
   unrestricted machine before being treated as more than "written" - see §6.
7. **UPDATED 2026-08-19, not fully resolved but a real option now exists:** the frontend still
   calls `quantum-core` directly by default (`VITE_QUANTUM_CORE_URL` points at port 8001), which is
   what item 7's original "accept the risk, rate-limit it" decision was reasoned around. That
   reasoning still holds for the risk it was addressing (resource exhaustion, not theft - quantum-core
   moves no funds). But **`browser-gateway/` now exists as the actual "build a signing backend"
   option** SECURITY.md's "Still Open" list named and left undone - independently verified this pass,
   not just read: 5/5 tests pass against the full three-service stack, including the specific proof
   that matters (`test_browser_gateway.py`) - the same unsigned request that succeeds through
   `browser-gateway` gets a real 401/422 when sent directly to `api-gateway`, confirming the boundary
   actually holds. **What's still a real, undone decision:** the frontend's default hasn't been
   switched to point at `browser-gateway` instead of `quantum-core` directly - that's a one-line env
   var change (`VITE_QUANTUM_CORE_URL=http://localhost:8002`), but making it the default rather than
   an available option is a deployment choice, not defaulted here either direction, same principle as
   the LeviathanCoin naming decision earlier in this project's history.

---

## 9. Testing Philosophy

Every "BUILT & TESTED" label in this project corresponds to an actual command that was actually run,
with actual output checked against what was expected - not just code that looks plausible. When you
add something new:

- Run it. Show the command and the actual output, not a description of expected output.
- If you can't run it (missing hardware, missing credentials, a sandboxed environment restriction),
  say so specifically - what's missing and why - rather than defaulting to either an unstated
  assumption of correctness or silence.
- If a test surfaces a bug in your own test code (not just the thing under test), document that too -
  see `quantum-core/pqc.py`'s module docstring for a real example (a signature-verification test that
  initially checked for a thrown exception instead of the actual returned boolean, which would have
  silently accepted a forged signature).

---

## 11. Load Test Results (BB84 endpoint) - Measured, Not Assumed

`quantum-core/load_test_bb84.py` - real asyncio/httpx load generator. **2026-07-31 update: the
root-cause fix described below is now implemented** (`asyncio.to_thread` moves the per-bit circuit
loop off the event loop) - re-measured before declaring anything solved, and the honest result is
mixed, not a clean win. Read the whole section before assuming this is "fixed."

| Concurrency | | Success rate | p50 | p95 | Throughput |
|---|---|---|---|---|---|
| 100 | before | 98.0% (6 ReadErrors) | 3.80s | 7.16s | 21.5 req/s |
| 100 | **after** | **100%** (0 errors) | 4.54s (worse) | **4.72s (much better)** | 21.4 req/s (flat) |
| 500 | before | 100% | 10.83s | 11.87s | 42.0 req/s |
| 500 | **after** | 100% | **8.65s (better)** | 15.68s (worse) | **30.5 req/s (worse)** |

**Why the results are mixed, found by actually checking rather than guessing:** `os.cpu_count()`
in this sandbox returns **1**. `asyncio.to_thread`'s default executor still only gets 5 worker
threads sharing that single core. The fix is doing exactly what it's supposed to - the event loop
stopped blocking, which is why read errors disappeared entirely and p95 tightened at moderate
concurrency - but no threading model manufactures CPU parallelism that doesn't physically exist. Five
threads time-slicing one core for CPU-bound Qiskit transpilation trade one bottleneck (a fully serial
event loop) for a different one (five threads contending for one core's cycles, with real
context-switch overhead), which is consistent with p50/throughput getting *worse* at higher
concurrency rather than better.

**What this means for you, concretely:** the code fix is correct and worth keeping regardless - freeing
the event loop is the right first move on any hardware. But the actual scaling fix needs genuine
multi-core parallelism, which threads within one process cannot provide (Python's GIL binds CPU-bound
work in each thread to contend for the same core). On real multi-core infrastructure:
```bash
uvicorn main:app --workers 4   # separate PROCESSES, separate GILs, genuine parallelism across cores
```
Re-run `load_test_bb84.py` yourself on real hardware with `--workers N` set to your actual core count
- that comparison, not this sandbox's single-core numbers, is the one that will tell you whether this
is actually solved for your deployment target.

## 12. Audit Readiness - Honest Assessment

If a professional audit (e.g., Trail of Bits or similar) is the actual near-term goal, worth stating
plainly what "ready" would need to include, based on everything verified in this project so far -
**this project is not there yet**:

- [ ] Confirm the fabricated-mining-reward finding (§8.1) is resolved or removed - a real auditor will
  find this in minutes and it will dominate the findings report if it's still present.
- [ ] Resolve the token identity mismatch (§8.2) and pragma version mismatch (§8.3) - present a single
  coherent contract set, not one with internal inconsistencies.
- [ ] Decide what's actually in scope. Auditors typically price and staff against a fixed, frozen
  scope - a repo containing audited-target Solidity alongside WRITTEN-NOT-VERIFIED components
  (Solana program, k8s manifests) and a not-yet-live-tested LLM agent needs an explicit "audit this,
  not that" boundary before a firm can quote it accurately.
- [ ] Fix or document the performance behavior in §11 if the BB84 endpoint (or anything like it) is
  part of what's being represented as production-capable.
- [ ] Have someone internal (or a lighter-weight review) pass over the contracts first - most serious
  audit firms will say the same thing: a first professional audit is more valuable, and cheaper in
  back-and-forth, after an internal review has already caught the obvious issues. **A real compiler
  pass is the minimum bar, not optional** - `contracts/verify_compile.sh` now exists specifically
  because 2 of 5 contracts didn't compile at all until this was actually run once (§8 item 3).

None of this means the underlying work is bad - the PQC implementation, the quantum-circuit sandbox,
and the honestly-labeled WRITTEN-NOT-VERIFIED items are exactly the kind of transparent state a real
audit process can work with. It means "freeze and submit" is premature right now, not that the
project has failed.

---

## 14. The API Gateway Connection - Now Actually Wired and Tested

`api-gateway` existed and passed its own isolated tests, but nothing else in this project actually
called it - the frontend talks to `quantum-core` directly, unauthenticated
(`VITE_QUANTUM_CORE_URL`). `api-gateway/reference_client.py` closes that gap: a real client that
registers an ML-DSA-87 keypair, signs requests, and calls the gateway's proxy endpoint. **BUILT &
TESTED**, run just now against both services live together:

- Correctly-signed request -> `200`, real response from quantum-core, real gateway headers
  (`X-Gateway-Verified-Client`, `X-Upstream-Latency-Ms: 95.7` - actually measured single-request
  latency, not the load-test figures in §11)
- Tampered body with a stale signature -> `401`
- No signature headers at all -> `401`

**Why the browser can't do this yet, stated plainly rather than left implicit:** ML-DSA-87 signing
here comes from `pqcrypto`, a Python package wrapping compiled C. There's no JS/WASM ML-DSA
implementation anywhere in this project, so a browser has no way to hold a private key and sign a
request client-side - that's a real, unstarted piece of work, not a bug in what exists. Realistic
near-term callers of `api-gateway` are trusted backend services (the `agent/`, a future edge function
that proxies to a Python signer) rather than the browser directly.

**Still genuinely open:** the actual frontend UI still calls `quantum-core` directly and
unauthenticated rather than going through `api-gateway` - `reference_client.py` proves the gateway
path works, it doesn't yet replace the frontend's calls. Rewiring the frontend either needs (a) a
signing backend the browser talks to instead of quantum-core directly, or (b) accepting that
quantum-core stays open/unauthenticated for this demo-scale deployment and `api-gateway` is used by
backend-to-backend callers only. That's a real architectural decision to make deliberately, not
default into.

---

## 5i. Browser Signing Backend (`browser-gateway/`)

**BUILT & TESTED** (already existed, completely undocumented until now - found it by actually
checking the directory listing, not because anything pointed here). This is the real implementation
of the "signing backend" option `SECURITY.md` named as still-open: holds one ML-DSA-87 keypair
server-side (generated at startup, registered with `api-gateway` automatically, never sent to a
browser), and re-signs every unauthenticated browser request before forwarding it through the real,
tested `api-gateway -> quantum-core` path.

Verified against the full three-service stack (`quantum-core` + `api-gateway` + `browser-gateway`,
all three actually running, not mocked) - 5/5 tests pass:

| Check | Result |
|---|---|
| Unsigned browser-style request through `browser-gateway` | 200, real ML-KEM/BB84 results came back |
| The identical unsigned request sent directly to `api-gateway` | 401/422 - correctly rejected |

That second row is the actual proof the boundary works, not just that the happy path succeeds - a
signing backend that also let unsigned requests through `api-gateway` directly would be decorative.

**Not a multi-tenant auth system**, by the module's own honest scoping: every browser client shares
one service identity. That's "requests came through the trusted backend, not raw from the internet,"
not per-user authentication - a real, separate addition if you need that later.

**The actual remaining decision** (see §8 item 7): switch `VITE_QUANTUM_CORE_URL` to point at this
service (port 8002) instead of `quantum-core` directly, or don't - both are legitimate, and which one
is the deployed default is a choice, not something defaulted silently here.

## 15. Where Things Live

- Business/status report: `report/QuantumSynapseFabricCompleteReport.pdf`
- Honest roadmap (shorter): `docs/HONEST-ROADMAP-DPR.md`
- Full DPR: `docs/QuantumSynapse-Fabric-DPR-Complete.md`
- This document: `docs/DEVELOPMENT.md`

---

## Appendix A. TS/Deno test-case status in this workspace (2026-08-29)

**BUILT & TESTED.** The Deno-side suites were re-run in this workspace after importing the
verified Colab notebook:

```
deno test --allow-net --allow-env --allow-read \
  supabase/functions/_tests/leviathan_test.ts \
  supabase/functions/_tests/indexer_test.ts \
  supabase/functions/_tests/variational_test.ts
# -> 19 passed | 0 failed

deno test --allow-net --allow-env --allow-read \
  supabase/functions/stripe-webhook/index_test.ts \
  supabase/functions/stripe-webhook-replay/index_test.ts
# -> 20 passed | 0 failed
```

Covered: LeviathanCoin Bell-score governance (`2.0 < S <= 2.828`, must-beat-epoch-best,
single-use model hash), canonical keccak event topics, `AttestationAccepted` ABI decoding,
the read-only EVM indexer against a stub JSON-RPC server (method allow-list enforced), the
variational VQE/QAOA/QML engine, and the Stripe webhook + replay guards.

**Fixed as part of this pass:** `analytics_anon_insert_test.ts` and `realtime_auth_test.ts`
imported `dotenv/load.ts`, which cross-checks `.env` against `.env.example` and threw
`MissingEnvVarsError` for every documented `VITE_*` var before a single test ran. Both now
call `load({ envPath: ".env", export: true, examplePath: null })` instead.

**NOT VERIFIED HERE, and deliberately not marked green:** those two suites plus the
password-reset test call the hosted backend over the network. The hosted database is
currently paused, so they fail with DNS/connect errors — an environment state, not a code
regression. Re-run them once the backend is resumed from Cloud settings.

**Qiskit notebook:** `notebooks/QuantumSynapseFabric_Qiskit_Verified.ipynb` (imported, cells
were executed upstream before packaging) alongside the earlier
`notebooks/quantumsynapse_qiskit_colab.ipynb`. Neither is executed in this sandbox — no
Qiskit/Aer here — so their status is **WRITTEN, NOT VERIFIED in this workspace**; they run
top-to-bottom in Colab. Nothing in either notebook holds a key, signs a transaction, or
writes to a chain.
