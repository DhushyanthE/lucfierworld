
import React from 'react';
import { Brain, Cpu, Network } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function OrchestratorArchitecture() {
  return (
    <Card className="bg-black/50 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" /> 
          AGI Orchestrator Architecture
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-900/70 p-4 rounded-lg text-xs text-gray-300 font-mono whitespace-pre overflow-auto h-[350px]">
{`┌────────────────┐      ┌────────────────┐      ┌─────────────────┐
│                │      │                │      │                 │
│  Genomic Data  │      │  Blockchain    │      │  AGI            │
│  Registry      │─────▶│  Events        │─────▶│  Orchestrator   │
│                │      │                │      │                 │
└────────────────┘      └────────────────┘      └────────┬────────┘
                                                         │
                                                         │ Chain-of-Thought
                                                         │ Reasoning
                                                         ▼
┌────────────────┐      ┌────────────────┐      ┌─────────────────┐
│                │      │                │      │                 │
│  Smart         │◀─────│  IPFS Storage  │◀─────│  AGI Decision   │
│  Contract      │      │  (CIDs)        │      │  Engine         │
│  Actions       │      │                │      │                 │
└────────────────┘      └────────────────┘      └─────────────────┘

Event Flow:
1. DataRegistered    → AGI generates summary → DataSummarized event
2. AccessRequested   → AGI risk assessment  → Access Approved/Denied

AGI Processing Pipeline:
┌──────────────────┐  ┌────────────────┐  ┌─────────────────┐  ┌───────────────┐
│                  │  │                │  │                 │  │               │
│ Event Detection  │─▶│ Quantum Seed   │─▶│ Chain-of-Thought│─▶│ Risk Analysis │
│                  │  │ Generation     │  │ Reasoning       │  │               │
└──────────────────┘  └────────────────┘  └─────────────────┘  └───────┬───────┘
                                                                        │
┌──────────────────┐  ┌────────────────┐  ┌─────────────────┐          │
│                  │  │                │  │                 │          │
│ Result Storage   │◀─┤ Smart Contract │◀─┤ Decision        │◀─────────┘
│ (IPFS)           │  │ Integration    │  │ Synthesis       │
└──────────────────┘  └────────────────┘  └─────────────────┘

Data Summary Workflow:
1. Genomic Dataset → IPFS → DataRegistered Event
2. AGI Processes Dataset Properties → Generates Summary
3. Summary → IPFS → CID Emitted via DataSummarized Event

Access Control Workflow:
1. User → RequestAccess(dataId) → AccessRequested Event
2. AGI Risk Assessment → Privacy Evaluation → Consent Check
3. Decision + Rationale → IPFS → CID Used for Grant/Deny Access`}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              <h3 className="font-medium text-white">Chain-of-Thought Reasoning</h3>
            </div>
            <p className="text-sm text-gray-400">
              AI models analyze metadata, purpose, and context through step-by-step reasoning to make transparent decisions.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-blue-400" />
              <h3 className="font-medium text-white">Quantum Enhancement</h3>
            </div>
            <p className="text-sm text-gray-400">
              Quantum-based entropy increases the security and unpredictability of the AGI's decision-making process.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-green-400" />
              <h3 className="font-medium text-white">Blockchain Integration</h3>
            </div>
            <p className="text-sm text-gray-400">
              All AGI decisions are permanently recorded on the blockchain with IPFS-stored reasoning for verification.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
