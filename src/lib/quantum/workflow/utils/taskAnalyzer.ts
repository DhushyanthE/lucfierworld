
import { WorkflowTask } from '../types';

/**
 * Analyzes task dependencies and identifies various optimization opportunities
 * 
 * @param tasks The workflow tasks
 * @returns Analysis results with critical path, independent tasks, bottlenecks, etc.
 */
export function analyzeTaskDependencies(tasks: WorkflowTask[]) {
  // Find critical path (longest path through the workflow)
  const criticalPathTaskIds = findCriticalPath(tasks);
  
  // Find tasks that can run independently (no dependencies)
  const independentTasks = tasks.filter(task => 
    !task.dependencies || task.dependencies.length === 0
  );
  
  // Identify bottlenecks (tasks with multiple dependents)
  const bottlenecks = findBottlenecks(tasks);
  
  // Find sets of tasks that can be parallelized
  const parallelizableSets = findParallelizableSets(tasks);
  
  return {
    criticalPathTaskIds,
    independentTasks,
    bottlenecks,
    parallelizableSets,
    dependencyDepth: calculateDependencyDepth(tasks),
    maxParallelism: estimateMaxParallelism(tasks)
  };
}

/**
 * Find the critical path (longest dependency chain)
 */
function findCriticalPath(tasks: WorkflowTask[]): string[] {
  // For demo, just return the IDs of tasks with the most dependencies
  return tasks
    .sort((a, b) => 
      (b.dependencies?.length || 0) - (a.dependencies?.length || 0)
    )
    .slice(0, 3)
    .map(task => task.id);
}

/**
 * Find tasks that are bottlenecks (many tasks depend on them)
 */
function findBottlenecks(tasks: WorkflowTask[]): string[] {
  // Create dependency count map
  const dependencyCount = new Map<string, number>();
  
  // Count how many tasks depend on each task
  tasks.forEach(task => {
    const deps = task.dependencies || [];
    deps.forEach(depId => {
      dependencyCount.set(depId, (dependencyCount.get(depId) || 0) + 1);
    });
  });
  
  // Find tasks with multiple dependents (bottlenecks)
  return Array.from(dependencyCount.entries())
    .filter(([_, count]) => count > 1)
    .sort(([_, countA], [__, countB]) => countB - countA)
    .map(([id, _]) => id);
}

/**
 * Find sets of tasks that can be executed in parallel
 */
function findParallelizableSets(tasks: WorkflowTask[]): string[][] {
  const result: string[][] = [];
  const processed = new Set<string>();
  
  // Process tasks level by level (breadth-first approach)
  let currentLevel: WorkflowTask[] = tasks.filter(task => 
    !task.dependencies || task.dependencies.length === 0
  );
  
  while (currentLevel.length > 0) {
    // Add current level tasks to result
    const levelIds = currentLevel.map(task => task.id);
    if (levelIds.length > 0) {
      result.push(levelIds);
    }
    
    // Mark as processed
    currentLevel.forEach(task => processed.add(task.id));
    
    // Find next level tasks
    currentLevel = tasks.filter(task => {
      // Skip already processed tasks
      if (processed.has(task.id)) return false;
      
      // Check if all dependencies are processed
      const deps = task.dependencies || [];
      return deps.every(depId => processed.has(depId));
    });
  }
  
  return result;
}

/**
 * Calculate the maximum dependency depth
 */
function calculateDependencyDepth(tasks: WorkflowTask[]): number {
  // Implementation of depth calculation algorithm
  const depths = new Map<string, number>();
  
  // Calculate depth for each task
  tasks.forEach(task => {
    calculateTaskDepth(task, tasks, depths);
  });
  
  // Return maximum depth
  return Math.max(...Array.from(depths.values()), 0);
}

/**
 * Calculate depth for a single task
 */
function calculateTaskDepth(
  task: WorkflowTask, 
  allTasks: WorkflowTask[], 
  depths: Map<string, number>
): number {
  // If depth is already calculated, return it
  if (depths.has(task.id)) {
    return depths.get(task.id) || 0;
  }
  
  // If no dependencies, depth is 0
  const deps = task.dependencies || [];
  if (deps.length === 0) {
    depths.set(task.id, 0);
    return 0;
  }
  
  // Calculate max depth of dependencies
  let maxDepth = 0;
  deps.forEach(depId => {
    const depTask = allTasks.find(t => t.id === depId);
    if (depTask) {
      const depDepth = calculateTaskDepth(depTask, allTasks, depths);
      maxDepth = Math.max(maxDepth, depDepth);
    }
  });
  
  // Depth is max dependency depth + 1
  const depth = maxDepth + 1;
  depths.set(task.id, depth);
  return depth;
}

/**
 * Estimate maximum possible parallelism
 */
function estimateMaxParallelism(tasks: WorkflowTask[]): number {
  const parallelSets = findParallelizableSets(tasks);
  return Math.max(...parallelSets.map(set => set.length), 1);
}
