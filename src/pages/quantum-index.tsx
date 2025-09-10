
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { QuantumVisualization } from '@/components/quantum/visualization/QuantumVisualization';
import { AdvancedAiCapabilities } from '@/components/quantum/AdvancedAiCapabilities';
import { QuantumBlockchain } from '@/components/quantum/QuantumBlockchain';
import { QuantumDataScience } from '@/components/quantum/QuantumDataScience';
import { QuantumCloudComputing } from '@/components/quantum/QuantumCloudComputing';
import { QuantumIoTIntegration } from '@/components/quantum/QuantumIoTIntegration';
import { QuantumTechnicalDocs } from '@/components/quantum/QuantumTechnicalDocs';
import { CircuitOptimizer } from '@/components/quantum/CircuitOptimizer';
import { QuantumAIEngine } from '@/components/ai/QuantumAIEngine';
import { QuantumWorkflowIntegration } from '@/components/ai/QuantumWorkflowIntegration';

export default function QuantumIndex() {
  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 space-y-8">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Quantum Intelligence Platform
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuantumVisualization />
          <AdvancedAiCapabilities />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuantumBlockchain />
          <QuantumAIEngine tokenSymbol="QNTM" />
        </div>
        
        <QuantumWorkflowIntegration />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuantumDataScience />
          <QuantumCloudComputing />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuantumIoTIntegration />
          <CircuitOptimizer />
        </div>
        
        <QuantumTechnicalDocs />
      </div>
    </AppLayout>
  );
}
