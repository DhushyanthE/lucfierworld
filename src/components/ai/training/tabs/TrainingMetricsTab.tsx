
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Zap, Workflow, Activity, ShieldAlert, Cpu, Braces, Network, BarChart, Gauge, Terminal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { QUANTUM_CONFIG } from '@/config/env';
import { simulateQuantumVerification } from '@/lib/quantum/WorkflowUtils';

interface TrainingMetricsTabProps {
  trainingMetrics: {
    accuracy: number;
    loss: number;
    fidelity: number;
    quantumAdvantage?: number;
    entropyLevel?: number;
    cryptoStrength?: number;
    networkLatency?: number;
    quantumBits?: number;
  }
}

export const TrainingMetricsTab: React.FC<TrainingMetricsTabProps> = ({ trainingMetrics }) => {
  const [animatedValues, setAnimatedValues] = useState({
    accuracy: 0,
    loss: 0,
    fidelity: 0,
    entropyLevel: 0,
    cryptoStrength: 0
  });
  const [verificationResult, setVerificationResult] = useState<any>(null);
  
  const quantumAdvantage = trainingMetrics.quantumAdvantage || 0;
  const entropyLevel = trainingMetrics.entropyLevel || 0.78;
  const cryptoStrength = trainingMetrics.cryptoStrength || 0.92;
  const networkLatency = trainingMetrics.networkLatency || 0.25;
  const quantumBits = trainingMetrics.quantumBits || QUANTUM_CONFIG.QUBITS;

  // Animate values on load
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedValues(prev => ({
        accuracy: Math.min(trainingMetrics.accuracy, prev.accuracy + 1.5),
        loss: Math.min(trainingMetrics.loss, prev.loss + 0.001),
        fidelity: Math.min(trainingMetrics.fidelity, prev.fidelity + 0.02),
        entropyLevel: Math.min(entropyLevel, prev.entropyLevel + 0.02),
        cryptoStrength: Math.min(cryptoStrength, prev.cryptoStrength + 0.02)
      }));
    }, 30);

    setTimeout(() => clearInterval(interval), 2000);
    
    // Run quantum verification simulation
    const hash = `${Date.now()}${Math.random()}`.replace('.', '');
    const result = simulateQuantumVerification(hash);
    setVerificationResult(result);
    
    return () => clearInterval(interval);
  }, [trainingMetrics, entropyLevel, cryptoStrength]);

  return (
    <div className="bg-black/50 rounded-lg p-5 border border-purple-500/20 backdrop-blur-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-purple-400 flex items-center gap-2">
          <Cpu className="h-4 w-4" />
          <span>Quantum Training Metrics</span>
        </h3>
        <div className="flex items-center gap-2">
          {quantumAdvantage > 0 && (
            <Badge className="bg-green-900/60 hover:bg-green-900/80 text-green-300 px-2 py-0.5">
              <Zap className="h-3 w-3 mr-1" />
              <span>{quantumAdvantage.toFixed(1)}x Quantum Advantage</span>
            </Badge>
          )}
          <Badge className="bg-purple-900/60 hover:bg-purple-900/80 text-purple-300 px-2 py-0.5">
            <Terminal className="h-3 w-3 mr-1" />
            <span>{quantumBits} Qubits</span>
          </Badge>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-5 leading-relaxed">
        This quantum neural network model demonstrates significant performance advantages over classical models,
        with an estimated {trainingMetrics.quantumAdvantage?.toFixed(1) || '0.0'}x speed improvement for inference.
        Operating with {quantumBits} quantum bits, the system maintains high quantum fidelity at {(trainingMetrics.fidelity * 100).toFixed(1)}%, 
        ensuring reliable quantum operations with minimal decoherence.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs mb-1">
              <div className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-gray-400">Cross-Entropy Loss</span>
              </div>
              <span className="text-white font-mono">{animatedValues.loss.toFixed(4)}</span>
            </div>
            <Progress value={100 - (animatedValues.loss * 100)} className="h-2 bg-gray-800">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-blue-500"
                style={{ 
                  transition: "width 0.5s ease-in-out",
                  boxShadow: "0 0 8px rgba(147, 51, 234, 0.5)" 
                }}
              />
            </Progress>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs mb-1">
              <div className="flex items-center gap-1.5">
                <Workflow className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-gray-400">Quantum Coherence</span>
              </div>
              <span className="text-white font-mono">{(animatedValues.fidelity * 0.9).toFixed(2)}</span>
            </div>
            <Progress value={animatedValues.fidelity * 90} className="h-2 bg-gray-800">
              <div 
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-500"
                style={{ 
                  transition: "width 0.5s ease-in-out",
                  boxShadow: "0 0 8px rgba(129, 140, 248, 0.5)" 
                }}
              />
            </Progress>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs mb-1">
              <div className="flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-gray-400">Model Accuracy</span>
              </div>
              <span className="text-white font-mono">{animatedValues.accuracy.toFixed(1)}%</span>
            </div>
            <Progress value={animatedValues.accuracy} className="h-2 bg-gray-800">
              <div 
                className="h-full bg-gradient-to-r from-green-600 to-emerald-400"
                style={{ 
                  transition: "width 0.5s ease-in-out",
                  boxShadow: "0 0 8px rgba(52, 211, 153, 0.5)" 
                }}
              />
            </Progress>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs mb-1">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-gray-400">Cryptographic Strength</span>
              </div>
              <span className="text-white font-mono">{animatedValues.cryptoStrength.toFixed(2)}</span>
            </div>
            <Progress value={animatedValues.cryptoStrength * 100} className="h-2 bg-gray-800">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400"
                style={{ 
                  transition: "width 0.5s ease-in-out",
                  boxShadow: "0 0 8px rgba(96, 165, 250, 0.5)" 
                }}
              />
            </Progress>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs mb-1">
              <div className="flex items-center gap-1.5">
                <Braces className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-gray-400">Entropy Level</span>
              </div>
              <span className="text-white font-mono">{animatedValues.entropyLevel.toFixed(2)}</span>
            </div>
            <Progress value={animatedValues.entropyLevel * 100} className="h-2 bg-gray-800">
              <div 
                className="h-full bg-gradient-to-r from-amber-600 to-yellow-400"
                style={{ 
                  transition: "width 0.5s ease-in-out",
                  boxShadow: "0 0 8px rgba(217, 119, 6, 0.5)" 
                }}
              />
            </Progress>
          </div>
          
          {verificationResult && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs mb-1">
                <div className="flex items-center gap-1.5">
                  <BarChart className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-gray-400">Security Level</span>
                </div>
                <Badge className={verificationResult.verified ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}>
                  {verificationResult.verified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
              <Progress value={verificationResult.securityLevel * 100} className="h-2 bg-gray-800">
                <div 
                  className={`h-full bg-gradient-to-r ${
                    verificationResult.verified 
                      ? 'from-green-600 to-teal-400' 
                      : 'from-red-600 to-orange-400'
                  }`}
                  style={{ 
                    transition: "width 0.5s ease-in-out",
                    boxShadow: `0 0 8px ${verificationResult.verified ? 'rgba(52, 211, 153, 0.5)' : 'rgba(239, 68, 68, 0.5)'}` 
                  }}
                />
              </Progress>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/70 rounded-lg p-3 text-center backdrop-blur-sm">
          <div className="text-purple-400 text-xs mb-1">Quantum Bits</div>
          <div className="text-white font-bold">{quantumBits}</div>
        </div>
        <div className="bg-gray-800/70 rounded-lg p-3 text-center backdrop-blur-sm">
          <div className="text-purple-400 text-xs mb-1">Network Latency</div>
          <div className="text-white font-bold">{networkLatency * 1000}ms</div>
        </div>
        <div className="bg-gray-800/70 rounded-lg p-3 text-center backdrop-blur-sm">
          <div className="text-purple-400 text-xs mb-1">Entanglement</div>
          <div className="text-white font-bold">{QUANTUM_CONFIG.ENTANGLEMENT_DEPTH}D</div>
        </div>
        <div className="bg-gray-800/70 rounded-lg p-3 text-center backdrop-blur-sm">
          <div className="text-purple-400 text-xs mb-1">Security Level</div>
          <div className="text-white font-bold">
            {cryptoStrength > 0.9 ? 'High' : cryptoStrength > 0.7 ? 'Medium' : 'Low'}
          </div>
        </div>
      </div>
      
      {verificationResult && (
        <div className="mt-4 p-2 border border-purple-500/20 rounded bg-black/40 text-xs font-mono text-gray-400">
          <div className="flex justify-between items-center mb-1">
            <span>Quantum signature:</span>
            <span className="text-purple-300">{verificationResult.quantumSignature}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Entropy score:</span>
            <span className="text-purple-300">{verificationResult.entropyScore}</span>
          </div>
        </div>
      )}
    </div>
  );
};
