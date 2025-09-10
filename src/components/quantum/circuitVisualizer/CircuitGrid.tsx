
import React from 'react';
import { QuantumCircuit, QuantumGate } from '@/lib/quantum/workflow/utils/circuitOptimizer';
import { GateVisual } from './GateVisual';

interface CircuitGridProps {
  circuit: QuantumCircuit;
  onGateClick?: (gate: QuantumGate) => void;
  highlightedGates?: number[];
}

export function CircuitGrid({ circuit, onGateClick, highlightedGates = [] }: CircuitGridProps) {
  // Create a 2D representation of the circuit
  const gridRepresentation = createGridRepresentation(circuit);
  
  return (
    <div className="overflow-x-auto quantum-panel">
      <div className="min-w-fit">
        {/* Qubit labels with quantum animation */}
        <div className="flex mb-2">
          <div className="w-16 shrink-0 px-2 text-center font-medium text-purple-300">
            Qubits
          </div>
          <div className="flex-1 h-8 border-b border-purple-500/30 data-flow" />
        </div>
        
        {/* Circuit grid */}
        {Array.from({ length: circuit.numQubits }).map((_, qubitIdx) => (
          <div key={`qubit-${qubitIdx}`} className="flex items-center h-16 border-b border-gray-800">
            {/* Qubit label */}
            <div className="w-16 shrink-0 px-2 text-center font-mono bg-purple-900/20 rounded-md m-1">
              |{qubitIdx}⟩
            </div>
            
            {/* Qubit line with gates */}
            <div className="flex-1 relative">
              {/* Qubit line with animated glow effect */}
              <div className="absolute h-0.5 circuit-wire w-full top-1/2 -translate-y-1/2 quantum-glow" />
              
              {/* Gates on this qubit */}
              {gridRepresentation[qubitIdx].map((gate, colIdx) => (
                <div 
                  key={`gate-${qubitIdx}-${colIdx}`}
                  className="absolute top-0 bottom-0 flex items-center justify-center transition-all duration-300"
                  style={{ 
                    left: `${(colIdx / (circuit.depth || 1)) * 100}%`,
                    width: `${1 / (circuit.depth || 1) * 100}%`,
                    transform: highlightedGates?.includes(gate?.position || -1) ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {gate && (
                    <div className="quantum-gate">
                      <GateVisual 
                        gate={gate}
                        isTarget={gate.targets.includes(qubitIdx)}
                        isControl={gate.controls?.includes(qubitIdx)}
                        onClick={() => onGateClick?.(gate)}
                        isHighlighted={highlightedGates?.includes(gate.position)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Time/position markers with quantum styling */}
        <div className="flex mt-2">
          <div className="w-16 shrink-0" />
          <div className="flex-1 flex">
            {Array.from({ length: circuit.depth }).map((_, idx) => (
              <div 
                key={`time-${idx}`}
                className="flex-1 text-center text-xs text-purple-400 font-mono"
              >
                t<sub>{idx}</sub>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Create a 2D representation of gates for visualization
function createGridRepresentation(circuit: QuantumCircuit): (QuantumGate | null)[][] {
  const { numQubits, gates, depth } = circuit;
  
  // Initialize grid with nulls
  const grid: (QuantumGate | null)[][] = Array(numQubits)
    .fill(null)
    .map(() => Array(depth).fill(null));
  
  // Place gates in grid
  for (const gate of gates) {
    // For each qubit involved in the gate
    const involvedQubits = [
      ...(gate.targets || []),
      ...(gate.controls || [])
    ];
    
    for (const qubit of involvedQubits) {
      if (qubit >= 0 && qubit < numQubits && gate.position >= 0 && gate.position < depth) {
        grid[qubit][gate.position] = gate;
      }
    }
  }
  
  return grid;
}
