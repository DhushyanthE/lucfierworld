
import { TradeSignal } from "@/types/trade";
import { toast } from "sonner";

interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  signal?: TradeSignal;
  rawResponse: string;
  success: boolean;
  error?: string;
}

// This service integrates with OpenAI's API to generate trading signals
export const tradingBotService = {
  async generateTradeSignal(prompt: string): Promise<ChatResponse> {
    try {
      // Check for API key in environment variables
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        toast.error("OpenAI API key is missing", {
          description: "Please add your API key in the environment variables"
        });
        return {
          rawResponse: "API key is missing",
          success: false,
          error: "OpenAI API key is missing"
        };
      }

      // Prepare messages for the API
      const messages: ChatCompletionMessage[] = [
        {
          role: "system",
          content: "You are a crypto trading assistant for Quantum Coin. Your task is to analyze market conditions and generate trading signals. Respond with BUY or SELL recommendations for QTC tokens."
        },
        {
          role: "user",
          content: prompt
        }
      ];

      // Call OpenAI API
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to generate trading signal");
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || "";

      // Extract trading signal (simple version, can be enhanced)
      const signalMatch = content.match(/\b(BUY|SELL)\b/i);
      let signal: TradeSignal | undefined;

      if (signalMatch) {
        const signalType = signalMatch[0].toUpperCase() as "BUY" | "SELL";
        signal = {
          type: signalType,
          symbol: "QTC",
          price: Math.random() * 1000 + 1000, // Mock price for demonstration
          confidence: Math.random() * 0.5 + 0.5, // Random confidence between 0.5 and 1.0
          timestamp: Date.now()
        };
      }

      return {
        signal,
        rawResponse: content,
        success: true
      };
    } catch (error) {
      console.error("Error generating trade signal:", error);
      toast.error("Failed to generate trading signal", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
      
      return {
        rawResponse: "",
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate trade signal"
      };
    }
  }
};
