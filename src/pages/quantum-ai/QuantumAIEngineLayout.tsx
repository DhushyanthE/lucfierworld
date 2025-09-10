
import React from "react";
import { QuantumAIEngine } from "@/components/ai/QuantumAIEngine";
import { AIChat } from "@/components/chat/AIChat";

export function QuantumAIEngineLayout() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* AI Engine */}
      <div>
        <QuantumAIEngine tokenSymbol="QNTM" />
      </div>
      
      {/* QuantumBot Chat */}
      <div>
        <AIChat />
      </div>
    </div>
  );
}
