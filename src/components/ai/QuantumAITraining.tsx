
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, BarChart4, Activity, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { ModelSelector, ModelOption } from './training/ModelSelector';
import { TrainingProgress } from './training/TrainingProgress';
import { DetailsTabs } from './training/DetailsTabs';
import { MODEL_OPTIONS } from './training/constants';
import { QuantumAdvancedOptions } from './training/QuantumAdvancedOptions';
import { quantumTrainingService } from '@/services/quantum/training/QuantumTrainingService';
import { QuantumTrainingAdvancedOptions, TrainedQuantumModel } from '@/services/quantum/models/QuantumModelTypes';
import { Button } from '../ui/button';
import { connectTrainingToAssistant } from './workflow-optimizer';

export function QuantumAITraining() {
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [totalEpochs, setTotalEpochs] = useState(100);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingMetrics, setTrainingMetrics] = useState({
    accuracy: 0,
    loss: 1.0,
    fidelity: 0.85,
    quantumAdvantage: 0,
    quantumCoherence: 0.9,
    quantumEntanglement: 0.7,
    energyEfficiency: 0.6
  });
  const [selectedModel, setSelectedModel] = useState('quantum-neural');
  const [activeTab, setActiveTab] = useState('metrics');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState<QuantumTrainingAdvancedOptions>({
    quantumCircuitDepth: 3,
    quantumNoiseModel: 'default',
    parameterizedGates: true,
    adaptiveLearningRate: true,
    regularizationStrength: 0.001,
    quantumBackpropagation: true,
    circuitOptimization: 'medium',
    earlyStoppingPatience: 10,
    quantumMemoryOptimization: true
  });
  const [trainedModel, setTrainedModel] = useState<TrainedQuantumModel | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionLevel, setConnectionLevel] = useState(0);
  
  // Generate synthetic training data
  const generateTrainingData = (samples: number) => {
    return Array(samples).fill(0).map(() => ({
      features: Array(8).fill(0).map(() => Math.random()),
      label: Math.random() > 0.5 ? 1 : 0
    }));
  };
  
  // Convert MODEL_OPTIONS to ModelOption[] for the ModelSelector component
  const modelOptions: ModelOption[] = MODEL_OPTIONS.map(option => ({
    id: option.id,
    name: option.name,
    description: option.description,
    complexity: option.complexity,
    layers: option.layers
  }));
  
  // Simulated training function
  const startTraining = async () => {
    if (isTraining) return;
    
    setIsTraining(true);
    setCurrentEpoch(0);
    setTrainingProgress(0);
    setTrainingMetrics({
      accuracy: 0,
      loss: 1.0,
      fidelity: 0.85,
      quantumAdvantage: 0,
      quantumCoherence: 0.9,
      quantumEntanglement: 0.7,
      energyEfficiency: 0.6
    });
    setIsConnected(false);
    setTrainedModel(null);
    
    toast.info("Quantum AI training started", {
      description: "Initializing quantum circuits and neural networks"
    });
    
    // Create training data
    const trainingData = generateTrainingData(500);
    
    // Get model configuration based on selection
    const selectedModelConfig = MODEL_OPTIONS.find(m => m.id === selectedModel)?.config || {};
    
    // Use the quantum training service
    try {
      // Perform training in the background but update UI with simulated progress
      const modelPromise = quantumTrainingService.trainDeepQuantumModel(
        trainingData,
        {
          ...selectedModelConfig,
          epochs: totalEpochs
        },
        advancedOptions
      );
      
      // Simulate training epochs
      const intervalId = setInterval(() => {
        setCurrentEpoch(prev => {
          const next = prev + 1;
          
          // Update progress
          const progress = Math.round((next / totalEpochs) * 100);
          setTrainingProgress(progress);
          
          // Update metrics with simulated improvements
          setTrainingMetrics(prev => {
            const epochProgress = next / totalEpochs;
            const coherenceDecay = Math.exp(-next / (totalEpochs * 0.7));
            
            return {
              accuracy: Math.min(0.95, prev.accuracy + (0.95 / totalEpochs) * (1.1 - epochProgress)),
              loss: Math.max(0.05, prev.loss - (0.95 / totalEpochs)),
              fidelity: Math.min(0.98, prev.fidelity + (0.15 / totalEpochs)),
              quantumAdvantage: Math.min(32, prev.quantumAdvantage + (32 / totalEpochs)),
              quantumCoherence: 0.9 * coherenceDecay + 0.1,
              quantumEntanglement: Math.min(0.95, prev.quantumEntanglement + 0.002),
              energyEfficiency: Math.min(0.9, prev.energyEfficiency + (0.3 / totalEpochs))
            };
          });
          
          // Complete training when reaching total epochs
          if (next >= totalEpochs) {
            clearInterval(intervalId);
            setIsTraining(false);
            
            // Store the trained model when complete
            modelPromise.then((model) => {
              setTrainedModel(model);
              toast.success("Quantum AI model training complete", {
                description: "Model ready for integration with QuantumBot"
              });
            });
          }
          
          return next;
        });
      }, 200);
    } catch (error) {
      console.error("Training error:", error);
      setIsTraining(false);
      toast.error("Training failed", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  };

  // Function to connect trained model to QuantumBot AI Assistant
  const handleConnectToAssistant = async () => {
    if (!trainedModel || isConnecting) return;
    
    setIsConnecting(true);
    
    try {
      toast.info("Connecting model to QuantumBot AI Assistant", {
        description: "Transferring quantum neural patterns..."
      });
      
      const result = await connectTrainingToAssistant(trainedModel);
      
      setIsConnected(true);
      setConnectionLevel(result.chatEnhancementLevel);
      
      toast.success("Model connected to QuantumBot AI", {
        description: `Assistant enhanced to level ${result.chatEnhancementLevel}/10`
      });
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to connect to QuantumBot AI Assistant");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          <span>Quantum AI Training</span>
          <div className="ml-auto flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="h-8 text-xs"
            >
              {showAdvancedOptions ? "Hide" : "Show"} Advanced Options
            </Button>
            {isTraining && (
              <div className="flex items-center">
                <Activity className="h-4 w-4 text-green-400 animate-pulse mr-1" />
                <span className="text-xs text-green-400">Training</span>
              </div>
            )}
            {isConnected && (
              <div className="flex items-center">
                <Zap className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="text-xs text-yellow-400">Connected L{connectionLevel}</span>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Model Selection Component */}
        <ModelSelector 
          models={modelOptions}
          selectedModel={selectedModel}
          onModelSelect={setSelectedModel}
        />
        
        {/* Advanced Options Panel */}
        {showAdvancedOptions && (
          <QuantumAdvancedOptions 
            options={advancedOptions} 
            onChange={setAdvancedOptions} 
          />
        )}
        
        {/* Training Progress Component */}
        <TrainingProgress
          isTraining={isTraining}
          currentEpoch={currentEpoch}
          totalEpochs={totalEpochs}
          trainingProgress={trainingProgress}
          trainingMetrics={trainingMetrics}
          onStartTraining={startTraining}
          onEpochsChange={setTotalEpochs}
        />
        
        {/* QuantumBot AI Assistant Integration */}
        {trainedModel && !isConnected && !isTraining && (
          <div className="mb-6 mt-4">
            <Button
              className="w-full bg-yellow-600/70 hover:bg-yellow-600 text-white"
              onClick={handleConnectToAssistant}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Connecting to QuantumBot AI Assistant...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Connect Model to QuantumBot AI Assistant
                </>
              )}
            </Button>
            <p className="text-xs text-gray-400 text-center mt-2">
              Enhance the QuantumBot AI Assistant with this trained quantum model
            </p>
          </div>
        )}
        
        {/* Detailed Training Information Tabs */}
        <DetailsTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          trainingMetrics={trainingMetrics}
          currentEpoch={currentEpoch}
          totalEpochs={totalEpochs}
        />
      </CardContent>
    </Card>
  );
}
