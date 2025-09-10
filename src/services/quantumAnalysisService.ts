import { AxiosResponse } from "axios";
import apiService from "./api"; // Fixed import to use the default export

// Define proper types to fix the overload signature issue
interface AnalysisResponse {
  status: string;
  text: string;
  message: string;
  neuralOutput?: any; // Add optional neuralOutput property
}

class QuantumAnalysisService {
  // Fix the signature by removing the overloaded methods and using a single implementation
  async analyzeQuantumData(data: any): Promise<AnalysisResponse> {
    try {
      // Implementation remains the same
      const response: AxiosResponse<AnalysisResponse> = await apiService.post('/quantum/analyze', { data });
      return response.data;
    } catch (error) {
      console.error("Error in quantum data analysis:", error);
      return {
        status: "error",
        text: "Analysis failed",
        message: "There was an error processing the quantum data."
      };
    }
  }

  async getQuantumPredictions(modelId: string, inputData: any) {
    try {
      const response = await apiService.post(`/quantum/predict/${modelId}`, inputData);
      return response.data;
    } catch (error) {
      console.error("Error getting quantum predictions:", error);
      return {
        status: "error",
        predictions: [],
        message: "Failed to generate predictions"
      };
    }
  }

  async trainQuantumModel(config: any) {
    try {
      const response = await apiService.post('/quantum/train', config);
      return response.data;
    } catch (error) {
      console.error("Error training quantum model:", error);
      return {
        status: "error",
        modelId: null,
        message: "Model training failed"
      };
    }
  }

  async getModelStatus(modelId: string) {
    try {
      const response = await apiService.get(`/quantum/model/${modelId}/status`);
      return response.data;
    } catch (error) {
      console.error("Error checking model status:", error);
      return {
        status: "error",
        trainingStatus: "unknown",
        message: "Could not retrieve model status"
      };
    }
  }

  async getQuantumInsights(data: any) {
    try {
      const response = await apiService.post('/quantum/insights', data);
      return response.data;
    } catch (error) {
      console.error("Error getting quantum insights:", error);
      return {
        status: "error",
        insights: [],
        message: "Failed to generate insights"
      };
    }
  }
}

export const quantumAnalysisService = new QuantumAnalysisService();
