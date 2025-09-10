
export interface FidelityMetric {
  name: string;
  value: number;
  threshold: number;
  description: string;
}

export interface SecurityMetric {
  algorithm: string;
  keySize: number;
  resistanceScore: number;
  isQuantumResistant: boolean;
  qubitEstimate: number;
}
