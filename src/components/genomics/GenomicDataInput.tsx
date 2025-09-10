
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface GenomicDataInputProps {
  onSequenceSubmit: (sequence: string, isPublic: boolean, useQuantum: boolean) => Promise<void>;
  isProcessing: boolean;
}

export function GenomicDataInput({ onSequenceSubmit, isProcessing }: GenomicDataInputProps) {
  const [sequence, setSequence] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [useQuantum, setUseQuantum] = useState<boolean>(true);
  
  const handleSubmit = async () => {
    if (!sequence.trim()) {
      return;
    }
    
    await onSequenceSubmit(sequence.trim(), isPublic, useQuantum);
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div>
          <Label htmlFor="sequence">Genomic Sequence</Label>
          <Textarea
            id="sequence"
            placeholder="Enter DNA or protein sequence data..."
            className="mt-1 h-32"
            value={sequence}
            onChange={(e) => setSequence(e.target.value)}
            disabled={isProcessing}
          />
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="publicData">Make Data Public</Label>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Allow others to discover and request access to your data
              </div>
            </div>
            <Switch
              id="publicData"
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={isProcessing}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="quantumProtection">Quantum Protection</Label>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Use quantum-resistant encryption for enhanced security
              </div>
            </div>
            <Switch
              id="quantumProtection"
              checked={useQuantum}
              onCheckedChange={setUseQuantum}
              disabled={isProcessing}
            />
          </div>
        </div>
        
        <Button 
          className="w-full" 
          onClick={handleSubmit} 
          disabled={isProcessing || !sequence.trim()}
        >
          {isProcessing ? 'Processing...' : 'Process Genomic Data'}
        </Button>
      </CardContent>
    </Card>
  );
}
