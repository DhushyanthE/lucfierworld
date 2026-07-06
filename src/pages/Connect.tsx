import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/layout/Footer";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const mcpUrl = `https://${projectRef}.supabase.co/functions/v1/mcp`;

export default function Connect() {
  const [copied, setCopied] = useState(false);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(mcpUrl);
      setCopied(true);
      toast.success("MCP URL copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy — select and copy manually");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black text-white">
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-4">
          <Link to="/" className="text-sm text-purple-300 hover:text-purple-200">
            ← Back to home
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-3">Connect an AI assistant</h1>
        <p className="text-gray-300 mb-10">
          Add Quantum Coin to ChatGPT or Claude so the assistant can look up app
          info and live crypto prices for you while you chat.
        </p>

        <Card className="bg-black/40 border-purple-500/30 mb-10">
          <CardHeader>
            <CardTitle className="text-lg">Your MCP server URL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 rounded-md border border-purple-500/30 bg-black/60 px-3 py-2">
              <code className="flex-1 text-sm text-purple-200 break-all">
                {mcpUrl}
              </code>
              <Button size="sm" variant="secondary" onClick={copyUrl}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" /> Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Paste this into the connector setup below. It is safe to share.
            </p>
          </CardContent>
        </Card>

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
                and turn on <strong>Developer mode</strong> (read the risk
                notice shown there).
              </li>
              <li>
                In the chat composer, click the <strong>+</strong> menu and
                enable <strong>Developer mode</strong>.
              </li>
              <li>
                Click <strong>Add sources</strong>, then <strong>Connect more</strong>.
              </li>
              <li>Give the connector a name and paste the MCP URL above.</li>
              <li>
                Start a new chat and ask ChatGPT to use Quantum Coin — for
                example, "Use Quantum Coin to get the current price of bitcoin."
              </li>
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
              <li>Give the connector a name and paste the MCP URL above.</li>
              <li>
                Back in Claude's chat composer, enable the connector, then ask
                Claude to use Quantum Coin.
              </li>
            </ol>
          </CardContent>
        </Card>

        <p className="text-sm text-gray-400">
          Once connected, the assistant will discover the app's tools on its own
          — you don't need to configure anything else.
        </p>
      </div>

      <Footer />
    </div>
  );
}
