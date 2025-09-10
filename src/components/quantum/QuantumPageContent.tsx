
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudComputingIntegration } from "./CloudComputingIntegration";
import { IoTIntegration } from "./IoTIntegration";
import { DataScienceIntegration } from "./DataScienceIntegration";
import { CircuitBoard, Cpu, BrainCircuit, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function QuantumPageContent() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black/60 border-purple-500/20 hover:border-purple-500/40 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <CircuitBoard className="h-5 w-5 text-purple-400" />
              <span>Quantum Circuits</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-white">
              Build, optimize and visualize quantum circuits with our advanced quantum circuit designer.
            </p>
            <Link to="/quantum-circuits">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Explore Circuits
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="bg-black/60 border-purple-500/20 hover:border-purple-500/40 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Cpu className="h-5 w-5 text-purple-400" />
              <span>Quantum Operations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-white">
              Access our suite of quantum operations for secure blockchain and cryptographic functions.
            </p>
            <Link to="/quantum-operations">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                View Operations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="bg-black/60 border-purple-500/20 hover:border-purple-500/40 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <BrainCircuit className="h-5 w-5 text-purple-400" />
              <span>Quantum AI</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-white">
              Leverage quantum computing for enhanced AI and machine learning capabilities.
            </p>
            <Link to="/quantum-ai">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Open Quantum AI
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataScienceIntegration />
        <CloudComputingIntegration />
      </div>
      
      <IoTIntegration />
    </div>
  );
}
