
/**
 * Environment configuration for the application
 */

/**
 * Backend base URL. The real backend of this project is the Lovable Cloud edge
 * function runtime, so it is the default rather than an unreachable public host.
 * VITE_API_URL still wins when a self-hosted gateway is running.
 */
const FUNCTIONS_BASE = import.meta.env.VITE_SUPABASE_URL
  ? `${String(import.meta.env.VITE_SUPABASE_URL).replace(/\/+$/, "")}/functions/v1`
  : "";

// Base API config
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || FUNCTIONS_BASE || "https://api.quantumblockchain.dev",
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  VERSION: "v1",
  API_KEY: import.meta.env.VITE_API_KEY || ""
};

// Service endpoints of the fabric (all served by the edge runtime unless overridden)
export const SERVICE_URLS = {
  FUNCTIONS_BASE,
  QUANTUM_CORE: import.meta.env.VITE_QUANTUM_CORE_URL || `${FUNCTIONS_BASE}/quantum-core`,
  QUANTUM_GATEWAY: import.meta.env.VITE_QUANTUM_GATEWAY_URL || `${FUNCTIONS_BASE}/quantum-gateway`,
  BLOCKCHAIN_INDEXER:
    import.meta.env.VITE_BLOCKCHAIN_INDEXER_URL || `${FUNCTIONS_BASE}/blockchain-indexer`
};

// Wallet configuration
export const WALLET_CONFIG = {
  NETWORK_ID: import.meta.env.VITE_NETWORK_ID || "0x1",
  REQUIRED_NETWORK: "mainnet",
  AUTO_CONNECT: true,
  SUPPORTED_WALLETS: ["metamask", "walletconnect"],
  GAS_LIMIT_MULTIPLIER: 1.2
};

// Quantum configuration
export const QUANTUM_CONFIG = {
  QUBITS: 15,
  MIN_DIFFICULTY: 2,
  MAX_DIFFICULTY: 8,
  ENTANGLEMENT_DEPTH: 10,
  FIDELITY_THRESHOLD: 0.95,
  BASE_FEE: 0.001,
  ERROR_CORRECTION: true
};

// Token configuration
export const TOKEN_CONFIG = {
  SYMBOL: "QNTM",
  DECIMALS: 18,
  // Use environment variable for contract address to prevent hardcoding sensitive data
  CONTRACT_ADDRESS: import.meta.env.VITE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
  TOTAL_SUPPLY: "1000000000000000000000000000"
};

// Default values
export const DEFAULTS = {
  LANGUAGE: "en",
  THEME: "dark",
  CURRENCY: "USD",
  GAS_PRICE: "5",
  SLIPPAGE: 0.5
};

// App configuration
export const APP_CONFIG = {
  NAME: "Quantum Blockchain",
  VERSION: import.meta.env.VITE_APP_VERSION || "0.1.0",
  ENVIRONMENT: import.meta.env.DEV ? "development" : "production"
};

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_QUANTUM_AI: true,
  ENABLE_CLOUD_COMPUTING: true,
  ENABLE_IOT_INTEGRATION: true,
  ENABLE_DATA_SCIENCE: true,
  ENABLE_ADVANCED_SECURITY: true
};

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
export const appVersion = import.meta.env.VITE_APP_VERSION || "0.1.0";
