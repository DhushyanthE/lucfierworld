import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Code, Coins, Lock, Wallet, Flame, BarChart, ChevronDown, ChevronUp } from "lucide-react";
import { Logo, LogoIconType } from "@/components/layout/Logo";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { AIChat } from "@/components/chat/AIChat";
import { aiService } from "@/services/aiService";

export function ExploreProcess() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiDetails, setAiDetails] = useState<string | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const { toast: useToastToast } = useToast();

  const processList = [
    {
      icon: <Code className="w-12 h-12 text-purple-400" />,
      title: "Development",
      description: "Smart contract development and security audits",
      details: "Our engineers implement ERC-20 standard with custom features for enhanced security and utility. All code undergoes multiple security audits by leading blockchain security firms.",
      logoType: "gem" as LogoIconType,
      feature: "project"
    },
    {
      icon: <Coins className="w-12 h-12 text-purple-400" />,
      title: "Validation",
      description: "Community testing and blockchain validation",
      details: "Open beta testing allows community members to interact with the token contract, identify potential issues, and provide feedback before final deployment.",
      logoType: "coins" as LogoIconType,
      feature: "mining"
    },
    {
      icon: <Lock className="w-12 h-12 text-purple-400" />,
      title: "Token Locking",
      description: "Founder tokens locked in time-release vault",
      details: "Team and advisor tokens are locked in a smart contract vault with gradual release over 4 years to ensure long-term commitment and prevent market flooding.",
      logoType: "diamond" as LogoIconType,
      feature: "stacking"
    },
    {
      icon: <Wallet className="w-12 h-12 text-purple-400" />,
      title: "Governance",
      description: "Community-driven protocol decisions",
      details: "Token holders can propose and vote on protocol changes, with voting weight proportional to their stake in the network.",
      logoType: "wallet" as LogoIconType,
      feature: "governance"
    },
    {
      icon: <BarChart className="w-12 h-12 text-purple-400" />,
      title: "Tokenomics",
      description: "Economic model and token distribution",
      details: "Deflationary model with maximum supply cap and strategic token allocations across ecosystem development, team, and community.",
      logoType: "chart" as LogoIconType,
      feature: "tokenomics"
    },
    {
      icon: <Flame className="w-12 h-12 text-purple-400" />,
      title: "DeFi Integration",
      description: "Financial primitives and protocols",
      details: "Integration with lending, borrowing, and liquidity protocols to enhance token utility and ecosystem value.",
      logoType: "flame" as LogoIconType,
      feature: "defi"
    }
  ];

  const toggleExpand = async (index: number) => {
    // If we're closing the current card, just close it
    if (expandedIndex === index) {
      setExpandedIndex(null);
      return;
    }
    
    // Set the expanded index first for immediate UI feedback
    setExpandedIndex(index);
    
    // Start generating AI content for the selected feature
    const feature = processList[index].feature;
    await generateAIDetails(feature);
  };

  const generateAIDetails = async (feature: string) => {
    setIsGenerating(true);
    
    try {
      const response = await aiService.generateText({
        prompt: `Generate a quantum-inspired analysis for the ${feature} feature of quantum cryptocurrency`,
        maxLength: 500
      });
      
      if (response.status === 'success') {
        setAiDetails(response.text);
        toast.success('AI information generated!');
      } else {
        toast.error(response.message || 'Failed to generate information');
      }
    } catch (error) {
      console.error('Error generating AI details:', error);
      toast.error('Something went wrong with AI generation');
    } finally {
      setIsGenerating(false);
    }
  };

  // Manually trigger generation for a specific feature
  const triggerGeneration = (e: React.MouseEvent, feature: string) => {
    e.stopPropagation();
    generateAIDetails(feature);
  };

  return (
    <div className="my-12">
      <h2 className="text-2xl font-bold text-white mb-6">Token Journey</h2>
      <p className="text-gray-400 mb-8 max-w-3xl">
        Explore the complete lifecycle of Quantum Coin from development to ecosystem expansion. Our transparent process ensures security, fairness, and sustainable growth.
      </p>
      
      <div className="flex justify-between items-center mb-8">
        <div></div>
        <button
          onClick={() => setShowAIChat(!showAIChat)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Logo iconType="gem" size={5} interactive={false} />
          {showAIChat ? "Hide AI Assistant" : "Ask Quantum AI"}
        </button>
      </div>
      
      {showAIChat && (
        <div className="mb-10">
          <AIChat />
        </div>
      )}
      
      <div className="flex flex-wrap gap-6 relative">
        {processList.map((process, index) => (
          <Card 
            key={index} 
            className={`bg-black/40 border-purple-500/30 hover:border-purple-500/60 transition-all hover:bg-black/60 hover:translate-y-[-5px] cursor-pointer ${expandedIndex === index ? 'border-purple-500/80' : ''}`}
            onClick={() => toggleExpand(index)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>{process.icon}</div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => triggerGeneration(e, process.feature)}
                    className="text-purple-400 hover:text-purple-300 disabled:text-purple-700"
                    disabled={isGenerating}
                    title="Refresh AI information"
                  >
                    {isGenerating ? (
                      <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"></path>
                        <path d="m14 7 3 3"></path>
                        <path d="M5 6v4"></path>
                        <path d="M19 14v4"></path>
                        <path d="M10 2v2"></path>
                        <path d="M7 8H3"></path>
                        <path d="M21 16h-4"></path>
                        <path d="M11 3H9"></path>
                      </svg>
                    )}
                  </button>
                  <Logo iconType={process.logoType} size={8} interactive={false} />
                </div>
              </div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-white">{process.title}</h3>
                {expandedIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-purple-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-purple-400" />
                )}
              </div>
              <p className="text-gray-400">{process.description}</p>
              
              {expandedIndex === index && (
                <div className="mt-4 pt-4 border-t border-purple-500/30 text-gray-300 text-sm">
                  {expandedIndex === index && isGenerating ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Generating AI content...</span>
                    </div>
                  ) : (
                    aiDetails && expandedIndex === index ? aiDetails : process.details
                  )}
                </div>
              )}
              
              {index < processList.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 right-[-15px] transform translate-x-[50%] translate-y-[-50%] z-10">
                  <ArrowRight className="w-6 h-6 text-purple-500" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
