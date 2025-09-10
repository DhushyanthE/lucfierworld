
import { toast } from "sonner";
import { TrainedQuantumModel } from "@/services/quantum/models/QuantumModelTypes";
import { TrainingTask, ModelTransferResult } from "@/lib/quantum/workflow/types/QuantumTask";
import { aiService, ChatMessage } from "@/services/aiService";

/**
 * Connect a trained quantum model to the QuantumBot AI Assistant
 * This enhances the AI's capabilities with the trained neural patterns
 */
export async function connectTrainingToAssistant(
  trainedModel: TrainedQuantumModel,
): Promise<ModelTransferResult> {
  try {
    console.log("Connecting trained model to QuantumBot AI Assistant", trainedModel);
    
    // Create a training task to transfer
    const trainingTask: TrainingTask = {
      id: `task-${Date.now()}`,
      type: 'training',
      status: 'completed',
      params: {
        modelId: trainedModel.config ? `quantum-model-${Date.now()}` : 'unknown',
        epochs: trainedModel.trainingStamps?.epochCount || 0,
        configuration: {
          layers: trainedModel.config?.layers || [],
          activations: trainedModel.config?.activations || []
        },
        advancedOptions: trainedModel.trainingOptions || {}
      },
      result: {
        accuracy: trainedModel.finalMetrics?.accuracy || 0,
        loss: trainedModel.finalMetrics?.loss || 0,
        quantumMetrics: {
          fidelity: trainedModel.finalMetrics?.fidelity || 0,
          coherence: trainedModel.metrics?.[trainedModel.metrics.length - 1]?.quantumCoherence || 0,
          entanglement: trainedModel.metrics?.[trainedModel.metrics.length - 1]?.quantumEntanglement || 0,
          quantumAdvantage: trainedModel.finalMetrics?.quantumAdvantage || 0
        }
      },
      timestamp: Date.now()
    };
    
    // Simulate AI assistant enhancement
    const enhancementCapabilities = getModelEnhancementCapabilities(trainedModel);
    const enhancementLevel = calculateEnhancementLevel(trainedModel);
    
    // In a real implementation, we would send the model to a backend service
    // For demo purposes, we'll simulate the connection
    await simulateModelTransfer(trainingTask, enhancementLevel);
    
    // Return result of the connection
    return {
      success: true,
      transferredAt: Date.now(),
      modelId: trainingTask.params.modelId,
      chatEnhancementLevel: enhancementLevel,
      assistantCapabilities: enhancementCapabilities
    };
  } catch (error) {
    console.error("Error connecting model to assistant:", error);
    toast.error("Failed to connect model to QuantumBot AI Assistant");
    
    throw error;
  }
}

/**
 * Calculate enhancement level based on model metrics
 */
function calculateEnhancementLevel(model: TrainedQuantumModel): number {
  const accuracy = model.finalMetrics?.accuracy || 0;
  const fidelity = model.finalMetrics?.fidelity || 0;
  const quantumAdvantage = model.finalMetrics?.quantumAdvantage || 0;
  
  // Create a weighted score based on important metrics
  return Math.min(10, Math.round(
    (accuracy * 3) + 
    (fidelity * 4) + 
    (quantumAdvantage * 0.3) +
    ((model.config?.layers?.length || 0) / 2)
  ));
}

/**
 * Determine capabilities enhanced by this model
 */
function getModelEnhancementCapabilities(model: TrainedQuantumModel): string[] {
  const capabilities = [];
  
  // Base capabilities from any quantum model
  capabilities.push("Quantum-Enhanced Response Generation");
  capabilities.push("Quantum Pattern Recognition");
  
  // Add capabilities based on model characteristics
  if ((model.finalMetrics?.accuracy || 0) > 0.8) {
    capabilities.push("High-Precision Responses");
  }
  
  if ((model.finalMetrics?.quantumAdvantage || 0) > 15) {
    capabilities.push("Quantum Parallel Reasoning");
  }
  
  if (model.config?.activations?.filter(a => a === 'quantum')?.length > 1) {
    capabilities.push("Multi-Quantum Layer Processing");
    capabilities.push("Quantum Coherent Reasoning");
  }
  
  if ((model.finalMetrics?.robustness || 0) > 0.85) {
    capabilities.push("Robust Error Correction");
  }
  
  return capabilities;
}

/**
 * Simulate the transfer process
 */
async function simulateModelTransfer(
  task: TrainingTask, 
  enhancementLevel: number
): Promise<void> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Create a system message informing about the enhancement  
  const systemMessage: ChatMessage = {
    id: `system-${Date.now()}`,
    role: 'system',
    content: `[SYSTEM] QuantumBot AI Assistant enhanced with quantum model. Enhancement level: ${enhancementLevel}/10. New capabilities activated.`,
    timestamp: Date.now()
  };
  
  // Log the enhancement details
  console.log(`QuantumBot AI Assistant enhanced with quantum model:`, {
    enhancementLevel,
    modelMetrics: task.result,
    modelConfiguration: task.params.configuration
  });
  
  // In a full implementation, we would send this to the backend
  toast.success(`QuantumBot AI enhanced to level ${enhancementLevel}/10`, {
    description: "New quantum capabilities activated"
  });
}
