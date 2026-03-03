import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { QuantumCircuitStudio } from '@/components/quantum/advanced/QuantumCircuitStudio';
import { EntanglementVisualization } from '@/components/quantum/advanced/EntanglementVisualization';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cpu, Link2 } from 'lucide-react';

export default function QuantumCircuits() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="circuits" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="circuits" className="gap-2"><Cpu className="h-4 w-4" />Circuit Studio</TabsTrigger>
            <TabsTrigger value="entanglement" className="gap-2"><Link2 className="h-4 w-4" />Entanglement Lab</TabsTrigger>
          </TabsList>
          <TabsContent value="circuits">
            <QuantumCircuitStudio />
          </TabsContent>
          <TabsContent value="entanglement">
            <EntanglementVisualization />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
