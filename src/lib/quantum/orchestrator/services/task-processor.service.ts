/**
 * Task Processor Service
 * 
 * Handles real-time task processing for the AGI Orchestrator
 */

import { eventManager } from '../event-manager';
import { aiCoreService } from './ai-core.service';

// Types
export interface TaskDefinition {
  id: string;
  type: 'genomic' | 'access' | 'analysis' | 'quantum';
  prompt: string;
  contextId: string;
  priority?: number;
  metadata?: Record<string, any>;
}

export interface TaskResult {
  taskId: string;
  result: any;
  processingTime: number;
  completedAt: number;
  metadata?: Record<string, any>;
}

export interface TaskError {
  taskId: string;
  error: string;
  timestamp: number;
}

/**
 * TaskProcessorService coordinates real-time task processing
 * with support for priority queuing and task status monitoring
 */
export class TaskProcessorService {
  private activeTasks = new Map<string, TaskDefinition>();
  private processingEnabled = true;
  private processingQueue: string[] = [];
  private isProcessing = false;
  
  /**
   * Submit a new task for processing
   */
  public async submitTask(task: TaskDefinition): Promise<string> {
    // Add task to active tasks collection
    this.activeTasks.set(task.id, task);
    
    // Add to processing queue based on priority
    if (task.priority && task.priority > 0) {
      // Higher priority tasks go to the front
      this.processingQueue.unshift(task.id);
    } else {
      // Regular tasks go to the end
      this.processingQueue.push(task.id);
    }
    
    // Notify about new task
    eventManager.notifyListeners('task.submitted', { 
      taskId: task.id, 
      taskType: task.type,
      contextId: task.contextId
    });
    
    // Process task if processing is enabled and not already processing
    if (this.processingEnabled && !this.isProcessing) {
      this.processNextTask().catch(err => {
        console.error(`Error processing task queue:`, err);
      });
    }
    
    return task.id;
  }
  
  /**
   * Process the next task in the queue
   */
  private async processNextTask(): Promise<void> {
    if (!this.processingEnabled || this.processingQueue.length === 0) {
      this.isProcessing = false;
      return;
    }
    
    this.isProcessing = true;
    
    const taskId = this.processingQueue.shift();
    if (!taskId) {
      this.isProcessing = false;
      return;
    }
    
    try {
      await this.processTask(taskId);
    } catch (err) {
      console.error(`Error processing task ${taskId}:`, err);
      eventManager.notifyListeners('task.error', { 
        taskId, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      });
    }
    
    // Continue with the next task if there are more
    if (this.processingQueue.length > 0) {
      this.processNextTask().catch(err => {
        console.error(`Error processing task queue:`, err);
      });
    } else {
      this.isProcessing = false;
    }
  }
  
  /**
   * Enable or disable task processing
   */
  public setProcessingEnabled(enabled: boolean): void {
    const wasEnabled = this.processingEnabled;
    this.processingEnabled = enabled;
    
    // If we're enabling processing and there are queued tasks, start processing
    if (!wasEnabled && enabled && this.processingQueue.length > 0 && !this.isProcessing) {
      this.processNextTask().catch(err => {
        console.error(`Error processing task queue:`, err);
      });
    }
  }
  
  /**
   * Get all active tasks
   */
  public getActiveTasks(): TaskDefinition[] {
    return Array.from(this.activeTasks.values());
  }
  
  /**
   * Get queue status information
   */
  public getQueueStatus(): {queueLength: number; isProcessing: boolean} {
    return {
      queueLength: this.processingQueue.length,
      isProcessing: this.isProcessing
    };
  }
  
  /**
   * Process a specific task by ID
   * @private This is an internal method used by the queue processor
   */
  private async processTask(taskId: string): Promise<TaskResult | null> {
    const task = this.activeTasks.get(taskId);
    if (!task) return null;
    
    // Notify task started
    eventManager.notifyListeners('task.started', { 
      taskId, 
      taskType: task.type,
      contextId: task.contextId
    });
    
    const startTime = Date.now();
    
    try {
      // Process with AGI based on task type
      const result = await aiCoreService.processWithAGI(task.prompt, task.contextId);
      
      const processingTime = Date.now() - startTime;
      
      // Create task result
      const taskResult: TaskResult = {
        taskId,
        result,
        processingTime,
        completedAt: Date.now(),
        metadata: task.metadata
      };
      
      // Remove from active tasks
      this.activeTasks.delete(taskId);
      
      // Notify task completed
      eventManager.notifyListeners('task.completed', taskResult);
      
      return taskResult;
    } catch (error) {
      // Create error object
      const taskError: TaskError = {
        taskId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
      
      // Notify task error
      eventManager.notifyListeners('task.error', taskError);
      
      // Keep task in active tasks for potential retry
      return null;
    }
  }
  
  /**
   * Retry a failed task
   */
  public retryTask(taskId: string): boolean {
    const task = this.activeTasks.get(taskId);
    if (!task) return false;
    
    // Add to front of queue for immediate processing
    this.processingQueue.unshift(taskId);
    
    // Start processing if not already processing
    if (this.processingEnabled && !this.isProcessing) {
      this.processNextTask().catch(err => {
        console.error(`Error processing task queue:`, err);
      });
    }
    
    return true;
  }
  
  /**
   * Cancel a task by removing it from the active tasks and queue
   */
  public cancelTask(taskId: string): boolean {
    const task = this.activeTasks.get(taskId);
    if (!task) return false;
    
    // Remove from active tasks
    this.activeTasks.delete(taskId);
    
    // Remove from processing queue if present
    const queueIndex = this.processingQueue.indexOf(taskId);
    if (queueIndex !== -1) {
      this.processingQueue.splice(queueIndex, 1);
    }
    
    // Notify task canceled
    eventManager.notifyListeners('task.canceled', { taskId });
    
    return true;
  }
}

// Create and export singleton instance
export const taskProcessorService = new TaskProcessorService();
export default taskProcessorService;
