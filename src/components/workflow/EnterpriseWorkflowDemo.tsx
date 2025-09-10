
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, ArrowRight, Check, RefreshCw, AlertTriangle, Ship } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkflowOrchestrator } from '@/hooks/useWorkflowOrchestrator';
import { WorkflowStepDefinition } from '@/lib/quantum/workflow/types/WorkflowStepTypes';
import { Badge } from '@/components/ui/badge';
import { projectMarinerRealtimeService, MarinerWorkflowProgress } from '@/services/realtime/ProjectMarinerRealtimeService';
import { adaptWorkflow } from '@/lib/quantum/workflow/adapters/WorkflowTypeAdapter';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';

export function EnterpriseWorkflowDemo() {
  const [marinerWorkflowId, setMarinerWorkflowId] = useState<string | null>(null);
  const [workflowStatus, setWorkflowStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [realtimeProgress, setRealtimeProgress] = useState<MarinerWorkflowProgress | null>(null);
  
  const { 
    createWorkflow,
    startWorkflow,
    createWorkflowStep,
    getWorkflowDetails,
    activeWorkflowSteps,
    stepResults,
    isLoading,
    error,
  } = useWorkflowOrchestrator({
    autoConnect: true,
    enableRealTimeUpdates: true,
    onWorkflowComplete: (workflowId, results) => {
      toast.success('Enterprise workflow completed!', {
        description: `All steps executed successfully.`
      });
      setWorkflowStatus('completed');
    },
    onStepComplete: (workflowId, stepId, result) => {
      if (workflowId === marinerWorkflowId) {
        toast.info(`Step completed: ${activeWorkflowSteps.find(step => step.id === stepId)?.name || stepId}`);
      }
    },
    onError: (error) => {
      toast.error('Workflow error', { description: error });
      setWorkflowStatus('failed');
    }
  });

  // Listen for real-time workflow updates
  useEffect(() => {
    const handleWorkflowStarted = (progress: MarinerWorkflowProgress) => {
      if (progress.workflowId === marinerWorkflowId) {
        setRealtimeProgress(progress);
        setWorkflowStatus('running');
      }
    };

    const handleWorkflowProgress = (progress: MarinerWorkflowProgress) => {
      if (progress.workflowId === marinerWorkflowId) {
        setRealtimeProgress(progress);
      }
    };

    const handleWorkflowCompleted = (progress: MarinerWorkflowProgress) => {
      if (progress.workflowId === marinerWorkflowId) {
        setRealtimeProgress(progress);
        setWorkflowStatus('completed');
      }
    };

    projectMarinerRealtimeService.on('workflowStarted', handleWorkflowStarted);
    projectMarinerRealtimeService.on('workflowProgress', handleWorkflowProgress);
    projectMarinerRealtimeService.on('workflowCompleted', handleWorkflowCompleted);

    return () => {
      projectMarinerRealtimeService.off('workflowStarted', handleWorkflowStarted);
      projectMarinerRealtimeService.off('workflowProgress', handleWorkflowProgress);
      projectMarinerRealtimeService.off('workflowCompleted', handleWorkflowCompleted);
    };
  }, [marinerWorkflowId]);

  // Initialize Enterprise workflow
  const createEnterpriseWorkflow = () => {
    // Define workflow steps
    const enterpriseSteps: WorkflowStepDefinition[] = [
      createWorkflowStep('System Initialization', 'agiPlan', {
        objective: 'Initialize Enterprise systems',
        priority: 'high'
      }),
      createWorkflowStep('Quantum Security Protocol', 'quantumCoin', {
        algorithm: 'QRNG-enhanced',
        encryptionLevel: 'maximum'
      }),
      createWorkflowStep('Navigation System Calibration', 'analysis', {
        dataSource: 'stellarCartography',
        precision: 'high'
      }),
      createWorkflowStep('Deep Space Communication', 'quantum', {
        entangledPairs: 128,
        coherenceTarget: 0.99
      }),
      createWorkflowStep('Stellar Analysis', 'genomicsVerify', {
        sequenceDepth: 'full',
        species: 'spaceVertebrates'
      }),
      createWorkflowStep('Space Current Analysis', 'mlInfer', {
        modelId: 'spaceography-v2',
        dataPoints: 5000
      }),
      createWorkflowStep('Trajectory Calculation', 'mlTrain', {
        modelId: 'trajectory-predictor',
        epochs: 50
      }),
      createWorkflowStep('Mission Data Storage', 'bigData', {
        storage: 'quantum-resilient',
        redundancy: 3
      }),
      createWorkflowStep('Results Publishing', 'gitCommit', {
        path: 'results/enterprise/${timestamp}.json',
        branch: 'mission-data'
      })
    ];

    // Create the workflow with required id field
    const workflowId = createWorkflow({
      id: uuidv4(),
      name: "Enterprise Exploration Workflow",
      steps: enterpriseSteps,
      metadata: {
        project: 'Enterprise',
        version: '1.0.0',
        classification: 'deep-space-exploration'
      }
    });

    setMarinerWorkflowId(workflowId);
    return workflowId;
  };

  // Start the workflow
  const launchEnterpriseWorkflow = () => {
    let workflowId = marinerWorkflowId;
    
    if (!workflowId) {
      workflowId = createEnterpriseWorkflow();
    }
    
    if (startWorkflow(workflowId)) {
      setWorkflowStatus('running');
      
      // Start real-time monitoring
      projectMarinerRealtimeService.startMarinerWorkflow(workflowId, "Enterprise Exploration Workflow");
      
      toast.info('Enterprise workflow started', {
        description: 'Initializing deep space exploration systems'
      });
    }
  };

  // Load workflow details if available
  useEffect(() => {
    if (marinerWorkflowId) {
      getWorkflowDetails(marinerWorkflowId);
    }
  }, [marinerWorkflowId]);

  return (
    <Card className="bg-black/70 border-blue-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5 text-blue-400" />
            <span>Enterprise Workflow</span>
            {workflowStatus === 'running' && (
              <Badge variant="outline" className="bg-blue-900/40 text-blue-300 border-blue-500/30 animate-pulse">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Running
              </Badge>
            )}
            {workflowStatus === 'completed' && (
              <Badge variant="outline" className="bg-green-900/40 text-green-300 border-green-500/30">
                <Check className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
            {workflowStatus === 'failed' && (
              <Badge variant="outline" className="bg-red-900/40 text-red-300 border-red-500/30">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Failed
              </Badge>
            )}
          </CardTitle>
          
          <Button
            variant="outline"
            size="sm"
            onClick={launchEnterpriseWorkflow}
            disabled={workflowStatus === 'running' || isLoading}
            className={`${
              workflowStatus !== 'running'
                ? 'bg-blue-900/30 border-blue-500/30 text-blue-300 hover:bg-blue-900/50'
                : 'bg-gray-900/30 border-gray-700 text-gray-400'
            }`}
          >
            {workflowStatus === 'running' ? (
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Rocket className="h-4 w-4 mr-1" />
            )}
            {workflowStatus === 'running' ? "Processing..." : "Launch Workflow"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {/* Real-time Progress Display */}
          {realtimeProgress && (
            <div className="p-3 rounded-md bg-blue-900/20 border border-blue-500/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-300">
                  Current Step: {realtimeProgress.currentStep}
                </span>
                <span className="text-sm text-blue-400">
                  {realtimeProgress.progress.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(realtimeProgress.progress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Data Collected: {realtimeProgress.dataCollected}</span>
                <span>ETA: {new Date(realtimeProgress.estimatedCompletion).toLocaleTimeString()}</span>
              </div>
            </div>
          )}

          {/* Workflow Steps Display */}
          <div className="space-y-2">
            {activeWorkflowSteps.map((step, index) => {
              const stepResult = marinerWorkflowId ? stepResults[step.id] : undefined;
              const isCompleted = stepResult && stepResult.success;
              const isFailed = stepResult && !stepResult.success;
              const isActive = workflowStatus === 'running' && !isCompleted && !isFailed && 
                activeWorkflowSteps.slice(0, index).every(s => marinerWorkflowId && stepResults[s.id]?.success);
              
              return (
                <div 
                  key={step.id}
                  className={`p-3 rounded-md border flex items-center justify-between ${
                    isActive ? 'bg-blue-900/20 border-blue-500/30 animate-pulse' :
                    isCompleted ? 'bg-green-900/20 border-green-500/30' :
                    isFailed ? 'bg-red-900/20 border-red-500/30' :
                    'bg-gray-900/40 border-gray-700/50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-bold bg-gray-800 text-gray-300">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{step.name}</span>
                  </div>
                  <div>
                    {isActive && <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />}
                    {isCompleted && <Check className="h-4 w-4 text-green-400" />}
                    {isFailed && <AlertTriangle className="h-4 w-4 text-red-400" />}
                    {!isActive && !isCompleted && !isFailed && (
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              );
            })}
            
            {activeWorkflowSteps.length === 0 && workflowStatus === 'idle' && (
              <div className="text-center p-6 text-gray-400">
                <Ship className="h-16 w-16 mx-auto mb-4 text-blue-500/30" />
                <p>Enterprise workflow is ready to launch.</p>
                <p className="text-sm mt-2">Click the "Launch Workflow" button to start the deep space exploration process.</p>
              </div>
            )}
          </div>
          
          {error && (
            <div className="p-3 rounded-md border bg-red-900/20 border-red-500/30 text-red-300">
              <p className="text-sm font-medium">Error: {error}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
