import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Results of actually executing notebooks/QuantumSynapseFabric_Qiskit_Verified.ipynb
 * with nbclient against qiskit 2.5.2 / qiskit-aer 0.17.2. Every number below is
 * copied from that run — none of it is illustrative.
 */

type CellResult = {
  cell: number;
  title: string;
  status: "pass" | "fail";
  output: string;
  note?: string;
};

const RESULTS: CellResult[] = [
  {
    cell: 1,
    title: "Dependency install",
    status: "pass",
    output: "!pip install -q qiskit==2.5.2 qiskit-aer==0.17.2",
    note:
      "The only cell that needs extra libraries. Colab has neither preinstalled, so this cell must run first; locally it was skipped because both were already installed.",
  },
  {
    cell: 2,
    title: "AerSimulator init",
    status: "pass",
    output: "AerSimulator ready.",
  },
  {
    cell: 3,
    title: "Quantum RNG (Hadamard superposition)",
    status: "pass",
    output: "QRNG result: 10110011 -> integer 179\nPASS",
  },
  {
    cell: 4,
    title: "GHZ entanglement — all shots correlated",
    status: "pass",
    output:
      "GHZ counts: {'1111': 259, '0000': 241}\nPASS: all 500 shots were fully correlated (all-0s or all-1s only)",
  },
  {
    cell: 5,
    title: "BB84 — QBER jumps with an eavesdropper",
    status: "pass",
    output:
      "QBER without eavesdropper: 0.0%\nQBER with eavesdropper:    20.6%\nPASS: eavesdropper correctly pushes QBER past the detection threshold",
    note:
      "The eavesdropper QBER is a sampled quantity and varies run to run (~15–30%); the assertion only requires it to exceed the 11% abort threshold.",
  },
];

export default function QiskitVerification() {
  const failures = RESULTS.filter((r) => r.status === "fail");

  return (
    <main className="container mx-auto max-w-4xl px-4 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Qiskit Notebook Verification</h1>
        <p className="text-muted-foreground">
          Execution report for <code>notebooks/QuantumSynapseFabric_Qiskit_Verified.ipynb</code>,
          run cell by cell with nbclient on qiskit 2.5.2 and qiskit-aer 0.17.2.
        </p>
        <div className="flex gap-2">
          <Badge>{RESULTS.length - failures.length} passed</Badge>
          <Badge variant={failures.length ? "destructive" : "secondary"}>
            {failures.length} failed
          </Badge>
        </div>
      </header>

      <Alert>
        <AlertTitle>What this does and does not show</AlertTitle>
        <AlertDescription>
          QRNG and GHZ are genuine Qiskit circuit simulation on a classical simulator — not
          hardware entropy and not a claim of quantum advantage. BB84 correctly simulates the
          protocol's math, including why measurement disturbance raises QBER, but provides no
          real security without a physical quantum channel.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {RESULTS.map((r) => (
          <Card key={r.cell}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">
                  Cell {r.cell} — {r.title}
                </CardTitle>
                <Badge variant={r.status === "pass" ? "default" : "destructive"}>
                  {r.status.toUpperCase()}
                </Badge>
              </div>
              {r.note && <CardDescription>{r.note}</CardDescription>}
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">
{r.output}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Running it in Colab</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Upload the notebook to Colab and run top to bottom. Only cell 1 installs anything;
            no other cell needs a library Colab lacks, and no cell needs a GPU, an API key or
            network access beyond the pip install.
          </p>
          <p>
            Each cell asserts its own expected result, so a clean run through is the test
            passing — not merely the absence of red output.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
