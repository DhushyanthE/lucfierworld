import { DharmicConsensusPanel } from "@/components/crypto/DharmicConsensusPanel";

export default function CellularBlockchain() {
  return (
    <div className="container mx-auto max-w-5xl py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Cellular Blockchain</h1>
        <p className="text-muted-foreground">
          Each cell node stakes LVTH, signs its Bell-score proposal with a lattice (ML-DSA-87) signature, and the network runs Proof of Dharmic State rounds. Results stream over the live bridge to every open page.
        </p>
        <p className="text-xs text-muted-foreground">Simulation: cells are software nodes, not living tissue. On-chain recording starts once LeviathanCoin is deployed.</p>
      </header>
      <DharmicConsensusPanel detailed />
    </div>
  );
}
