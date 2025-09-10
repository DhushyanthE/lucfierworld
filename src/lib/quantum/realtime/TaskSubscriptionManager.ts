
import { Task } from '../types';

export class TaskSubscriptionManager {
  private subscribers: Map<string, Function[]> = new Map();
  private activeSubscriptions: Set<string> = new Set();
  private taskQueue: Task[] = [];
  private processingInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(private processingDelay: number = 500) {}

  subscribe(taskId: string, callback: Function): void {
    if (!this.subscribers.has(taskId)) {
      this.subscribers.set(taskId, []);
    }
    this.subscribers.get(taskId)?.push(callback);
    this.activeSubscriptions.add(taskId);
  }

  unsubscribe(taskId: string, callback: Function): void {
    if (this.subscribers.has(taskId)) {
      const callbacks = this.subscribers.get(taskId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
        if (callbacks.length === 0) {
          this.subscribers.delete(taskId);
          this.activeSubscriptions.delete(taskId);
        }
      }
    }
  }

  publish(taskId: string, data: any): void {
    if (this.subscribers.has(taskId)) {
      this.subscribers.get(taskId)?.forEach(callback => callback(data));
    }
  }

  queueTask(task: Task): void {
    const taskWithDefaults = {
      ...task,
      priority: task.priority !== undefined ? task.priority : this.getDefaultPriority(),
      parameters: task.parameters || {}
    };
    this.taskQueue.push(taskWithDefaults);
    this.taskQueue.sort((a, b) => this.getTaskPriority(a) - this.getTaskPriority(b));
    if (!this.isProcessing) {
      this.startProcessing();
    }
  }

  private startProcessing(): void {
    if (this.isProcessing || this.processingInterval) return;
    
    this.isProcessing = true;
    this.processingInterval = setInterval(() => {
      if (this.taskQueue.length === 0) {
        this.stopProcessing();
        return;
      }
      
      const task = this.taskQueue.shift();
      if (task) {
        this.processTask(task);
      }
    }, this.processingDelay);
  }

  private stopProcessing(): void {
    clearInterval(this.processingInterval!);
    this.processingInterval = null;
    this.isProcessing = false;
  }

  private async processTask(task: Task): Promise<void> {
    try {
      // Simulate task processing
      const result = await this.simulateTaskExecution(task);
      this.publish(task.id, result);
    } catch (error) {
      console.error(`Task ${task.id} failed:`, error);
      this.publish(task.id, { error: 'Task failed' });
    } finally {
      this.activeSubscriptions.delete(task.id);
    }
  }

  private async simulateTaskExecution(task: Task): Promise<any> {
    const delay = Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return {
      taskId: task.id,
      result: `Task ${task.operation} completed successfully`,
      parameters: this.getTaskParameters(task)
    };
  }

  private getTaskPriority(task: Task): number {
    // Check if task has priority property, default to 1 if not
    return task.priority !== undefined ? task.priority : 1;
  }

  private getDefaultPriority(): number {
    return 1;
  }

  private getTaskParameters(task: Task): any {
    // Return empty object if parameters don't exist
    return task.parameters || {};
  }
}
