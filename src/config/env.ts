
/**
 * Environment configuration for the application
 */

// Base API config
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "https://api.quantumblockchain.dev",
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  VERSION: "v1",
  API_KEY: import.meta.env.VITE_API_KEY || ""
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
  CONTRACT_ADDRESS: "0x3F8CB69d9c740AD82a3a3999ABd73c1aE75F5768",
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
