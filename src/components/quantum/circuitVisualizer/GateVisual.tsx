
import React from 'react';
import { QuantumGate } from '@/lib/quantum/workflow/utils/circuitOptimizer';

interface GateVisualProps {
  gate: QuantumGate;
  isTarget: boolean;
  isControl?: boolean;
  onClick?: () => void;
  isHighlighted?: boolean;
}

export function GateVisual({ 
  gate, 
  isTarget, 
  isControl = false, 
  onClick, 
  isHighlighted = false 
}: GateVisualProps) {
  if (isControl) {
    // Render control point with improved visual effects
    return (
      <div 
        className={`w-3 h-3 rounded-full bg-blue-600 shadow-lg transition-all duration-300
          ${isHighlighted ? 'ring-2 ring-yellow-400 quantum-pulse' : ''}
        `}
        style={{
          boxShadow: isHighlighted ? '0 0 8px rgba(59, 130, 246, 0.8)' : '0 0 4px rgba(59, 130, 246, 0.5)'
        }}
        onClick={onClick}
      />
    );
  }
  
  if (!isTarget) {
    // This qubit is neither control nor target, don't render anything
    return null;
  }
  
  // Get color based on gate type
  const getGateColor = () => {
    switch (gate.type) {
      case 'H': return 'from-green-600 to-green-700';
      case 'X': return 'from-red-600 to-red-700';
      case 'Y': return 'from-yellow-600 to-yellow-700';
      case 'Z': return 'from-blue-600 to-blue-700';
      case 'CNOT': return 'from-purple-600 to-purple-700';
      case 'SWAP': return 'from-teal-600 to-teal-700';
      case 'T': return 'from-indigo-600 to-indigo-700';
      case 'S': return 'from-pink-600 to-pink-700';
      case 'Rx':
      case 'Ry': 
      case 'Rz': return 'from-amber-600 to-amber-700';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  // Get border color based on gate fidelity
  const getBorderColor = () => {
    const fidelity = gate.fidelity;
    if (fidelity > 0.95) return 'border-green-500/50';
    if (fidelity > 0.9) return 'border-blue-500/50';
    if (fidelity > 0.8) return 'border-yellow-500/50';
    return 'border-red-500/50';
  };
  
  return (
    <div 
      className={`
        w-10 h-10 flex items-center justify-center rounded 
        bg-gradient-to-br ${getGateColor()} text-white font-mono cursor-pointer
        border ${getBorderColor()}
        ${isHighlighted ? 'ring-2 ring-yellow-400 quantum-pulse' : ''}
        hover:opacity-90 transition-all duration-300
      `}
      style={{
        boxShadow: isHighlighted ? '0 0 10px rgba(139, 92, 246, 0.8)' : 'none',
      }}
      onClick={onClick}
      title={`${gate.type} gate (fidelity: ${(gate.fidelity * 100).toFixed(1)}%)`}
    >
      <div className="relative">
        {gate.type}
        {(gate.type === 'Rx' || gate.type === 'Ry' || gate.type === 'Rz') && gate.angle !== undefined && (
          <span className="text-xs ml-0.5">({(gate.angle / Math.PI).toFixed(1)}π)</span>
        )}
        
        {/* Fidelity indicator */}
        <div 
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"
          style={{ opacity: gate.fidelity }}
        ></div>
      </div>
    </div>
  );
}
