import { Task, QuantumTask, QuantumWorkflowState } from './types';

/**
 * Manages the task queue for quantum workflow operations
 * with advanced prioritization algorithms and performance optimizations
 */
export class TaskQueueManager {
  private state: QuantumWorkflowState;
  private performanceMetrics: {
    averageProcessingTime: number;
    tasksProcessed: number;
    priorityDistribution: Record<number, number>;
  };

  constructor(initialState: QuantumWorkflowState) {
    this.state = { 
      ...initialState,
      tasks: {},
      processingQueue: [],
      completedTasks: [],
      activeTaskId: null,
      status: initialState.status || 'idle'
    };
    
    this.performanceMetrics = {
      averageProcessingTime: 0,
      tasksProcessed: 0,
      priorityDistribution: {},
    };
  }

  /**
   * Get the current state
   */
  getState(): QuantumWorkflowState {
    return { ...this.state };
  }

  /**
   * Set the state
   */
  setState(newState: Partial<QuantumWorkflowState>): void {
    this.state = { ...this.state, ...newState };
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  /**
   * Add a task to the processing queue with advanced priority handling
   * Uses dynamic priority adjustment based on system load
   */
  addTask(task: QuantumTask): string {
    // Record priority for metrics
    const priority = task.priority;
    this.performanceMetrics.priorityDistribution[priority] = 
      (this.performanceMetrics.priorityDistribution[priority] || 0) + 1;
    
    // Enhanced task with metadata
    const enhancedTask: QuantumTask = {
      ...task,
      data: {
        ...task.data,
        queuedAt: Date.now(),
        estimatedCompletionTime: this.estimateTaskCompletionTime(task)
      }
    };
    
    // Add task to tasks map
    if (!this.state.tasks) {
      this.state.tasks = {};
    }
    
    this.state.tasks[task.id] = enhancedTask;

    // Initialize processingQueue if needed
    if (!this.state.processingQueue) {
      this.state.processingQueue = [];
    }
    
    // Insert based on enhanced priority algorithm
    const insertIndex = this.findOptimalInsertionPoint(enhancedTask);
    
    // Insert at the calculated position
    this.state.processingQueue.splice(insertIndex, 0, task.id);
    
    return task.id;
  }

  /**
   * Find the optimal insertion point based on multiple factors
   */
  private findOptimalInsertionPoint(task: QuantumTask): number {
    if (!this.state.processingQueue) {
      return 0;
    }
    
    // Calculate dynamic score for each position
    for (let i = 0; i < this.state.processingQueue.length; i++) {
      const taskId = this.state.processingQueue[i];
      const existingTask = this.state.tasks[taskId];
      
      if (!existingTask) continue;
      
      // Calculate priority scores with waiting time factored in
      const taskScore = this.calculateTaskScore(task);
      const existingTaskScore = this.calculateTaskScore(existingTask);
      
      if (taskScore > existingTaskScore) {
        return i;
      }
    }
    
    // If not inserted, add to end
    return this.state.processingQueue.length;
  }
  
  /**
   * Calculate task priority score based on multiple factors
   */
  private calculateTaskScore(task: QuantumTask): number {
    // Base priority
    let score = task.priority * 100;
    
    // Factor in waiting time (if task has been queued)
    const queuedAt = task.data?.queuedAt || Date.now();
    const waitingTime = Date.now() - queuedAt;
    score += Math.min(waitingTime / 1000, 30); // Cap at 30 seconds max boost
    
    // Task type factor
    switch (task.type) {
      case 'encryption': // Critical security tasks
        score += 50;
        break;
      case 'distribution': // Key distribution is time-sensitive
        score += 30;
        break;
      case 'analysis': // Analysis can wait if needed
        score += 10;
        break;
      default:
        break;
    }
    
    return score;
  }

  /**
   * Estimate task completion time based on historical data and type
   */
  private estimateTaskCompletionTime(task: QuantumTask): number {
    // Base time by task type (in ms)
    const baseTime = {
      'optimization': 800,
      'simulation': 1500,
      'analysis': 1200,
      'distribution': 600,
      'encryption': 300
    }[task.type] || 1000;
    
    // Factor in system load
    const systemLoadFactor = 1 + (this.state.processingQueue.length * 0.05);
    
    // Factor in priority (higher priority = faster processing)
    const priorityFactor = Math.max(0.5, 1 - (task.priority * 0.1));
    
    return baseTime * systemLoadFactor * priorityFactor;
  }

  /**
   * Get the next task from the processing queue with advanced selection
   */
  getNextTask(): QuantumTask | null {
    if (!this.state.processingQueue || this.state.processingQueue.length === 0) {
      return null;
    }

    // Apply advanced selection strategy based on current system state
    const taskId = this.selectOptimalNextTask();
    if (!taskId) {
      return null;
    }
    
    if (!this.state.tasks) {
      return null;
    }
    
    const task = this.state.tasks[taskId];
    if (!task) {
      // Remove invalid task ID and try again
      this.state.processingQueue = this.state.processingQueue.filter(id => id !== taskId);
      return this.getNextTask();
    }
    
    // Update task status and starting time
    const updatedTask: QuantumTask = {
      ...task,
      status: 'processing',
      startTime: Date.now()
    };
    
    this.state.tasks[taskId] = updatedTask;
    
    // Remove from processing queue and set as active
    this.state.processingQueue = this.state.processingQueue.filter(id => id !== taskId);
    this.state.activeTaskId = taskId;
    
    return updatedTask;
  }
  
  /**
   * Select the optimal next task considering system load and priority
   */
  private selectOptimalNextTask(): string | null {
    if (!this.state.processingQueue || this.state.processingQueue.length === 0) {
      return null;
    }
    
    // Default to first task in queue (already sorted by priority)
    let selectedTaskId = this.state.processingQueue[0];
    let highestScore = -1;
    
    // Consider first 5 tasks maximum to balance optimality and performance
    const tasksToConsider = Math.min(5, this.state.processingQueue.length);
    
    for (let i = 0; i < tasksToConsider; i++) {
      const taskId = this.state.processingQueue[i];
      if (!this.state.tasks) continue;
      const task = this.state.tasks[taskId];
      
      if (!task) continue;
      
      // Calculate selection score
      const waitingTime = Date.now() - (task.data?.queuedAt || Date.now());
      const waitingFactor = Math.min(waitingTime / 10000, 2); // Cap at 2x boost after 10 seconds
      
      // Execution time factor (prefer shorter tasks when system is busy)
      const estimatedTime = task.data?.estimatedCompletionTime || 1000;
      const timeFactor = 1000 / Math.max(100, estimatedTime);
      
      const score = (task.priority * 10) + (waitingFactor * 5) + timeFactor;
      
      if (score > highestScore) {
        highestScore = score;
        selectedTaskId = taskId;
      }
    }
    
    return selectedTaskId;
  }

  /**
   * Mark task as completed with enhanced metrics collection
   */
  completeTask(taskId: string, result: any): void {
    if (!this.state.tasks || !taskId) {
      return;
    }
    
    const task = this.state.tasks[taskId];
    if (!task) {
      return;
    }
    
    const startTime = task.startTime || Date.now();
    const processingTime = Date.now() - startTime;
    
    // Update performance metrics
    this.performanceMetrics.tasksProcessed++;
    this.performanceMetrics.averageProcessingTime = 
      (this.performanceMetrics.averageProcessingTime * (this.performanceMetrics.tasksProcessed - 1) + processingTime) / 
      this.performanceMetrics.tasksProcessed;
    
    const updatedTask: QuantumTask = {
      ...task,
      status: 'completed',
      result,
      completedAt: Date.now(),
      processingTime
    };
    
    this.state.tasks[taskId] = updatedTask;
    
    // Add to completed tasks
    if (!this.state.completedTasks) {
      this.state.completedTasks = [];
    }
    
    this.state.completedTasks.push(taskId);
    
    // Clear active task
    this.state.activeTaskId = null;
  }

  /**
   * Mark task as failed with detailed error reporting
   */
  failTask(taskId: string, error: string): void {
    if (!this.state.tasks || !taskId) {
      return;
    }
    
    const task = this.state.tasks[taskId];
    if (!task) {
      return;
    }
    
    const updatedTask: QuantumTask = {
      ...task,
      status: 'failed',
      error,
      completedAt: Date.now(),
      failureAnalysis: {
        errorType: this.categorizeError(error),
        recoverable: !error.includes('fatal'),
        retryCount: (task.failureAnalysis?.retryCount || 0) + 1
      }
    };
    
    this.state.tasks[taskId] = updatedTask;
    
    // Clear active task
    this.state.activeTaskId = null;
    
    // If recoverable and not exceeded retry limit, requeue with higher priority
    if (updatedTask.failureAnalysis?.recoverable && 
        updatedTask.failureAnalysis.retryCount <= 3) {
      
      // Clone task for retry with increased priority
      const retryTask: QuantumTask = {
        ...updatedTask,
        id: `${updatedTask.id}-retry-${updatedTask.failureAnalysis.retryCount}`,
        status: 'pending', // Use 'pending' instead of 'queued' to match allowed values
        priority: Math.min(updatedTask.priority + 1, 10), // Increase priority but cap at 10
        createdAt: Date.now(),
        data: {
          ...updatedTask.data,
          isRetry: true,
          originalTaskId: updatedTask.id
        }
      };
      
      // Add to queue
      this.addTask(retryTask);
    }
  }
  
  /**
   * Categorize error for better error handling
   */
  private categorizeError(error: string): string {
    if (error.includes('timeout')) return 'timeout';
    if (error.includes('memory')) return 'memory';
    if (error.includes('permission')) return 'permission';
    if (error.includes('network')) return 'network';
    if (error.includes('quantum')) return 'quantum-hardware';
    return 'unknown';
  }

  /**
   * Get a task by ID
   */
  getTask(taskId: string): QuantumTask | null {
    if (!this.state.tasks) return null;
    return this.state.tasks[taskId] || null;
  }

  /**
   * Clear all tasks
   */
  clearTasks(): void {
    this.state.tasks = {};
    this.state.processingQueue = [];
    this.state.completedTasks = [];
    this.state.activeTaskId = null;
    
    // Reset performance metrics
    this.performanceMetrics = {
      averageProcessingTime: 0,
      tasksProcessed: 0,
      priorityDistribution: {}
    };
  }

  /**
   * Get all tasks in priority order
   */
  getAllTasksSorted(): QuantumTask[] {
    if (!this.state.tasks) return [];
    return Object.values(this.state.tasks).sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * Get tasks by status
   */
  getTasksByStatus(status: 'pending' | 'processing' | 'completed' | 'failed'): QuantumTask[] {
    if (!this.state.tasks) return [];
    return Object.values(this.state.tasks).filter(task => task.status === status);
  }
  
  /**
   * Get queue health metrics
   */
  getQueueHealthMetrics() {
    if (!this.state.tasks) {
      return {
        queueLength: 0,
        processingCount: 0,
        completedCount: 0,
        failedCount: 0,
        averageWaitTimeMs: 0,
        successRate: 0,
        throughputPerMinute: 0
      };
    }
    
    const tasks = Object.values(this.state.tasks);
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const processingTasks = tasks.filter(t => t.status === 'processing');
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const failedTasks = tasks.filter(t => t.status === 'failed');
    
    // Calculate average wait time for queued tasks
    const currentTime = Date.now();
    const waitTimes = pendingTasks
      .map(t => currentTime - (t.data?.queuedAt || t.createdAt))
      .filter(time => !isNaN(time));
    
    const avgWaitTime = waitTimes.length > 0 
      ? waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length 
      : 0;
    
    // Calculate success rate
    const totalCompleted = completedTasks.length + failedTasks.length;
    const successRate = totalCompleted > 0 
      ? completedTasks.length / totalCompleted
      : 1;
    
    return {
      queueLength: pendingTasks.length,
      processingCount: processingTasks.length,
      completedCount: completedTasks.length,
      failedCount: failedTasks.length,
      averageWaitTimeMs: avgWaitTime,
      successRate,
      throughputPerMinute: this.performanceMetrics.tasksProcessed / 
        (this.performanceMetrics.averageProcessingTime / 60000 || 1)
    };
  }
}
