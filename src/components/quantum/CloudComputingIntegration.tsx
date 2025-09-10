
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Cloud, Server, CircleDollarSign, RefreshCcw, Check, 
  Clock, AlertTriangle, Cpu, BarChart
} from "lucide-react";
import { toast } from "sonner";
import { 
  CloudQuantumProcessorType,
  CloudJobStatus,
  CloudQuantumJobConfig,
  submitCloudQuantumJob,
  getCloudJobStatus,
  estimateCloudJobCost,
  getAvailableCloudProcessors
} from "@/lib/quantum/workflow/utils/quantumCloud";

export function CloudComputingIntegration() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedProcessor, setSelectedProcessor] = useState<string>('sim-basic');
  const [shots, setShots] = useState<number>(1000);
  const [qubits, setQubits] = useState<number>(5);
  const [errorMitigation, setErrorMitigation] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [availableProcessors, setAvailableProcessors] = useState<any[]>([]);
  
  useEffect(() => {
    // Load available processors
    setAvailableProcessors(getAvailableCloudProcessors());
    
    // Update cost estimate when parameters change
    updateCostEstimate();
  }, [selectedProcessor, shots, qubits, errorMitigation]);
  
  const updateCostEstimate = () => {
    const selectedProc = availableProcessors.find(p => p.id === selectedProcessor);
    if (!selectedProc) return;
    
    const config: CloudQuantumJobConfig = {
      processorType: selectedProc.type,
      priority: 1,
      qubits,
      shots,
      maxExecutionTime: 60,
      errorMitigation
    };
    
    const cost = estimateCloudJobCost(config);
    setEstimatedCost(cost);
  };
  
  const renderStatusIcon = (status: CloudJobStatus | undefined) => {
    if (status === CloudJobStatus.COMPLETED) {
      return <Check className="h-4 w-4 mr-1" />;
    } else if (status === CloudJobStatus.RUNNING) {
      return <RefreshCcw className="h-4 w-4 mr-1 animate-spin" />;
    } else if (status === CloudJobStatus.QUEUED) {
      return <Clock className="h-4 w-4 mr-1" />;
    } else if (status === CloudJobStatus.FAILED) {
      return <AlertTriangle className="h-4 w-4 mr-1" />;
    }
    return null;
  };
  
  const submitJob = async () => {
    setIsSubmitting(true);
    
    try {
      const selectedProc = availableProcessors.find(p => p.id === selectedProcessor);
      if (!selectedProc) {
        throw new Error("Selected processor not found");
      }
      
      // Create simple quantum circuit (simplified for demo)
      const circuit = `
OPENQASM 2.0;
include "qelib1.inc";
qreg q[${qubits}];
creg c[${qubits}];
h q[0];
cx q[0],q[1];
measure q -> c;
      `;
      
      // Create job config
      const config: CloudQuantumJobConfig = {
        processorType: selectedProc.type,
        priority: 1,
        qubits,
        shots,
        maxExecutionTime: 60,
        errorMitigation
      };
      
      // Submit job
      const newJobId = await submitCloudQuantumJob(circuit, config);
      setJobId(newJobId);
      
      toast.success("Quantum job submitted to cloud", {
        description: `Job ID: ${newJobId}`
      });
      
      // Start polling for job status
      pollJobStatus(newJobId);
    } catch (error) {
      console.error("Error submitting job:", error);
      toast.error("Failed to submit quantum job");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const pollJobStatus = async (id: string) => {
    try {
      const status = await getCloudJobStatus(id);
      setJobStatus(status);
      
      // If job is still running, poll again
      if (status.status === CloudJobStatus.RUNNING || status.status === CloudJobStatus.QUEUED) {
        setTimeout(() => pollJobStatus(id), 1500);
      } else if (status.status === CloudJobStatus.COMPLETED) {
        toast.success("Quantum job completed successfully");
      } else if (status.status === CloudJobStatus.FAILED) {
        toast.error("Quantum job failed");
      }
    } catch (error) {
      console.error("Error polling job status:", error);
    }
  };
  
  const resetJob = () => {
    setJobId(null);
    setJobStatus(null);
  };
  
  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-purple-400" />
          <span>Quantum Cloud Computing</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!jobId ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Select Quantum Processor</div>
                  <select
                    value={selectedProcessor}
                    onChange={(e) => setSelectedProcessor(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                    disabled={isSubmitting}
                  >
                    {availableProcessors.map((processor) => (
                      <option key={processor.id} value={processor.id}>
                        {processor.name} ({processor.qubits} qubits)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Number of Shots</div>
                  <input
                    type="number"
                    value={shots}
                    onChange={(e) => setShots(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                    min="1"
                    max="10000"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Circuit Size (Qubits)</div>
                  <input
                    type="number"
                    value={qubits}
                    onChange={(e) => setQubits(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                    min="1"
                    max="32"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Error Mitigation</div>
                  <div className="flex items-center pt-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={errorMitigation}
                        onChange={() => setErrorMitigation(!errorMitigation)}
                        className="sr-only peer"
                        disabled={isSubmitting}
                      />
                      <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-300">
                        {errorMitigation ? "Enabled" : "Disabled"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/80 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <CircleDollarSign className="h-4 w-4 text-green-400" />
                    <span>Estimated Cost</span>
                  </div>
                  <div className="text-green-400 font-medium">${estimatedCost.toFixed(4)}</div>
                </div>
              </div>
              
              <div className="flex justify-center mt-4">
                <Button 
                  onClick={submitJob} 
                  disabled={isSubmitting} 
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Quantum Job"
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-800/80 p-4 rounded-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-purple-400" />
                    <span className="font-medium">Quantum Job Status</span>
                  </div>
                  <div>
                    {jobStatus?.status === CloudJobStatus.COMPLETED && (
                      <span className="flex items-center text-green-400 text-sm">
                        {renderStatusIcon(CloudJobStatus.COMPLETED)} Completed
                      </span>
                    )}
                    {jobStatus?.status === CloudJobStatus.RUNNING && (
                      <span className="flex items-center text-blue-400 text-sm">
                        {renderStatusIcon(CloudJobStatus.RUNNING)} Running
                      </span>
                    )}
                    {jobStatus?.status === CloudJobStatus.QUEUED && (
                      <span className="flex items-center text-yellow-400 text-sm">
                        {renderStatusIcon(CloudJobStatus.QUEUED)} Queued
                      </span>
                    )}
                    {jobStatus?.status === CloudJobStatus.FAILED && (
                      <span className="flex items-center text-red-400 text-sm">
                        {renderStatusIcon(CloudJobStatus.FAILED)} Failed
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <div className="text-gray-400">Job ID</div>
                    <div className="text-white font-mono text-xs">{jobId}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-400">Processor</div>
                    <div className="text-white">
                      {availableProcessors.find(p => p.id === selectedProcessor)?.name || "Unknown"}
                    </div>
                  </div>
                </div>
                
                {jobStatus?.status === CloudJobStatus.COMPLETED && jobStatus?.results && (
                  <div className="pt-3 border-t border-gray-700 space-y-3">
                    <div className="font-medium">Results</div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-900/50 p-3 rounded-md">
                        <div className="flex items-center gap-2 mb-2">
                          <Cpu className="h-4 w-4 text-blue-400" />
                          <span className="font-medium">Execution Stats</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Execution Time:</span>
                            <span>{jobStatus.executionTime?.toFixed(2) || 0} ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Error Rate:</span>
                            <span>{((jobStatus.errorRate || 0) * 100).toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Fidelity:</span>
                            <span>{((jobStatus.results?.fidelity || 0) * 100).toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Final Cost:</span>
                            <span className="text-green-400">${(jobStatus.cost || 0).toFixed(4)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-900/50 p-3 rounded-md">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart className="h-4 w-4 text-purple-400" />
                          <span className="font-medium">Measurement Counts</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          {jobStatus.results?.counts && Object.entries(jobStatus.results.counts).map(([state, count]) => (
                            <div key={state} className="flex justify-between">
                              <span className="text-gray-400">{state}:</span>
                              <span>{String(count)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={resetJob} 
                  variant="outline" 
                  className="border-purple-500/20 text-purple-300"
                >
                  Run Another Job
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
