
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileCode, GitMerge, Package } from "lucide-react";
import { DataScienceIntegration } from "@/components/quantum/DataScienceIntegration";
import { CloudComputingIntegration } from "@/components/quantum/CloudComputingIntegration";
import { IoTIntegration } from "@/components/quantum/IoTIntegration";

export function QuantumAITechnicalDocs() {
  return (
    <>
      <div className="grid grid-cols-1 gap-8 mt-8">
        <h2 className="text-2xl font-semibold text-white">Advanced Quantum Computing Features</h2>
        
        {/* Data Science Integration */}
        <DataScienceIntegration />
        
        {/* Grid with Cloud and IoT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cloud Computing Integration */}
          <CloudComputingIntegration />
          
          {/* IoT Integration */}
          <IoTIntegration />
        </div>
        
        <Card className="bg-black/70 border-purple-500/20 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-400" />
              <span>Quantum AI Technical Documentation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/60 border border-gray-800 rounded-lg p-4">
                <h3 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
                  <FileCode className="h-5 w-5" />
                  API Reference
                </h3>
                <ul className="text-sm space-y-2">
                  <li className="text-gray-300">Quantum Neural Networks</li>
                  <li className="text-gray-300">Encryption Protocols</li>
                  <li className="text-gray-300">Data Science Models</li>
                  <li className="text-gray-300">Cloud Integration</li>
                  <li className="text-gray-300">IoT Connectivity</li>
                </ul>
              </div>
              
              <div className="bg-black/60 border border-gray-800 rounded-lg p-4">
                <h3 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Integration Guides
                </h3>
                <ul className="text-sm space-y-2">
                  <li className="text-gray-300">Data Science Pipelines</li>
                  <li className="text-gray-300">Cloud Services Connection</li>
                  <li className="text-gray-300">IoT Device Management</li>
                  <li className="text-gray-300">Quantum Key Distribution</li>
                  <li className="text-gray-300">Workflow Automation</li>
                </ul>
              </div>
              
              <div className="bg-black/60 border border-gray-800 rounded-lg p-4">
                <h3 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
                  <GitMerge className="h-5 w-5" />
                  Development Resources
                </h3>
                <ul className="text-sm space-y-2">
                  <li className="text-gray-300">Security Protocols</li>
                  <li className="text-gray-300">Quantum Architecture</li>
                  <li className="text-gray-300">Model Training</li>
                  <li className="text-gray-300">AI Integration</li>
                  <li className="text-gray-300">Distributed Systems</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
