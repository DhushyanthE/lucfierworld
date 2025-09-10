/**
 * Quantum Computing Engine
 * Core quantum computing operations and circuit simulation
 */

export interface QuantumState {
  amplitudes: Complex[];
  numQubits: number;
  entangled: boolean;
  coherenceTime: number;
}

export interface Complex {
  real: number;
  imaginary: number;
}

export interface QuantumGate {
  name: string;
  matrix: Complex[][];
  qubits: number[];
  controlled?: boolean;
}

export interface QuantumCircuit {
  id: string;
  gates: QuantumGate[];
  numQubits: number;
  depth: number;
  fidelity: number;
}

export interface QuantumMeasurement {
  qubit: number;
  basis: 'computational' | 'hadamard' | 'circular';
  result: 0 | 1;
  probability: number;
}

export class QuantumComputingEngine {
  private quantumStates: Map<string, QuantumState> = new Map();
  private circuits: Map<string, QuantumCircuit> = new Map();

  /**
   * Initialize a quantum register with n qubits
   */
  initializeQuantumRegister(numQubits: number, stateId: string = 'default'): QuantumState {
    const amplitudes: Complex[] = [];
    const numStates = Math.pow(2, numQubits);
    
    // Initialize in |00...0⟩ state
    for (let i = 0; i < numStates; i++) {
      amplitudes.push({
        real: i === 0 ? 1.0 : 0.0,
        imaginary: 0.0
      });
    }

    const state: QuantumState = {
      amplitudes,
      numQubits,
      entangled: false,
      coherenceTime: 1000 + Math.random() * 9000 // 1-10 seconds
    };

    this.quantumStates.set(stateId, state);
    return state;
  }

  /**
   * Apply Hadamard gate to create superposition
   */
  applyHadamardGate(stateId: string, qubit: number): QuantumState {
    const state = this.quantumStates.get(stateId);
    if (!state) throw new Error(`Quantum state ${stateId} not found`);

    const numStates = Math.pow(2, state.numQubits);
    const newAmplitudes: Complex[] = [...state.amplitudes];

    for (let i = 0; i < numStates; i++) {
      const bitAtQubit = (i >> qubit) & 1;
      const flippedIndex = i ^ (1 << qubit);

      if (bitAtQubit === 0) {
        // Apply H = 1/√2 * [1  1; 1 -1]
        const original = state.amplitudes[i];
        const flipped = state.amplitudes[flippedIndex];

        newAmplitudes[i] = {
          real: (original.real + flipped.real) / Math.sqrt(2),
          imaginary: (original.imaginary + flipped.imaginary) / Math.sqrt(2)
        };

        newAmplitudes[flippedIndex] = {
          real: (original.real - flipped.real) / Math.sqrt(2),
          imaginary: (original.imaginary - flipped.imaginary) / Math.sqrt(2)
        };
      }
    }

    state.amplitudes = newAmplitudes;
    this.quantumStates.set(stateId, state);
    return state;
  }

  /**
   * Apply CNOT gate for entanglement
   */
  applyCNOTGate(stateId: string, controlQubit: number, targetQubit: number): QuantumState {
    const state = this.quantumStates.get(stateId);
    if (!state) throw new Error(`Quantum state ${stateId} not found`);

    const numStates = Math.pow(2, state.numQubits);
    const newAmplitudes: Complex[] = [...state.amplitudes];

    for (let i = 0; i < numStates; i++) {
      const controlBit = (i >> controlQubit) & 1;
      
      if (controlBit === 1) {
        // Flip target qubit if control is |1⟩
        const flippedIndex = i ^ (1 << targetQubit);
        const temp = newAmplitudes[i];
        newAmplitudes[i] = newAmplitudes[flippedIndex];
        newAmplitudes[flippedIndex] = temp;
      }
    }

    state.amplitudes = newAmplitudes;
    state.entangled = true;
    this.quantumStates.set(stateId, state);
    return state;
  }

  /**
   * Apply Pauli-X (NOT) gate
   */
  applyPauliXGate(stateId: string, qubit: number): QuantumState {
    const state = this.quantumStates.get(stateId);
    if (!state) throw new Error(`Quantum state ${stateId} not found`);

    const numStates = Math.pow(2, state.numQubits);
    const newAmplitudes: Complex[] = new Array(numStates);

    for (let i = 0; i < numStates; i++) {
      const flippedIndex = i ^ (1 << qubit);
      newAmplitudes[flippedIndex] = state.amplitudes[i];
    }

    state.amplitudes = newAmplitudes;
    this.quantumStates.set(stateId, state);
    return state;
  }

  /**
   * Apply Pauli-Z gate
   */
  applyPauliZGate(stateId: string, qubit: number): QuantumState {
    const state = this.quantumStates.get(stateId);
    if (!state) throw new Error(`Quantum state ${stateId} not found`);

    const numStates = Math.pow(2, state.numQubits);

    for (let i = 0; i < numStates; i++) {
      const bitAtQubit = (i >> qubit) & 1;
      
      if (bitAtQubit === 1) {
        // Apply phase flip: |1⟩ → -|1⟩
        state.amplitudes[i].real *= -1;
        state.amplitudes[i].imaginary *= -1;
      }
    }

    this.quantumStates.set(stateId, state);
    return state;
  }

  /**
   * Measure a qubit in computational basis
   */
  measureQubit(stateId: string, qubit: number): QuantumMeasurement {
    const state = this.quantumStates.get(stateId);
    if (!state) throw new Error(`Quantum state ${stateId} not found`);

    const numStates = Math.pow(2, state.numQubits);
    let prob0 = 0, prob1 = 0;

    // Calculate probabilities
    for (let i = 0; i < numStates; i++) {
      const bitAtQubit = (i >> qubit) & 1;
      const probability = state.amplitudes[i].real ** 2 + state.amplitudes[i].imaginary ** 2;

      if (bitAtQubit === 0) {
        prob0 += probability;
      } else {
        prob1 += probability;
      }
    }

    // Quantum measurement - collapse to |0⟩ or |1⟩
    const result = Math.random() < prob0 ? 0 : 1;
    const resultProb = result === 0 ? prob0 : prob1;

    // Collapse state vector
    const newAmplitudes: Complex[] = new Array(numStates);
    const normalizationFactor = 1 / Math.sqrt(resultProb);

    for (let i = 0; i < numStates; i++) {
      const bitAtQubit = (i >> qubit) & 1;
      
      if (bitAtQubit === result) {
        newAmplitudes[i] = {
          real: state.amplitudes[i].real * normalizationFactor,
          imaginary: state.amplitudes[i].imaginary * normalizationFactor
        };
      } else {
        newAmplitudes[i] = { real: 0, imaginary: 0 };
      }
    }

    state.amplitudes = newAmplitudes;
    this.quantumStates.set(stateId, state);

    return {
      qubit,
      basis: 'computational',
      result: result as 0 | 1,
      probability: resultProb
    };
  }

  /**
   * Calculate quantum fidelity between two states
   */
  calculateFidelity(stateId1: string, stateId2: string): number {
    const state1 = this.quantumStates.get(stateId1);
    const state2 = this.quantumStates.get(stateId2);
    
    if (!state1 || !state2) return 0;
    if (state1.numQubits !== state2.numQubits) return 0;

    let fidelity = 0;
    for (let i = 0; i < state1.amplitudes.length; i++) {
      const amp1 = state1.amplitudes[i];
      const amp2 = state2.amplitudes[i];
      
      // |⟨ψ₁|ψ₂⟩|²
      const innerProduct = amp1.real * amp2.real + amp1.imaginary * amp2.imaginary;
      fidelity += innerProduct ** 2;
    }

    return Math.sqrt(fidelity);
  }

  /**
   * Calculate entanglement entropy
   */
  calculateEntanglementEntropy(stateId: string, subsystemQubits: number[]): number {
    const state = this.quantumStates.get(stateId);
    if (!state) return 0;

    // Simplified entanglement entropy calculation
    // In practice, this would require reduced density matrix computation
    const totalQubits = state.numQubits;
    const subsystemSize = subsystemQubits.length;
    
    if (subsystemSize === 0 || subsystemSize === totalQubits) return 0;

    // Von Neumann entropy approximation
    const maxEntropy = Math.min(subsystemSize, totalQubits - subsystemSize);
    const entanglementFactor = state.entangled ? 0.8 : 0.1;
    
    return maxEntropy * Math.log2(2) * entanglementFactor;
  }

  /**
   * Create Bell state (maximally entangled state)
   */
  createBellState(stateId: string, type: 'phi+' | 'phi-' | 'psi+' | 'psi-' = 'phi+'): QuantumState {
    const state = this.initializeQuantumRegister(2, stateId);
    
    // Apply H to first qubit
    this.applyHadamardGate(stateId, 0);
    
    // Apply CNOT
    this.applyCNOTGate(stateId, 0, 1);
    
    // Modify based on Bell state type
    switch (type) {
      case 'phi-':
        this.applyPauliZGate(stateId, 0);
        break;
      case 'psi+':
        this.applyPauliXGate(stateId, 1);
        break;
      case 'psi-':
        this.applyPauliXGate(stateId, 1);
        this.applyPauliZGate(stateId, 0);
        break;
    }

    return this.quantumStates.get(stateId)!;
  }

  /**
   * Simulate quantum decoherence
   */
  simulateDecoherence(stateId: string, decoherenceRate: number = 0.01): QuantumState {
    const state = this.quantumStates.get(stateId);
    if (!state) throw new Error(`Quantum state ${stateId} not found`);

    // Apply random phase and amplitude noise
    for (let i = 0; i < state.amplitudes.length; i++) {
      const noiseReal = (Math.random() - 0.5) * decoherenceRate;
      const noiseImag = (Math.random() - 0.5) * decoherenceRate;
      
      state.amplitudes[i].real += noiseReal;
      state.amplitudes[i].imaginary += noiseImag;
    }

    // Renormalize
    this.normalizeState(state);
    state.coherenceTime *= (1 - decoherenceRate);
    
    this.quantumStates.set(stateId, state);
    return state;
  }

  /**
   * Normalize quantum state
   */
  private normalizeState(state: QuantumState): void {
    let norm = 0;
    for (const amp of state.amplitudes) {
      norm += amp.real ** 2 + amp.imaginary ** 2;
    }
    
    const normalizationFactor = 1 / Math.sqrt(norm);
    for (const amp of state.amplitudes) {
      amp.real *= normalizationFactor;
      amp.imaginary *= normalizationFactor;
    }
  }

  /**
   * Get quantum state
   */
  getQuantumState(stateId: string): QuantumState | undefined {
    return this.quantumStates.get(stateId);
  }

  /**
   * Get all quantum states
   */
  getAllQuantumStates(): Map<string, QuantumState> {
    return new Map(this.quantumStates);
  }

  /**
   * Reset quantum state
   */
  resetQuantumState(stateId: string): void {
    this.quantumStates.delete(stateId);
  }

  /**
   * Calculate quantum advantage metric
   */
  calculateQuantumAdvantage(classicalTime: number, quantumTime: number): number {
    if (quantumTime === 0) return Infinity;
    return Math.log2(classicalTime / quantumTime);
  }
}

// Export singleton instance
export const quantumEngine = new QuantumComputingEngine();