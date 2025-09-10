
/**
 * Quantum Circuit Optimization utilities
 */

/**
 * Represents a quantum gate in a circuit
 */
export interface QuantumGate {
  type: 'X' | 'Y' | 'Z' | 'H' | 'CNOT' | 'SWAP' | 'T' | 'S' | 'Rx' | 'Ry' | 'Rz';
  targets: number[];
  controls?: number[];
  angle?: number;
  position: number;
  fidelity: number;
}

/**
 * Represents a quantum circuit with gates
 */
export interface QuantumCircuit {
  numQubits: number;
  gates: QuantumGate[];
  depth: number;
  fidelity: number;
}

/**
 * Calculate the depth of a quantum circuit
 * @param circuit Quantum circuit to analyze
 * @returns The circuit depth (maximum gate position)
 */
export function calculateCircuitDepth(circuit: QuantumCircuit): number {
  if (!circuit.gates.length) return 0;
  return Math.max(...circuit.gates.map(gate => gate.position)) + 1;
}

/**
 * Calculate overall circuit fidelity based on individual gate fidelities
 * @param circuit Quantum circuit to analyze
 * @returns Fidelity score between 0 and 1
 */
export function calculateCircuitFidelity(circuit: QuantumCircuit): number {
  if (!circuit.gates.length) return 1.0;
  
  // Overall fidelity is the product of individual gate fidelities
  const overallFidelity = circuit.gates.reduce(
    (fidelity, gate) => fidelity * gate.fidelity, 
    1.0
  );
  
  return overallFidelity;
}

/**
 * Optimize a quantum circuit by reducing gate count
 * @param circuit Original quantum circuit
 * @returns Optimized circuit with reduced gate count
 */
export function optimizeCircuitGateCount(circuit: QuantumCircuit): QuantumCircuit {
  const gates = [...circuit.gates];
  const optimizedGates: QuantumGate[] = [];
  
  // Simple gate cancellation for adjacent inverse gates
  for (let i = 0; i < gates.length; i++) {
    const currentGate = gates[i];
    
    if (!currentGate) continue; // Skip already processed gates
    
    // Check if next gate cancels this one
    let canceled = false;
    for (let j = i + 1; j < gates.length && !canceled; j++) {
      const nextGate = gates[j];
      
      if (!nextGate) continue;
      
      // Check if gates cancel each other
      if (areInverseGates(currentGate, nextGate)) {
        gates[j] = null as any; // Mark as processed
        canceled = true;
      }
    }
    
    if (!canceled) {
      optimizedGates.push(currentGate);
    }
  }
  
  // Reassign positions to maintain continuous sequence
  const reindexedGates = optimizedGates.map((gate, idx) => ({
    ...gate,
    position: idx
  }));
  
  const optimizedCircuit: QuantumCircuit = {
    ...circuit,
    gates: reindexedGates,
    depth: reindexedGates.length > 0 ? 
      Math.max(...reindexedGates.map(g => g.position)) + 1 : 0,
    fidelity: calculateCircuitFidelity({ ...circuit, gates: reindexedGates })
  };
  
  return optimizedCircuit;
}

/**
 * Optimize a quantum circuit by reordering gates to reduce circuit depth
 * @param circuit Original quantum circuit
 * @returns Optimized circuit with reduced depth
 */
export function optimizeCircuitDepth(circuit: QuantumCircuit): QuantumCircuit {
  // Create a dependency graph between gates
  const gates = [...circuit.gates];
  const dependencies = new Map<number, Set<number>>();
  
  // Initialize dependency sets
  gates.forEach((_, idx) => {
    dependencies.set(idx, new Set());
  });
  
  // Build dependency graph based on qubit interactions
  for (let i = 0; i < gates.length; i++) {
    const gate1 = gates[i];
    const qubits1 = new Set([...gate1.targets, ...(gate1.controls || [])]);
    
    for (let j = i + 1; j < gates.length; j++) {
      const gate2 = gates[j];
      const qubits2 = new Set([...gate2.targets, ...(gate2.controls || [])]);
      
      // Check for overlapping qubits
      const hasOverlap = [...qubits1].some(q => qubits2.has(q));
      
      if (hasOverlap) {
        dependencies.get(j)?.add(i);
      }
    }
  }
  
  // Assign new positions based on dependencies
  const positions = new Map<number, number>();
  const assignPosition = (gateIdx: number): number => {
    if (positions.has(gateIdx)) return positions.get(gateIdx)!;
    
    const deps = dependencies.get(gateIdx) || new Set();
    let maxPos = -1;
    
    for (const depIdx of deps) {
      maxPos = Math.max(maxPos, assignPosition(depIdx));
    }
    
    const pos = maxPos + 1;
    positions.set(gateIdx, pos);
    return pos;
  };
  
  gates.forEach((_, idx) => {
    assignPosition(idx);
  });
  
  // Create optimized circuit
  const optimizedGates = gates.map((gate, idx) => ({
    ...gate,
    position: positions.get(idx) || 0
  }));
  
  const optimizedCircuit: QuantumCircuit = {
    ...circuit,
    gates: optimizedGates,
    depth: optimizedGates.length > 0 ? 
      Math.max(...optimizedGates.map(g => g.position)) + 1 : 0,
    fidelity: calculateCircuitFidelity({ ...circuit, gates: optimizedGates })
  };
  
  return optimizedCircuit;
}

/**
 * Check if two gates cancel each other out
 * @param gate1 First quantum gate
 * @param gate2 Second quantum gate
 * @returns True if gates cancel each other
 */
function areInverseGates(gate1: QuantumGate, gate2: QuantumGate): boolean {
  // Gates must be of same type
  if (gate1.type !== gate2.type) return false;
  
  // Must act on same qubits
  if (gate1.targets.length !== gate2.targets.length) return false;
  if (!gate1.targets.every(t => gate2.targets.includes(t))) return false;
  
  // Controls must match if present
  if (gate1.controls || gate2.controls) {
    if (!gate1.controls || !gate2.controls) return false;
    if (gate1.controls.length !== gate2.controls.length) return false;
    if (!gate1.controls.every(c => gate2.controls!.includes(c))) return false;
  }
  
  // Check for rotation gates that add up to 2π
  if (['Rx', 'Ry', 'Rz'].includes(gate1.type) && gate1.angle && gate2.angle) {
    return Math.abs((gate1.angle + gate2.angle) % (2 * Math.PI)) < 0.0001;
  }
  
  // Hermitian gates (H, X, Y, Z) applied twice cancel out
  return ['H', 'X', 'Y', 'Z'].includes(gate1.type);
}

/**
 * Generate a random quantum circuit for testing
 * @param numQubits Number of qubits in the circuit
 * @param numGates Number of gates to generate
 * @returns A randomly generated quantum circuit
 */
export function generateRandomCircuit(numQubits: number, numGates: number): QuantumCircuit {
  const gateTypes: QuantumGate['type'][] = ['X', 'Y', 'Z', 'H', 'CNOT', 'SWAP', 'T', 'S', 'Rx', 'Ry', 'Rz'];
  const gates: QuantumGate[] = [];
  
  for (let i = 0; i < numGates; i++) {
    const gateType = gateTypes[Math.floor(Math.random() * gateTypes.length)];
    const numTargets = (gateType === 'SWAP') ? 2 : 1;
    const targets: number[] = [];
    
    // Generate unique target qubits
    while (targets.length < numTargets) {
      const target = Math.floor(Math.random() * numQubits);
      if (!targets.includes(target)) {
        targets.push(target);
      }
    }
    
    // Generate control qubits for controlled gates
    let controls: number[] | undefined = undefined;
    if (gateType === 'CNOT') {
      controls = [];
      const control = Math.floor(Math.random() * numQubits);
      if (!targets.includes(control)) {
        controls.push(control);
      } else {
        controls.push((control + 1) % numQubits);
      }
    }
    
    // Generate angle for rotation gates
    let angle: number | undefined = undefined;
    if (['Rx', 'Ry', 'Rz'].includes(gateType)) {
      angle = Math.random() * 2 * Math.PI;
    }
    
    const gate: QuantumGate = {
      type: gateType,
      targets,
      controls,
      angle,
      position: i,
      fidelity: 0.95 + Math.random() * 0.05 // Random fidelity between 0.95 and 1.0
    };
    
    gates.push(gate);
  }
  
  const circuit: QuantumCircuit = {
    numQubits,
    gates,
    depth: numGates,
    fidelity: calculateCircuitFidelity({ numQubits, gates, depth: numGates, fidelity: 1.0 })
  };
  
  return circuit;
}

/**
 * Simulate quantum noise effects on circuit fidelity
 * @param circuit Input quantum circuit
 * @param noiseLevel Noise level between 0 and 1
 * @returns Circuit with updated fidelities based on noise
 */
export function applyQuantumNoise(circuit: QuantumCircuit, noiseLevel: number): QuantumCircuit {
  const noisyGates = circuit.gates.map(gate => ({
    ...gate,
    fidelity: Math.max(0.5, gate.fidelity * (1 - noiseLevel * Math.random()))
  }));
  
  return {
    ...circuit,
    gates: noisyGates,
    fidelity: calculateCircuitFidelity({ ...circuit, gates: noisyGates })
  };
}

/**
 * Simulate quantum error correction on a noisy circuit
 * @param circuit Noisy quantum circuit
 * @param correctionStrength Error correction strength (0-1)
 * @returns Circuit with improved fidelities
 */
export function applyErrorCorrection(circuit: QuantumCircuit, correctionStrength: number): QuantumCircuit {
  const correctedGates = circuit.gates.map(gate => {
    const improvement = (1 - gate.fidelity) * correctionStrength;
    return {
      ...gate,
      fidelity: Math.min(0.999, gate.fidelity + improvement)
    };
  });
  
  return {
    ...circuit,
    gates: correctedGates,
    fidelity: calculateCircuitFidelity({ ...circuit, gates: correctedGates })
  };
}
