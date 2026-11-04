import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_app_info",
  title: "Get app info",
  description:
    "Return a short description of this app (Quantum Coin) and a list of its main routes so an assistant can direct users to the right page.",
  inputSchema: {},
  annotations: {
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: false,
  },
  handler: () => {
    const info = {
      name: "Quantum Coin",
      description:
        "A blockchain + quantum-simulation web app with quantum circuit visualizer, mining dashboard, DAO governance, crypto market data, and a realtime demo.",
      routes: [
        { path: "/", purpose: "Home / marketing landing page" },
        { path: "/quantum-lab", purpose: "Quantum sequence, BB84 QKD demo, Grover/Shor solver panels" },
        { path: "/realtime-demo", purpose: "Supabase Realtime + IBM Quantum QASM runner demo" },
        { path: "/quantum-computing", purpose: "Quantum computing overview" },
        { path: "/crypto-market", purpose: "Live crypto market data" },
        { path: "/dao", purpose: "DAO governance" },
        { path: "/wallet", purpose: "User wallet integrations (MetaMask, Phantom, Pera)" },
        { path: "/profile", purpose: "Signed-in user profile" },
      ],
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      structuredContent: info,
    };
  },
});
