export const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'ru', name: 'Русский' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिंदी' }
];

export const translations = {
  en: {
    navigation: {
      home: 'Home',
      wallet: 'Wallet',
      cryptoMarket: 'Market',
      quantumAI: 'Quantum AI'
    },
    common: {
      confirm: 'Confirm',
      cancel: 'Cancel',
      loading: 'Loading...',
      success: 'Success',
      error: 'Error'
    },
    wallet: {
      walletConnected: 'Wallet Connected',
      connectWallet: 'Connect Wallet',
      walletAddress: 'Wallet Address',
      balance: 'Balance',
      send: 'Send',
      receive: 'Receive',
      copyAddress: 'Copy Address',
      addressCopied: 'Address copied to clipboard!',
      transactions: 'Transactions',
      connectNow: 'Connect Now',
      walletIntegration: 'Wallet Integration',
      securityWarning: 'Always verify transactions before confirming'
    },
    crypto: {
      marketCap: 'Market Cap',
      volume24h: '24h Volume',
      cryptoPrice: 'Price',
      cryptoTechnologies: 'Cryptographic Technologies',
      encryptDescription: 'Advanced quantum-resistant encryption protects all transactions',
      priceChart: 'Price Chart'
    },
    security: {
      securitySettings: 'Security Settings',
      quantumResistant: 'Quantum-resistant cryptography secures your assets',
      encryptionLevel: 'Encryption Level',
      authProtocol: 'Authentication Protocol'
    },
    ui: {
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Logout',
      language: 'Language',
      multilingual: 'Multilingual Support'
    }
  },
  es: {
    navigation: {
      home: 'Inicio',
      wallet: 'Billetera',
      cryptoMarket: 'Mercado',
      quantumAI: 'IA Cuántica'
    },
    common: {
      confirm: 'Confirmar',
      cancel: 'Cancelar',
      loading: 'Cargando...',
      success: 'Éxito',
      error: 'Error'
    },
    wallet: {
      walletConnected: 'Billetera Conectada',
      connectWallet: 'Conectar Billetera',
      walletAddress: 'Dirección de Billetera',
      balance: 'Saldo',
      send: 'Enviar',
      receive: 'Recibir',
      copyAddress: 'Copiar Dirección',
      addressCopied: '¡Dirección copiada al portapapeles!',
      transactions: 'Transacciones',
      connectNow: 'Conectar Ahora',
      walletIntegration: 'Integración de Billetera',
      securityWarning: 'Siempre verifique las transacciones antes de confirmar'
    },
    crypto: {
      marketCap: 'Capitalización de Mercado',
      volume24h: 'Volumen 24h',
      cryptoPrice: 'Precio',
      cryptoTechnologies: 'Tecnologías Criptográficas',
      encryptDescription: 'Encriptación avanzada resistente a la cuántica protege todas las transacciones',
      priceChart: 'Gráfico de Precio'
    },
    security: {
      securitySettings: 'Configuración de Seguridad',
      quantumResistant: 'La criptografía resistente a la cuántica asegura sus activos',
      encryptionLevel: 'Nivel de Encriptación',
      authProtocol: 'Protocolo de Autenticación'
    },
    ui: {
      darkMode: 'Modo Oscuro',
      lightMode: 'Modo Claro',
      settings: 'Configuración',
      profile: 'Perfil',
      logout: 'Cerrar Sesión',
      language: 'Idioma',
      multilingual: 'Soporte Multilingüe'
    }
  },
  zh: {
    navigation: {
      home: '首页',
      wallet: '钱包',
      cryptoMarket: '市场',
      quantumAI: '量子AI'
    },
    common: {
      confirm: '确认',
      cancel: '取消',
      loading: '加载中...',
      success: '成功',
      error: '错误'
    },
    wallet: {
      walletConnected: '钱包已连接',
      connectWallet: '连接钱包',
      walletAddress: '钱包地址',
      balance: '余额',
      send: '发送',
      receive: '接收',
      copyAddress: '复制地址',
      addressCopied: '地址已复制到剪贴板！',
      transactions: '交易',
      connectNow: '立即连接',
      walletIntegration: '钱包集成',
      securityWarning: '确认前请始终验证交易'
    },
    crypto: {
      marketCap: '市值',
      volume24h: '24小时交易量',
      cryptoPrice: '价格',
      cryptoTechnologies: '加密技术',
      encryptDescription: '先进的抗量子加密保护所有交易',
      priceChart: '价格图表'
    },
    security: {
      securitySettings: '安全设置',
      quantumResistant: '抗量子密码学保护您的资产',
      encryptionLevel: '加密级别',
      authProtocol: '认证协议'
    },
    ui: {
      darkMode: '暗黑模式',
      lightMode: '明亮模式',
      settings: '设置',
      profile: '个人资料',
      logout: '登出',
      language: '语言',
      multilingual: '多语言支持'
    }
  }
  // Add more languages as needed
};

export type LanguageCode = keyof typeof translations;
export type TranslationCategory = keyof typeof translations.en;
export type TranslationKey<C extends TranslationCategory> = keyof typeof translations.en[C];

// Use export type for type exports
export type { 
  TranslationNamespace 
} from './translations/index';

// Use regular export for functions
export { 
  getTranslationByNamespace, 
  getTranslation, 
  getLanguageCode, 
  getLanguageName 
} from './translations/index';
