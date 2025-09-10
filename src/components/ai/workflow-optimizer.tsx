
import { TrainedQuantumModel } from "@/services/quantumDeepLearningService";
import { aiService } from "@/services/aiService";
import { toast } from "sonner";

/**
 * Connect a trained quantum model to the QuantumBot AI Assistant
 */
export const connectTrainingToAssistant = async (model: TrainedQuantumModel) => {
  // Log the connection attempt
  console.log("Connecting model to QuantumBot AI Assistant:", model);

  try {
    // Calculate enhancement level based on model metrics
    const enhancementLevel = calculateEnhancementLevel(model);
    
    // Create quantum model enhancement object
    const enhancement = {
      modelId: model.id,
      enhancementLevel,
      capabilities: determineCapabilities(model),
      activatedAt: Date.now()
    };
    
    // Register the model with the AI service
    const registered = aiService.registerQuantumModel(enhancement);

    if (!registered) {
      console.warn("Model already registered with QuantumBot AI");
      return {
        success: true,
        chatEnhancementLevel: enhancementLevel,
        message: "Model connection refreshed"
      };
    }

    // Return success response
    return {
      success: true,
      chatEnhancementLevel: enhancementLevel,
      message: "Model successfully connected to QuantumBot AI Assistant"
    };
  } catch (error) {
    console.error("Error connecting model to QuantumBot:", error);
    throw new Error("Failed to connect to QuantumBot AI Assistant");
  }
};

/**
 * Calculate enhancement level based on model metrics
 * Returns a value between 1-10
 */
const calculateEnhancementLevel = (model: TrainedQuantumModel): number => {
  // Calculate enhancement level based on model metrics
  const accuracyFactor = model.finalMetrics.accuracy * 3;
  const fidelityFactor = model.finalMetrics.fidelity * 4;
  const robustnessFactor = model.finalMetrics.robustness * 2;
  const resistanceFactor = model.finalMetrics.quantumResistance * 1;
  
  // Calculate total score (out of 10)
  let enhancementLevel = Math.floor((accuracyFactor + fidelityFactor + robustnessFactor + resistanceFactor) / 10);
  
  // Ensure the level is between 1 and 10
  enhancementLevel = Math.max(1, Math.min(10, enhancementLevel));
  
  return enhancementLevel;
};

/**
 * Determine capabilities based on model metrics
 */
const determineCapabilities = (model: TrainedQuantumModel): string[] => {
  const capabilities: string[] = ["Enhanced reasoning"];
  
  if (model.finalMetrics.accuracy > 0.8) {
    capabilities.push("Advanced pattern recognition");
  }
  
  if (model.finalMetrics.fidelity > 0.85) {
    capabilities.push("Quantum coherence maintenance");
  }
  
  if (model.finalMetrics.robustness > 0.7) {
    capabilities.push("Noise resilience");
  }
  
  if (model.finalMetrics.quantumResistance > 0.75) {
    capabilities.push("Quantum advantage");
  }
  
  return capabilities;
};
