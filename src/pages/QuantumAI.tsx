
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { QuantumWorkflowIntegration } from "@/components/ai/QuantumWorkflowIntegration";
import { QuantumSuperAIMetrics } from "@/components/ai/QuantumSuperAIMetrics";
import { Zap } from "lucide-react";
import { toast } from "sonner";
import { QuantumAIHeader } from "./quantum-ai/QuantumAIHeader";
import { QuantumAIDescription } from "./quantum-ai/QuantumAIDescription";
import { QuantumAIDashboard } from "./quantum-ai/QuantumAIDashboard";
import { QuantumAIEngineLayout } from "./quantum-ai/QuantumAIEngineLayout";
import { QuantumAITechnicalDocs } from "./quantum-ai/QuantumAITechnicalDocs";
import { realTimeQuantumProcessor } from "@/lib/quantum/RealTimeQuantumProcessor";
import { agiModule } from "@/lib/quantum/AGIModule";
import { superAIModule } from "@/lib/quantum/SuperAIModule";
import { dataScienceAGI } from "@/lib/quantum/DataScienceAGI";
import { QuantumAICapabilities } from "@/components/ai/QuantumAICapabilities";
import { QuantumBlockchainNetwork } from "@/components/ai/QuantumBlockchainNetwork";
import { DataScienceAICapabilities } from "@/components/ai/DataScienceAICapabilities";
import { RealTimeWorkflowOptimizer } from "@/components/ai/RealTimeWorkflowOptimizer";
import { QuantumCoinVisualization } from "@/components/ai/QuantumCoinVisualization";

export default function QuantumAI() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('platform');
  
  useEffect(() => {
    // Initialize quantum engine components
    const initializeQuantumComponents = async () => {
      try {
        // Connect to the real-time quantum processor
        realTimeQuantumProcessor.connect();
        console.log("Successfully connected to Quantum Processing Network");
        
        // Initialize AGI module with a test processing
        await agiModule.processInput({
          operation: "system_initialize",
          complexity: "high"
        });
        
        // Ensure Super AI module is initialized
        const superAICapabilities = superAIModule.getCapabilities() || [];
        console.log(`Initialized Super AI with ${superAICapabilities.length} capabilities`);
        
        // Initialize Data Science AGI
        const dataAGIMetrics = dataScienceAGI.getMetrics();
        console.log(`Initialized Data Science AGI with ${dataAGIMetrics.processingCapacity * 100}% capacity`);
        
        // Simulate loading of AI components
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setIsLoading(false);
        toast.success("Quantum AI Engine connected", {
          description: "Neural network models loaded and ready for analysis",
          icon: <Zap className="h-5 w-5" />,
          duration: 3000
        });
      } catch (error) {
        console.error("Error initializing quantum components:", error);
        setIsLoading(false);
        toast.error("Error connecting to Quantum AI Engine");
      }
    };
    
    initializeQuantumComponents();
    
    // Clean up on unmount
    return () => {
      if (realTimeQuantumProcessor.isConnected()) {
        realTimeQuantumProcessor.disconnect();
      }
    };
  }, []);

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 space-y-8">
        <QuantumAIHeader />
        <QuantumAIDescription />
        
        <div className="grid grid-cols-1 gap-8">
          {/* AI Dashboard Tabs */}
          <QuantumAIDashboard 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
          
          {/* Quantum Coin Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <QuantumCoinVisualization coinSymbol="QNTM" />
            <QuantumBlockchainNetwork />
          </div>
          
          {/* New Components: AI Capabilities & Workflow Optimizer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <QuantumAICapabilities />
            <RealTimeWorkflowOptimizer />
          </div>
          
          {/* Data Science and IoT Capabilities */}
          <DataScienceAICapabilities />
          
          {/* Grid for AI Engine and Chat */}
          <QuantumAIEngineLayout />
          
          {/* Super AI Metrics */}
          <QuantumSuperAIMetrics />
          
          {/* Workflow Integration */}
          <div>
            <QuantumWorkflowIntegration />
          </div>
        </div>
        
        <QuantumAITechnicalDocs />
      </div>
    </AppLayout>
  );
}
