
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_KEY: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_WALLET_NETWORK: string;
  readonly VITE_CONTRACT_ADDRESS: string;
  readonly VITE_BLOCK_EXPLORER_URL: string;
  readonly VITE_GAS_PRICE_MULTIPLIER: string;
  readonly VITE_QUANTUM_THRESHOLD: string;
  readonly VITE_QUANTUM_PROCESSOR_URL: string;
  readonly VITE_MIN_DIFFICULTY: string;
  readonly VITE_MAX_DIFFICULTY: string;
  readonly VITE_QUANTUM_QUBITS: string;
  readonly VITE_ENTANGLEMENT_DEPTH: string;
  readonly VITE_ERROR_CORRECTION: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_APP_THEME: string;
  readonly VITE_ENABLE_QUANTUM_WALLET: string;
  readonly VITE_ENABLE_ADVANCED_METRICS: string;
  readonly VITE_ENABLE_QUANTUM_MINING: string;
  readonly VITE_ENABLE_AI_PREDICTIONS: string;
  readonly VITE_ENABLE_NEURAL_SECURITY: string;
  readonly VITE_ENABLE_FULL_SCREEN_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
