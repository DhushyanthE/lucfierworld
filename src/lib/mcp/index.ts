import { defineMcp } from "@lovable.dev/mcp-js";
import echoTool from "./tools/echo";
import appInfoTool from "./tools/app-info";
import cryptoPriceTool from "./tools/crypto-price";

export default defineMcp({
  name: "quantum-coin-mcp",
  title: "Quantum Coin MCP",
  version: "0.1.0",
  instructions:
    "Tools for the Quantum Coin app. Use `echo` to verify connectivity, `get_app_info` to learn what routes and features the app exposes, and `get_crypto_price` to fetch live USD prices for a given CoinGecko coin id.",
  tools: [echoTool, appInfoTool, cryptoPriceTool],
});
