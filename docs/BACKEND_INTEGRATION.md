# QuantumSynapse backend integration architecture

## Purpose
The backend is organized as composable technology boundaries rather than one monolithic algorithm.

```
React / operator UI
        |
Supabase Auth
        |
Integration Gateway
   |---- Sentinel defensive triage
   |---- SHA3-512 canonical integrity
   |---- ML-DSA-87 signatures
   |---- nine-perspective policy review
   |---- Quantum Fabric research simulation
   |---- Supabase data/realtime adapters
   |---- EVM read-only indexer
   |---- optional OpenAI analyst
        |
Human command gate
        |
Audit / observability
```

## Backend structure
- `_shared/backend-contracts.ts`: stable cross-module DTOs and correlation IDs.
- `_shared/integration-registry.ts`: runtime technology/capability registry.
- `integration-gateway/index.ts`: authenticated orchestration API.
- `_shared/defense.ts`: defensive telemetry scoring and PQ-signed findings.
- `_shared/defense-review.ts`: fail-closed multi-policy review simulation.
- `_shared/fabric.ts`: research quantum/AI/cryptographic pipeline.
- `_shared/pqc.ts`: ML-KEM-1024 and ML-DSA-87 wrappers.
- `leviathan-chain` / indexer: read-only EVM observation.

## API
`GET /integration-gateway/health` returns technology configuration and explicit boundaries.
`POST /integration-gateway/defense/analyze` runs the defensive analysis pipeline.

The gateway requires a valid Supabase JWT. Findings are recommendations only. No endpoint provides weapon control, targeting, transaction signing or autonomous containment.

## Integration principles
1. Authenticate at the gateway.
2. Validate and normalize before crossing module boundaries.
3. Canonicalize and hash before signing.
4. Verify signed evidence before policy review.
5. Fail closed on integrity mismatch.
6. Preserve a human decision gate.
7. Keep blockchain observation read-only.
8. Report simulated/research components as simulations.
9. Propagate a correlation ID through services.
10. Add durable RLS-backed audit persistence before production use.
