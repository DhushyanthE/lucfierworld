
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, SendIcon } from 'lucide-react';

interface TradeFormProps {
  prompt: string;
  setPrompt: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

export function TradeForm({ prompt, setPrompt, handleSubmit, isLoading }: TradeFormProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-gray-700">Ask about market conditions or trading signals</Label>
        <Textarea
          id="prompt"
          placeholder="E.g., Analyze current QTC market trends and suggest a trading strategy"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="bg-white border-gray-300 text-gray-800 min-h-[100px]"
          disabled={isLoading}
        />
      </div>
      
      <Button 
        type="submit"
        disabled={isLoading || !prompt.trim()}
        className="w-full bg-purple-500 hover:bg-purple-600 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Analyzing...
          </>
        ) : (
          <>
            <SendIcon className="mr-2 h-4 w-4" />
            Generate Signal
          </>
        )}
      </Button>
    </form>
  );
}
