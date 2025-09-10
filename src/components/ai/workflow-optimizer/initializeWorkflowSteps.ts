
import { Database, Cpu, Network, Bot, CheckCircle } from 'lucide-react';
import { WorkflowTask } from '@/lib/quantum/WorkflowOptimizer';
import React from 'react';

export function initializeWorkflowSteps(): WorkflowTask[] {
  return [
    {
      id: 'data-collection',
      name: 'Data Collection',
      status: 'pending',
      progress: 0,
      description: 'Collecting blockchain transaction data',
      icon: React.createElement(Database, { className: "h-4 w-4" }),
      type: 'classical',
      parameters: {},
      dependencies: [],
      priority: 1,
      estimatedResources: {}
    },
    {
      id: 'quantum-processing',
      name: 'Quantum Processing',
      status: 'pending',
      progress: 0,
      description: 'Processing data through quantum circuits',
      icon: React.createElement(Cpu, { className: "h-4 w-4" }),
      dependsOn: ['data-collection'],
      dependencies: ['data-collection'],
      type: 'quantum',
      parameters: {},
      priority: 2,
      estimatedResources: {}
    },
    {
      id: 'ml-analysis',
      name: 'ML Analysis',
      status: 'pending',
      progress: 0,
      description: 'Machine learning pattern detection',
      icon: React.createElement(Network, { className: "h-4 w-4" }),
      dependsOn: ['quantum-processing'],
      dependencies: ['quantum-processing'],
      type: 'hybrid',
      parameters: {},
      priority: 3,
      estimatedResources: {}
    },
    {
      id: 'ai-optimization',
      name: 'AI Optimization',
      status: 'pending',
      progress: 0,
      description: 'Neural networks optimizing parameters',
      icon: React.createElement(Bot, { className: "h-4 w-4" }),
      dependsOn: ['ml-analysis'],
      dependencies: ['ml-analysis'],
      type: 'hybrid',
      parameters: {},
      priority: 4,
      estimatedResources: {}
    },
    {
      id: 'validation',
      name: 'Result Validation',
      status: 'pending',
      progress: 0,
      description: 'Validating optimization results',
      icon: React.createElement(CheckCircle, { className: "h-4 w-4" }),
      dependsOn: ['ai-optimization'],
      dependencies: ['ai-optimization'],
      type: 'classical',
      parameters: {},
      priority: 5,
      estimatedResources: {}
    }
  ];
}
