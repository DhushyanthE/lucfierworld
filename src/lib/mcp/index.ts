import { defineMcp } from "@lovable.dev/mcp-js";
import echoTool from "./tools/echo";
import appInfoTool from "./tools/app-info";
import cryptoPriceTool from "./tools/crypto-price";
import quantumTools from "./tools/quantum";

export default defineMcp({
  name: "quantum-coin-mcp",
  title: "Quantum Coin MCP",
  version: "0.2.0",
  instructions:
    "Tools for the Quantum Coin / QuantumSynapse Fabric app. Use `echo` to verify connectivity, `get_app_info` for routes and features, and `get_crypto_price` for live USD prices. Quantum tools: `run_qrng`, `run_bb84_simulation`, `run_vqe`, `run_qaoa`. Chain data: `check_blockchain_findings`. Every tool is read-only — none can sign a transaction, call a state-changing contract function, or move funds.",
  tools: [echoTool, appInfoTool, cryptoPriceTool, ...quantumTools],
});
