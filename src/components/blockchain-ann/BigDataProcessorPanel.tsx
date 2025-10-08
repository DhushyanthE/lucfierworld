import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Cpu, BarChart3, Zap } from 'lucide-react';
import { useBigDataProcessor, BigDataOperation } from '@/hooks/useBigDataProcessor';

export function BigDataProcessorPanel() {
  const { isProcessing, results, performance, processBigData } = useBigDataProcessor();
  const [operation, setOperation] = useState<BigDataOperation>('analyze');

  const handleProcess = () => {
    // Generate sample dataset
    const dataset = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      value: Math.random() * 1000,
      category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
      timestamp: Date.now() - i * 3600000
    }));

    processBigData(operation, dataset);
  };

  return (
    <Card className="border-blue-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-400" />
              Big Data Processor
            </CardTitle>
            <CardDescription>
              Distributed data processing with blockchain verification
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={operation} onValueChange={(v) => setOperation(v as BigDataOperation)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aggregate">Aggregate</SelectItem>
                <SelectItem value="transform">Transform</SelectItem>
                <SelectItem value="analyze">Analyze</SelectItem>
                <SelectItem value="predict">Predict</SelectItem>
                <SelectItem value="classify">Classify</SelectItem>
                <SelectItem value="cluster">Cluster</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleProcess} 
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Cpu className="mr-2 h-4 w-4" />
              {isProcessing ? 'Processing...' : 'Process Data'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {results && (
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-background/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Processed Records</p>
                    <p className="text-2xl font-bold">{results.processedRecords?.toLocaleString()}</p>
                  </div>
                  <Database className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Insights Found</p>
                    <p className="text-2xl font-bold">{results.insights?.length || 0}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {performance && (
          <Card className="bg-background/50">
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                Performance Metrics
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Throughput</p>
                  <p className="font-mono">{performance.throughput?.toFixed(2)} rec/s</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Latency</p>
                  <p className="font-mono">{performance.latency?.toFixed(2)} ms</p>
                </div>
                <div>
                  <p className="text-muted-foreground">BC Verifications</p>
                  <p className="font-mono">{performance.blockchainVerifications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {results?.insights && results.insights.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Data Insights</h3>
            <div className="space-y-2">
              {results.insights.map((insight: string, index: number) => (
                <Card key={index} className="bg-background/30">
                  <CardContent className="p-3">
                    <p className="text-sm">{insight}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
