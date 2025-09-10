
import React from "react";
import { FileText, Users } from "lucide-react";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { CompetitiveAnalysis } from "@/components/home/CompetitiveAnalysis";
import { TechnicalSpecs } from "@/components/technical/TechnicalSpecs";
import { TokenDistribution } from "@/components/tokenomics/TokenDistribution";
import { RoadmapTimeline } from "@/components/roadmap/RoadmapTimeline";
import { HeroSection } from "@/components/home/HeroSection";

interface MainContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onTrySwap: () => void;
}

export const MainContent: React.FC<MainContentProps> = ({ activeTab, setActiveTab, onTrySwap }) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <section className="space-y-12">
            <FeatureGrid />
            <CompetitiveAnalysis />
          </section>
        );

      case "technical":
        return <TechnicalSpecs />;

      case "tokenomics":
        return <TokenDistribution />;

      case "roadmap":
        return <RoadmapTimeline />;

      default:
        return null;
    }
  };

  return (
    <>
      <HeroSection onTrySwap={onTrySwap} />
      <div className="flex gap-4 mb-12 overflow-x-auto pb-4">
        {[
          { id: "overview", label: "Overview" },
          { id: "technical", label: "Technical Specs" },
          { id: "tokenomics", label: "Tokenomics" },
          { id: "roadmap", label: "Roadmap" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-purple-500 text-white"
                : "bg-white/10 text-gray-400 hover:bg-white/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {renderTabContent()}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Join the Financial Revolution</h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Be part of the next generation of blockchain technology. Quantum Coin combines speed, security, and sustainability for a better financial future.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="bg-purple-500 hover:bg-purple-600 transition-colors px-8 py-3 rounded-lg text-white font-medium inline-flex items-center gap-2">
              Read Whitepaper <FileText className="w-4 h-4" />
            </button>
            <button className="bg-white/10 hover:bg-white/20 transition-colors px-8 py-3 rounded-lg text-white font-medium inline-flex items-center gap-2">
              Join Community <Users className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
};
