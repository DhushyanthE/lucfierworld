/**
 * Utilities for analyzing and manipulating task dependencies
 */
import { WorkflowTask } from '../types';

/**
 * Build a dependency graph from workflow tasks
 * @param tasks The workflow tasks
 * @returns A map of task IDs to their dependent task IDs
 */
export function buildDependencyGraph(tasks: WorkflowTask[]): Map<string, string[]> {
  const graph = new Map<string, string[]>();
  
  // Initialize graph with empty arrays for all tasks
  tasks.forEach(task => {
    graph.set(task.id, []);
  });
  
  // Add dependencies to the graph
  tasks.forEach(task => {
    // Support both dependsOn and dependencies properties
    const dependencies = task.dependsOn || task.dependencies || [];
    if (dependencies && dependencies.length > 0) {
      dependencies.forEach(depId => {
        const dependents = graph.get(depId) || [];
        dependents.push(task.id);
        graph.set(depId, dependents);
      });
    }
  });
  
  return graph;
}

/**
 * Find the critical path in a workflow
 * @param tasks The workflow tasks or dependency graph
 * @returns Array of task IDs representing the critical path
 */
export function findCriticalPath(tasks: WorkflowTask[] | Map<string, string[]>): string[] {
  // Implementation depends on the type of input
  if (tasks instanceof Map) {
    // If input is a dependency graph
    return findCriticalPathFromGraph(tasks);
  } else {
    // If input is an array of tasks, build graph first
    const graph = buildDependencyGraph(tasks);
    return findCriticalPathFromGraph(graph);
  }
}

/**
 * Find critical path from dependency graph
 */
function findCriticalPathFromGraph(graph: Map<string, string[]>): string[] {
  const paths: string[][] = [];
  
  // Start with tasks that have no dependents
  const terminalTasks = Array.from(graph.entries())
    .filter(([_, dependents]) => dependents.length === 0)
    .map(([taskId, _]) => taskId);
  
  // Build paths from each terminal task
  terminalTasks.forEach(taskId => {
    const path = [taskId];
    extendPathBackward(path, graph, paths);
  });
  
  // Return the longest path
  return paths.reduce((longest, current) => 
    current.length > longest.length ? current : longest, []); 
}

/**
 * Helper function to extend paths recursively backward
 */
function extendPathBackward(
  currentPath: string[], 
  graph: Map<string, string[]>, 
  allPaths: string[][]
): void {
  const taskId = currentPath[0]; // First element (we're going backwards)
  
  // Find all tasks that have this task as a dependent
  const predecessors = Array.from(graph.entries())
    .filter(([_, dependents]) => dependents.includes(taskId))
    .map(([id, _]) => id);
  
  if (predecessors.length === 0) {
    // This is a starting task, add the path to allPaths
    allPaths.push([...currentPath]);
    return;
  }
  
  // Extend the path with each predecessor
  predecessors.forEach(predId => {
    // Avoid cycles
    if (!currentPath.includes(predId)) {
      const newPath = [predId, ...currentPath];
      extendPathBackward(newPath, graph, allPaths);
    }
  });
}

/**
 * Optimize the order of tasks for execution
 * @param tasks The workflow tasks
 * @returns The optimized order of tasks
 */
export function optimizeTaskOrder(tasks: WorkflowTask[]): WorkflowTask[] {
  // Simple topological sorting implementation
  
  // Create a copy of the tasks
  const remainingTasks = [...tasks];
  const result: WorkflowTask[] = [];
  
  // Keep processing until all tasks are added to the result
  while (remainingTasks.length > 0) {
    // Find tasks with no unprocessed dependencies
    const availableTasks = remainingTasks.filter(task => {
      const deps = task.dependsOn || task.dependencies || [];
      return deps.every(depId => 
        result.some(addedTask => addedTask.id === depId) || 
        !remainingTasks.some(t => t.id === depId)
      );
    });
    
    if (availableTasks.length === 0 && remainingTasks.length > 0) {
      // There's a dependency cycle, break it by adding the first remaining task
      result.push(remainingTasks[0]);
      remainingTasks.splice(0, 1);
    } else {
      // Add available tasks to result and remove from remaining
      availableTasks.forEach(task => {
        result.push(task);
        const index = remainingTasks.findIndex(t => t.id === task.id);
        if (index >= 0) {
          remainingTasks.splice(index, 1);
        }
      });
    }
  }
  
  return result;
}
