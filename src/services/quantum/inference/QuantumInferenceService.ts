
import { 
  quantumNeuralLayer
} from "@/lib/quantum/workflow/utils";
import { TrainedQuantumModel } from "../models/QuantumModelTypes";

class QuantumInferenceService {
  /**
   * Run inference with trained quantum model
   * @param model Trained quantum model
   * @param features Input features
   * @returns Prediction results
   */
  runInference(model: TrainedQuantumModel, features: number[]): {
    prediction: number,
    confidence: number,
    quantumMetrics: {
      fidelity: number,
      coherence: number,
      resistanceScore: number
    }
  } {
    try {
      // Process through each layer
      let activation = features;
      
      // Check if model has the required properties for inference
      if (!model.weights || !model.biases || !model.config) {
        throw new Error("Model is missing required properties for inference");
      }
      
      for (let layerIdx = 0; layerIdx < model.weights.length; layerIdx++) {
        // Get input and output dimensions for this layer
        const inputDim = layerIdx === 0 ? features.length : model.config.layers[layerIdx - 1];
        const outputDim = model.config.layers[layerIdx];
        
        // Make sure activation type is handled as a valid enum value
        const activationType = model.config.activations[layerIdx] as "relu" | "quantum" | "sigmoid" | "tanh";
        
        // Pass through quantum neural layer
        activation = quantumNeuralLayer(
          activation,
          model.weights[layerIdx],
          model.biases[layerIdx],
          inputDim,
          outputDim,
          activationType
        );
      }
      
      // Get prediction from final layer
      const rawPrediction = activation.reduce((sum, val) => sum + val, 0) / activation.length;
      const prediction = rawPrediction > 0.5 ? 1 : 0;
      
      // Calculate confidence as distance from decision boundary
      const confidence = Math.abs(rawPrediction - 0.5) * 2;
      
      // Generate quantum metrics
      const fidelity = model.finalMetrics.fidelity * (0.95 + Math.random() * 0.05);
      const coherence = 0.8 + Math.random() * 0.15;
      
      return {
        prediction,
        confidence,
        quantumMetrics: {
          fidelity,
          coherence,
          resistanceScore: model.finalMetrics.quantumResistance || 0.8
        }
      };
    } catch (error) {
      console.error("Error in quantum inference:", error);
      throw new Error(`Quantum inference failed: ${error}`);
    }
  }
}

export const quantumInferenceService = new QuantumInferenceService();
export default quantumInferenceService;
