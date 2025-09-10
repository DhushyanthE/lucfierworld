
// Namespace our translation keys to avoid conflicts and better organization
export type TranslationNamespace = 
  | 'common'
  | 'crypto'
  | 'wallet'
  | 'security'
  | 'ui'
  | 'navigation';

// Types for each namespace
export type CommonTranslationKey =
  | 'loading'
  | 'error'
  | 'success'
  | 'confirm'
  | 'cancel'
  | 'save'
  | 'edit'
  | 'delete'
  | 'back'
  | 'next'
  | 'low'
  | 'medium'
  | 'high';

export type CryptoTranslationKey =
  | "marketCap"
  | "volume24h"
  | "cryptoPrice" 
  | "cryptoTechnologies"
  | "encryptDescription"
  | "priceChart"
  | "securityLevel"
  | "encryptionStatus"
  | "dataProtection"
  | "encrypt"
  | "decrypt"
  | "encryptData"
  | "decryptData"
  | "encryptDescription"
  | "decryptDescription"
  | "inputData"
  | "enterText"
  | "encryptionNotice"
  | "encryptButton"
  | "decryptButton"
  | "noEncryptedData"
  | "decryptedResult"
  | "keysGenerated"
  | "generatingKeys"
  | "dataEncrypted"
  | "dataNotEncrypted"
  | "initializingCrypto"
  | "generatingSecureKeys"
  | "processingData"
  | "applyingEncryption"
  | "decryptingData"
  | "verifyingIntegrity"
  | "secureCommunication"
  | "cryptoShielding"
  | "crossChainSecurity"
  | "privateKeyStorage"
  | "seedPhrase"
  | "advancedEncryption"
  | "hashingAlgorithm"
  | "signatureVerification"
  | "networkSecurity"
  | "aiCryptoShield";

export type WalletTranslationKey = 
  | "walletConnected"
  | "connectWallet"
  | "walletAddress"
  | "balance"
  | "send"
  | "receive"
  | "copyAddress"
  | "addressCopied"
  | "transactions"
  | "connectNow"
  | "walletIntegration"
  | "securityWarning"
  | "walletDisconnected"
  | "selectWallet"
  | "metamask"
  | "trustWallet"
  | "phantom"
  | "walletConnect"
  | "walletBalances"
  | "walletNetwork"
  | "walletTransactions"
  | "walletTokens"
  | "walletHistory"
  | "walletExchange"
  | "walletSecurity"
  | "confirmTransaction"
  | "transactionPending"
  | "yourWallet"
  | "connected"
  | "disconnected"
  | "connecting"
  | "connectError"
  | "disconnect"
  | "ethereum"
  | "solana"
  | "multiChain"
  | "mobileWallets"
  | "refresh"
  | "swap"
  | "terms"
  | "noWallet"
  | "learnMore"
  | "activeStatus"
  | "yourBalance"
  | "quickActions"
  | "recentActivity"
  | "viewAllTransactions"
  | "today"
  | "yesterday"
  | "balanceRefreshed"
  | "balanceUpdated"
  | "refreshFailed"
  | "couldNotRefresh"
  | "connectionFailed"
  | "couldNotConnect"
  | "pleaseTryAgain"
  | "errorConnecting"
  | "walletDisconnectedDesc"
  | "successfullyConnected"
  | "termsNotice"
  | "connectYourWallet"
  | "connectToEthereum"
  | "connectToSolana"
  | "multiChainSupport";

export type SecurityTranslationKey =
  | "securityFeatures"
  | "quantumResistant"
  | "multiChain"
  | "languageSupport"
  | "keyManagement"
  | "securityAssessment"
  | "cryptoWorkflow"
  | "secureProtocol"
  | "twofactorAuth"
  | "biometricProtection"
  | "fraudPrevention"
  | "riskAssessment"
  | "securityScore"
  | "multiLayerSecurity"
  | "threatDetection"
  | "privacyMeasures"
  | "dataIsolation"
  | "securitySettings"
  | "encryptionLevel"
  | "authProtocol";

export type UITranslationKey =
  | "darkMode"
  | "lightMode"
  | "settings"
  | "profile"
  | "logout"
  | "login"
  | "register"
  | "search"
  | "notifications"
  | "menu"
  | "close"
  | "open"
  | "multilingual"
  | "layoutSettings"
  | "appearance"
  | "accessibility"
  | "fontSize"
  | "animationSpeed"
  | "colorScheme"
  | "themeSelection"
  | "interfaceLanguage"
  | "displayPreferences"
  | "language";

export type NavigationTranslationKey =
  | "home"
  | "wallet"
  | "cryptoMarket"
  | "quantumAI";

// Translation record type that includes all namespaces and their keys
export type TranslationRecord = {
  common: Partial<Record<CommonTranslationKey, string>>;
  crypto: Partial<Record<CryptoTranslationKey, string>>;
  wallet: Partial<Record<WalletTranslationKey, string>>;
  security: Partial<Record<SecurityTranslationKey, string>>;
  ui: Partial<Record<UITranslationKey, string>>;
  navigation: Partial<Record<NavigationTranslationKey, string>>;
};
