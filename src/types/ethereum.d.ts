
interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    isTrust?: boolean;
    request: (request: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, callback: any) => void;
    removeListener: (event: string, callback: any) => void;
  };
  trustwallet?: {
    enable: () => Promise<string[]>;
    request: (request: { method: string; params?: any[] }) => Promise<any>;
  };
  phantom?: {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
    }
  };
}
