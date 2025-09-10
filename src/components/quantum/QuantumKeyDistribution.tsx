
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Key, RefreshCcw, Shield, Send } from 'lucide-react';
import quantumCryptographyModule from '@/lib/quantum/QuantumCryptographyModule';
import { QuantumKeyDistribution as QKDType } from '@/lib/quantum/types';

export function QuantumKeyDistribution() {
  const [keyDistributions, setKeyDistributions] = useState<QKDType[]>([]);
  const [participantIds, setParticipantIds] = useState('');
  const [isCreatingDistribution, setIsCreatingDistribution] = useState(false);

  useEffect(() => {
    refreshDistributions();
  }, []);

  const refreshDistributions = () => {
    try {
      const distributions = quantumCryptographyModule.listSharedKeys();
      setKeyDistributions(distributions);
    } catch (error) {
      console.error('Error loading QKD:', error);
      toast.error('Failed to load quantum key distributions');
    }
  };

  const createKeyDistribution = async () => {
    if (!participantIds.trim()) {
      toast.error('Please enter at least one participant ID');
      return;
    }

    setIsCreatingDistribution(true);

    try {
      // Parse participant IDs from comma-separated string
      const participants = participantIds.split(',').map(id => id.trim());
      
      // Fixed: Changed from array to individual participants string
      await quantumCryptographyModule.establishQuantumKeyDistribution(participants);
      
      toast.success('Quantum key distribution established successfully');
      refreshDistributions();
      setParticipantIds('');
    } catch (error) {
      console.error('Error creating QKD:', error);
      toast.error('Failed to establish quantum key distribution');
    } finally {
      setIsCreatingDistribution(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const copyToClipboard = (text: string, label: string = 'Value') => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(`${label} copied to clipboard`))
      .catch(() => toast.error('Failed to copy to clipboard'));
  };

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-medium flex items-center gap-2">
            <Key className="h-5 w-5 text-purple-400" />
            <span>Quantum Key Distribution</span>
          </CardTitle>
          
          <Button 
            onClick={refreshDistributions} 
            variant="outline"
            className="border-purple-500/30"
            size="sm"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Create new key distribution */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Establish New Quantum Key</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="participantIds">Participant IDs (comma-separated)</Label>
                <Input
                  id="participantIds"
                  value={participantIds}
                  onChange={(e) => setParticipantIds(e.target.value)}
                  placeholder="Enter participant IDs separated by commas"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              
              <Button
                onClick={createKeyDistribution}
                disabled={isCreatingDistribution || !participantIds.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isCreatingDistribution ? (
                  <>
                    <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                    Establishing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Establish Secure Key
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Display existing key distributions */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Quantum-Secured Keys</h3>
            
            {keyDistributions.length === 0 ? (
              <div className="text-center py-6 bg-gray-800/50 rounded-lg">
                <Shield className="h-12 w-12 text-purple-400/50 mx-auto mb-2" />
                <p className="text-gray-400">No quantum keys established yet</p>
                <p className="text-sm text-gray-500 mt-1">Create your first quantum key distribution above</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {keyDistributions.map((distribution) => (
                  <div 
                    key={distribution.keyId}
                    className="bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/80 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Shield className={`h-5 w-5 ${distribution.secure ? 'text-green-500' : 'text-amber-500'}`} />
                        <span className="font-medium">
                          {distribution.secure ? 'Secure Key' : 'Potentially Compromised Key'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {formatTime(distribution.createdAt)}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Key ID: </span>
                        <span className="font-mono">{distribution.keyId.substring(0, 12)}...</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(distribution.keyId, 'Key ID')}
                          className="h-6 w-6 p-0 ml-1 text-gray-400 hover:text-white"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </Button>
                      </div>
                      
                      <div>
                        <span className="text-gray-400">Key Length: </span>
                        <span>{distribution.keyLength} bits</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-400">Error Rate: </span>
                        <span className={`${distribution.errorRate > 0.1 ? 'text-amber-400' : 'text-green-400'}`}>
                          {(distribution.errorRate * 100).toFixed(2)}%
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-gray-400">Participants: </span>
                        <span>{distribution.participants.length}</span>
                      </div>
                      
                      <div className="font-mono text-xs bg-gray-900/80 p-2 rounded truncate">
                        {distribution.sharedKey.substring(0, 12)}...
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(distribution.sharedKey, 'Shared Key')}
                          className="h-6 w-6 p-0 ml-1 text-gray-400 hover:text-white float-right"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-gray-900/30 p-3 rounded-lg text-sm text-gray-400">
            <p>Quantum Key Distribution establishes secure cryptographic keys between two parties using quantum properties to detect eavesdroppers. Unlike classical key exchange, any interception attempt is detectable through quantum principles like superposition and entanglement.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
