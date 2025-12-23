/**
 * Blockchain-ANN Integration Page
 * 
 * Main page for the Blockchain-ANN combined architecture system
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlockchainANNDashboard } from '@/components/blockchain-ann/BlockchainANNDashboard';
import { LayerConfiguration, ConfigurationData } from '@/components/blockchain-ann/LayerConfiguration';
import { WorkflowBuilder, WorkflowData } from '@/components/blockchain-ann/WorkflowBuilder';
import { AnomalyDetectionPanel } from '@/components/blockchain-ann/AnomalyDetectionPanel';
import { BigDataProcessorPanel } from '@/components/blockchain-ann/BigDataProcessorPanel';
import { GenomicProcessorPanel } from '@/components/blockchain-ann/GenomicProcessorPanel';
import { RealtimeMonitorPanel } from '@/components/blockchain-ann/RealtimeMonitorPanel';
import { QuantumEchoesPanel } from '@/components/blockchain-ann/QuantumEchoesPanel';
import { AgenticAIPanel } from '@/components/blockchain-ann/AgenticAIPanel';
import { QuantumCoinAGIPanel } from '@/components/blockchain-ann/QuantumCoinAGIPanel';
import { UnifiedMetricsDashboard } from '@/components/blockchain-ann/UnifiedMetricsDashboard';
import { QuantumBlockchainIntegrationPanel } from '@/components/blockchain-ann/QuantumBlockchainIntegrationPanel';
import { ComprehensiveUnifiedDashboard } from '@/components/blockchain-ann/ComprehensiveUnifiedDashboard';
import { AIAnomalyPredictionPanel } from '@/components/blockchain-ann/AIAnomalyPredictionPanel';
import { useBlockchainANN } from '@/hooks/useBlockchainANN';
import { useWorkflowExecution } from '@/hooks/useWorkflowExecution';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Network, Brain, Workflow, Settings, Play, Activity, Database, Dna, Waves, Bot, Coins, BarChart3, Cpu, Sparkles } from 'lucide-react';

export default function BlockchainANN() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();
  
  const {
    architecture,
    deployedModels,
    metrics,
    isLoading,
    initializeArchitecture,
    deployModel,
    trainModel
  } = useBlockchainANN();

  const {
    currentWorkflow,
    isExecuting,
    executionProgress,
    createWorkflow,
    executeWorkflow
  } = useWorkflowExecution();

  const handleSaveConfiguration = async (config: ConfigurationData) => {
    try {
      const arch = await initializeArchitecture({
        name: 'Custom Architecture',
        consensusType: config.blockchainConfig.consensusType,
        quantumEnabled: config.quantumEnabled,
        blockchainNodes: config.blockchainConfig.nodes,
        annLayers: config.annConfig.layers.map(layer => ({
          type: layer.type,
          neurons: layer.neurons,
          activationFunction: layer.activation,
          dropout: layer.dropout
        }))
      });

      toast({
        title: "Configuration Saved",
        description: "Architecture initialized successfully",
      });

      setActiveTab('dashboard');
    } catch (error) {
      console.error('Configuration error:', error);
    }
  };

  const handleSaveWorkflow = (workflowData: WorkflowData) => {
    if (!architecture) {
      toast({
        title: "Architecture Required",
        description: "Please configure architecture first",
        variant: "destructive"
      });
      return;
    }

    createWorkflow({
      ...workflowData,
      architecture,
      trainingConfig: {
        epochs: 100,
        batchSize: 32,
        learningRate: 0.001,
        optimizer: 'adam',
        lossFunction: 'categorical_crossentropy',
        validationSplit: 0.2,
        distributedNodes: 10,
        blockchainVerification: true,
        quantumEnhancement: architecture.quantumEnabled
      }
    });

    toast({
      title: "Workflow Saved",
      description: `${workflowData.name} is ready to execute`,
    });
  };

  const handleExecuteWorkflow = async (workflowData: WorkflowData) => {
    if (!architecture) {
      toast({
        title: "Architecture Required",
        description: "Please configure architecture first",
        variant: "destructive"
      });
      return;
    }

    const workflow = createWorkflow({
      ...workflowData,
      architecture,
      trainingConfig: {
        epochs: 100,
        batchSize: 32,
        learningRate: 0.001,
        optimizer: 'adam',
        lossFunction: 'categorical_crossentropy',
        validationSplit: 0.2,
        distributedNodes: 10,
        blockchainVerification: true,
        quantumEnhancement: architecture.quantumEnabled
      }
    });

    await executeWorkflow(workflow.id);
    setActiveTab('dashboard');
  };

  const handleQuickStart = async () => {
    // Quick start with default configuration
    try {
      const arch = await initializeArchitecture({
        name: 'QuickStart Architecture',
        consensusType: 'proof-of-neural-work',
        quantumEnabled: true,
        blockchainNodes: 10,
        annLayers: [
          { type: 'input', neurons: 784, activationFunction: 'relu' as const },
          { type: 'hidden', neurons: 128, activationFunction: 'relu' as const, dropout: 0.2 },
          { type: 'hidden', neurons: 64, activationFunction: 'relu' as const, dropout: 0.2 },
          { type: 'output', neurons: 10, activationFunction: 'softmax' as const }
        ]
      });

      // Create and execute demo workflow
      const workflow = createWorkflow({
        name: 'Demo Training Workflow',
        description: 'Automated blockchain-verified neural network training',
        architecture: arch,
        trainingConfig: {
          epochs: 50,
          batchSize: 32,
          learningRate: 0.001,
          optimizer: 'adam',
          lossFunction: 'categorical_crossentropy',
          validationSplit: 0.2,
          distributedNodes: 10,
          blockchainVerification: true,
          quantumEnhancement: true
        },
        steps: [
          { name: 'Load Training Data', type: 'data-loading' },
          { name: 'Preprocess Data', type: 'preprocessing' },
          { name: 'Train Model', type: 'training' },
          { name: 'Validate Model', type: 'validation' },
          { name: 'Deploy to Blockchain', type: 'deployment' }
        ]
      });

      await executeWorkflow(workflow.id);
      setActiveTab('dashboard');

      toast({
        title: "Quick Start Launched",
        description: "Demo workflow is now running",
      });
    } catch (error) {
      console.error('Quick start error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Blockchain + ANN Architecture
              </h1>
              <p className="text-muted-foreground text-lg">
                Decentralized Neural Network Training & Deployment Platform
              </p>
            </div>
            {!architecture && (
              <Button onClick={handleQuickStart} size="lg" disabled={isLoading}>
                <Play className="mr-2 h-5 w-5" />
                Quick Start Demo
              </Button>
            )}
          </div>
        </div>

        {!architecture ? (
          <Card className="border-2 border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Get Started
              </CardTitle>
              <CardDescription>
                Configure your blockchain-ANN architecture or launch a quick demo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col gap-2"
                  onClick={handleQuickStart}
                  disabled={isLoading}
                >
                  <Play className="h-8 w-8" />
                  <span>Quick Start Demo</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col gap-2"
                  onClick={() => setActiveTab('configure')}
                >
                  <Settings className="h-8 w-8" />
                  <span>Custom Configuration</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col gap-2"
                  onClick={() => setActiveTab('workflow')}
                >
                  <Workflow className="h-8 w-8" />
                  <span>Build Workflow</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7 lg:grid-cols-13 lg:w-auto lg:inline-grid">
              <TabsTrigger value="dashboard">
                <Network className="mr-2 h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="unified">
                <BarChart3 className="mr-2 h-4 w-4" />
                Unified
              </TabsTrigger>
              <TabsTrigger value="integration">
                <Cpu className="mr-2 h-4 w-4" />
                Integration
              </TabsTrigger>
              <TabsTrigger value="ai-prediction">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Predict
              </TabsTrigger>
              <TabsTrigger value="realtime">
                <Activity className="mr-2 h-4 w-4" />
                Real-Time
              </TabsTrigger>
              <TabsTrigger value="quantum-echoes">
                <Waves className="mr-2 h-4 w-4" />
                Quantum Echoes
              </TabsTrigger>
              <TabsTrigger value="agentic-ai">
                <Bot className="mr-2 h-4 w-4" />
                Agentic AI
              </TabsTrigger>
              <TabsTrigger value="quantum-coin-agi">
                <Coins className="mr-2 h-4 w-4" />
                QCoin AGI
              </TabsTrigger>
              <TabsTrigger value="anomaly">
                <Activity className="mr-2 h-4 w-4" />
                Anomaly
              </TabsTrigger>
              <TabsTrigger value="bigdata">
                <Database className="mr-2 h-4 w-4" />
                Big Data
              </TabsTrigger>
              <TabsTrigger value="genomic">
                <Dna className="mr-2 h-4 w-4" />
                Genomic
              </TabsTrigger>
              <TabsTrigger value="workflow">
                <Workflow className="mr-2 h-4 w-4" />
                Workflow
              </TabsTrigger>
              <TabsTrigger value="models">
                <Brain className="mr-2 h-4 w-4" />
                Models
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <BlockchainANNDashboard />
            </TabsContent>

            <TabsContent value="unified" className="space-y-6">
              <ComprehensiveUnifiedDashboard />
            </TabsContent>

            <TabsContent value="integration" className="space-y-6">
              <QuantumBlockchainIntegrationPanel />
            </TabsContent>

            <TabsContent value="ai-prediction" className="space-y-6">
              <AIAnomalyPredictionPanel />
            </TabsContent>

            <TabsContent value="realtime" className="space-y-6">
              <RealtimeMonitorPanel />
            </TabsContent>

            <TabsContent value="quantum-echoes" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <QuantumEchoesPanel />
                <Card className="border-primary/20 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Waves className="h-5 w-5" />
                      20 Pattern Layer Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      The Quantum Echoes Algorithm implements 20 distinct security pattern layers
                      for quantum-resistant data transfer and verification.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        'Entanglement-Init', 'Superposition-Gate', 'Phase-Encoding', 'Echo-Propagation',
                        'Interference-Check', 'Decoherence-Guard', 'Key-Distribution', 'Bell-State-Verify',
                        'Quantum-Signature', 'Error-Correction', 'Tomography-Scan', 'Fidelity-Assessment',
                        'Noise-Mitigation', 'Coherence-Extension', 'Multi-Party-Sync', 'Blockchain-Anchor',
                        'Neural-Validation', 'Consensus-Gate', 'Echo-Finalization', 'Transfer-Complete'
                      ].map((layer, idx) => (
                        <div key={idx} className="p-2 rounded bg-muted flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span>{layer}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="agentic-ai" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <AgenticAIPanel />
                <Card className="border-primary/20 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      Q-Learning Formula
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted font-mono text-center">
                      Q(s,a) = Q(s,a) + α[r + γ max Q(s',a') - Q(s,a)]
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">α (Learning Rate)</span>
                        <span className="font-mono">0.1</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">γ (Discount Factor)</span>
                        <span className="font-mono">0.95</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ε (Exploration Rate)</span>
                        <span className="font-mono">0.2</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Autonomous agents learn optimal blockchain operations through 
                      reinforcement learning with neural network integration.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="quantum-coin-agi" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <QuantumCoinAGIPanel />
                <Card className="border-primary/20 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coins className="h-5 w-5" />
                      AGI Workflow Stages
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {[
                        { name: 'Quantum State Preparation', desc: 'Initialize 128 qubits with 64 entanglement pairs' },
                        { name: 'AGI Transaction Analysis', desc: 'AI-powered risk assessment and optimization' },
                        { name: 'Quantum Optimization', desc: 'Apply quantum algorithms for route optimization' },
                        { name: 'Blockchain Verification', desc: 'Immutable verification on-chain' },
                        { name: 'Superintelligence Synthesis', desc: 'Generate advanced insights and predictions' }
                      ].map((stage, idx) => (
                        <div key={idx} className="p-3 rounded bg-muted">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-sm">{stage.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 ml-8">{stage.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="anomaly" className="space-y-6">
              <AnomalyDetectionPanel />
            </TabsContent>

            <TabsContent value="bigdata" className="space-y-6">
              <BigDataProcessorPanel />
            </TabsContent>

            <TabsContent value="genomic" className="space-y-6">
              <GenomicProcessorPanel />
            </TabsContent>

            <TabsContent value="workflow" className="space-y-6">
              <WorkflowBuilder 
                onSave={handleSaveWorkflow}
                onExecute={handleExecuteWorkflow}
              />
            </TabsContent>

            <TabsContent value="models" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Deployed Models</CardTitle>
                  <CardDescription>
                    Neural networks deployed on blockchain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {deployedModels.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Brain className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No models deployed yet</p>
                      <p className="text-sm">Create and execute a workflow to deploy your first model</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {deployedModels.map((model, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">{model.modelId}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Contract: {model.contractAddress.substring(0, 20)}...
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold">
                                  Accuracy: {(model.accuracy * 100).toFixed(2)}%
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Consensus: {(model.consensusScore * 100).toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
