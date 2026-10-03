import { DharmicConsensusPanel } from "@/components/crypto/DharmicConsensusPanel";

export default function CellularBlockchain() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 space-y-6">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">QuantumSynapse Fabric / BBB8</div>
        <h1 className="text-3xl font-bold">Cellular Blockchain · Proof of Dharmic State</h1>
        <p className="max-w-4xl text-muted-foreground">
          Nine software cell nodes score Bell-gated, reputation-aware, LVTH stake-weighted proposals. Each proposal is canonicalized, hashed with SHA3-512 and signed with ML-DSA-87 before a strict &gt;2/3 validator quorum can finalize it.
        </p>
        <p className="text-xs text-muted-foreground">
          Research simulation boundary: “cellular” is DNA-inspired software topology, not biological computing. The current page uses the server/Supabase bridge; it must not be interpreted as on-chain persistence until a LeviathanCoin deployment address is configured.
        </p>
      </header>
      <DharmicConsensusPanel detailed />
    </div>
  );
}
