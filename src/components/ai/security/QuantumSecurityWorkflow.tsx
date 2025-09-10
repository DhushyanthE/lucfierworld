
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Brain, Activity, Workflow, Cpu, Zap, Check } from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  isQuantum: boolean;
}

export function QuantumSecurityWorkflow() {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    {
      id: 'threat-detection',
      name: 'Quantum Threat Detection',
      description: 'Scanning for potential quantum-based attack vectors',
      status: 'pending',
      progress: 0,
      isQuantum: true
    },
    {
      id: 'cryptographic-analysis',
      name: 'Cryptographic Analysis',
      description: 'Evaluating cryptographic algorithm resistance',
      status: 'pending',
      progress: 0,
      isQuantum: true
    },
    {
      id: 'neural-verification',
      name: 'Neural Network Verification',
      description: 'Verifying AI model security parameters',
      status: 'pending',
      progress: 0,
      isQuantum: false
    },
    {
      id: 'quantum-key-distribution',
      name: 'Quantum Key Distribution',
      description: 'Generating quantum-resistant encryption keys',
      status: 'pending',
      progress: 0,
      isQuantum: true
    },
    {
      id: 'security-policy',
      name: 'Security Policy Enforcement',
      description: 'Applying quantum security policies to system',
      status: 'pending',
      progress: 0,
      isQuantum: false
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [quantumEntanglementScore, setQuantumEntanglementScore] = useState(0);

  useEffect(() => {
    if (isRunning && currentStepIndex < workflowSteps.length) {
      const timer = setTimeout(() => {
        runNextStep();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isRunning, currentStepIndex, workflowSteps]);

  const startWorkflow = () => {
    if (isRunning) return;
    
    // Reset workflow
    setWorkflowSteps(steps => steps.map(step => ({
      ...step,
      status: 'pending',
      progress: 0
    })));

    setIsRunning(true);
    setCurrentStepIndex(0);
    setQuantumEntanglementScore(0);
  };

  const runNextStep = () => {
    if (currentStepIndex >= workflowSteps.length) {
      setIsRunning(false);
      return;
    }

    // Start current step
    const currentStep = workflowSteps[currentStepIndex];
    
    // Mark as running
    setWorkflowSteps(steps => steps.map((step, i) => 
      i === currentStepIndex ? { ...step, status: 'running' } : step
    ));
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setWorkflowSteps(steps => {
        const newSteps = [...steps];
        const step = newSteps[currentStepIndex];
        
        if (step && step.progress < 100) {
          // Add some quantum randomness to the progress
          const progressIncrement = step.isQuantum 
            ? 2 + Math.floor(Math.random() * 5) 
            : 4 + Math.floor(Math.random() * 3);
            
          newSteps[currentStepIndex] = {
            ...step,
            progress: Math.min(100, step.progress + progressIncrement)
          };
        } else if (step && step.progress >= 100) {
          clearInterval(progressInterval);
          
          // Update quantum entanglement score for completed quantum steps
          if (step.isQuantum) {
            setQuantumEntanglementScore(prev => Math.min(100, prev + 20));
          }
          
          // Mark as completed and move to next step
          newSteps[currentStepIndex] = {
            ...step,
            status: 'completed',
            progress: 100
          };
          
          setCurrentStepIndex(i => i + 1);
        }
        
        return newSteps;
      });
    }, 200);

    return () => clearInterval(progressInterval);
  };

  const getStatusIcon = (status: string, isQuantum: boolean) => {
    switch (status) {
      case 'running':
        return isQuantum ? <Zap className="w-4 h-4 text-purple-400 animate-pulse" /> : <Activity className="w-4 h-4 text-blue-400 animate-pulse" />;
      case 'completed':
        return <Check className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <Shield className="w-4 h-4 text-red-400" />;
      default:
        return isQuantum ? <Cpu className="w-4 h-4 text-gray-400" /> : <Workflow className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <Card className="bg-black/70 border-purple-500/20 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-400" />
            <span>Quantum Security Workflow</span>
            {quantumEntanglementScore > 50 && (
              <Badge className="bg-purple-900/60 text-purple-300">
                {quantumEntanglementScore}% Entanglement
              </Badge>
            )}
          </CardTitle>
          <Button 
            onClick={startWorkflow} 
            disabled={isRunning}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            size="sm"
          >
            {isRunning ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Processing
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Start Security Workflow
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workflowSteps.map((step) => (
            <div 
              key={step.id}
              className={`bg-black/50 border rounded-lg p-4 transition-all duration-300 ${
                step.status === 'running' ? 'border-purple-500/50 shadow-glow' : 
                step.status === 'completed' ? 'border-green-500/30' : 
                'border-gray-800'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(step.status, step.isQuantum)}
                  <span className="font-medium text-white">{step.name}</span>
                  {step.isQuantum && (
                    <Badge className="bg-purple-900/40 text-purple-300 text-xs">
                      Quantum
                    </Badge>
                  )}
                </div>
                <Badge className={`
                  ${step.status === 'pending' ? 'bg-gray-800 text-gray-400' : 
                    step.status === 'running' ? 'bg-blue-900/60 text-blue-300 animate-pulse' : 
                    step.status === 'completed' ? 'bg-green-900/60 text-green-300' : 
                    'bg-red-900/60 text-red-300'}`
                }>
                  {step.status === 'pending' ? 'Pending' : 
                   step.status === 'running' ? 'Processing' : 
                   step.status === 'completed' ? 'Completed' : 'Failed'}
                </Badge>
              </div>
              
              <p className="text-xs text-gray-400 mb-3">{step.description}</p>
              
              <div className="relative">
                <Progress 
                  value={step.progress} 
                  className={`h-1.5 ${
                    step.isQuantum 
                      ? 'bg-black/50 bg-gradient-to-r from-purple-600 to-indigo-400' 
                      : 'bg-black/50 bg-gradient-to-r from-blue-600 to-cyan-400'
                  }`}
                />
                {step.status === 'running' && (
                  <div className="absolute inset-0 bg-white/10 animate-pulse rounded-full" />
                )}
              </div>
              
              {step.status === 'completed' && step.isQuantum && (
                <div className="mt-2 pt-2 border-t border-gray-800 text-xs text-gray-400 flex items-center">
                  <Cpu className="w-3 h-3 mr-1 text-purple-400" />
                  <span>Quantum state verification complete</span>
                </div>
              )}
            </div>
          ))}
          
          {!isRunning && quantumEntanglementScore >= 100 && (
            <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg text-center">
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-green-900/30 rounded-full">
                  <Lock className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <h3 className="text-green-400 font-medium mb-1">Quantum Security Protocol Activated</h3>
              <p className="text-xs text-gray-300">All systems protected with quantum-resistant cryptography</p>
            </div>
          )}
          
          {workflowSteps.every(step => step.status === 'pending') && (
            <div className="p-8 text-center text-gray-400">
              <Shield className="w-12 h-12 mx-auto mb-3 text-gray-600/50" />
              <p>Click "Start Security Workflow" to begin the quantum security assessment</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper components
const Loader = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// Add some CSS to apply a glowing effect
const style = document.createElement('style');
style.textContent = `
  .shadow-glow {
    box-shadow: 0 0 15px rgba(147, 51, 234, 0.3);
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }
`;
document.head.appendChild(style);
