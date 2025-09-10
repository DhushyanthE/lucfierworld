
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Logo } from "@/components/layout/Logo";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { ChatInput } from "./components/ChatInput";
import { ChatMessageList } from "./components/ChatMessageList";
import { SuggestedQueries } from "./components/SuggestedQueries";
import { suggestedQueries } from "./data/suggestedQueries";
import { BrainCircuit, Zap } from "lucide-react";
import { ChatMessage, aiService, enhancedChatService } from "@/services/aiService";

export function AIChat() {
  // Start with empty messages array; assistant responses will be fetched via aiService using the knowledge base
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [enhancementLevel, setEnhancementLevel] = useState(0);

  // Check for quantum enhancements
  useEffect(() => {
    // Check enhancement level periodically
    const checkEnhancements = () => {
      const level = enhancedChatService.getEnhancementLevel();
      if (level !== enhancementLevel) {
        setEnhancementLevel(level);
        
        // If enhancement level increased, add a system message about the enhancement
        if (level > enhancementLevel && enhancementLevel === 0) {
          const systemMessage: ChatMessage = {
            id: uuidv4(),
            role: 'system',
            content: `QuantumBot AI has been enhanced with quantum neural capabilities (Level ${level}/10)`,
            timestamp: Date.now(),
            quantumEnhanced: true
          };
          setMessages(prev => [...prev, systemMessage]);
        }
      }
    };
    
    // Check immediately and then every 5 seconds
    checkEnhancements();
    const interval = setInterval(checkEnhancements, 5000);
    
    return () => clearInterval(interval);
  }, [enhancementLevel]);

  const handleSend = async (messageText: string) => {
    if (!messageText.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: messageText,
      timestamp: Date.now(), // Convert Date to number timestamp
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Get AI response using the updated service method
      const response = await aiService.generateChatResponse(messageText);
      
      if (response.status === 'success') {
        const botMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: response.text,
          timestamp: Date.now(), // Convert Date to number timestamp
          quantumEnhanced: enhancementLevel > 0
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        toast.error(response.message || 'Failed to get a response');
      }
    } catch (error) {
      console.error('Error in chat:', error);
      toast.error('Something went wrong with the AI chat');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestedQuery = (query: string) => {
    handleSend(query);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-black/40 border-purple-500/30">
      <CardHeader className="border-b border-purple-500/20">
        <CardTitle className="flex items-center gap-2">
          <Logo iconType="gem" size={6} interactive={false} />
          <span className="text-white flex items-center">
            <BrainCircuit className="w-5 h-5 mr-1 text-purple-400" />
            QuantumBot AI Assistant
            {enhancementLevel > 0 && (
              <span className="ml-2 text-xs bg-yellow-900/50 text-yellow-300 px-2 py-0.5 rounded-full flex items-center">
                <Zap className="h-3 w-3 mr-1" /> Quantum L{enhancementLevel}
              </span>
            )}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ChatMessageList messages={messages} />
        
        {/* Suggested queries section */}
        {messages.length < 3 && (
          <SuggestedQueries 
            suggestions={suggestedQueries} 
            onSelectQuery={handleSuggestedQuery} 
            isLoading={isLoading}
          />
        )}
      </CardContent>
      <CardFooter className="border-t border-purple-500/20 p-4">
        <ChatInput onSendMessage={handleSend} isLoading={isLoading} />
      </CardFooter>
    </Card>
  );
}
