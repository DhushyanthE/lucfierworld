
import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Cpu, Brain, Network, LineChart, RefreshCw, 
  Link2, Shield, ArrowRight, Database
} from 'lucide-react';
import { AIChat } from '@/components/chat/AIChat';
import { QuantumWorkflowIntegration } from '@/components/ai/QuantumWorkflowIntegration';
import { QuantumWorkflow as QuantumWorkflowComponent } from '@/components/tokenomics/QuantumWorkflow';
import { RealTimeWorkflowOptimizer } from '@/components/ai/workflow-optimizer';
import { useQuantumAnalysis } from '@/components/tokenomics/analysis/useQuantumAnalysis';
import { realTimeQuantumProcessor } from '@/lib/quantum/RealTimeQuantumProcessor';
import { quantumWorkflowHandler } from '@/lib/quantum/QuantumWorkflowHandler';
import { BigDataWorkflow } from '@/components/ai/BigDataWorkflow';

export default function QuantumWorkflow() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isConnecting, setIsConnecting] = useState(false);
  const { 
    workflow, 
    startWorkflow, 
    resetWorkflow, 
    aiConfidence,
    neuralNetworkActive,
    toggleNeuralNetwork 
  } = useQuantumAnalysis();
  
  useEffect(() => {
    // Initialize quantum processor and workflow handler
    const initQuantumServices = async () => {
      setIsConnecting(true);
      
      try {
        // Start the workflow handler
        quantumWorkflowHandler.start();
        
        // Connect to real-time quantum processor
        if (!realTimeQuantumProcessor.isConnected()) {
          await realTimeQuantumProcessor.connect();
        }
        
        toast.success("Quantum workflow system connected", {
          description: "All quantum services are active and ready"
        });
      } catch (error) {
        console.error("Failed to initialize quantum services:", error);
        toast.error("Connection failed", {
          description: "Unable to connect to quantum services"
        });
      } finally {
        setIsConnecting(false);
      }
    };
    
    initQuantumServices();
    
    // Clean up on unmount
    return () => {
      quantumWorkflowHandler.stop();
      if (realTimeQuantumProcessor.isConnected()) {
        realTimeQuantumProcessor.disconnect();
      }
    };
  }, []);

  // Fix for reconnect method that doesn't exist
  const handleReconnect = () => {
    if (realTimeQuantumProcessor.isConnected()) {
      realTimeQuantumProcessor.disconnect();
    }
    realTimeQuantumProcessor.connect();
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Network className="h-6 w-6 text-purple-400" />
            Enhanced AGI-Driven Workflow
          </h1>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleNeuralNetwork}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
            >
              <Brain className="w-4 h-4 mr-2" />
              {neuralNetworkActive ? 'Disable Neural Network' : 'Enable Neural Network'}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReconnect}
              disabled={isConnecting}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
            >
              {isConnecting ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Reconnect Services
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl mx-auto">
            <TabsTrigger value="dashboard">
              <LineChart className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="workflow">
              <Network className="w-4 h-4 mr-2" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="quantum">
              <Cpu className="w-4 h-4 mr-2" />
              Quantum
            </TabsTrigger>
            <TabsTrigger value="bigdata">
              <Database className="w-4 h-4 mr-2" />
              Big Data
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Brain className="w-4 h-4 mr-2" />
              AI Assistant
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RealTimeWorkflowOptimizer />
              
              <Card className="bg-black/40 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-400" />
                    System Architecture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900/70 p-4 rounded-lg text-xs text-gray-300 font-mono whitespace-pre overflow-auto h-[350px]">
{`┌──────────┐      Secure API      ┌───────────────┐
│ IoT      │────────────────────▶│ Ingest Service│
│ Devices  │                     └──────┬────────┘
└──────────┘                            │ Message Bus
                                        ▼
                                  ┌───────────────┐
                                  │  Event Bus    │
                                  └─┬───────────┬─┘
            ┌──────────────────────┘           └──────────────────────┐
            │                                                         │
            ▼                                                         ▼
┌──────────────────────────┐                         ┌──────────────────────────┐
│Anomaly Detection Service │                         │   AGI Orchestrator      │
│   (Quantum Enhanced)     │                         │ (Multi-Agent System)    │
└───────────┬───────────────┘                        └─────┬──────────────────┘
            │   anomaly, score, context                    │
            └──────────┬──────────────────────────────────┘
                      ▼
            ┌───────────────────────────┐
            │  Reasoning & Planning     │
            │ – Chain-of-Thought        │
            │ – Smart-Contract Generator│
            └───────────┬───────────────┘
                        │ plan, optimized code
                        ▼
            ┌───────────────────────────┐
            │  Blockchain Oracle        │◀── On-chain events
            │  (Quantum Coin Network)   │
            └───────────┬───────────────┘
                        │ tx, events
                        ▼
            ┌───────────────────────────┐
            │  Quantum Coin L1          │
            └───────────┬───────────────┘
                        │ events
                        ▼
            ┌───────────────────────────┐
            │ Off-Chain Indexer & DB    │
            └───────────┬───────────────┘
                        │ pub/sub
                        ▼
            ┌───────────────────────────┐
            │ Real-time Dashboard       │
            └───────────────────────────┘`}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-black/40 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-purple-400" />
                    Technology Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gray-900/50 p-4 rounded-lg space-y-3">
                      <h3 className="text-white font-medium flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-400" />
                        Advanced AGI
                      </h3>
                      <ul className="text-sm text-gray-400 space-y-2 pl-6">
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-purple-400 shrink-0" />
                          <span>Neural network analysis</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-purple-400 shrink-0" />
                          <span>Multi-agent orchestration</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-purple-400 shrink-0" />
                          <span>Reinforcement learning</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-purple-400 shrink-0" />
                          <span>Anomaly detection</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-900/50 p-4 rounded-lg space-y-3">
                      <h3 className="text-white font-medium flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-purple-400" />
                        Quantum Systems
                      </h3>
                      <ul className="text-sm text-gray-400 space-y-2 pl-6">
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-purple-400 shrink-0" />
                          <span>Quantum-resistant cryptography</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-purple-400 shrink-0" />
                          <span>Quantum key distribution</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-purple-400 shrink-0" />
                          <span>Quantum machine learning</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-purple-400 shrink-0" />
                          <span>Quantum circuit optimization</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-900/50 p-4 rounded-lg space-y-3">
                      <h3 className="text-white font-medium flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-purple-400" />
                        Blockchain Technology
                      </h3>
                      <ul className="text-sm text-gray-400 space-y-2 pl-6">
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-purple-400 shrink-0" />
                          <span>Decentralized consensus</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-purple-400 shrink-0" />
                          <span>Smart contract automation</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-purple-400 shrink-0" />
                          <span>Oracle integration</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-purple-400 shrink-0" />
                          <span>Cross-chain interoperability</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-900/50 p-4 rounded-lg space-y-3">
                      <h3 className="text-white font-medium flex items-center gap-2">
                        <Database className="h-4 w-4 text-purple-400" />
                        Big Data Systems
                      </h3>
                      <ul className="text-sm text-gray-400 space-y-2 pl-6">
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-purple-400 shrink-0" />
                          <span>Distributed processing</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-purple-400 shrink-0" />
                          <span>Quantum data compression</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-purple-400 shrink-0" />
                          <span>Real-time analytics</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-purple-400 shrink-0" />
                          <span>Petabyte-scale storage</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="workflow">
            <div className="grid grid-cols-1 gap-6">
              <QuantumWorkflowIntegration />
              <QuantumWorkflowComponent />
            </div>
          </TabsContent>
          
          <TabsContent value="quantum">
            <RealTimeWorkflowOptimizer />
          </TabsContent>
          
          <TabsContent value="bigdata">
            <BigDataWorkflow />
          </TabsContent>
          
          <TabsContent value="ai">
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <AIChat />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
