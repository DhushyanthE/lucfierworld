/**
 * Workflow Execution Engine
 * 
 * Orchestrates complex blockchain-ANN workflows with state management
 */

import { 
  BlockchainANNWorkflow, 
  WorkflowStep, 
  TrainingConfiguration,
  BlockchainANNArchitecture 
} from '@/types/blockchain-ann.types';
import { blockchainANNOrchestrator } from '../BlockchainANNOrchestratorService';
import { v4 as uuidv4 } from 'uuid';

class WorkflowExecutionEngine {
  private activeWorkflows: Map<string, BlockchainANNWorkflow> = new Map();
  private executionCallbacks: Map<string, ((step: WorkflowStep) => void)[]> = new Map();

  /**
   * Create a new workflow
   */
  createWorkflow(config: {
    name: string;
    description: string;
    architecture: BlockchainANNArchitecture;
    trainingConfig: TrainingConfiguration;
    steps: Omit<WorkflowStep, 'id' | 'status' | 'progress'>[];
  }): BlockchainANNWorkflow {
    console.log('📋 Creating workflow:', config.name);

    const workflow: BlockchainANNWorkflow = {
      id: uuidv4(),
      name: config.name,
      description: config.description,
      architecture: config.architecture,
      trainingConfig: config.trainingConfig,
      steps: config.steps.map(step => ({
        ...step,
        id: uuidv4(),
        status: 'pending',
        progress: 0
      })),
      status: 'draft',
      createdAt: new Date()
    };

    this.activeWorkflows.set(workflow.id, workflow);
    return workflow;
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowId: string,
    onStepUpdate?: (step: WorkflowStep) => void
  ): Promise<{
    success: boolean;
    workflowId: string;
    completedSteps: number;
    totalSteps: number;
    executionTime: number;
    results: Record<string, any>;
  }> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    console.log('▶️ Executing workflow:', workflow.name);

    const startTime = Date.now();
    workflow.status = 'running';
    const results: Record<string, any> = {};

    // Register callback
    if (onStepUpdate) {
      if (!this.executionCallbacks.has(workflowId)) {
        this.executionCallbacks.set(workflowId, []);
      }
      this.executionCallbacks.get(workflowId)!.push(onStepUpdate);
    }

    let completedSteps = 0;

    try {
      for (const step of workflow.steps) {
        await this.executeStep(workflow, step, results);
        completedSteps++;
        
        // Notify callbacks
        this.notifyStepUpdate(workflowId, step);
      }

      workflow.status = 'completed';
      workflow.completedAt = new Date();

      console.log('✅ Workflow completed:', workflow.name);

      return {
        success: true,
        workflowId,
        completedSteps,
        totalSteps: workflow.steps.length,
        executionTime: Date.now() - startTime,
        results
      };

    } catch (error) {
      console.error('❌ Workflow execution failed:', error);
      workflow.status = 'failed';

      return {
        success: false,
        workflowId,
        completedSteps,
        totalSteps: workflow.steps.length,
        executionTime: Date.now() - startTime,
        results
      };
    }
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(
    workflow: BlockchainANNWorkflow,
    step: WorkflowStep,
    results: Record<string, any>
  ): Promise<void> {
    console.log(`🔄 Executing step: ${step.name}`);

    step.status = 'running';
    step.startTime = new Date();
    step.progress = 0;

    try {
      switch (step.type) {
        case 'data-loading':
          await this.executeDataLoading(step, workflow, results);
          break;

        case 'preprocessing':
          await this.executePreprocessing(step, workflow, results);
          break;

        case 'training':
          await this.executeTraining(step, workflow, results);
          break;

        case 'validation':
          await this.executeValidation(step, workflow, results);
          break;

        case 'deployment':
          await this.executeDeployment(step, workflow, results);
          break;

        case 'inference':
          await this.executeInference(step, workflow, results);
          break;

        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      step.status = 'completed';
      step.progress = 100;
      step.endTime = new Date();

      console.log(`✅ Step completed: ${step.name}`);

    } catch (error) {
      step.status = 'failed';
      step.endTime = new Date();
      console.error(`❌ Step failed: ${step.name}`, error);
      throw error;
    }
  }

  /**
   * Execute data loading step
   */
  private async executeDataLoading(
    step: WorkflowStep,
    workflow: BlockchainANNWorkflow,
    results: Record<string, any>
  ): Promise<void> {
    // Simulate data loading from blockchain
    for (let i = 0; i <= 100; i += 10) {
      step.progress = i;
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Generate mock training data
    const dataSize = 1000;
    results.trainingData = Array(dataSize).fill(null).map(() =>
      Array(workflow.architecture.annLayers[0].neurons).fill(0).map(() => Math.random())
    );

    results.labels = Array(dataSize).fill(null).map(() => {
      const outputSize = workflow.architecture.annLayers[workflow.architecture.annLayers.length - 1].neurons;
      const label = Array(outputSize).fill(0);
      label[Math.floor(Math.random() * outputSize)] = 1;
      return label;
    });

    step.blockchainCheckpoint = `0x${Math.random().toString(16).substring(2, 66)}`;
    step.metrics = {
      dataSize,
      blockchainVerified: true,
      loadTime: 1.2
    };
  }

  /**
   * Execute preprocessing step
   */
  private async executePreprocessing(
    step: WorkflowStep,
    workflow: BlockchainANNWorkflow,
    results: Record<string, any>
  ): Promise<void> {
    // Simulate data preprocessing
    for (let i = 0; i <= 100; i += 20) {
      step.progress = i;
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    step.metrics = {
      normalized: true,
      augmented: true,
      validationSplit: workflow.trainingConfig.validationSplit
    };
  }

  /**
   * Execute training step
   */
  private async executeTraining(
    step: WorkflowStep,
    workflow: BlockchainANNWorkflow,
    results: Record<string, any>
  ): Promise<void> {
    if (!results.trainingData || !results.labels) {
      throw new Error('Training data not loaded');
    }

    const trainingResult = await blockchainANNOrchestrator.trainDistributedModel(
      workflow.id,
      results.trainingData,
      results.labels,
      workflow.trainingConfig
    );

    results.trainingResult = trainingResult;

    step.blockchainCheckpoint = `0x${Math.random().toString(16).substring(2, 66)}`;
    step.metrics = {
      finalAccuracy: trainingResult.finalAccuracy,
      trainingTime: trainingResult.trainingTime,
      consensusRounds: trainingResult.consensusRounds,
      blockchainVerified: trainingResult.blockchainVerified
    };
  }

  /**
   * Execute validation step
   */
  private async executeValidation(
    step: WorkflowStep,
    workflow: BlockchainANNWorkflow,
    results: Record<string, any>
  ): Promise<void> {
    // Simulate validation with blockchain consensus
    for (let i = 0; i <= 100; i += 25) {
      step.progress = i;
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    step.metrics = {
      validationAccuracy: 0.91 + Math.random() * 0.08,
      consensusValidation: true,
      validatorNodes: workflow.trainingConfig.distributedNodes
    };
  }

  /**
   * Execute deployment step
   */
  private async executeDeployment(
    step: WorkflowStep,
    workflow: BlockchainANNWorkflow,
    results: Record<string, any>
  ): Promise<void> {
    // Deploy model to blockchain
    const deployment = await blockchainANNOrchestrator.deployNeuralNetworkToBlockchain(
      workflow.name,
      workflow.architecture.annLayers,
      [[[]]] // Mock weights
    );

    results.deployment = deployment;

    step.blockchainCheckpoint = deployment.contractAddress;
    step.metrics = {
      contractAddress: deployment.contractAddress,
      ipfsHash: deployment.ipfsHash,
      consensusScore: deployment.consensusScore
    };
  }

  /**
   * Execute inference step
   */
  private async executeInference(
    step: WorkflowStep,
    workflow: BlockchainANNWorkflow,
    results: Record<string, any>
  ): Promise<void> {
    if (!results.deployment) {
      throw new Error('Model not deployed');
    }

    // Simulate batch inference
    const batchSize = 100;
    const predictions: number[][] = [];

    for (let i = 0; i < batchSize; i++) {
      const input = Array(workflow.architecture.annLayers[0].neurons).fill(0).map(() => Math.random());
      const output = Array(workflow.architecture.annLayers[workflow.architecture.annLayers.length - 1].neurons)
        .fill(0).map(() => Math.random());
      
      predictions.push(output);
      step.progress = (i / batchSize) * 100;
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    step.metrics = {
      inferenceCount: batchSize,
      averageLatency: 15 + Math.random() * 5,
      blockchainVerified: true
    };
  }

  /**
   * Get workflow status
   */
  getWorkflowStatus(workflowId: string): BlockchainANNWorkflow | undefined {
    return this.activeWorkflows.get(workflowId);
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): BlockchainANNWorkflow[] {
    return Array.from(this.activeWorkflows.values());
  }

  /**
   * Cancel workflow execution
   */
  async cancelWorkflow(workflowId: string): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (workflow && workflow.status === 'running') {
      workflow.status = 'failed';
      workflow.completedAt = new Date();
      console.log('🛑 Workflow cancelled:', workflow.name);
    }
  }

  /**
   * Retry failed workflow
   */
  async retryWorkflow(workflowId: string): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (workflow && workflow.status === 'failed') {
      // Reset failed steps
      workflow.steps.forEach(step => {
        if (step.status === 'failed') {
          step.status = 'pending';
          step.progress = 0;
          step.startTime = undefined;
          step.endTime = undefined;
        }
      });

      workflow.status = 'draft';
      console.log('🔄 Workflow reset for retry:', workflow.name);
    }
  }

  /**
   * Notify step update callbacks
   */
  private notifyStepUpdate(workflowId: string, step: WorkflowStep): void {
    const callbacks = this.executionCallbacks.get(workflowId);
    if (callbacks) {
      callbacks.forEach(callback => callback(step));
    }
  }

  /**
   * Get workflow metrics
   */
  getWorkflowMetrics(workflowId: string): {
    totalSteps: number;
    completedSteps: number;
    failedSteps: number;
    averageStepTime: number;
    overallProgress: number;
  } {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const completed = workflow.steps.filter(s => s.status === 'completed').length;
    const failed = workflow.steps.filter(s => s.status === 'failed').length;
    
    const stepTimes = workflow.steps
      .filter(s => s.startTime && s.endTime)
      .map(s => (s.endTime!.getTime() - s.startTime!.getTime()) / 1000);

    const avgTime = stepTimes.length > 0 
      ? stepTimes.reduce((sum, t) => sum + t, 0) / stepTimes.length 
      : 0;

    const progress = workflow.steps.reduce((sum, s) => sum + s.progress, 0) / workflow.steps.length;

    return {
      totalSteps: workflow.steps.length,
      completedSteps: completed,
      failedSteps: failed,
      averageStepTime: avgTime,
      overallProgress: progress
    };
  }
}

export const workflowExecutionEngine = new WorkflowExecutionEngine();
export default workflowExecutionEngine;
