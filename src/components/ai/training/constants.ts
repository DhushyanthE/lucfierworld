
export const MODEL_OPTIONS = [
  {
    id: 'quantum-neural',
    name: 'Quantum Neural Network',
    description: 'Hybrid quantum-classical neural network with parameterized quantum circuits',
    complexity: 'High',
    layers: [64, 32, 16],
    config: {
      epochs: 100,
      learningRate: 0.001,
      usesQuantumBackpropagation: true
    }
  },
  {
    id: 'variational-quantum',
    name: 'Variational Quantum Eigensolver',
    description: 'Optimized for quantum chemical simulations and material science',
    complexity: 'Medium',
    layers: [32, 16],
    config: {
      epochs: 80,
      learningRate: 0.002,
      usesQuantumBackpropagation: false
    }
  },
  {
    id: 'quantum-boltzmann',
    name: 'Quantum Boltzmann Machine',
    description: 'Enhanced probabilistic model using quantum tunneling effects',
    complexity: 'Very High',
    layers: [128, 64, 32, 16],
    config: {
      epochs: 150,
      learningRate: 0.0008,
      usesQuantumBackpropagation: true
    }
  },
  {
    id: 'quantum-cnn',
    name: 'Quantum Convolutional Network',
    description: 'Specialized for pattern recognition with quantum advantage',
    complexity: 'High',
    layers: [64, 32, 16, 8],
    config: {
      epochs: 120,
      learningRate: 0.001,
      usesQuantumBackpropagation: true
    }
  }
];
