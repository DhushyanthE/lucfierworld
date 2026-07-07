import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Footer } from "@/components/layout/Footer";
import { Loader2, Play } from "lucide-react";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const MCP_URL = `https://${projectRef}.supabase.co/functions/v1/mcp`;

type ToolDef = {
  name: string;
  title: string;
  description: string;
  inputs: { key: string; label: string; placeholder: string; default: string }[];
};

const TOOLS: ToolDef[] = [
  {
    name: "echo",
    title: "echo",
    description: "Echoes the text you send back to you. Useful for a connectivity ping.",
    inputs: [{ key: "text", label: "Text", placeholder: "hello", default: "hello from Tool Runner" }],
  },
  {
    name: "get_app_info",
    title: "get_app_info",
    description: "Returns app metadata: name, description, and main routes.",
    inputs: [],
  },
  {
    name: "get_crypto_price",
    title: "get_crypto_price",
    description: "Fetches the current USD price and 24h change for a coin (CoinGecko id).",
    inputs: [{ key: "coin_id", label: "Coin id", placeholder: "bitcoin", default: "bitcoin" }],
  },
];

type CallState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; latencyMs: number; data: unknown }
  | { kind: "err"; latencyMs: number; message: string };

async function invokeMcpTool(name: string, args: Record<string, string>) {
  const res = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: crypto.randomUUID(),
      method: "tools/call",
      params: { name, arguments: args },
    }),
  });
  const contentType = res.headers.get("content-type") ?? "";
  const body = contentType.includes("text/event-stream")
    ? await res.text()
    : await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(body).slice(0, 400)}`);
  return body;
}

function ToolCard({ tool }: { tool: ToolDef }) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(tool.inputs.map((i) => [i.key, i.default])),
  );
  const [state, setState] = useState<CallState>({ kind: "idle" });

  const run = async () => {
    setState({ kind: "loading" });
    const start = performance.now();
    try {
      const data = await invokeMcpTool(tool.name, values);
      setState({ kind: "ok", latencyMs: Math.round(performance.now() - start), data });
    } catch (e) {
      setState({
        kind: "err",
        latencyMs: Math.round(performance.now() - start),
        message: e instanceof Error ? e.message : String(e),
      });
    }
  };

  return (
    <Card className="bg-black/40 border-purple-500/30">
      <CardHeader>
        <CardTitle className="font-mono text-base">{tool.title}</CardTitle>
        <p className="text-sm text-gray-400">{tool.description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {tool.inputs.map((i) => (
          <div key={i.key} className="space-y-1">
            <Label htmlFor={`${tool.name}-${i.key}`} className="text-xs uppercase tracking-wide text-gray-400">
              {i.label}
            </Label>
            <Input
              id={`${tool.name}-${i.key}`}
              placeholder={i.placeholder}
              value={values[i.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [i.key]: e.target.value }))}
              className="bg-black/60 border-purple-500/30 text-gray-100"
            />
          </div>
        ))}
        <Button onClick={run} disabled={state.kind === "loading"} className="w-full">
          {state.kind === "loading" ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running…</>
          ) : (
            <><Play className="w-4 h-4 mr-2" /> Run</>
          )}
        </Button>

        {state.kind === "ok" && (
          <div className="space-y-1">
            <p className="text-xs text-emerald-400">200 OK · {state.latencyMs} ms</p>
            <pre className="text-xs bg-black/70 border border-emerald-500/20 rounded p-3 overflow-auto max-h-72 text-emerald-100">
{JSON.stringify(state.data, null, 2)}
            </pre>
          </div>
        )}
        {state.kind === "err" && (
          <div className="space-y-1">
            <p className="text-xs text-red-400">Failed · {state.latencyMs} ms</p>
            <pre className="text-xs bg-black/70 border border-red-500/20 rounded p-3 overflow-auto max-h-72 text-red-200">
{state.message}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ToolRunner() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black text-white">
      <div className="container mx-auto px-6 py-16 max-w-5xl">
        <div className="mb-4">
          <Link to="/connect" className="text-sm text-purple-300 hover:text-purple-200">
            ← Back to Connect
          </Link>
        </div>
        <h1 className="text-4xl font-bold mb-3">Tool Runner</h1>
        <p className="text-gray-300 mb-2">
          Trigger the app's MCP tools directly from the browser and inspect the JSON
          returned by <code className="text-purple-300">{MCP_URL}</code>.
        </p>
        <p className="text-sm text-gray-400 mb-10">
          These are the same tools ChatGPT or Claude sees when they connect. Use this
          page as a smoke test after redeploying the <code>mcp</code> edge function.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {TOOLS.map((t) => <ToolCard key={t.name} tool={t} />)}
        </div>
      </div>
      <Footer />
    </div>
  );
}
