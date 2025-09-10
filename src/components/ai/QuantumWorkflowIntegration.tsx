
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Box } from 'lucide-react';
import { Activity, Database, GitBranchPlus, GitMerge, Network, Shield, Brain, Cpu, Zap } from 'lucide-react';
import { WorkflowStep } from './workflow/WorkflowStep';
import { WorkflowControls } from './workflow/WorkflowControls';
import { WorkflowStatus } from './workflow/WorkflowStatus';
import { useWorkflow } from './workflow/useWorkflow';
import { toast } from 'sonner';
import { realTimeQuantumProcessor } from '@/lib/quantum/RealTimeQuantumProcessor';
import { agiModule } from '@/lib/quantum/AGIModule';
import { superAIModule } from '@/lib/quantum/SuperAIModule';

export function QuantumWorkflowIntegration() {
  // Initialize workflow steps with quantum computing and AI integration steps
  const initialSteps = [
    {
      id: 'data-collection',
      name: 'Market Data Collection',
      status: 'idle' as const,
      progress: 0,
      description: 'Collecting real-time data from 42 exchanges',
      icon: <Database className="h-5 w-5" />
    },
    {
      id: 'quantum-analysis',
      name: 'Quantum Pattern Analysis',
      status: 'idle' as const,
      progress: 0,
      description: 'Processing market patterns using quantum algorithms',
      icon: <Activity className="h-5 w-5" />,
      dependsOn: ['data-collection']
    },
    {
      id: 'neural-processing',
      name: 'Neural Network Processing',
      status: 'idle' as const,
      progress: 0,
      description: '5-layer deep neural network analysis',
      icon: <Network className="h-5 w-5" />,
      dependsOn: ['quantum-analysis']
    },
    {
      id: 'ann-integration',
      name: 'Artificial Neural Network Integration',
      status: 'idle' as const,
      progress: 0,
      description: 'Integrating ANNs with quantum blockchain',
      icon: <Brain className="h-5 w-5" />,
      dependsOn: ['neural-processing']
    },
    {
      id: 'quantum-entanglement',
      name: 'Quantum Entanglement Generation',
      status: 'idle' as const,
      progress: 0,
      description: 'Creating secure quantum entangled keys',
      icon: <Cpu className="h-5 w-5" />,
      dependsOn: ['ann-integration']
    },
    {
      id: 'agi-synthesis',
      name: 'AGI Cognitive Analysis',
      status: 'idle' as const,
      progress: 0,
      description: 'Applying human-level intelligence to data',
      icon: <Brain className="h-5 w-5" />,
      dependsOn: ['quantum-entanglement']
    },
    {
      id: 'superintelligence-optimization',
      name: 'Superintelligence Optimization',
      status: 'idle' as const,
      progress: 0,
      description: 'Applying beyond-human intelligence to optimize',
      icon: <Zap className="h-5 w-5" />,
      dependsOn: ['agi-synthesis']
    },
    {
      id: 'prediction-generation',
      name: 'Prediction Generation',
      status: 'idle' as const,
      progress: 0,
      description: 'Creating price and trend predictions',
      icon: <GitBranchPlus className="h-5 w-5" />,
      dependsOn: ['superintelligence-optimization']
    },
    {
      id: 'security-verification',
      name: 'Quantum Security Verification',
      status: 'idle' as const,
      progress: 0,
      description: 'Verifying prediction integrity using quantum cryptography',
      icon: <Shield className="h-5 w-5" />,
      dependsOn: ['prediction-generation']
    },
    {
      id: 'result-integration',
      name: 'Results Integration',
      status: 'idle' as const,
      progress: 0,
      description: 'Integrating results with trading systems',
      icon: <GitMerge className="h-5 w-5" />,
      dependsOn: ['security-verification']
    }
  ];

  const { 
    workflowSteps, 
    isRunning, 
    activeStep,
    runWorkflow,
    resetWorkflow,
    lastExecutionTime,
    errors,
    isValidated,
    quantumEntanglement,
    neuralNetworkAccuracy,
    agiSynthesisLevel,
    superintelligenceScore
  } = useWorkflow(initialSteps);

  // Get current step name for display
  const currentStepName = activeStep ? 
    workflowSteps.find(step => step.id === activeStep)?.name : 
    undefined;
    
  // Connect to real-time quantum processor when component mounts
  useEffect(() => {
    try {
      // Connect to the real-time processor if not already connected
      if (!realTimeQuantumProcessor.isConnected()) {
        realTimeQuantumProcessor.connect();
        
        // Add event listener for connection status
        const unsubscribe = realTimeQuantumProcessor.addEventListener('connect', () => {
          toast.success("Connected to Quantum Processing Network", {
            description: "Quantum-resistant cryptography activated",
            icon: <Zap className="h-5 w-5 text-purple-400" />
          });
        });
        
        // Initialize AGI module with a test processing
        agiModule.processInput({
          operation: "workflow_initialize",
          complexity: "medium"
        });
        
        return () => {
          unsubscribe();
          realTimeQuantumProcessor.disconnect();
        };
      }
    } catch (error) {
      console.error("Failed to connect to quantum processor:", error);
    }
  }, []);

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5 text-purple-400" />
            <span>Quantum AI Workflow Integration</span>
            {quantumEntanglement > 80 && (
              <span className="text-xs bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded-full flex items-center">
                <Cpu className="h-3 w-3 mr-1" /> Quantum Enhanced
              </span>
            )}
            {superintelligenceScore > 70 && (
              <span className="text-xs bg-yellow-900/40 text-yellow-300 px-2 py-0.5 rounded-full flex items-center ml-2">
                <Zap className="h-3 w-3 mr-1" /> Superintelligence Active
              </span>
            )}
          </CardTitle>
          <WorkflowControls 
            runWorkflow={runWorkflow} 
            resetWorkflow={resetWorkflow} 
            isRunning={isRunning}
            hasErrors={errors.length > 0}
            isValidated={isValidated}
            quantumEntanglement={quantumEntanglement}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {workflowSteps.map((step, index) => (
              <WorkflowStep 
                key={step.id}
                step={step}
                activeStep={activeStep}
                workflowSteps={workflowSteps}
                isLastStep={index === workflowSteps.length - 1}
              />
            ))}
          </div>
          
          <WorkflowStatus 
            isRunning={isRunning} 
            lastExecutionTime={lastExecutionTime ? new Date(lastExecutionTime) : null}
            currentStep={currentStepName}
            errors={errors}
            quantumEntanglement={quantumEntanglement}
            neuralNetworkAccuracy={neuralNetworkAccuracy}
            agiSynthesisLevel={agiSynthesisLevel}
            superintelligenceScore={superintelligenceScore}
          />
        </div>
      </CardContent>
    </Card>
  );
}
