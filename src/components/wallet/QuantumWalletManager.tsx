
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Key, Fingerprint, Lock, Database } from 'lucide-react';
import { toast } from 'sonner';
import { WalletManager } from '@/lib/quantum/WalletManager';
import { QuantumKeyPair } from '@/lib/quantum/types';

export function QuantumWalletManager() {
  const [wallets, setWallets] = useState<QuantumKeyPair[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [messageToSign, setMessageToSign] = useState('');
  const [signature, setSignature] = useState<any | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [walletManager] = useState(() => new WalletManager());
  
  // Load wallets on component mount
  useEffect(() => {
    const loadWallets = async () => {
      // Create a sample wallet if none exists
      if (walletManager.listWallets().length === 0) {
        await walletManager.generateWallet("initial_entropy_seed");
      }
      setWallets(walletManager.listWallets());
    };
    
    loadWallets();
  }, [walletManager]);

  // Create a new quantum-resistant wallet
  const createWallet = async () => {
    setIsCreatingWallet(true);
    
    try {
      // Generate additional entropy
      const entropy = Array(32).fill(0)
        .map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0'))
        .join('');
      
      // Create the wallet
      const wallet = await walletManager.generateWallet(entropy);
      
      // Update wallets list
      setWallets(walletManager.listWallets());
      
      // Select the new wallet
      setSelectedWallet(wallet.keyId);
      
      toast.success('Quantum-resistant wallet created');
    } catch (error) {
      console.error('Error creating wallet:', error);
      toast.error('Failed to create wallet');
    } finally {
      setIsCreatingWallet(false);
    }
  };

  // Sign a message with the selected wallet
  const signMessage = async () => {
    if (!selectedWallet || !messageToSign.trim()) {
      toast.error('Please select a wallet and enter a message');
      return;
    }
    
    setIsSigning(true);
    setSignature(null);
    
    try {
      const result = await walletManager.signMessage(messageToSign, selectedWallet);
      
      setSignature(result);
      setVerificationResult(null);
      toast.success('Message signed successfully');
    } catch (error) {
      console.error('Error signing message:', error);
      toast.error('Failed to sign message');
    } finally {
      setIsSigning(false);
    }
  };

  // Verify a signature
  const verifySignature = async () => {
    if (!signature || !selectedWallet || !messageToSign.trim()) {
      toast.error('Missing signature or message data');
      return;
    }
    
    setIsVerifying(true);
    
    try {
      const wallet = walletManager.getWallet(selectedWallet);
      
      if (!wallet) {
        throw new Error('Selected wallet not found');
      }
      
      const isValid = await walletManager.verifySignature(
        messageToSign,
        signature,
        wallet.publicKey
      );
      
      setVerificationResult(isValid);
      
      if (isValid) {
        toast.success('Signature verified successfully');
      } else {
        toast.error('Invalid signature');
      }
    } catch (error) {
      console.error('Error verifying signature:', error);
      toast.error('Failed to verify signature');
      setVerificationResult(false);
    } finally {
      setIsVerifying(false);
    }
  };

  // Get selected wallet
  const getSelectedWallet = () => {
    if (!selectedWallet) return null;
    return wallets.find(wallet => wallet.keyId === selectedWallet) || null;
  };

  // Format public key for display
  const formatKey = (key: string | undefined) => {
    if (!key) return '';
    return key.length > 16 ? `${key.substring(0, 8)}...${key.substring(key.length - 8)}` : key;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white flex items-center">
          <Shield className="h-5 w-5 text-purple-400 mr-2" />
          Quantum-Resistant Wallets
        </h3>
        
        <Button 
          onClick={createWallet} 
          disabled={isCreatingWallet}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isCreatingWallet ? 'Creating...' : 'Create New Wallet'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-black/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-lg font-medium">My Quantum Wallets</CardTitle>
          </CardHeader>
          <CardContent>
            {wallets.length === 0 ? (
              <div className="text-center py-6 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400">No wallets created yet</p>
                <Button 
                  onClick={createWallet} 
                  className="mt-3 bg-purple-600 hover:bg-purple-700"
                  disabled={isCreatingWallet}
                >
                  Create Your First Wallet
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {wallets.map((wallet) => (
                  <div 
                    key={wallet.keyId}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedWallet === wallet.keyId 
                        ? 'bg-purple-900/20 border border-purple-500/30' 
                        : 'bg-gray-800/50 hover:bg-gray-700/50'
                    }`}
                    onClick={() => setSelectedWallet(wallet.keyId)}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">Wallet {wallets.indexOf(wallet) + 1}</span>
                      <Badge className="bg-purple-600">
                        {wallet.quantumResistant ? 'Quantum Resistant' : 'Standard'}
                      </Badge>
                    </div>
                    
                    <div className="mt-2 text-sm">
                      <div className="flex justify-between text-gray-400 mb-1">
                        <span>Public Key:</span>
                        <span className="font-mono">{formatKey(wallet.publicKey)}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Created:</span>
                        <span>{new Date(wallet.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-black/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Quantum-Secure Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="sign">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="sign">
                  <Key className="h-4 w-4 mr-2" />
                  Sign Message
                </TabsTrigger>
                <TabsTrigger value="verify">
                  <Lock className="h-4 w-4 mr-2" />
                  Verify Signature
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="sign" className="space-y-4">
                <div>
                  <label htmlFor="message" className="block text-sm mb-1">Message to Sign</label>
                  <Input
                    id="message"
                    value={messageToSign}
                    onChange={(e) => setMessageToSign(e.target.value)}
                    placeholder="Enter a message to sign"
                    disabled={!selectedWallet}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                
                <Button
                  onClick={signMessage}
                  disabled={!selectedWallet || !messageToSign.trim() || isSigning}
                  className="bg-purple-600 hover:bg-purple-700 w-full"
                >
                  {isSigning ? 'Signing...' : 'Sign Message'}
                </Button>
                
                {/* Signature Result */}
                {signature && (
                  <div className="mt-3 bg-gray-800/50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Signature</span>
                    </div>
                    
                    <div className="bg-black/50 p-2 rounded font-mono text-xs break-all">
                      {signature.signature.substring(0, 64)}...
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-400 flex justify-between">
                      <span>Algorithm: {signature.algorithm}</span>
                      <span>Timestamp: {new Date(signature.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="verify" className="space-y-4">
                <div className="bg-gray-800/50 p-3 rounded-lg mb-3">
                  <p className="text-xs text-gray-300">
                    Quantum signature verification uses advanced cryptographic algorithms that are resistant to quantum computing attacks.
                  </p>
                </div>
                
                <Button
                  onClick={verifySignature}
                  disabled={!signature || isVerifying}
                  className="bg-purple-600 hover:bg-purple-700 w-full"
                >
                  {isVerifying ? 'Verifying...' : 'Verify Signature'}
                </Button>
                
                {verificationResult !== null && (
                  <div className={`mt-3 p-3 rounded-lg ${
                    verificationResult ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'
                  }`}>
                    <div className="flex items-center">
                      <Badge className={verificationResult ? "bg-green-600" : "bg-red-600"}>
                        {verificationResult ? "Valid Signature" : "Invalid Signature"}
                      </Badge>
                    </div>
                    
                    <p className="mt-2 text-xs text-gray-300">
                      {verificationResult 
                        ? 'The signature has been verified using quantum-resistant cryptographic algorithms.'
                        : 'Signature verification failed. The message may have been tampered with or the wrong key was used.'}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Selected Wallet Info */}
      {selectedWallet && (
        <Card className="bg-black/50 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Fingerprint className="h-5 w-5 text-purple-400 mr-2" />
              Selected Wallet Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getSelectedWallet() && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400 block mb-1">Public Key:</span>
                  <div className="bg-black/50 p-2 rounded font-mono text-xs break-all">
                    {getSelectedWallet()?.publicKey}
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-400 block mb-1">Key ID:</span>
                  <div className="bg-black/50 p-2 rounded font-mono text-xs break-all">
                    {getSelectedWallet()?.keyId}
                  </div>
                </div>
                
                <div className="md:col-span-2 bg-purple-900/20 p-3 rounded-lg border border-purple-500/20">
                  <p className="text-sm text-purple-300 flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    This quantum-resistant wallet uses post-quantum cryptography that is secure against attacks from both classical and quantum computers.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
