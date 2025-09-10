
import { toast } from 'sonner';

export class WalletService {
  /**
   * Check if MetaMask is installed and available
   */
  isMetaMaskAvailable(): boolean {
    return typeof window !== 'undefined' && window.ethereum !== undefined;
  }
  
  /**
   * Check if Phantom wallet is installed and available
   */
  isPhantomAvailable(): boolean {
    return typeof window !== 'undefined' && 
           window.phantom !== undefined && 
           window.phantom.solana !== undefined;
  }
  
  /**
   * Get the balance of a token for a specific address
   */
  async getTokenBalance(
    tokenAddress: string, 
    walletAddress: string, 
    chainId: number
  ): Promise<string> {
    try {
      // This would typically use ethers.js or web3.js to get token balances
      // For this example, we'll return a mock value
      await this.simulateNetworkDelay();
      
      // Mock token balance
      const mockBalances: Record<string, string> = {
        '0x1234': '125.45',
        '0x5678': '1.25',
        '0x9abc': '1250.0'
      };
      
      return mockBalances[tokenAddress] || '0.0';
    } catch (error) {
      console.error('Error getting token balance:', error);
      toast.error('Failed to fetch token balance');
      return '0.0';
    }
  }
  
  /**
   * Send a transaction
   */
  async sendTransaction(
    from: string,
    to: string,
    amount: string,
    walletType: string
  ): Promise<{success: boolean, txHash?: string, error?: string}> {
    try {
      await this.simulateNetworkDelay();
      
      if (walletType === 'metamask' || walletType === 'trustwallet') {
        // MetaMask or Trust Wallet transaction
        if (!window.ethereum) {
          throw new Error('Wallet not available');
        }
        
        // This would be a real transaction in production
        // const txHash = await window.ethereum.request({
        //   method: 'eth_sendTransaction',
        //   params: [{
        //     from,
        //     to,
        //     value: '0x' + (parseFloat(amount) * 1e18).toString(16)
        //   }]
        // });
        
        // Mock transaction hash
        const txHash = '0x' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2);
        
        toast.success('Transaction sent', {
          description: `Amount: ${amount} ETH`
        });
        
        return { success: true, txHash };
      } else if (walletType === 'phantom') {
        // Phantom wallet transaction (Solana)
        if (!window.phantom?.solana) {
          throw new Error('Phantom wallet not available');
        }
        
        // Mock transaction hash
        const txHash = Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2);
        
        toast.success('Transaction sent', {
          description: `Amount: ${amount} SOL`
        });
        
        return { success: true, txHash };
      } else {
        throw new Error('Unsupported wallet type');
      }
    } catch (error: any) {
      console.error('Error sending transaction:', error);
      toast.error('Transaction failed', {
        description: error.message || 'Error sending transaction'
      });
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Helper method to simulate network delay
   */
  private simulateNetworkDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
  }
}

export const walletService = new WalletService();
