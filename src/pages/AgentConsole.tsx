import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { SERVICE_URLS } from "@/config/env";

/**
 * Browser console for the OpenAI agent, which runs entirely in the
 * `openai-agent` edge function. The API key never reaches this file.
 */

const AGENT_FN = `${SERVICE_URLS.FUNCTIONS_BASE}/openai-agent`;

type Msg = { role: "user" | "assistant"; content: string };

export default function AgentConsole() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<{ key_configured: boolean; model: string; tools: string[] } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(AGENT_FN).then((r) => r.json()).then(setHealth).catch(() => setHealth(null));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(AGENT_FN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, stream: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ? JSON.stringify(data.error) : `HTTP ${res.status}`);
      setMessages([...next, { role: "assistant", content: data.reply || "(empty response)" }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "agent request failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">QuantumSynapse Agent</h1>
        <p className="text-muted-foreground">
          The agent runs server-side with read-only tools: Bell-score governance checks and the
          blockchain indexer. It cannot sign transactions or move funds.
        </p>
        {health && (
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant={health.key_configured ? "default" : "destructive"}>
              {health.key_configured ? "key configured" : "OPENAI_API_KEY missing"}
            </Badge>
            <Badge variant="outline">{health.model}</Badge>
            {health.tools?.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
          </div>
        )}
      </header>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Agent error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
          <CardDescription>Ask about the quantum core, governance rules or chain state.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-[50vh] space-y-3 overflow-y-auto">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Try: “Is a CHSH score of 2.9 acceptable?” or “What on-chain events do you see?”
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "rounded-lg bg-muted p-3 text-sm"
                    : "rounded-lg border p-3 text-sm whitespace-pre-wrap"
                }
              >
                <span className="mb-1 block text-xs uppercase text-muted-foreground">{m.role}</span>
                {m.content}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <Textarea
            rows={3}
            value={input}
            placeholder="Ask the agent…"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <Button onClick={() => void send()} disabled={busy || !input.trim()}>
            {busy ? "Thinking…" : "Send"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
