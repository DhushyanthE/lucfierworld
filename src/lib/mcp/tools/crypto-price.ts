import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_crypto_price",
  title: "Get crypto price",
  description:
    "Fetch the current USD price and 24h change for a cryptocurrency by CoinGecko id (e.g. 'bitcoin', 'ethereum', 'solana').",
  inputSchema: {
    coinId: z
      .string()
      .trim()
      .min(1)
      .describe("CoinGecko coin id, e.g. 'bitcoin' or 'ethereum'."),
  },
  annotations: {
    readOnlyHint: true,
    idempotentHint: false,
    openWorldHint: true,
  },
  handler: async ({ coinId }) => {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
      coinId,
    )}&vs_currencies=usd&include_24hr_change=true`;

    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `CoinGecko error: ${res.status} ${res.statusText}` }],
        isError: true,
      };
    }
    const data = (await res.json()) as Record<string, { usd?: number; usd_24h_change?: number }>;
    const entry = data[coinId];
    if (!entry) {
      return {
        content: [{ type: "text", text: `No price data for '${coinId}'.` }],
        isError: true,
      };
    }
    const payload = {
      coinId,
      usd: entry.usd,
      change24hPct: entry.usd_24h_change,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
