
import { TransactionSimulationResult, BigDataMetrics } from './types';

/**
 * Simulate quantum transaction processing with enhanced Big Data capabilities
 */
export function simulateQuantumTransactionProcessing(
  transactionCount: number,
  blockSize: number,
  optimized: boolean = false,
  bigDataMode: boolean = false
): TransactionSimulationResult {
  // For demo purposes
  const successRate = 0.92 + (Math.random() * 0.07);
  const avgTime = 2.5 - (optimized ? 0.8 : 0);
  
  // Generate Big Data metrics when bigDataMode is enabled
  let bigDataMetrics: BigDataMetrics | undefined;
  
  if (bigDataMode) {
    // Calculate metrics based on transaction volume and optimization
    const processingVolume = transactionCount * 0.001 * (optimized ? 1.8 : 1.0);
    const optimizationFactor = optimized ? 1.5 : 1.0;
    
    bigDataMetrics = {
      processingVolume: processingVolume,
      storageThroughput: processingVolume * 0.8,
      compressionRatio: 3.2 + (optimized ? 1.1 : 0),
      dataParallelism: Math.min(32, Math.ceil(transactionCount / 1000) * 2 * optimizationFactor),
      distributedNodesUtilized: Math.min(16, Math.ceil(transactionCount / 2000) * optimizationFactor),
      quantumEnhanced: optimized
    };
  }
  
  return {
    success: true,
    processedCount: transactionCount,
    avgProcessingTime: avgTime,
    successRate: successRate,
    energyEfficiency: 0.02 + (optimized ? 0.01 : 0),
    hash: "0x" + Math.random().toString(16).substring(2, 10),
    blockHeight: 1000000 + Math.floor(Math.random() * 1000),
    quantumSecure: true,
    bigDataMetrics
  };
}

/**
 * Simulate Big Data pipeline processing in a quantum-enhanced blockchain
 */
export function simulateBigDataPipelineProcessing(
  dataVolumeGB: number,
  processingNodes: number,
  useQuantumAcceleration: boolean = true
): {
  processingTime: number;
  throughputGBps: number;
  nodeUtilization: number[];
  quantumAccelerationFactor: number;
  energyEfficiency: number;
} {
  // Base processing capabilities
  const baseNodeThroughput = 2.5; // GB per second per node
  const quantumFactor = useQuantumAcceleration ? (1.8 + Math.random() * 0.6) : 1.0;
  
  // Calculate processing metrics
  const totalThroughput = baseNodeThroughput * processingNodes * quantumFactor;
  const processingTime = dataVolumeGB / totalThroughput;
  
  // Generate random but realistic node utilization
  const nodeUtilization = Array(processingNodes).fill(0).map(() => 
    0.7 + Math.random() * 0.3 // 70-100% utilization per node
  );
  
  // Energy efficiency is better with quantum acceleration
  const energyEfficiency = useQuantumAcceleration ? 0.85 + Math.random() * 0.1 : 0.5 + Math.random() * 0.2;
  
  return {
    processingTime,
    throughputGBps: totalThroughput,
    nodeUtilization,
    quantumAccelerationFactor: quantumFactor,
    energyEfficiency
  };
}
