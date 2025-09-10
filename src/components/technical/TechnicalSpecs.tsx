
import { Card } from "@/components/ui/card";
import { Shield, Zap, Server, Cpu } from "lucide-react";

export function TechnicalSpecs() {
  return (
    <section className="space-y-8">
      <Card className="p-6 bg-black/70 backdrop-blur-sm border border-purple-500/20 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">Consensus Mechanism</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium text-purple-400 mb-3">Type & Validators</h4>
            <ul className="space-y-3 text-gray-200">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>Hybrid DPoS + BFT consensus</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>101 nodes elected via staking (DPoS)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>2-second block confirmation (BFT)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>Energy efficient (0.01 kWh/tx)</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-medium text-purple-400 mb-3">Performance</h4>
            <ul className="space-y-3 text-gray-200">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>10,000 TPS (base layer)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>Scalable to 100,000 TPS with Layer-2</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>$0.0001 transaction fee</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>Cross-chain compatibility</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-black/70 backdrop-blur-sm border border-purple-500/20 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Server className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">Network Architecture</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium text-purple-400 mb-3">Sharding & Layer-2</h4>
            <ul className="space-y-3 text-gray-200">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>64 parallel shards process transactions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>ZK-Rollups batch 1,000 transactions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>Validator nodes consume 50W/node</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>Inter-shard communication protocol</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-medium text-purple-400 mb-3">Security</h4>
            <ul className="space-y-3 text-gray-200">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>EdDSA signatures (faster than ECDSA)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>Lattice-based quantum resistance (2026)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>10% slashing for malicious behavior</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>24/7 network monitoring</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-black/70 backdrop-blur-sm border border-purple-500/20 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">Risk Assessment</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium text-purple-400 mb-3">Risk Factors</h4>
            <ul className="space-y-3 text-gray-200">
              <li className="flex items-start gap-2">
                <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded text-xs">High</span>
                <span>Regulatory Hurdles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded text-xs">Medium</span>
                <span>Technical Delays</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded text-xs">Medium</span>
                <span>Adoption Failure</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded text-xs">Low</span>
                <span>Network Attacks</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-medium text-purple-400 mb-3">Mitigation Strategy</h4>
            <ul className="space-y-3 text-gray-200">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>Multi-jurisdiction licensing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>Agile development, third-party audits</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>Strategic partnerships (Stripe, Shopify)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>Slashing, quantum-resistant technology</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-black/70 backdrop-blur-sm border border-purple-500/20 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Cpu className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">Team & Development</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-lg font-medium text-purple-400 mb-3">Lead Developer</h4>
            <p className="text-gray-200">Ex-Google Blockchain Engineer</p>
            <p className="text-gray-400 text-sm mt-1">Expertise in scalable consensus algorithms and sharding</p>
          </div>
          <div>
            <h4 className="text-lg font-medium text-purple-400 mb-3">Technical Advisor</h4>
            <p className="text-gray-200">Dr. Alice Chen (MIT)</p>
            <p className="text-gray-400 text-sm mt-1">Post-quantum cryptography, EdDSA signatures</p>
          </div>
          <div>
            <h4 className="text-lg font-medium text-purple-400 mb-3">Financial Advisor</h4>
            <p className="text-gray-200">Raj Patel (Ex-JPMorgan)</p>
            <p className="text-gray-400 text-sm mt-1">Enterprise blockchain adoption, compliance</p>
          </div>
        </div>
      </Card>
    </section>
  );
}
