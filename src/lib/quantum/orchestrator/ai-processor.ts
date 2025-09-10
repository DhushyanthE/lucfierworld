
/**
 * AI Processor for AGI Orchestrator
 * 
 * Handles AI processing for genomic data and access decisions
 * Delegates specific functionality to specialized services
 */

import { AgiBrainResult } from './types';
import { aiCoreService } from './services/ai-core.service';
import { genomicSummaryService } from './services/genomic-summary.service';
import { accessAssessmentService } from './services/access-assessment.service';

export class AIProcessor {
  /**
   * Generate a quantum seed for AGI prompts
   */
  public async generateQuantumSeed(): Promise<string> {
    return aiCoreService.generateQuantumSeed();
  }
  
  /**
   * Process a request with the AGI module
   */
  public async processWithAGI(prompt: string, contextId: string): Promise<AgiBrainResult> {
    console.log("Processing with AGI:", prompt);
    
    // Generate a mock response based on the prompt
    let result: AgiBrainResult;
    
    if (prompt.includes('summary')) {
      result = genomicSummaryService.generateDataSummary();
    } else if (prompt.includes('access')) {
      result = accessAssessmentService.generateAccessAssessment();
    } else {
      // Use core service for generic responses
      result = await aiCoreService.processWithAGI(prompt, contextId);
    }
    
    return result;
  }
  
  /**
   * Determine if access should be approved based on the AI assessment
   */
  public determineApproval(assessment: string): boolean {
    return aiCoreService.determineApproval(assessment);
  }
}

// Create and export singleton instance
export const aiProcessor = new AIProcessor();
export default aiProcessor;
