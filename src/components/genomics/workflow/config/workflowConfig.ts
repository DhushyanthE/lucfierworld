
import { AIModelType } from '@/types';

export interface GenomicWorkflowConfig {
  quantumEnabled: boolean;
  blockchainVerification: boolean;
  defaultModel: AIModelType;
}

export const defaultGenomicWorkflowConfig: GenomicWorkflowConfig = {
  quantumEnabled: true,
  blockchainVerification: true,
  defaultModel: 'gemini'
};
