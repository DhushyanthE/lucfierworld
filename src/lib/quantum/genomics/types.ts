
/**
 * Type definitions for genomic data processing
 */

export interface ProcessingStatus {
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  message?: string;
  errorMessage?: string;
}

export interface SequenceMetadata {
  source: string;
  species: string;
  sampleType?: string;
  purpose?: string;
  tags?: string[];
  owner?: string;
  confidentiality?: 'public' | 'private' | 'restricted';
  creationDate?: string;
  lastModified?: string;
  experimentId?: string;
}

export interface SequenceResult {
  sequenceId: string;
  quantumHash: string;
  matchScore: number;
  blockchainTxId: string;
  quantumEntanglementScore: number;
  analysisResults: SequenceAnalysis;
  metadata: SequenceMetadata;
  patternFindings?: PatternResult[];
  verificationHistory?: VerificationRecord[];
}

export interface SequenceAnalysis {
  gcContent: number;
  repeats: number;
  mutations: number;
  structuralComplexity: number;
  methylationPattern?: MethylationInfo;
  epitopeAnalysis?: EpitopeAnalysis;
  secondaryStructures?: SecondaryStructure[];
}

export interface MethylationInfo {
  totalMethylatedSites: number;
  methylationDensity: number;
  methylationPattern: string;
}

export interface EpitopeAnalysis {
  predictedEpitopes: number;
  immunogenicityScore: number;
}

export interface SecondaryStructure {
  type: 'hairpin' | 'stem-loop' | 'pseudoknot';
  startPosition: number;
  endPosition: number;
  stabilityScore: number;
}

export interface SequenceSubmissionOptions {
  priority?: 'normal' | 'high' | 'critical';
  useQuantumProcessing?: boolean;
  storagePolicy?: 'blockchain' | 'localonly' | 'hybrid';
  notifyOnCompletion?: boolean;
  encryptionLevel?: 'standard' | 'enhanced' | 'quantum';
  accessControl?: {
    accessList: string[];
    expirationDate?: string;
  };
}

/**
 * Pattern detection result interface
 */
export interface PatternResult {
  patternType: 'repeat' | 'snp' | 'inversion' | 'translocation';
  position: number;
  length: number;
  confidence: number;
  significance?: 'low' | 'medium' | 'high';
  associatedGenes?: string[];
  clinicalRelevance?: string;
}

/**
 * Verification record interface
 */
export interface VerificationRecord {
  timestamp: number;
  verifier: string;
  blockchainTxId: string;
  status: 'verified' | 'rejected' | 'pending';
  integrityScore: number;
  notes?: string;
}

/**
 * Blockchain verification result interface
 */
export interface BlockchainVerificationResult {
  verified: boolean;
  timestamp: number;
  blockNumber: number;
  transactionHash: string;
  integrityScore: number;
  signatureValidation: boolean;
  quantumResistance: 'low' | 'medium' | 'high';
  verificationMethod: string;
}
