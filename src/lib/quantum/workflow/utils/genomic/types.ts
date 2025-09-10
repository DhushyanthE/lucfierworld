
/**
 * Type definitions for Genomic Blockchain Integration
 */

// Blockchain data structure
export interface GenomicBlockchainData {
  blockchainTxId: string;
  sequenceHash?: string;
  dataHash?: string;
  timestamp: number;
  accessControl: {
    isPublic: boolean;
    allowedAddresses: string[];
    encryptionType?: string;
  };
  blockHeight?: number;
  kontourTokenPrice?: number;
}

// IoT device data structure
export interface IoTDeviceData {
  deviceId: string;
  timestamp: number;
  readings: Record<string, any>;
  metadata?: Record<string, any>;
  status?: string;
}

// Genomic dataset structure
export interface GenomicDataset {
  id: string;
  hash: string;
  metadata: {
    sequenceLength: number;
    species: string;
    sampleDate: string;
    sampleType: string;
    researchPurpose: string;
    ownerAddress: string;
    allowedAccess: string[];
  };
  sequenceSegments: Array<{
    id: string;
    data: string;
    verified: boolean;
  }>;
  timestamp: number;
}

// Analysis results
export interface GenomicAnalysisResult {
  hash: string;
  analysis: {
    baseComposition: {
      A: number;
      C: number;
      G: number;
      T: number;
    };
    gcContent: number;
    uniquenessScore: number;
    patternCount: number;
    potentialGenes: number;
  };
  patterns: any[];
}

// Transaction history
export interface GenomicTransactionHistory {
  txId: string;
  type: string;
  timestamp: number;
  blockNumber: number;
  data: any;
}

// Access request
export interface GenomicAccessRequest {
  requestId: string;
  requestorAddress: string;
  sequenceHash: string;
  purpose: string;
  timestamp: number;
}
