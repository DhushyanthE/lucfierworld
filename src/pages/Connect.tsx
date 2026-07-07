import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check, Copy, ExternalLink, Loader2, PlayCircle, Wrench, XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Footer } from "@/components/layout/Footer";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const mcpUrl = `https://${projectRef}.supabase.co/functions/v1/mcp`;

// Copy-ready client configuration snippets. These use the standard
// Model Context Protocol JSON-RPC 2.0 shape that both ChatGPT (Developer
// mode) and Claude (custom connectors) accept for a Streamable-HTTP server.
const chatgptSnippet = JSON.stringify(
  {
    name: "Quantum Coin",
    transport: "http",
    url: mcpUrl,
    headers: {
      Accept: "application/json, text/event-stream",
      "Content-Type": "application/json",
    },
  },
  null,
  2,
);

const claudeSnippet = JSON.stringify(
  {
    mcpServers: {
      "quantum-coin": {
        url: mcpUrl,
        transport: "http",
        headers: {
          Accept: "application/json, text/event-stream",
        },
      },
    },
  },
  null,
  2,
);

type ToolStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; latencyMs: number; summary: string }
  | { kind: "err"; latencyMs: number; message: string };

async function invokeMcpTool(name: string, args: Record<string, unknown> = {}) {
  const res = await fetch(mcpUrl, {
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
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("text/event-stream")) return await res.text();
  return await res.json();
}

function extractText(payload: unknown): string {
  if (typeof payload === "string") return payload.slice(0, 200);
  const anyPayload = payload as { result?: { content?: Array<{ type: string; text?: string }> } };
  const content = anyPayload?.result?.content;
  if (Array.isArray(content)) {
    const t = content.find((c) => c.type === "text");
    if (t?.text) return t.text.slice(0, 200);
  }
  return JSON.stringify(payload).slice(0, 200);
}

function StatusBadge({ status }: { status: ToolStatus }) {
  if (status.kind === "loading") return <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Testing…</Badge>;
  if (status.kind === "ok") return <Badge className="bg-emerald-600 hover:bg-emerald-600"><Check className="w-3 h-3 mr-1" />OK · {status.latencyMs}ms</Badge>;
  if (status.kind === "err") return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
  return <Badge variant="outline">Not tested</Badge>;
}

export default function Connect() {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [echoStatus, setEchoStatus] = useState<ToolStatus>({ kind: "idle" });
  const [priceStatus, setPriceStatus] = useState<ToolStatus>({ kind: "idle" });

  const copy = async (value: string, field: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      toast.success(`${label} copied`);
      setTimeout(() => setCopiedField((f) => (f === field ? null : f)), 2000);
    } catch {
      toast.error("Could not copy — select and copy manually");
    }
  };

  const runTest = async (
    tool: "echo" | "get_crypto_price",
    args: Record<string, unknown>,
    setter: (s: ToolStatus) => void,
  ) => {
    setter({ kind: "loading" });
    const start = performance.now();
    try {
      const data = await invokeMcpTool(tool, args);
      setter({
        kind: "ok",
        latencyMs: Math.round(performance.now() - start),
        summary: extractText(data),
      });
    } catch (e) {
      setter({
        kind: "err",
        latencyMs: Math.round(performance.now() - start),
        message: e instanceof Error ? e.message : String(e),
      });
    }
  };

  const testAll = () => {
    void runTest("echo", { text: "ping from /connect" }, setEchoStatus);
    void runTest("get_crypto_price", { coin_id: "bitcoin" }, setPriceStatus);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black text-white">
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <Link to="/" className="text-sm text-purple-300 hover:text-purple-200">
            ← Back to home
          </Link>
          <Link to="/tools" className="text-sm text-purple-300 hover:text-purple-200 inline-flex items-center gap-1">
            <Wrench className="w-4 h-4" /> Open Tool Runner
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-3">Connect an AI assistant</h1>
        <p className="text-gray-300 mb-10">
          Add Quantum Coin to ChatGPT or Claude so the assistant can look up app
          info and live crypto prices for you while you chat.
        </p>

        {/* URL + live status */}
        <Card className="bg-black/40 border-purple-500/30 mb-10">
          <CardHeader>
            <CardTitle className="text-lg">Your MCP server URL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 rounded-md border border-purple-500/30 bg-black/60 px-3 py-2">
              <code className="flex-1 text-sm text-purple-200 break-all">{mcpUrl}</code>
              <Button size="sm" variant="secondary" onClick={() => copy(mcpUrl, "url", "URL")}>
                {copiedField === "url" ? (
                  <><Check className="w-4 h-4 mr-1" /> Copied</>
                ) : (
                  <><Copy className="w-4 h-4 mr-1" /> Copy</>
                )}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={testAll} size="sm" variant="default">
                <PlayCircle className="w-4 h-4 mr-2" /> Test connection
              </Button>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">echo</span>
                <StatusBadge status={echoStatus} />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">get_crypto_price</span>
                <StatusBadge status={priceStatus} />
              </div>
            </div>

            {(echoStatus.kind === "ok" || echoStatus.kind === "err") && (
              <pre className="text-xs bg-black/70 border border-purple-500/20 rounded p-3 overflow-auto max-h-40 text-gray-300">
{`echo → ${echoStatus.kind === "ok" ? echoStatus.summary : echoStatus.message}`}
              </pre>
            )}
            {(priceStatus.kind === "ok" || priceStatus.kind === "err") && (
              <pre className="text-xs bg-black/70 border border-purple-500/20 rounded p-3 overflow-auto max-h-40 text-gray-300">
{`get_crypto_price → ${priceStatus.kind === "ok" ? priceStatus.summary : priceStatus.message}`}
              </pre>
            )}
          </CardContent>
        </Card>

        {/* Copy-ready snippets */}
        <Card className="bg-black/40 border-purple-500/30 mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Copy-ready configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-300 font-medium">ChatGPT (Developer mode)</p>
                <Button size="sm" variant="secondary" onClick={() => copy(chatgptSnippet, "chatgpt", "ChatGPT config")}>
                  {copiedField === "chatgpt" ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  Copy
                </Button>
              </div>
              <pre className="text-xs bg-black/70 border border-purple-500/20 rounded p-3 overflow-auto text-purple-100">
{chatgptSnippet}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-300 font-medium">Claude (mcpServers block)</p>
                <Button size="sm" variant="secondary" onClick={() => copy(claudeSnippet, "claude", "Claude config")}>
                  {copiedField === "claude" ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  Copy
                </Button>
              </div>
              <pre className="text-xs bg-black/70 border border-purple-500/20 rounded p-3 overflow-auto text-purple-100">
{claudeSnippet}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* QR for mobile */}
        <Card className="bg-black/40 border-purple-500/30 mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Scan on mobile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center gap-6">
            <div className="rounded-md bg-white p-3">
              <QRCodeSVG value={mcpUrl} size={168} includeMargin={false} />
            </div>
            <div className="text-sm text-gray-300">
              <p>
                Point your phone's camera at the code to grab the MCP URL, then paste it
                into a mobile MCP client or send it to yourself for a desktop client.
              </p>
              <p className="text-xs text-gray-500 mt-2 break-all">{mcpUrl}</p>
            </div>
          </CardContent>
        </Card>

        {/* Manual steps */}
        <Card className="bg-black/40 border-purple-500/30 mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Connect from ChatGPT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-200">
            <ol className="list-decimal list-inside space-y-3">
              <li>
                Open{" "}
                <a
                  href="https://chatgpt.com/#settings/Connectors/Advanced"
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-300 underline inline-flex items-center gap-1"
                >
                  ChatGPT Connector settings
                  <ExternalLink className="w-3 h-3" />
                </a>{" "}
                and turn on <strong>Developer mode</strong>.
              </li>
              <li>Click <strong>Add sources</strong> → <strong>Connect more</strong>.</li>
              <li>Name the connector and paste the MCP URL above.</li>
              <li>Ask ChatGPT to use Quantum Coin, e.g. "Use Quantum Coin to get the current price of bitcoin."</li>
            </ol>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-purple-500/30 mb-10">
          <CardHeader>
            <CardTitle className="text-lg">Connect from Claude</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-200">
            <ol className="list-decimal list-inside space-y-3">
              <li>
                Open{" "}
                <a
                  href="https://claude.ai/customize/connectors?modal=add-custom-connector"
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-300 underline inline-flex items-center gap-1"
                >
                  Claude's Add custom connector dialog
                  <ExternalLink className="w-3 h-3" />
                </a>
                .
              </li>
              <li>Name the connector and paste the MCP URL above.</li>
              <li>Enable the connector in the chat composer, then ask Claude to use Quantum Coin.</li>
            </ol>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card className="bg-black/40 border-amber-500/30 mb-10">
          <CardHeader>
            <CardTitle className="text-lg">Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-200">
            <div>
              <p className="font-medium text-amber-200">406 Not Acceptable</p>
              <p className="text-gray-300">
                The MCP Streamable HTTP spec requires{" "}
                <code className="text-xs">Accept: application/json, text/event-stream</code> on every POST.
                Use the snippet above verbatim — the header is already set.
              </p>
            </div>
            <div>
              <p className="font-medium text-amber-200">Wrong URL / 404</p>
              <p className="text-gray-300">
                Confirm the URL matches the one shown at the top of this page. If your
                assistant appended <code>/sse</code> or <code>/v1</code>, remove it — this server
                serves the JSON-RPC endpoint at the root path shown.
              </p>
            </div>
            <div>
              <p className="font-medium text-amber-200">Server offline / 5xx</p>
              <p className="text-gray-300">
                Click <strong>Test connection</strong> above. If echo fails, the{" "}
                <code>mcp</code> edge function has not deployed successfully — redeploy
                it and retry. The <Link to="/tools" className="text-purple-300 underline">Tool Runner</Link>{" "}
                page has per-tool payload previews for deeper debugging.
              </p>
            </div>
            <div>
              <p className="font-medium text-amber-200">Tools work in the browser but not in ChatGPT/Claude</p>
              <p className="text-gray-300">
                Some clients cache the tool catalog. Remove the connector and re-add it, or
                start a fresh chat so the client refetches <code>tools/list</code>.
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-sm text-gray-400">
          Once connected, the assistant discovers the app's tools on its own — no extra
          configuration required.
        </p>
      </div>

      <Footer />
    </div>
  );
}
