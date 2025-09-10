
/**
 * Quantum types definitions
 */

export interface QuantumGate {
  type: string;  // Using string instead of enum to be compatible with both versions
  targets: number[];
  controls?: number[];
  position: { x: number; y: number } | number;
  fidelity: number;
  angle?: number;
}

export interface Task {
  id: string;
  operation: string;
  priority?: number;
  parameters?: any;
}

// Define task status types
export type TaskStatus = 'queued' | 'processing' | 'completed' | 'failed';

// Define task type
export interface TaskWithStatus extends Task {
  status: TaskStatus;
  progress?: number;
  result?: any;
  error?: string;
  createdAt: number;
  startTime?: number;
  completedAt?: number;
}

// Quantum Key Distribution types
export interface QuantumKeyDistribution {
  sharedKey: string;
  keyLength: number;
  errorRate: number;
  secure: boolean;
  participants: string[];
  createdAt: number;
  keyId: string;
}

// Quantum Wallet types
export interface QuantumKeyPair {
  keyId: string;
  publicKey: string;
  privateKey: string;
  createdAt: number;
  quantumResistant: boolean;
}

export interface QuantumSignature {
  signature: string;
  algorithm: string;
  keyId: string;
  timestamp: number;
  hash: string;
}

// Circuit visualization types
export interface QuantumCircuit {
  numQubits: number;
  gates: QuantumGate[];
  depth: number;
  fidelity: number;
  name?: string;
  id?: string;
  qubits?: number;
}

// Advanced MPQKD types
export interface MPQKDParticipant {
  id: string;
  name: string;
  publicKey: string;
  status: 'active' | 'inactive' | 'compromised';
  lastActive: number;
  role: 'coordinator' | 'member' | 'auditor' | 'observer';
  joinedAt: number;
  pairwiseChannels: { participantId: string, established: number }[];
}

export interface AdvancedMPQKDGroup {
  id: string;
  name: string;
  description: string;
  participants: MPQKDParticipant[];
  createdAt: number;
  keyGenerationCount: number;
  lastKeyGeneration: number;
  securityLevel: 'standard' | 'enhanced' | 'maximum';
  coordinatorId: string;
  topology: 'star' | 'mesh' | 'tree';
  keyHistory: {
    keyId: string;
    timestamp: number;
    reason: string;
    securityMetrics: {
      entropy: number;
      qberAverage: number;
      detectedInterference: boolean;
    };
  }[];
  auditLog: {
    id: string;
    timestamp: number;
    eventType: string;
    details: string;
    securityImpact: 'none' | 'low' | 'medium' | 'high';
  }[];
  accessControl?: {
    accessPolicy: string;
    rolePermissions: Record<string, any>;
    temporaryAccess: any[];
  };
}

export interface MPQKDKeyGenerationEvent {
  id: string;
  groupId: string;
  timestamp: number;
  participantIds: string[];
  keySize: number;
  success: boolean;
  errorRate?: number;
}

export interface MPQKDAuditEvent {
  id: string;
  groupId: string;
  eventType: 'access' | 'generation' | 'compromise' | 'rotation';
  timestamp: number;
  initiatedBy: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface MPQKDMessage {
  id: string;
  sender: string;
  recipients: string[];
  encryptedContent: string;
  timestamp: number;
  keyId: string;
  readReceipts: { [participantId: string]: number };
}

export interface MPQKDAccessControl {
  groupId: string;
  accessLevel: 'read' | 'write' | 'admin';
  participants: { [participantId: string]: 'read' | 'write' | 'admin' };
}

// Hierarchical Groups types
export interface KeyRotationPolicy {
  intervalHours: number;
  lastRotation: number;
  autoRotate: boolean;
  rotationConditions: {
    participantJoin: boolean;
    participantLeave: boolean;
    suspectedCompromise: boolean;
  };
  intervalMs?: number;
  onMembershipChange?: boolean;
  onSecurityEvent?: boolean;
  minimumEntropy?: number;
}

export interface HierarchicalGroup {
  id: string;
  groupId: string; // For backward compatibility
  name: string;
  level: number;
  parentId?: string;
  parentGroupId?: string; // For backward compatibility
  childrenIds: string[];
  participants: string[];
  adminIds: string[];
  memberIds: string[];
  createdAt: number;
  keyRotationPolicy: KeyRotationPolicy;
  activeKeyId?: string;
  previousKeyIds: string[];
  lastKeyRotation: number;
  encryptedGroupKey: string;
  subgroups: any[];
}

// WorkflowTask type for workflow optimizer
export interface WorkflowTask {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  description?: string;
  icon?: React.ReactNode;
  dependsOn?: string[];
}
