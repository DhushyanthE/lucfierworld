
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Dna, Database, Network } from 'lucide-react';
import { GenomicDataVisualizer } from '@/components/genomics/GenomicDataVisualizer';
import { BlockchainVerifier } from '@/components/genomics/BlockchainVerifier';
import { TokenIntegration } from '@/components/genomics/sections/TokenIntegration';
import { GenomicAIWorkflow } from '@/components/genomics/workflow/GenomicAIWorkflow';

export function DataRegistryTab() {
  const [activeTab, setActiveTab] = React.useState('visualizer');

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="visualizer">
            <Dna className="h-4 w-4 mr-2" />
            Genomic Data
          </TabsTrigger>
          <TabsTrigger value="blockchain">
            <Network className="h-4 w-4 mr-2" />
            Blockchain Verification
          </TabsTrigger>
          <TabsTrigger value="workflow">
            <Database className="h-4 w-4 mr-2" />
            AI Workflow
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="visualizer" className="mt-4">
          <GenomicDataVisualizer />
        </TabsContent>
        
        <TabsContent value="blockchain" className="mt-4">
          <BlockchainVerifier />
        </TabsContent>
        
        <TabsContent value="workflow" className="mt-4">
          <GenomicAIWorkflow />
        </TabsContent>
      </Tabs>
      
      <TokenIntegration />
    </div>
  );
}
