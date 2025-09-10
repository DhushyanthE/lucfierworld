
/**
 * AI Service - Central service for AI functionality
 */

import { chatService } from './ai/chatService';
import { textGenerationService } from './ai/textGeneration';

// Export QuantumSecurityAnalysis type
export interface QuantumSecurityAnalysis {
  resistanceScore: number;
  vulnerabilities: string[];
  recommendations: string[];
  quantumSafeAlgorithms: string[];
}

// Export response type for AI generation
export interface AIGenerationResponse {
  text: string;
  status: 'success' | 'error';
  message?: string;
  neuralOutput?: any;
}

// Export chat message type
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  quantumEnhanced?: boolean;
}

// Quantum model enhancement interface
export interface QuantumModelEnhancement {
  modelId: string;
  enhancementLevel: number;
  capabilities: string[];
  activatedAt: number;
}

// Enhanced chat service with quantum model capabilities
export const enhancedChatService = {
  ...chatService,
  activeQuantumModels: [] as QuantumModelEnhancement[],

  /**
   * Register a quantum model enhancement with the chat service
   */
  registerQuantumModel(enhancement: QuantumModelEnhancement): boolean {
    // Avoid duplicates
    if (this.activeQuantumModels.some(model => model.modelId === enhancement.modelId)) {
      return false;
    }
    
    this.activeQuantumModels.push(enhancement);
    console.log("Registered quantum model enhancement:", enhancement);
    return true;
  },
  
  /**
   * Get the current enhancement level of the chat service
   */
  getEnhancementLevel(): number {
    if (this.activeQuantumModels.length === 0) {
      return 0;
    }
    
    // Return the highest enhancement level among active models
    return Math.max(...this.activeQuantumModels.map(model => model.enhancementLevel));
  }
};

// Proxy the services to provide a clean API
export const aiService = {
  /**
   * Generate a chat response for the QuantumBot AI Assistant
   * @param message The user message
   * @returns A response object with text and status
   */
  generateChatResponse: chatService.generateChatResponse,
  
  /**
   * Generate text for various purposes
   * @param options Text generation options
   * @returns A response object with text and status
   */
  generateText: textGenerationService.generateText,
  
  /**
   * Register quantum model enhancement with the chat service
   */
  registerQuantumModel: enhancedChatService.registerQuantumModel,
  
  /**
   * Get the current quantum enhancement level
   */
  getQuantumEnhancementLevel: enhancedChatService.getEnhancementLevel
};

// Export the individual services for direct access
export { chatService, textGenerationService };
// enhancedChatService is already exported above, so we don't need to export it again
