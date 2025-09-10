
import React from "react";
import { Link } from "react-router-dom";
import { BarChart3, Network } from "lucide-react";
import { MainContent } from "@/components/home/MainContent";

interface HomeContentSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onTrySwap: () => void;
}

export function HomeContentSection({ activeTab, setActiveTab, onTrySwap }: HomeContentSectionProps) {
  return (
    <>
      <MainContent 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onTrySwap={onTrySwap} 
      />
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
        <Link 
          to="/crypto-market" 
          className="inline-flex items-center px-6 py-3 text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
        >
          <BarChart3 className="h-5 w-5 mr-2" />
          Explore Quantum Crypto Market Analysis
        </Link>
        
        <Link 
          to="/quantum-operations" 
          className="inline-flex items-center px-6 py-3 text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <Network className="h-5 w-5 mr-2" />
          Quantum Operations Dashboard
        </Link>
      </div>
      
      <p className="mt-2 text-gray-400 text-sm text-center">
        Real-time analysis powered by quantum-resistant AI technology
      </p>
    </>
  );
}
