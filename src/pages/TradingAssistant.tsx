
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { TradingAssistant } from "@/components/trading/TradingAssistant";
import { EnhancedQuantumCoinDashboard } from "@/components/quantum-coin/EnhancedQuantumCoinDashboard";

export default function TradingAssistantPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Quantum Trading & Workflow Center
          </h1>
          <p className="text-muted-foreground">
            Advanced AI-powered trading assistant with quantum coin workflow management
          </p>
        </div>
        
        <EnhancedQuantumCoinDashboard />
        
        <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
          <TradingAssistant />
        </div>
      </div>
    </AppLayout>
  );
}
