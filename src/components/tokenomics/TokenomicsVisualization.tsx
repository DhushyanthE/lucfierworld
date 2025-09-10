
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Coins } from 'lucide-react';
import { TokenAllocationTab } from './visualization/TokenAllocationTab';
import { DistributionTab } from './visualization/DistributionTab';
import { VestingTab } from './visualization/VestingTab';

export function TokenomicsVisualization() {
  const [activeTab, setActiveTab] = useState('allocation');
  
  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-purple-400" />
          <span>Quantum Coin Tokenomics</span>
          <Badge variant="outline" className="ml-auto bg-purple-900/30 text-purple-300 text-xs">
            QNTM
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger 
              value="allocation" 
              className="data-[state=active]:bg-purple-900/30"
              onClick={() => setActiveTab('allocation')}
            >
              Allocation
            </TabsTrigger>
            <TabsTrigger 
              value="distribution" 
              className="data-[state=active]:bg-purple-900/30"
              onClick={() => setActiveTab('distribution')}
            >
              Distribution
            </TabsTrigger>
            <TabsTrigger 
              value="vesting" 
              className="data-[state=active]:bg-purple-900/30"
              onClick={() => setActiveTab('vesting')}
            >
              Vesting
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="allocation">
            <TokenAllocationTab />
          </TabsContent>
          
          <TabsContent value="distribution">
            <DistributionTab />
          </TabsContent>
          
          <TabsContent value="vesting">
            <VestingTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
