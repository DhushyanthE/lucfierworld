import { useCallback, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Play } from "lucide-react";
import { SERVICE_URLS } from "@/config/env";
import recorded from "@/data/qiskitNotebookRun.json";

/**
 * Quantum Results — the recorded Qiskit notebook run plus a live re-run button.
 *
 * The recorded column is the real nbclient execution of the Python notebook.
 * The live column re-runs the same circuits on this project's own TypeScript
 * statevector engine, because Qiskit is Python-only and cannot run in the edge
 * runtime. Both are labelled; neither is illustrative.
 */

const RUN_FN = `${SERVICE_URLS.FUNCTIONS_BASE}/quantum-notebook-run`;

type LiveCell = {
  index: number;
  title: string;
  status: "passed" | "failed";
  output: string;
  error: string | null;
  duration_ms: number;
};

type LiveRun = {
  engine: string;
  ran_at: string;
  total_duration_ms: number;
  passed: number;
  failing: number;
  failing_cells: { index: number; title: string; error: string | null }[];
  cells: LiveCell[];
};

type RecordedCell = {
  index: number;
  title: string;
  status: string;
  output: string;
  error: string | null;
};

const recordedCells = recorded.cells as RecordedCell[];

export default function QuantumResults() {
  const [live, setLive] = useState<LiveRun | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const runLive = useCallback(async () => {
    setRunning(true);
    setError(null);
    setLive(null);
    setElapsed(0);
    const started = Date.now();
    const ticker = window.setInterval(() => setElapsed(Date.now() - started), 100);
    try {
      const res = await fetch(RUN_FN, { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? `run failed with HTTP ${res.status}`);
      setLive(body as LiveRun);
    } catch (e) {
      setError(e instanceof Error ? e.message : "could not reach the quantum engine");
    } finally {
      window.clearInterval(ticker);
      setRunning(false);
    }
  }, []);

  return (
    <main className="container mx-auto max-w-4xl px-4 py-10 space-y-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Quantum Results</h1>
        <p className="text-muted-foreground">
          Every code cell of <code>notebooks/{recorded.notebook}</code>, its recorded output from
          the pinned Qiskit run, and a live re-run of the same circuits you can trigger now.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => void runLive()} disabled={running}>
            {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            {running ? `Running… ${(elapsed / 1000).toFixed(1)}s` : "Run live"}
          </Button>
          {live && (
            <>
              <Badge>{live.passed} passed</Badge>
              <Badge variant={live.failing ? "destructive" : "secondary"}>
                {live.failing} failing
              </Badge>
              <span className="text-xs text-muted-foreground">
                {live.total_duration_ms} ms · {new Date(live.ran_at).toUTCString()}
              </span>
            </>
          )}
        </div>
      </header>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Live run failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Alert>
        <AlertTitle>What "live" means here</AlertTitle>
        <AlertDescription>
          The recorded outputs come from executing the Python notebook with nbclient on{" "}
          {recorded.runtime}. The live run executes the same circuits and assertions on this
          project's TypeScript statevector engine, since Qiskit cannot run in the server
          runtime — so sampled numbers (GHZ counts, QBER, CHSH S) differ run to run, as they
          should.
        </AlertDescription>
      </Alert>

      {live && live.failing_cells.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Failing cells in the live run</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {live.failing_cells.map((c) => (
                <li key={c.index} className="rounded-md border p-3">
                  <p className="font-medium">Cell {c.index} — {c.title}</p>
                  <p className="text-destructive text-xs mt-1">{c.error}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {recordedCells.map((cell) => {
          const liveCell = live?.cells.find((c) => c.index === cell.index);
          return (
            <Card key={cell.index}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    Cell {cell.index} — <code className="text-sm">{cell.title}</code>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={cell.status === "passed" ? "default" : "destructive"}>
                      recorded {cell.status}
                    </Badge>
                    {liveCell && (
                      <Badge variant={liveCell.status === "passed" ? "default" : "destructive"}>
                        live {liveCell.status} · {liveCell.duration_ms} ms
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription>
                  {liveCell ? "Recorded Qiskit output and the live engine re-run." : "Recorded Qiskit output."}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Recorded (Qiskit)</p>
                  <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">
{cell.output || "(no output)"}
                  </pre>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    Live (TypeScript engine)
                  </p>
                  <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">
{running ? "running…" : liveCell ? (liveCell.output || liveCell.error || "(no output)") : "not run yet"}
                  </pre>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {live?.cells
          .filter((c) => !recordedCells.some((r) => r.index === c.index))
          .map((c) => (
            <Card key={`extra-${c.index}`}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    Cell {c.index} — <code className="text-sm">{c.title}</code>
                  </CardTitle>
                  <Badge variant={c.status === "passed" ? "default" : "destructive"}>
                    live {c.status} · {c.duration_ms} ms
                  </Badge>
                </div>
                <CardDescription>Live-only check, not present in the notebook.</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">
{c.output || c.error}
                </pre>
              </CardContent>
            </Card>
          ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Required libraries (Colab)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {recorded.libraries.map((lib) => (
              <Badge key={lib} variant="outline"><code>{lib}</code></Badge>
            ))}
          </div>
          <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
{`!pip install -q qiskit==2.5.2 qiskit-aer==0.17.2`}
          </pre>
        </CardContent>
      </Card>
    </main>
  );
}
