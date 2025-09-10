
import { WalletType } from '@/contexts/wallet-context';

export interface QuantumSecurityStatus {
  isQuantumResistant: boolean;
  securityLevel: 'high' | 'medium' | 'low';
  vulnerabilities: number;
  recommendations: string[];
}

export interface GenomicTransactionHistory {
  txId: string;
  type: string;
  timestamp: number;
  blockNumber: number;
  data: any;
}

export interface ProcessGenomicDataResult {
  success: boolean;
  tokens?: number;
  txId?: string;
  error?: string;
}

export interface TransferKontourTokensResult {
  success: boolean;
  txId?: string;
  error?: string;
}
