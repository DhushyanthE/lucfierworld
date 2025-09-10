
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cpu, Brain, Shield } from 'lucide-react';
import { quantumWorkflowHandler } from '@/lib/quantum/QuantumWorkflowHandler';
import { toast } from 'sonner';
import { FidelityTabContent } from './metrics/FidelityTabContent';
import { SecurityTabContent } from './metrics/SecurityTabContent';
import { FidelityMetric, SecurityMetric } from './metrics/types';
import { Task } from '@/lib/quantum/workflow/types';

export function QuantumFidelityMetrics() {
  const [activeTab, setActiveTab] = useState('fidelity');
  const [fidelityMetrics, setFidelityMetrics] = useState<FidelityMetric[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  useEffect(() => {
    // Load metrics on component mount
    loadMetrics();
    
    // Set up refresh interval
    const intervalId = setInterval(loadMetrics, 60000);
    return () => clearInterval(intervalId);
  }, []);
  
  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      // Submit task to generate fidelity metrics
      const task = quantumWorkflowHandler.createTask({
        id: `fidelity-task-${Date.now()}`,
        name: 'Fidelity Analysis Task',
        type: 'analysis',
        priority: 1,
        status: 'pending', // Add status to fix the type error
        data: {},
        operation: 'fidelity-machine-learning',
        parameters: { 
          algorithm: 'dilithium',
          keySize: 2048,
          epochs: 100
        }
      });
      
      // Store the task ID directly
      const taskId = task.id;
      
      // Wait for task to complete
      const checkStatus = async () => {
        const taskStatus = quantumWorkflowHandler.getTask(taskId);
        if (!taskStatus) {
          setTimeout(checkStatus, 500);
          return;
        }
        
        if (taskStatus.status === 'completed' && taskStatus.result) {
          processTaskResult(taskStatus.result);
          setLastUpdated(new Date());
          setIsLoading(false);
        } else if (taskStatus.status === 'failed') {
          // Access the error safely
          const errorMessage = taskStatus.error || "Unknown error";
          console.error("Failed to generate fidelity metrics:", errorMessage);
          toast.error("Failed to generate quantum metrics");
          setIsLoading(false);
        } else {
          setTimeout(checkStatus, 500);
        }
      };
      
      checkStatus();
    } catch (error) {
      console.error("Error loading quantum fidelity metrics:", error);
      toast.error("Failed to load quantum metrics");
      setIsLoading(false);
      
      // Generate fallback metrics if real ones can't be loaded
      generateFallbackMetrics();
    }
  };
  
  const processTaskResult = (result: any) => {
    // Process fidelity metrics
    const fidelityData: FidelityMetric[] = [
      {
        name: 'Model Fidelity',
        value: result.fidelityScore * 100,
        threshold: 90,
        description: 'Overall fidelity of quantum processing operations'
      },
      {
        name: 'Quantum Resistance',
        value: result.quantumResistance * 100,
        threshold: 80,
        description: 'Resistance to quantum computing attacks'
      },
      {
        name: 'Weight Entropy',
        value: result.weightEntropy * 100,
        threshold: 70,
        description: 'Entropy of model weights (complexity measure)'
      },
      {
        name: 'Model Accuracy',
        value: result.accuracy * 100,
        threshold: 85,
        description: 'Prediction accuracy on test data'
      }
    ];
    
    // Process security metrics
    const securityData: SecurityMetric[] = [
      {
        algorithm: result.cryptoEvaluation.isQuantumResistant ? 'Dilithium (post-quantum)' : 'RSA',
        keySize: result.cryptoEvaluation.recommendedKeySize,
        resistanceScore: result.cryptoEvaluation.score * 100,
        isQuantumResistant: result.cryptoEvaluation.isQuantumResistant,
        qubitEstimate: result.cryptoEvaluation.estimatedQubitsCrack
      },
      {
        algorithm: 'Lattice-based',
        keySize: 1024,
        resistanceScore: 92,
        isQuantumResistant: true,
        qubitEstimate: 5000
      },
      {
        algorithm: 'NTRU',
        keySize: 743,
        resistanceScore: 89,
        isQuantumResistant: true,
        qubitEstimate: 4200
      }
    ];
    
    setFidelityMetrics(fidelityData);
    setSecurityMetrics(securityData);
  };
  
  const generateFallbackMetrics = () => {
    // Generate fallback fidelity metrics if real ones can't be loaded
    const fallbackFidelity: FidelityMetric[] = [
      {
        name: 'Model Fidelity',
        value: 92.5,
        threshold: 90,
        description: 'Overall fidelity of quantum processing operations'
      },
      {
        name: 'Quantum Resistance',
        value: 84.3,
        threshold: 80,
        description: 'Resistance to quantum computing attacks'
      },
      {
        name: 'Weight Entropy',
        value: 76.8,
        threshold: 70,
        description: 'Entropy of model weights (complexity measure)'
      },
      {
        name: 'Model Accuracy',
        value: 89.2,
        threshold: 85,
        description: 'Prediction accuracy on test data'
      }
    ];
    
    // Generate fallback security metrics
    const fallbackSecurity: SecurityMetric[] = [
      {
        algorithm: 'Dilithium (post-quantum)',
        keySize: 2048,
        resistanceScore: 91,
        isQuantumResistant: true,
        qubitEstimate: 4800
      },
      {
        algorithm: 'Lattice-based',
        keySize: 1024,
        resistanceScore: 89,
        isQuantumResistant: true,
        qubitEstimate: 4200
      },
      {
        algorithm: 'NTRU',
        keySize: 743,
        resistanceScore: 85,
        isQuantumResistant: true,
        qubitEstimate: 3800
      }
    ];
    
    setFidelityMetrics(fallbackFidelity);
    setSecurityMetrics(fallbackSecurity);
    setLastUpdated(new Date());
  };

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 to-black/0 pointer-events-none"></div>
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-purple-400" />
          <span>Quantum Fidelity & Resistance Metrics</span>
          {lastUpdated && (
            <span className="text-xs bg-purple-900/30 text-purple-300 rounded-full px-2 py-0.5 ml-auto">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="fidelity" className="data-[state=active]:bg-purple-900/30">
              <Brain className="h-4 w-4 mr-2" />
              Fidelity Metrics
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-purple-900/30">
              <Shield className="h-4 w-4 mr-2" />
              Quantum Security
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="fidelity" className="focus-visible:outline-none focus-visible:ring-0">
            <FidelityTabContent fidelityMetrics={fidelityMetrics} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="security" className="focus-visible:outline-none focus-visible:ring-0">
            <SecurityTabContent securityMetrics={securityMetrics} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
