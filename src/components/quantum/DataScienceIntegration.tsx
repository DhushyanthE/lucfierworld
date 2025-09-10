
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Cpu, Database, BarChart, GitBranch, RefreshCcw, 
  Activity, LineChart, Calculator, BrainCircuit, Zap
} from "lucide-react";
import { toast } from "sonner";
import { 
  processDataWithQuantum, 
  QuantumDataAlgorithm, 
  evaluateQuantumDataAdvantage 
} from "@/lib/quantum/workflow/utils/quantumDataScience";

export function DataScienceIntegration() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [dataPoints, setDataPoints] = useState<number>(0);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<QuantumDataAlgorithm>(QuantumDataAlgorithm.PCA);
  const [quantumEnabled, setQuantumEnabled] = useState(true);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  
  const startDataAnalysis = async () => {
    setIsProcessing(true);
    toast.info("Quantum data analysis started");
    
    // Simulate data processing
    setDataPoints(0);
    const totalDataPoints = Math.floor(Math.random() * 5000) + 10000;
    
    try {
      // Process in chunks to show progress
      for (let i = 0; i <= totalDataPoints; i += 500) {
        setDataPoints(Math.min(i, totalDataPoints));
        await new Promise(r => setTimeout(r, 50)); // Speed up a bit
      }
      
      // Generate synthetic data
      const dimensions = Math.floor(Math.random() * 20) + 10;
      const syntheticData = Array(totalDataPoints).fill(0).map(() => 
        Array(dimensions).fill(0).map(() => Math.random() * 2 - 1)
      );
      
      // Run quantum data processing
      const quantumStart = Date.now();
      const quantumResults = processDataWithQuantum(syntheticData, {
        algorithm: selectedAlgorithm,
        quantumEnhancement: quantumEnabled,
        qubits: 16,
        errorCorrection: true,
        normalization: true,
        iterations: 100
      });
      const quantumTime = Date.now() - quantumStart;
      
      // Run classical data processing for comparison
      const classicalStart = Date.now();
      const classicalResults = processDataWithQuantum(syntheticData, {
        algorithm: selectedAlgorithm,
        quantumEnhancement: false,
        qubits: 0,
        errorCorrection: false,
        normalization: true,
        iterations: 100
      });
      const classicalTime = Date.now() - classicalStart;
      
      // Evaluate quantum advantage
      const advantage = evaluateQuantumDataAdvantage(
        classicalTime,
        quantumTime,
        classicalResults.accuracy,
        quantumResults.accuracy
      );
      
      setAnalysisResults({
        quantum: quantumResults,
        classical: classicalResults,
        advantage,
        dimensions,
        totalPoints: totalDataPoints
      });
      
      setAnalysisComplete(true);
      toast.success("Quantum data analysis complete", {
        description: `${totalDataPoints.toLocaleString()} data points processed`
      });
    } catch (error) {
      console.error("Data analysis error:", error);
      toast.error("Data analysis encountered an error");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const resetAnalysis = () => {
    setAnalysisComplete(false);
    setDataPoints(0);
    setAnalysisResults(null);
    toast.info("Analysis reset");
  };
  
  const getAlgorithmName = (algorithm: QuantumDataAlgorithm) => {
    switch (algorithm) {
      case QuantumDataAlgorithm.PCA:
        return "Principal Component Analysis";
      case QuantumDataAlgorithm.CLUSTERING:
        return "Quantum Clustering";
      case QuantumDataAlgorithm.CLASSIFICATION:
        return "Quantum Classification";
      case QuantumDataAlgorithm.REGRESSION:
        return "Quantum Regression";
      case QuantumDataAlgorithm.ANOMALY_DETECTION:
        return "Anomaly Detection";
      case QuantumDataAlgorithm.PATTERN_RECOGNITION:
        return "Pattern Recognition";
      case QuantumDataAlgorithm.QUANTUM_NEURAL_NETWORK:
        return "Quantum Neural Network";
      case QuantumDataAlgorithm.QUANTUM_SVM:
        return "Quantum SVM";
      default:
        return "Unknown Algorithm";
    }
  };
  
  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-purple-400" />
          <span>Quantum Data Science Integration</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-400" />
                <span className="text-sm">Quantum Data Processing</span>
              </div>
              <span className="text-sm text-blue-400">
                {dataPoints.toLocaleString()} points
              </span>
            </div>
            
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${analysisComplete ? 'bg-green-500' : 'bg-blue-500'}`} 
                style={{ width: `${isProcessing ? Math.min((dataPoints / 10000) * 100, 100) : analysisComplete ? 100 : 0}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Algorithm</div>
              <select
                value={selectedAlgorithm}
                onChange={(e) => setSelectedAlgorithm(e.target.value as QuantumDataAlgorithm)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                disabled={isProcessing}
              >
                {Object.values(QuantumDataAlgorithm).map((algo) => (
                  <option key={algo} value={algo}>
                    {getAlgorithmName(algo as QuantumDataAlgorithm)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Processing Mode</div>
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quantumEnabled}
                    onChange={() => setQuantumEnabled(!quantumEnabled)}
                    className="sr-only peer"
                    disabled={isProcessing}
                  />
                  <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-300">
                    {quantumEnabled ? (
                      <span className="flex items-center text-purple-300">
                        <Cpu className="h-3 w-3 mr-1" /> Quantum Enhanced
                      </span>
                    ) : (
                      <span className="text-gray-500">Classical</span>
                    )}
                  </span>
                </label>
              </div>
            </div>
          </div>
          
          {analysisResults && (
            <div className="mt-4">
              <Tabs defaultValue="results" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="results">Results</TabsTrigger>
                  <TabsTrigger value="comparison">Comparison</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                </TabsList>
                <TabsContent value="results" className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-800/80 p-3 rounded-md">
                      <div className="flex items-center gap-2 text-sm font-medium mb-2">
                        <LineChart className="h-4 w-4 text-purple-400" />
                        <span>Data Characteristics</span>
                      </div>
                      <div className="space-y-1 text-xs text-gray-300">
                        <div className="flex justify-between">
                          <span>Total Data Points:</span>
                          <span className="font-medium">{analysisResults.totalPoints.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dimensions:</span>
                          <span className="font-medium">{analysisResults.dimensions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Algorithm:</span>
                          <span className="font-medium">{getAlgorithmName(selectedAlgorithm)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/80 p-3 rounded-md">
                      <div className="flex items-center gap-2 text-sm font-medium mb-2">
                        <BrainCircuit className="h-4 w-4 text-blue-400" />
                        <span>Processing Results</span>
                      </div>
                      <div className="space-y-1 text-xs text-gray-300">
                        <div className="flex justify-between">
                          <span>Analysis Accuracy:</span>
                          <span className="font-medium">{(analysisResults.quantum.accuracy * 100).toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quantum Advantage:</span>
                          <span className="font-medium text-purple-300">
                            +{analysisResults.quantum.quantumAdvantage.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Processing Time:</span>
                          <span className="font-medium">{analysisResults.quantum.processingTime.toFixed(2)} ms</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="comparison" className="space-y-3">
                  <div className="bg-gray-800/80 p-3 rounded-md">
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Activity className="h-4 w-4 text-green-400" />
                      <span>Quantum vs Classical Performance</span>
                    </div>
                    <div className="space-y-3 text-xs text-gray-300">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Speed Improvement:</span>
                          <span className="font-medium text-green-300">
                            {analysisResults.advantage.speedupFactor.toFixed(2)}x faster
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Accuracy Improvement:</span>
                          <span className="font-medium text-green-300">
                            +{(analysisResults.advantage.accuracyImprovement * 100).toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Overall Advantage:</span>
                          <span className="font-medium text-green-300">
                            {analysisResults.advantage.overallAdvantage.toFixed(2)}x
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-700">
                        <div className="text-sm font-medium mb-1">Recommendation</div>
                        <div className="text-xs text-gray-300">{analysisResults.advantage.recommendation}</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="insights" className="space-y-3">
                  <div className="bg-gray-800/80 p-3 rounded-md">
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      <span>Quantum Analysis Insights</span>
                    </div>
                    
                    <ul className="space-y-2 text-xs text-gray-300">
                      {analysisResults.quantum.insights.map((insight: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-500 mt-0.5">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          <div className="flex justify-center space-x-3 mt-4">
            <Button 
              onClick={startDataAnalysis} 
              disabled={isProcessing} 
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isProcessing ? (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Start Quantum Analysis"
              )}
            </Button>
            
            {analysisComplete && (
              <Button 
                onClick={resetAnalysis} 
                variant="outline" 
                className="border-purple-500/20 text-purple-300"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
