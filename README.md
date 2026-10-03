# QuantumSynapse Fabric

QuantumSynapse Fabric is a research platform combining quantum simulation, post-quantum cryptography, AI-assisted analysis, an EVM token, a read-only chain indexer, and the BBB8 / Proof of Dharmic State research consensus UI.

## Current architecture

- **Frontend:** React + TypeScript + Vite + Tailwind/shadcn.
- **Backend:** Supabase Auth, Realtime and Edge Functions.
- **Quantum research:** statevector simulation, BB84/QKD simulation, VQE/QAOA and Bell/CHSH validation.
- **Post-quantum crypto:** ML-DSA-87 signed records plus SHA3-512 canonical digests.
- **BBB8 / cellular consensus:** nine software cell nodes and Proof of Dharmic State. These are simulations, not living biological nodes or physical QKD.
- **LeviathanCoin:** ERC-20-compatible EVM contract with Bell-gated attestations and PoDS round commitments.
- **Indexer boundary:** read-only. It may query chain state and logs; it never signs or broadcasts transactions.
- **AI agent:** server-side OpenAI API integration with read-only tools. No alternate AI-provider fallback is used.

## Run locally

```sh
npm install
npm run dev
```

Build:

```sh
npm run build
```

## Main routes

- `/fabric` — BBB8 quantum / AI / signature / consensus pipeline.
- `/cells` — cellular blockchain and Proof of Dharmic State rounds.
- `/market` — market dashboard and PoDS network summary.
- `/leviathan` — live LeviathanCoin state, balances and wallet-signed transfers when a contract is configured.
- `/agent` — OpenAI-backed read-only project agent.

## Live-chain configuration

The app never invents chain state. Configure the server with:

```
EVM_RPC_URL=<https EVM RPC endpoint>
LEVIATHAN_CONTRACT_ADDRESS=<deployed contract address>
```

Until both values exist, the Leviathan/indexer UI reports that the chain is not configured.

Deployment itself requires a wallet funded with the target network's native gas token. Keep private keys outside the repository. The application/indexer remains read-only; user transfers are signed by the user's browser wallet.

## OpenAI agent

Set `OPENAI_API_KEY` only as a server-side secret. Optionally set `OPENAI_MODEL`. The browser never receives the API key. If the API account has no quota, the function returns the OpenAI error rather than silently switching providers.

## Scientific boundary

QuantumSynapse Fabric is a research prototype. The cellular nodes are software abstractions; PoDS is an experimental policy; BB84/Bell operations in the application are simulations unless explicitly connected to physical hardware. SHA3-512 and ML-DSA-87 are real cryptographic primitives, but their use does not make the overall application “unhackable.”
