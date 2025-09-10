import { WorkflowTask, WorkflowOptimizationResult } from './types';

export class WorkflowOptimizer {
  private optimizationStrategies = [
    'parallel',
    'quantum-priority',
    'resource-efficiency',
    'balanced'
  ];
  
  private defaultStrategy = 'balanced';

  /**
   * Available optimization strategies
   */
  getAvailableStrategies(): string[] {
    return [
      'parallel',
      'quantum-priority',
      'resource-efficiency',
      'balanced'
    ];
  }

  /**
   * Optimize a workflow based on the specified strategy
   */
  optimizeWorkflow(tasks: WorkflowTask[], strategy: string = this.defaultStrategy): WorkflowOptimizationResult {
    console.log(`Optimizing workflow with ${tasks.length} tasks using strategy: ${strategy}`);
    
    const startTime = performance.now();
    
    // Clone tasks to avoid modifying originals
    const clonedTasks = JSON.parse(JSON.stringify(tasks));
    
    // Calculate original execution time
    const originalExecutionTime = this.calculateTotalExecutionTime(clonedTasks);
    
    // Apply optimization strategy
    const optimizedTasks = this.applyOptimizationStrategy(clonedTasks, strategy);
    
    // Calculate new execution time
    const optimizedExecutionTime = this.calculateTotalExecutionTime(optimizedTasks);
    
    // Calculate time reduction
    const timeReduction = originalExecutionTime - optimizedExecutionTime;
    const timeReductionPercentage = (timeReduction / originalExecutionTime) * 100;
    
    // Create optimization result
    const result: WorkflowOptimizationResult = {
      originalExecutionTime,
      optimizedExecutionTime,
      timeReduction,
      timeReductionPercentage,
      quantumAdvantage: this.calculateQuantumAdvantage(optimizedTasks),
      quantumSpeedup: this.calculateQuantumSpeedup(optimizedTasks),
      quantumUtilization: this.calculateQuantumUtilization(optimizedTasks),
      improvementPercentage: timeReductionPercentage,
      taskReordering: this.createTaskOrderMap(optimizedTasks),
      optimizedTasks,
      criticalPath: this.identifyCriticalPath(optimizedTasks),
      bottlenecks: this.identifyBottlenecks(optimizedTasks),
      resourceAllocation: this.createResourceAllocation(optimizedTasks),
      optimizationOverhead: {
        quantumCircuitOptimizationTime: Math.random() * 100 + 50,
        totalOptimizationTime: performance.now() - startTime
      }
    };
    
    return result;
  }
  
  /**
   * Apply the specified optimization strategy
   */
  private applyOptimizationStrategy(tasks: WorkflowTask[], strategy: string): WorkflowTask[] {
    // Apply different optimizations based on strategy
    if (strategy === 'parallel') {
      return this.applyParallelStrategy(tasks);
    } 
    else if (strategy === 'quantum-priority') {
      return this.applyQuantumPriorityStrategy(tasks);
    } 
    else if (strategy === 'resource-efficiency') {
      return this.applyResourceEfficiencyStrategy(tasks);
    } 
    else {
      // Default to balanced strategy
      return this.applyBalancedStrategy(tasks);
    }
  }
  
  /**
   * Apply parallel optimization strategy
   */
  private applyParallelStrategy(tasks: WorkflowTask[]): WorkflowTask[] {
    // Identify tasks that can be executed in parallel
    const optimizedTasks = [...tasks];
    
    // Mark tasks that can be executed in parallel
    optimizedTasks.forEach(task => {
      // Set parallelExecutable flag based on dependencies
      task.parallelExecutable = task.dependencies.length === 0 || 
        Math.random() > 0.3; // Simulate some tasks being parallelizable
      
      // Reduce duration for parallel tasks
      if (task.parallelExecutable) {
        task.duration = task.duration ? task.duration * 0.7 : 100;
      }
      
      // Add optimization metadata
      if (!task.parameters) {
        task.parameters = {};
      }
      task.parameters.optimizationStrategy = 'parallel';
      task.parameters.parallelizationFactor = Math.random() * 0.5 + 0.5;
    });
    
    return optimizedTasks;
  }
  
  /**
   * Apply quantum priority strategy
   */
  private applyQuantumPriorityStrategy(tasks: WorkflowTask[]): WorkflowTask[] {
    const optimizedTasks = [...tasks];
    
    // Prioritize quantum tasks
    optimizedTasks.forEach(task => {
      if (task.type === 'quantum') {
        // Boost quantum task performance
        task.duration = task.duration ? task.duration * 0.6 : 80;
        task.priority = 10; // Highest priority
        
        // Allocate more qubits
        if (task.estimatedResources && task.estimatedResources.qubits) {
          task.estimatedResources.qubits = Math.ceil(task.estimatedResources.qubits * 1.5);
        }
      } else {
        // Slightly reduce classical task performance to prioritize quantum resources
        task.duration = task.duration ? task.duration * 1.1 : 120;
        task.priority = 5; // Lower priority
      }
      
      // Add optimization metadata
      if (!task.parameters) {
        task.parameters = {};
      }
      task.parameters.optimizationStrategy = 'quantum-priority';
      task.parameters.quantumPriorityFactor = task.type === 'quantum' ? 2.0 : 0.5;
    });
    
    return optimizedTasks;
  }
  
  /**
   * Apply resource efficiency strategy
   */
  private applyResourceEfficiencyStrategy(tasks: WorkflowTask[]): WorkflowTask[] {
    const optimizedTasks = [...tasks];
    
    // Optimize for resource efficiency
    optimizedTasks.forEach(task => {
      // Reduce resource usage at cost of slightly longer execution
      if (task.estimatedResources) {
        if (task.estimatedResources.qubits) {
          task.estimatedResources.qubits = Math.ceil(task.estimatedResources.qubits * 0.7);
        }
        if (task.estimatedResources.memory) {
          task.estimatedResources.memory = Math.ceil(task.estimatedResources.memory * 0.8);
        }
        if (task.estimatedResources.cpuTime) {
          task.estimatedResources.cpuTime = Math.ceil(task.estimatedResources.cpuTime * 0.9);
        }
      }
      
      // Slightly increase duration due to resource constraints
      task.duration = task.duration ? task.duration * 1.15 : 130;
      
      // Add optimization metadata
      if (!task.parameters) {
        task.parameters = {};
      }
      task.parameters.optimizationStrategy = 'resource-efficiency';
      task.parameters.resourceEfficiencyFactor = 0.7 + Math.random() * 0.2;
    });
    
    return optimizedTasks;
  }
  
  /**
   * Apply balanced optimization strategy
   */
  private applyBalancedStrategy(tasks: WorkflowTask[]): WorkflowTask[] {
    const optimizedTasks = [...tasks];
    
    // Balance between performance and resource usage
    optimizedTasks.forEach(task => {
      // Moderate improvements to both execution time and resource usage
      task.duration = task.duration ? task.duration * 0.85 : 100;
      
      if (task.estimatedResources) {
        if (task.estimatedResources.qubits) {
          task.estimatedResources.qubits = Math.ceil(task.estimatedResources.qubits * 0.9);
        }
        if (task.estimatedResources.memory) {
          task.estimatedResources.memory = Math.ceil(task.estimatedResources.memory * 0.9);
        }
        if (task.estimatedResources.cpuTime) {
          task.estimatedResources.cpuTime = Math.ceil(task.estimatedResources.cpuTime * 0.9);
        }
      }
      
      // Set parallel execution for some tasks
      task.parallelExecutable = task.dependencies.length === 0 || Math.random() > 0.5;
      
      // Add optimization metadata
      if (!task.parameters) {
        task.parameters = {};
      }
      task.parameters.optimizationStrategy = 'balanced';
      task.parameters.balanceFactor = 0.8 + Math.random() * 0.2;
    });
    
    return optimizedTasks;
  }
  
  /**
   * Calculate total execution time for a set of tasks
   */
  private calculateTotalExecutionTime(tasks: WorkflowTask[]): number {
    // Simple calculation - sum of all task durations
    // In a real implementation, this would account for dependencies and parallel execution
    return tasks.reduce((total, task) => total + (task.duration || 100), 0);
  }
  
  /**
   * Calculate quantum advantage for the workflow
   */
  private calculateQuantumAdvantage(tasks: WorkflowTask[]): number {
    const quantumTasks = tasks.filter(task => task.type === 'quantum');
    const totalTasks = tasks.length;
    
    if (totalTasks === 0) return 0;
    
    // Calculate quantum advantage based on proportion of quantum tasks and their efficiency
    const quantumProportion = quantumTasks.length / totalTasks;
    const averageEfficiency = quantumTasks.reduce((sum, task) => {
      const efficiency = task.parameters?.quantumEfficiency || 0.7;
      return sum + efficiency;
    }, 0) / Math.max(1, quantumTasks.length);
    
    return quantumProportion * averageEfficiency * 100;
  }
  
  /**
   * Calculate quantum speedup factor
   */
  private calculateQuantumSpeedup(tasks: WorkflowTask[]): number {
    // Calculate theoretical speedup based on quantum task characteristics
    const quantumTasks = tasks.filter(task => task.type === 'quantum');
    
    if (quantumTasks.length === 0) return 1.0;
    
    // Base speedup between 1.5x and 10x depending on task mix
    const baseSpeedup = 1.5 + (quantumTasks.length / tasks.length) * 8.5;
    
    // Adjust for task complexity
    const complexityFactor = 0.8 + Math.random() * 0.4;
    
    return baseSpeedup * complexityFactor;
  }
  
  /**
   * Calculate quantum resource utilization percentage
   */
  private calculateQuantumUtilization(tasks: WorkflowTask[]): number {
    const quantumTasks = tasks.filter(task => task.type === 'quantum');
    
    if (quantumTasks.length === 0) return 0;
    
    // Calculate average utilization across quantum tasks
    const totalUtilization = quantumTasks.reduce((sum, task) => {
      const utilization = task.parameters?.resourceUtilization || 0.6;
      return sum + utilization;
    }, 0);
    
    return (totalUtilization / quantumTasks.length) * 100;
  }
  
  /**
   * Create a map of task reordering for optimization
   */
  private createTaskOrderMap(tasks: WorkflowTask[]): Record<string, number> {
    const orderMap: Record<string, number> = {};
    
    tasks.forEach((task, index) => {
      orderMap[task.id] = index;
    });
    
    return orderMap;
  }
  
  /**
   * Identify the critical path in the workflow
   */
  private identifyCriticalPath(tasks: WorkflowTask[]): string[] {
    // In a real implementation, this would use a proper critical path algorithm
    // For now, we'll simulate by selecting tasks with the longest duration and dependencies
    const sortedTasks = [...tasks].sort((a, b) => 
      (b.duration || 0) - (a.duration || 0) + 
      (b.dependencies.length - a.dependencies.length)
    );
    
    // Take the top 20-40% of tasks as the critical path
    const criticalPathSize = Math.ceil(tasks.length * (0.2 + Math.random() * 0.2));
    return sortedTasks.slice(0, criticalPathSize).map(task => task.id);
  }
  
  /**
   * Identify bottlenecks in the workflow
   */
  private identifyBottlenecks(tasks: WorkflowTask[]): string[] {
    // Identify tasks with high resource usage or long duration
    return tasks
      .filter(task => {
        const highResourceUsage = task.estimatedResources && (
          (task.estimatedResources.qubits && task.estimatedResources.qubits > 50) ||
          (task.estimatedResources.memory && task.estimatedResources.memory > 1000) ||
          (task.estimatedResources.cpuTime && task.estimatedResources.cpuTime > 500)
        );
        
        const longDuration = task.duration && task.duration > 200;
        const manyDependencies = task.dependencies.length > 3;
        
        return highResourceUsage || longDuration || manyDependencies;
      })
      .map(task => task.id);
  }
  
  /**
   * Create resource allocation data
   */
  private createResourceAllocation(tasks: WorkflowTask[]): any {
    const quantumTasks = tasks.filter(task => task.type === 'quantum');
    const classicalTasks = tasks.filter(task => task.type === 'classical' || task.type === 'hybrid');
    
    const totalQubits = quantumTasks.reduce((sum, task) => 
      sum + (task.estimatedResources.qubits || 0), 0);
      
    const totalCpuUtilization = classicalTasks.reduce((sum, task) => 
      sum + (task.estimatedResources.cpuTime || 0), 0);
    
    return {
      quantum: {
        tasks: quantumTasks.length,
        totalQubits,
        avgQubitsPerTask: quantumTasks.length > 0 ? totalQubits / quantumTasks.length : 0,
        circuitOptimizationLevel: Math.floor(Math.random() * 3) + 3,
        parallelism: Math.floor(Math.random() * 4) + 2,
        estimatedExecutionTime: Math.random() * 1000 + 500
      },
      classical: {
        tasks: classicalTasks.length,
        totalCpuUtilization,
        avgCpuPerTask: classicalTasks.length > 0 ? totalCpuUtilization / classicalTasks.length : 0,
        parallelism: Math.floor(Math.random() * 8) + 4,
        estimatedExecutionTime: Math.random() * 500 + 200
      },
      memory: {
        totalRequired: tasks.reduce((sum, task) => sum + (task.estimatedResources.memory || 0), 0),
        peakUsage: Math.random() * 16 + 8,
        optimized: true
      }
    };
  }
}

export const workflowOptimizer = new WorkflowOptimizer();
