
import React, { useEffect } from "react";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { quantumWorkflowHandler } from "@/lib/quantum/QuantumWorkflowHandler";
import { QuantumWorkflowIntegration } from "@/components/ai/QuantumWorkflowIntegration";
import { QuantumWorkflow } from "@/components/tokenomics/QuantumWorkflow";
import { QuantumKeyDistribution } from "@/components/quantum/QuantumKeyDistribution";
import { QuantumWallet } from "@/components/quantum/QuantumWallet";
import { HierarchicalGroups } from "@/components/quantum/HierarchicalGroups";
import { AdvancedMPQKD } from "@/components/quantum/AdvancedMPQKD";
import { realTimeQuantumProcessor } from "@/lib/quantum/RealTimeQuantumProcessor";
import { QuantumBlockchainAI } from "@/components/quantum/QuantumBlockchainAI";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cpu, Brain } from "lucide-react";

export default function QuantumOperations() {
  // Start the quantum workflow handler when the page is loaded
  useEffect(() => {
    quantumWorkflowHandler.start();
    
    // Initialize the real-time quantum processor
    const initializeRealTimeProcessor = async () => {
      try {
        // Test connection by submitting a basic task
        await realTimeQuantumProcessor.execute('ai', { 
          operation: 'analyze-security',
          level: 'quantum'
        });
        
        toast.success("Quantum processing network initialized");
      } catch (error) {
        console.error("Error initializing quantum processor:", error);
        toast.error("Failed to initialize quantum network");
      }
    };
    
    initializeRealTimeProcessor();
    
    // Clean up on unmount
    return () => {
      quantumWorkflowHandler.stop();
      realTimeQuantumProcessor.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <NavBar 
        logoType="gem"
        onLogoClick={() => {}}
        selectedWallet={null}
        onConnectWallet={() => {}}
        onShowCharts={() => {}}
        onShowAIChat={() => {}}
        onShowSwap={() => {}}
        showCharts={false}
        showAIChat={false}
        showSwap={false}
      />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <span className="bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
                Quantum Operations Dashboard
              </span>
            </h1>
            
            <div className="flex gap-3">
              <Link to="/quantum-circuits">
                <Button variant="outline" className="bg-black/40 border-purple-500/30 text-purple-300 hover:bg-black/60">
                  <Cpu className="mr-2 h-4 w-4" />
                  Circuit Optimizer
                </Button>
              </Link>
              
              <Link to="/quantum-ai">
                <Button variant="outline" className="bg-black/40 border-purple-500/30 text-purple-300 hover:bg-black/60">
                  <Brain className="mr-2 h-4 w-4" />
                  Quantum AI
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-8">
            {/* Quantum Blockchain AI */}
            <QuantumBlockchainAI />
            
            {/* Quantum Workflow Integration */}
            <QuantumWorkflowIntegration />
            
            {/* Advanced Multi-Party QKD */}
            <AdvancedMPQKD />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quantum Key Distribution */}
              <QuantumKeyDistribution />
              
              {/* Quantum Wallet */}
              <QuantumWallet />
            </div>
            
            {/* Hierarchical Groups */}
            <HierarchicalGroups />
            
            {/* Quantum Workflow */}
            <QuantumWorkflow />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
