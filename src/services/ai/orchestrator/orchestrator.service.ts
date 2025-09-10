
import { toast } from 'sonner';
import { AIModelType, WorkflowStepType } from '@/types';
import { aiWorkflowService } from '../aiWorkflowService';
import { WorkflowContext, WorkflowExecutionResult, WorkflowOrchestratorConfig } from './types';
import { generateTransactionId } from '@/lib/quantum/workflow/utils/blockchain';

/**
 * Core orchestrator service for managing workflow execution
 */
class OrchestratorService {
  private config: WorkflowOrchestratorConfig = {
    modelType: 'gemini',
    quantumEnabled: true,
    blockchainEnabled: true,
    dataProcessingEnabled: true
  };
  
  private context: WorkflowContext = {
    sessionId: '',
    currentStepId: null
  };
  
  constructor() {
    // Initialize with a session ID
    this.context.sessionId = generateTransactionId();
  }
  
  /**
   * Configure the workflow orchestrator
   */
  public configure(config: Partial<WorkflowOrchestratorConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('Workflow orchestrator configured:', this.config);
  }
  
  /**
   * Get the current configuration
   */
  public getConfig(): WorkflowOrchestratorConfig {
    return { ...this.config };
  }
  
  /**
   * Execute a workflow with the specified steps
   */
  public async executeWorkflow(
    steps: WorkflowStepType[],
    workflowId: string,
    context?: Partial<WorkflowContext>
  ): Promise<WorkflowExecutionResult> {
    const startTime = new Date();
    const result: WorkflowExecutionResult = {
      success: true,
      startTime,
      endTime: new Date(),
      processingTime: 0,
      steps: [],
      transactionIds: [],
      model: this.config.modelType,
      insights: []
    };
    
    // Update context with provided values
    if (context) {
      this.context = { ...this.context, ...context };
    }
    
    // Execute each step in sequence
    for (const step of steps) {
      this.context.currentStepId = step.id;
      
      const stepStartTime = new Date();
      try {
        // Process step with AI service
        const aiResponse = await aiWorkflowService.processWorkflowStep({
          prompt: `Process workflow step: ${step.name}`,
          modelType: this.config.modelType,
          workflowId,
          contextData: {
            stepId: step.id,
            stepName: step.name,
            stepType: step.name.toLowerCase().includes('quantum') ? 'quantum' : 
                      step.name.toLowerCase().includes('genomic') ? 'genomic' : 'standard',
            quantumEnabled: this.config.quantumEnabled,
            session: this.context.sessionId
          },
          temperature: 0.7
        });
        
        // Record transaction ID if one was generated
        if (aiResponse.transactionId) {
          result.transactionIds.push(aiResponse.transactionId);
        }
        
        // Add any insights from the AI response
        if (aiResponse.insights) {
          result.insights.push(...aiResponse.insights);
        }
        
        // Record successful step completion
        result.steps.push({
          id: step.id,
          name: step.name,
          status: 'completed',
          startTime: stepStartTime,
          endTime: new Date()
        });
        
        // Update context with AI analysis
        this.updateContextWithAIAnalysis(aiResponse);
        
      } catch (error) {
        console.error(`Error executing workflow step ${step.id}:`, error);
        
        // Record failed step
        result.steps.push({
          id: step.id,
          name: step.name,
          status: 'failed',
          startTime: stepStartTime,
          endTime: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        result.success = false;
        toast.error(`Workflow step failed: ${step.name}`);
        break;
      }
    }
    
    // Calculate total processing time
    const endTime = new Date();
    result.endTime = endTime;
    result.processingTime = endTime.getTime() - startTime.getTime();
    
    if (result.success) {
      toast.success('Workflow completed successfully', {
        description: `Processed with ${this.config.modelType.toUpperCase()} in ${(result.processingTime / 1000).toFixed(1)}s`
      });
    }
    
    return result;
  }
  
  /**
   * Update the context with AI analysis results
   */
  private updateContextWithAIAnalysis(aiResponse: any): void {
    if (!this.context.aiAnalysis) {
      this.context.aiAnalysis = {
        model: this.config.modelType,
        confidenceScore: aiResponse.confidence,
        insights: aiResponse.suggestedNextSteps || [],
        processingTime: aiResponse.processingTime
      };
    } else {
      // Aggregate insights
      this.context.aiAnalysis.insights = [
        ...this.context.aiAnalysis.insights,
        ...(aiResponse.suggestedNextSteps || [])
      ];
      // Update confidence with average
      this.context.aiAnalysis.confidenceScore = 
        (this.context.aiAnalysis.confidenceScore + aiResponse.confidence) / 2;
    }
  }
  
  /**
   * Get the current workflow context
   */
  public getContext(): WorkflowContext {
    return { ...this.context };
  }
  
  /**
   * Reset the workflow context
   */
  public resetContext(): void {
    this.context = {
      sessionId: generateTransactionId(),
      currentStepId: null
    };
  }
  
  /**
   * Get capabilities for the selected AI model
   */
  public getModelCapabilities(): Record<string, any> {
    return aiWorkflowService.getAIModelCapabilities(this.config.modelType);
  }
}

// Create a singleton instance for export
export const orchestratorService = new OrchestratorService();
