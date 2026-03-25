import React from 'react';
import Layout from '@/components/Layout';
import { QuantumCircuitStudio } from '@/components/quantum/advanced/QuantumCircuitStudio';
import { EntanglementVisualization } from '@/components/quantum/advanced/EntanglementVisualization';
import { QuantumErrorCorrection } from '@/components/quantum/advanced/QuantumErrorCorrection';
import { DecoherenceSimulation } from '@/components/quantum/advanced/DecoherenceSimulation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cpu, Link2, Shield, Atom } from 'lucide-react';

export default function QuantumCircuits() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="circuits" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="circuits" className="gap-2"><Cpu className="h-4 w-4" />Circuit Studio</TabsTrigger>
            <TabsTrigger value="entanglement" className="gap-2"><Link2 className="h-4 w-4" />Entanglement Lab</TabsTrigger>
            <TabsTrigger value="error-correction" className="gap-2"><Shield className="h-4 w-4" />Error Correction</TabsTrigger>
            <TabsTrigger value="decoherence" className="gap-2"><Atom className="h-4 w-4" />Decoherence Lab</TabsTrigger>
          </TabsList>
          <TabsContent value="circuits">
            <QuantumCircuitStudio />
          </TabsContent>
          <TabsContent value="entanglement">
            <EntanglementVisualization />
          </TabsContent>
          <TabsContent value="error-correction">
            <QuantumErrorCorrection />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
