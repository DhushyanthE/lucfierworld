import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Wallet, Shield, Send, Key, Fingerprint } from 'lucide-react';
import { toast } from 'sonner';
import quantumCryptographyModule from '@/lib/quantum/QuantumCryptographyModule';
import { QuantumKeyPair, QuantumSignature } from '@/lib/quantum/types';
import { processQuantumTransaction } from '@/lib/quantum/WorkflowUtils';

export function QuantumWallet() {
  const [wallets, setWallets] = useState<QuantumKeyPair[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [messageToSign, setMessageToSign] = useState('');
  const [signature, setSignature] = useState<QuantumSignature | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState('wallets');
  const [transactionAmount, setTransactionAmount] = useState('1.0');
  const [recipient, setRecipient] = useState('');
  const [transactionResult, setTransactionResult] = useState<any | null>(null);
  const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);

  // Load wallets on component mount
  useEffect(() => {
    setWallets(quantumCryptographyModule.listWallets());
  }, []);

  // Create a new quantum-resistant wallet
  const createWallet = async () => {
    setIsCreatingWallet(true);
    
    try {
      // Generate additional entropy
      const entropy = Array(32).fill(0)
        .map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0'))
        .join('');
      
      // Create the wallet
      const wallet = await quantumCryptographyModule.generateWallet(entropy);
      
      // Add to wallets list
      setWallets([...wallets, wallet]);
      
      // Select the new wallet
      setSelectedWallet(wallet.keyId);
      
      toast.success('Quantum-resistant wallet created successfully');
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
      const result = await quantumCryptographyModule.signMessage(messageToSign, selectedWallet);
      
      setSignature(result);
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
      const wallet = quantumCryptographyModule.getWallet(selectedWallet);
      
      if (!wallet) {
        throw new Error('Selected wallet not found');
      }
      
      const isValid = await quantumCryptographyModule.verifySignature(
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

  // Process a quantum transaction
  const processTransaction = async () => {
    if (!selectedWallet || !recipient.trim() || isNaN(parseFloat(transactionAmount))) {
      toast.error('Please fill in all transaction details');
      return;
    }
    
    setIsProcessingTransaction(true);
    setTransactionResult(null);
    
    try {
      // Get selected wallet
      const wallet = quantumCryptographyModule.getWallet(selectedWallet);
      
      if (!wallet) {
        throw new Error('Selected wallet not found');
      }
      
      // Process the transaction
      const result = processQuantumTransaction(
        wallet.publicKey.substring(0, 16),
        recipient,
        parseFloat(transactionAmount),
        4 // Difficulty level
      );
      
      // Sign the transaction
      const signature = await quantumCryptographyModule.signMessage(
        result.hash,
        wallet.keyId
      );
      
      // Combine results
      setTransactionResult({
        ...result,
        signature: signature.signature.substring(0, 24) + '...',
        walletId: wallet.keyId
      });
      
      toast.success('Transaction processed successfully');
    } catch (error) {
      console.error('Error processing transaction:', error);
      toast.error('Failed to process transaction');
    } finally {
      setIsProcessingTransaction(false);
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
    <Card className="bg-black/70 border-purple-500/20 shadow-lg w-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-medium flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-400" />
            <span>Quantum-Resistant Wallet</span>
          </CardTitle>
          
          <Button 
            onClick={createWallet} 
            disabled={isCreatingWallet}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isCreatingWallet ? 'Creating...' : 'Create New Wallet'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="wallets" className="data-[state=active]:bg-purple-600">
              <Wallet className="h-4 w-4 mr-2" />
              Wallets
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-purple-600">
              <Send className="h-4 w-4 mr-2" />
              Transactions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="wallets" className="space-y-4">
            {/* Wallet List */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3">My Quantum Wallets</h3>
              
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
                <div className="space-y-3">
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
            </div>
            
            {/* Message Signing */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3">Quantum-Secure Signing</h3>
              
              <div className="space-y-4">
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
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={signMessage}
                    disabled={!selectedWallet || !messageToSign.trim() || isSigning}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isSigning ? 'Signing...' : 'Sign Message'}
                  </Button>
                  
                  <Button
                    onClick={verifySignature}
                    disabled={!signature || isVerifying}
                    variant="outline"
                    className="border-purple-500/30"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify Signature'}
                  </Button>
                </div>
                
                {/* Signature Result */}
                {signature && (
                  <div className="mt-3 bg-gray-800/50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Signature</span>
                      
                      {verificationResult !== null && (
                        <Badge className={verificationResult ? "bg-green-600" : "bg-red-600"}>
                          {verificationResult ? "Valid" : "Invalid"}
                        </Badge>
                      )}
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
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-4">
            {/* Transaction Form */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3">Process Quantum Transaction</h3>
              
              {wallets.length === 0 ? (
                <div className="text-center py-6 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-400">Create a wallet to process transactions</p>
                  <Button 
                    onClick={() => {
                      setActiveTab('wallets');
                      setTimeout(createWallet, 100);
                    }} 
                    className="mt-3 bg-purple-600 hover:bg-purple-700"
                  >
                    Create Wallet
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Wallet Selector */}
                  <div>
                    <label className="block text-sm mb-1">Select Wallet</label>
                    <select
                      value={selectedWallet || ''}
                      onChange={(e) => setSelectedWallet(e.target.value)}
                      className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                      disabled={isProcessingTransaction}
                    >
                      <option value="">-- Select a wallet --</option>
                      {wallets.map((wallet) => (
                        <option key={wallet.keyId} value={wallet.keyId}>
                          Wallet {wallets.indexOf(wallet) + 1} ({formatKey(wallet.publicKey)})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Transaction Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="amount" className="block text-sm mb-1">Amount (QNTM)</label>
                      <Input
                        id="amount"
                        type="number"
                        value={transactionAmount}
                        onChange={(e) => setTransactionAmount(e.target.value)}
                        placeholder="Enter amount"
                        min="0.1"
                        step="0.1"
                        disabled={isProcessingTransaction}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="recipient" className="block text-sm mb-1">Recipient Address</label>
                      <Input
                        id="recipient"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="Enter recipient address"
                        disabled={isProcessingTransaction}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={processTransaction}
                    disabled={!selectedWallet || !recipient.trim() || isProcessingTransaction}
                    className="bg-purple-600 hover:bg-purple-700 w-full"
                  >
                    {isProcessingTransaction ? 'Processing...' : 'Process Transaction'}
                  </Button>
                </div>
              )}
            </div>
            
            {/* Transaction Result */}
            {transactionResult && (
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3">Transaction Result</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <Badge className={transactionResult.isValid ? "bg-green-600" : "bg-red-600"}>
                      {transactionResult.isValid ? "Valid" : "Invalid"}
                    </Badge>
                  </div>
                  
                  <div>
                    <span className="text-gray-400 block mb-1">Transaction Hash:</span>
                    <div className="bg-gray-900 p-2 rounded font-mono text-xs overflow-x-auto">
                      {transactionResult.hash}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nonce:</span>
                    <span className="font-mono">{transactionResult.nonce}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span>{transactionResult.amount} QNTM</span>
                  </div>
                  
                  <div>
                    <span className="text-gray-400 block mb-1">Quantum Signature:</span>
                    <div className="bg-gray-900 p-2 rounded font-mono text-xs overflow-x-auto">
                      {transactionResult.signature}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Timestamp:</span>
                    <span>{new Date(transactionResult.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Selected Wallet Info */}
        {selectedWallet && (
          <div className="mt-6 bg-gray-800/30 p-4 rounded-lg">
            <h4 className="text-purple-400 font-medium flex items-center gap-1 mb-2">
              <Fingerprint className="h-4 w-4" />
              <span>Selected Wallet Details</span>
            </h4>
            
            {getSelectedWallet() && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400 block">Public Key:</span>
                  <span className="font-mono text-xs break-all">{getSelectedWallet()?.publicKey}</span>
                </div>
                
                <div>
                  <span className="text-gray-400 block">Key ID:</span>
                  <span className="font-mono text-xs break-all">{getSelectedWallet()?.keyId}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
