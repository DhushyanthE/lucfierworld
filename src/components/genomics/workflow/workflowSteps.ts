
import { WorkflowStepType } from '@/types';

// Genomic workflow steps
export function getGenomicWorkflowSteps(): WorkflowStepType[] {
  return [
    {
      id: 'data-collection',
      name: 'Genomic Data Collection',
      status: 'idle',
      progress: 0,
      description: 'Collecting genomic sequences'
    },
    {
      id: 'preprocessing',
      name: 'Sequence Preprocessing',
      status: 'idle',
      progress: 0,
      description: 'Preparing sequences for analysis',
      dependsOn: ['data-collection']
    },
    {
      id: 'ai-analysis',
      name: 'AI-Powered Analysis',
      status: 'idle',
      progress: 0,
      description: 'Analyzing sequences with neural networks',
      dependsOn: ['preprocessing']
    },
    {
      id: 'quantum-processing',
      name: 'Quantum Pattern Detection',
      status: 'idle',
      progress: 0,
      description: 'Applying quantum algorithms to find patterns',
      dependsOn: ['ai-analysis']
    },
    {
      id: 'blockchain-verification',
      name: 'Blockchain Verification',
      status: 'idle',
      progress: 0,
      description: 'Securing results in blockchain',
      dependsOn: ['quantum-processing']
    },
    {
      id: 'visualization',
      name: 'Results Visualization',
      status: 'idle',
      progress: 0,
      description: 'Creating visualizations of findings',
      dependsOn: ['blockchain-verification']
    }
  ];
}
