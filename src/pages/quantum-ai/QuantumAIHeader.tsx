
import React from "react";
import { BrainCircuit, Cpu, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function QuantumAIHeader() {
  return (
    <div className="flex justify-between items-center mb-2">
      <h1 className="text-3xl font-bold text-white flex items-center">
        <BrainCircuit className="mr-3 h-8 w-8 text-purple-500" />
        Quantum AI Neural Network
      </h1>
      
      <div className="flex gap-3">
        <Link to="/quantum-circuits">
          <Button variant="outline" className="bg-black/40 border-purple-500/30 text-purple-300 hover:bg-black/60">
            <Cpu className="mr-2 h-4 w-4" />
            Circuit Optimizer
          </Button>
        </Link>
        
        <Link to="/quantum-operations">
          <Button variant="outline" className="bg-black/40 border-purple-500/30 text-purple-300 hover:bg-black/60">
            <Zap className="mr-2 h-4 w-4" />
            Quantum Operations
          </Button>
        </Link>
      </div>
    </div>
  );
}
