
import { ChevronRight } from "lucide-react";

export function RoadmapTimeline() {
  const phases = [
    {
      period: "2025 Q1-Q2",
      title: "Research & Design",
      status: "Planned",
      items: [
        "Whitepaper Development",
        "Node Specifications",
        "Security Audits",
        "Launch Educational Platform",
        "Interactive Learning Modules",
        "Community Tutorials",
        "Developer Documentation"
      ]
    },
    {
      period: "2025 Q3-2026 Q1",
      title: "Core Protocol Development",
      status: "In Development",
      items: [
        "Hybrid DPoS + BFT Consensus Codebase",
        "Sharding Implementation",
        "ZK-Rollup Framework",
        "Security Testing",
        "GameFi Platform Launch",
        "NFT Marketplace",
        "Play-to-Earn Mechanics",
        "Game Developer SDK"
      ]
    },
    {
      period: "2026 Q2-Q3",
      title: "Testnet Launch",
      status: "Not Started",
      items: [
        "Stress Testing (100,000 TPS)",
        "Cross-shard Validation",
        "Latency Testing",
        "Validator Onboarding",
        "Governance Portal",
        "Staking Platform",
        "Community Events",
        "DeFi Integration"
      ]
    },
    {
      period: "2026 Q4",
      title: "Mainnet Launch",
      status: "Not Started",
      items: [
        "101 Validator Nodes",
        "Regulatory Compliance (MSB, VASP, FSA)",
        "Exchange Integration",
        "Public Sale"
      ]
    },
    {
      period: "2027+",
      title: "Ecosystem Expansion",
      status: "Conceptual",
      items: [
        "Enterprise Partnerships",
        "DeFi Protocol Suite",
        "Launch in 50+ countries",
        "Implement quantum resistance",
        "Scale to 100k+ validators",
        "Deploy advanced DeFi protocols",
        "Cross-chain Integration",
        "Mobile App Launch",
        "Enterprise Solutions",
        "Advanced Trading Features",
        "Release enterprise APIs",
        "Launch institutional partnerships",
        "Obtain regulatory licenses",
        "Deploy institutional custody"
      ]
    }
  ];

  return (
    <section className="space-y-8">
      <div className="max-w-4xl mx-auto space-y-12 bg-black/70 p-8 rounded-xl border border-purple-500/20 shadow-lg">
        {phases.map((phase, index) => (
          <div key={index} className="relative pl-10">
            <div className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-purple-500 to-purple-300/10" />
            <div className="absolute left-[-3px] top-3 w-6 h-6 rounded-full bg-black border-2 border-purple-500 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
            </div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-purple-400 font-semibold text-lg">{phase.period}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                phase.status === "Planned" ? "bg-blue-500/20 text-blue-300" :
                phase.status === "In Development" ? "bg-yellow-500/20 text-yellow-300" :
                phase.status === "Not Started" ? "bg-gray-500/20 text-gray-300" :
                "bg-green-500/20 text-green-300"
              }`}>
                {phase.status}
              </span>
            </div>
            <h4 className="text-xl font-bold text-white mb-4">{phase.title}</h4>
            <ul className="space-y-3 pl-1">
              {phase.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-200">
                  <ChevronRight className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
