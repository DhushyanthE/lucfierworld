
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { TradingAssistant } from "@/components/trading/TradingAssistant";

export default function TradingAssistantPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">AI Trading Assistant</h1>
        <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
          <TradingAssistant />
        </div>
      </div>
    </AppLayout>
  );
}
