import { TradeSignal } from "@/types/trade";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ChatResponse {
  signal?: TradeSignal;
  rawResponse: string;
  success: boolean;
  error?: string;
}

// This service integrates with the secure trading-bot edge function
export const tradingBotService = {
  async generateTradeSignal(prompt: string): Promise<ChatResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('trading-bot', {
        body: { prompt }
      });

      if (error) {
        console.error('Trading bot error:', error);
        toast.error("Failed to generate trading signal", {
          description: error.message
        });
        return {
          rawResponse: "",
          success: false,
          error: error.message
        };
      }

      if (!data.success) {
        toast.error("Trading signal generation failed", {
          description: data.error || "Unknown error"
        });
        return {
          rawResponse: data.rawResponse || "",
          success: false,
          error: data.error
        };
      }

      return {
        signal: data.signal,
        rawResponse: data.rawResponse,
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
