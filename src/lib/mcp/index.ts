import { auth, defineMcp } from "@lovable.dev/mcp-js";
import echoTool from "./tools/echo";
import appInfoTool from "./tools/app-info";
import cryptoPriceTool from "./tools/crypto-price";
import quantumTools from "./tools/quantum";

// The published Supabase URL is the OAuth issuer; use the stable build-time
// project ref, not the runtime/proxy URL (RFC 8414 issuer matching).
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "quantum-coin-mcp",
  title: "Quantum Coin MCP",
  version: "0.3.0",
  instructions:
    "Tools for the Quantum Coin / QuantumSynapse Fabric app. Use `echo` to verify connectivity, `get_app_info` for routes and features, and `get_crypto_price` for live USD prices. Quantum tools: `run_qrng`, `run_bb84_simulation`, `run_vqe`, `run_qaoa`. Chain data: `check_blockchain_findings`. Every tool is read-only — none can sign a transaction, call a state-changing contract function, or move funds.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  requireOAuthClientClaim: true,
  tools: [echoTool, appInfoTool, cryptoPriceTool, ...quantumTools],
});
