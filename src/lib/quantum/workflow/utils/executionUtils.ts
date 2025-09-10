
/**
 * Utilities for calculating workflow execution time and task duration
 */
import { WorkflowTask } from '../types';

/**
 * Calculate the total execution time if all tasks are run sequentially
 * @param tasks The workflow tasks
 * @returns The total execution time
 */
export function calculateSequentialExecutionTime(tasks: WorkflowTask[]): number {
  return tasks.reduce((sum, task) => sum + (task.duration || estimateTaskDuration(task)), 0);
}

/**
 * Calculate the total execution time with optimal parallelization
 * @param orderedTasks The ordered tasks to execute
 * @returns The total execution time with parallelization
 */
export function calculateParallelExecutionTime(orderedTasks: WorkflowTask[]): number {
  if (orderedTasks.length === 0) return 0;
  
  // Track the earliest finish time for each task
  const finishTimes = new Map<string, number>();
  
  // Process tasks in order
  orderedTasks.forEach(task => {
    // Find the latest finish time of all dependencies
    let startTime = 0;
    // Get dependencies using either dependsOn or dependencies property
    const dependencies = task.dependsOn || task.dependencies || [];
    
    if (dependencies && dependencies.length > 0) {
      startTime = Math.max(
        ...dependencies.map(depId => finishTimes.get(depId) || 0)
      );
    }
    
    // Calculate this task's finish time
    const duration = task.duration || estimateTaskDuration(task);
    const finishTime = startTime + duration;
    finishTimes.set(task.id, finishTime);
  });
  
  // The workflow execution time is the maximum finish time
  return Math.max(...Array.from(finishTimes.values()));
}

/**
 * Estimate the duration of a task based on its attributes
 * @param task The task to estimate
 * @returns The estimated duration
 */
export function estimateTaskDuration(task: WorkflowTask): number {
  // Base duration depends on task complexity (represented by priority)
  const baseDuration = task.priority ? 100 / task.priority : 100;
  
  // Apply slight randomness to make it more realistic
  const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
  
  return baseDuration * randomFactor;
}
