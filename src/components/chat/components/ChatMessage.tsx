
import React from 'react';
import { ChatMessage as ChatMessageType } from '@/services/aiService';
import { User, Bot, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  if (isSystem) {
    return (
      <div className="px-4 py-2 my-1">
        <div className="bg-gray-800/70 text-gray-300 rounded py-1.5 px-3 text-xs text-center flex items-center justify-center">
          {message.quantumEnhanced && <Zap className="w-3 h-3 mr-1 text-yellow-400" />}
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-3 p-4',
        isUser ? 'bg-transparent' : 'bg-gray-900/30'
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isUser ? 'bg-blue-600' : 'bg-purple-600'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center mb-1">
          <span className="font-medium text-sm text-white">
            {isUser ? 'You' : 'QuantumBot AI'}
          </span>
          {message.quantumEnhanced && (
            <span className="ml-2 text-xs bg-yellow-900/50 text-yellow-300 px-1.5 py-0 rounded-full flex items-center">
              <Zap className="h-2.5 w-2.5 mr-0.5" />
              Quantum
            </span>
          )}
          <span className="ml-auto text-xs text-gray-500">
            {formattedTime}
          </span>
        </div>
        <div className="text-sm prose prose-invert max-w-none text-white">
          {message.content}
        </div>
      </div>
    </div>
  );
}
