
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { processQuantumTransaction } from '@/lib/quantum/WorkflowUtils';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function QuantumWorkflow() {
  const [sender, setSender] = useState('0x3F8CB69d9c740AD82a3a3999ABd73c1aE75F5768');
  const [recipient, setRecipient] = useState('0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9');
  const [amount, setAmount] = useState(1.5);
  const [difficulty, setDifficulty] = useState(3);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcessTransaction = useCallback(() => {
    setLoading(true);
    setError(null);
    
    // Use setTimeout to prevent UI from freezing during calculation
    setTimeout(() => {
      try {
        const transaction = processQuantumTransaction(
          sender,
          recipient,
          amount,
          difficulty
        );
        
        setResult(transaction);
        
        if (transaction.isValid) {
          toast.success("Transaction processed successfully", {
            description: `Hash: ${transaction.hash.substring(0, 8)}...`
          });
        } else {
          toast.error("Transaction validation failed");
        }
      } catch (error) {
        console.error('Error processing transaction:', error);
        setError((error as Error).message || 'Failed to process transaction');
        toast.error("Transaction processing failed");
      } finally {
        setLoading(false);
      }
    }, 100);
  }, [sender, recipient, amount, difficulty]);

  return (
    <Card className="bg-gray-900/50 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white">Quantum Proof of Work</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sender">Sender Address</Label>
          <Input
            id="sender"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient Address</Label>
          <Input
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (QNTM)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Input
              id="difficulty"
              type="number"
              min={1}
              max={8}
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-md p-3 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
        
        <Button 
          onClick={handleProcessTransaction}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Processing...
            </>
          ) : (
            'Process Transaction'
          )}
        </Button>
        
        {result && (
          <div className="mt-4 p-4 bg-gray-800 rounded-md">
            <h3 className="text-white font-medium mb-2">Transaction Result:</h3>
            <div className="space-y-2 text-sm">
              {result.error ? (
                <p className="text-red-400">{result.error}</p>
              ) : (
                <>
                  <p><span className="text-gray-400">Status:</span> <span className={result.isValid ? "text-green-400" : "text-red-400"}>{result.isValid ? "Valid" : "Invalid"}</span></p>
                  <p><span className="text-gray-400">Hash:</span> <span className="text-white">{result.hash}</span></p>
                  <p><span className="text-gray-400">Nonce:</span> <span className="text-white">{result.nonce}</span></p>
                  <p><span className="text-gray-400">Timestamp:</span> <span className="text-white">{new Date(result.timestamp).toLocaleString()}</span></p>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
