
import React from "react";
import { Brain, BrainCircuit, Network, BookOpen, Activity, Shield, Bot, Server } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuantumNeuralNetwork } from "@/components/ai/QuantumNeuralNetwork";
import { QuantumAITraining } from "@/components/ai/QuantumAITraining";
import { QuantumFidelityMetrics } from "@/components/ai/QuantumFidelityMetrics";
import { QuantumDeepLearningDashboard } from "@/components/ai/QuantumDeepLearningDashboard";
import { QuantumNeuralNetworkFlow } from "@/components/ai/neural-network/QuantumNeuralNetworkFlow";
import { EnhancedNeuralNetworkFlow } from "@/components/ai/neural-network/EnhancedNeuralNetworkFlow";
import { InteractiveWorkflowManager } from "@/components/ai/deep-learning/InteractiveWorkflowManager";
import { EnhancedAGIDashboard } from "@/components/ai/agi/EnhancedAGIDashboard";
import { ImprovedAGIDashboard } from "@/components/ai/agi/ImprovedAGIDashboard";
import { QuantumBlockchainPlatform } from "@/components/ai/quantum-blockchain/QuantumBlockchainPlatform";
import { QuantumAITrainingAdvanced } from "@/components/ai/quantum-blockchain/QuantumAITrainingAdvanced";
import { AutonomousAgentSystem } from "@/components/ai/quantum-blockchain/AutonomousAgentSystem";
import { TechnicalArchitecture } from "@/components/ai/quantum-blockchain/TechnicalArchitecture";

interface QuantumAIDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function QuantumAIDashboard({ activeTab, setActiveTab }: QuantumAIDashboardProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4 lg:grid-cols-9 mb-4 w-full overflow-x-auto">
        <TabsTrigger value="neural" className="min-w-0">
          <Brain className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Neural Network</span>
          <span className="sm:hidden">Neural</span>
        </TabsTrigger>
        <TabsTrigger value="flow" className="min-w-0">
          <Activity className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Network Flow</span>
          <span className="sm:hidden">Flow</span>
        </TabsTrigger>
        <TabsTrigger value="platform" className="min-w-0">
          <Shield className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Platform</span>
          <span className="sm:hidden">Platform</span>
        </TabsTrigger>
        <TabsTrigger value="training-advanced" className="min-w-0">
          <BrainCircuit className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Advanced Training</span>
          <span className="sm:hidden">Training</span>
        </TabsTrigger>
        <TabsTrigger value="agents" className="min-w-0">
          <Bot className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Autonomous Agents</span>
          <span className="sm:hidden">Agents</span>
        </TabsTrigger>
        <TabsTrigger value="architecture" className="min-w-0">
          <Server className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Architecture</span>
          <span className="sm:hidden">Arch</span>
        </TabsTrigger>
        <TabsTrigger value="fidelity" className="min-w-0">
          <Network className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Fidelity</span>
          <span className="sm:hidden">Fidelity</span>
        </TabsTrigger>
        <TabsTrigger value="learning" className="min-w-0">
          <BookOpen className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Deep Learning</span>
          <span className="sm:hidden">Learning</span>
        </TabsTrigger>
        <TabsTrigger value="agi" className="min-w-0">
          <BrainCircuit className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Enhanced AGI</span>
          <span className="sm:hidden">AGI</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="neural">
        <QuantumNeuralNetwork tokenSymbol="QNTM" />
      </TabsContent>

      <TabsContent value="flow">
        <div className="space-y-8">
          <EnhancedNeuralNetworkFlow />
          <InteractiveWorkflowManager />
        </div>
      </TabsContent>

      <TabsContent value="platform">
        <QuantumBlockchainPlatform />
      </TabsContent>

      <TabsContent value="training-advanced">
        <QuantumAITrainingAdvanced />
      </TabsContent>

      <TabsContent value="agents">
        <AutonomousAgentSystem />
      </TabsContent>

      <TabsContent value="architecture">
        <TechnicalArchitecture />
      </TabsContent>

      <TabsContent value="fidelity">
        <QuantumFidelityMetrics />
      </TabsContent>
      
      <TabsContent value="learning">
        <QuantumDeepLearningDashboard />
      </TabsContent>

      <TabsContent value="agi">
        <ImprovedAGIDashboard />
      </TabsContent>
    </Tabs>
  );
}
