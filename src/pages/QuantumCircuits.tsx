import React from 'react';
import Layout from '@/components/Layout';
import { QuantumCircuitStudio } from '@/components/quantum/advanced/QuantumCircuitStudio';
import { EntanglementVisualization } from '@/components/quantum/advanced/EntanglementVisualization';
import { QuantumErrorCorrection } from '@/components/quantum/advanced/QuantumErrorCorrection';
import { DecoherenceSimulation } from '@/components/quantum/advanced/DecoherenceSimulation';
import { GateFidelityBenchmark } from '@/components/quantum/advanced/GateFidelityBenchmark';
import { QuantumAlgorithmSimulator } from '@/components/quantum/advanced/QuantumAlgorithmSimulator';
import { QuantumVQESimulator } from '@/components/quantum/advanced/QuantumVQESimulator';
import { QuantumStateTomography } from '@/components/quantum/advanced/QuantumStateTomography';
import { QuantumProcessTomography } from '@/components/quantum/advanced/QuantumProcessTomography';
import { QuantumCompiler } from '@/components/quantum/advanced/QuantumCompiler';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cpu, Link2, Shield, Atom, Gauge, Zap, FlaskConical, Eye, Activity, Settings2 } from 'lucide-react';

export default function QuantumCircuits() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="circuits" className="w-full">
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="circuits" className="gap-2"><Cpu className="h-4 w-4" />Circuit Studio</TabsTrigger>
            <TabsTrigger value="algorithms" className="gap-2"><Zap className="h-4 w-4" />Algorithms</TabsTrigger>
            <TabsTrigger value="vqe" className="gap-2"><FlaskConical className="h-4 w-4" />VQE</TabsTrigger>
            <TabsTrigger value="tomography" className="gap-2"><Eye className="h-4 w-4" />Tomography</TabsTrigger>
            <TabsTrigger value="entanglement" className="gap-2"><Link2 className="h-4 w-4" />Entanglement Lab</TabsTrigger>
            <TabsTrigger value="error-correction" className="gap-2"><Shield className="h-4 w-4" />Error Correction</TabsTrigger>
            <TabsTrigger value="decoherence" className="gap-2"><Atom className="h-4 w-4" />Decoherence Lab</TabsTrigger>
            <TabsTrigger value="benchmark" className="gap-2"><Gauge className="h-4 w-4" />Gate Benchmark</TabsTrigger>
          </TabsList>
          <TabsContent value="circuits">
            <QuantumCircuitStudio />
          </TabsContent>
          <TabsContent value="algorithms">
            <QuantumAlgorithmSimulator />
          </TabsContent>
          <TabsContent value="vqe">
            <QuantumVQESimulator />
          </TabsContent>
          <TabsContent value="tomography">
            <QuantumStateTomography />
          </TabsContent>
          <TabsContent value="entanglement">
            <EntanglementVisualization />
          </TabsContent>
          <TabsContent value="error-correction">
            <QuantumErrorCorrection />
          </TabsContent>
          <TabsContent value="decoherence">
            <DecoherenceSimulation />
          </TabsContent>
          <TabsContent value="benchmark">
            <GateFidelityBenchmark />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
