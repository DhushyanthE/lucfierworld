import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Activity, Network, Shield, FileText, CheckCircle, XCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { agiOrchestratorService, DataRegisteredEvent, AccessRequestedEvent } from '@/lib/quantum/orchestrator';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  type: string;
  timestamp: number;
  details: any;
}

export function AGIOrchestrator() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [quantumSeedEnabled, setQuantumSeedEnabled] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [processingEvent, setProcessingEvent] = useState<string | null>(null);
  
  // Initialize on mount
  useEffect(() => {
    // Update initial state
    const status = agiOrchestratorService.getStatus();
    setIsRunning(status.isRunning);
    setQuantumSeedEnabled(status.quantumSeedEnabled);
    
    // Register event listeners
    const unsubscribeDataRegistered = agiOrchestratorService.addEventListener('dataRegistered', 
      (data: any) => {
        setProcessingEvent(`Processing data ${data.dataId.substring(0, 8)}...`);
        setEvents(prev => [{
          id: `data_${Date.now()}`,
          type: 'DataRegistered',
          timestamp: Date.now(),
          details: data
        }, ...prev]);
      }
    );
    
    const unsubscribeDataSummarized = agiOrchestratorService.addEventListener('dataSummarized',
      (data: any) => {
        setProcessingEvent(null);
        setEvents(prev => [{
          id: `summary_${Date.now()}`,
          type: 'DataSummarized',
          timestamp: Date.now(),
          details: data
        }, ...prev]);
        
        setSummaries(prev => [{
          dataId: data.dataId,
          summaryCID: data.summaryCID,
          summary: data.summary,
          timestamp: Date.now()
        }, ...prev]);
      }
    );
    
    const unsubscribeAccessRequested = agiOrchestratorService.addEventListener('accessRequested',
      (data: any) => {
        setProcessingEvent(`Assessing access request ${data.requestId.substring(0, 8)}...`);
        setEvents(prev => [{
          id: `request_${Date.now()}`,
          type: 'AccessRequested',
          timestamp: Date.now(),
          details: data
        }, ...prev]);
      }
    );
    
    const unsubscribeAccessApproved = agiOrchestratorService.addEventListener('accessApproved',
      (data: any) => {
        setProcessingEvent(null);
        setEvents(prev => [{
          id: `approved_${Date.now()}`,
          type: 'AccessApproved',
          timestamp: Date.now(),
          details: data
        }, ...prev]);
        
        setAssessments(prev => [{
          dataId: data.dataId,
          requestId: data.requestId,
          requester: data.requester,
          assessment: data.assessment,
          approved: true,
          timestamp: Date.now()
        }, ...prev]);
      }
    );
    
    const unsubscribeAccessDenied = agiOrchestratorService.addEventListener('accessDenied',
      (data: any) => {
        setProcessingEvent(null);
        setEvents(prev => [{
          id: `denied_${Date.now()}`,
          type: 'AccessDenied',
          timestamp: Date.now(),
          details: data
        }, ...prev]);
        
        setAssessments(prev => [{
          dataId: data.dataId,
          requestId: data.requestId,
          requester: data.requester,
          assessment: data.assessment,
          approved: false,
          timestamp: Date.now()
        }, ...prev]);
      }
    );
    
    // Cleanup listeners on unmount
    return () => {
      unsubscribeDataRegistered();
      unsubscribeDataSummarized();
      unsubscribeAccessRequested();
      unsubscribeAccessApproved();
      unsubscribeAccessDenied();
    };
  }, [toast]);
  
  // Toggle orchestrator service
  const toggleService = () => {
    if (isRunning) {
      agiOrchestratorService.stop();
      setIsRunning(false);
    } else {
      agiOrchestratorService.start();
      setIsRunning(true);
    }
  };
  
  // Toggle quantum seed
  const toggleQuantumSeed = (enabled: boolean) => {
    agiOrchestratorService.toggleQuantumSeed(enabled);
    setQuantumSeedEnabled(enabled);
    
    toast({
      title: enabled 
        ? "Quantum seed enabled" 
        : "Quantum seed disabled",
      description: enabled 
        ? "AGI prompts will be seeded with quantum entropy" 
        : "AGI prompts will use standard randomness"
    });
  };
  
  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  // Simulate adding test event for UI testing
  const addTestEvent = async () => {
    if (Math.random() > 0.5) {
      const testEvent: DataRegisteredEvent = {
        dataId: `data_${Date.now()}`,
        owner: `0x${Math.random().toString(16).substring(2, 10)}`,
        ipfsHash: `Qm${Math.random().toString(16).substring(2, 30)}`,
        timestamp: Date.now()
      };
      await agiOrchestratorService.processDataRegistered(testEvent);
    } else {
      const testEvent: AccessRequestedEvent = {
        dataId: `data_${Math.floor(Date.now() / 1000)}`,
        requestId: `req_${Date.now()}`,
        requester: `0x${Math.random().toString(16).substring(2, 10)}`,
        purpose: "Genetic analysis for personalized medicine treatment planning",
        timestamp: Date.now()
      };
      await agiOrchestratorService.processAccessRequested(testEvent);
    }
  };
  
  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="h-5 w-5 text-purple-400" />
            <span>AGI Blockchain Orchestrator</span>
            
            <Badge variant={isRunning ? "default" : "secondary"} className="ml-2">
              {isRunning ? "Active" : "Inactive"}
            </Badge>
          </CardTitle>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="quantum-seed"
                checked={quantumSeedEnabled}
                onCheckedChange={toggleQuantumSeed}
                disabled={!isRunning}
              />
              <Label htmlFor="quantum-seed" className="text-xs text-gray-400">
                Quantum Seed
              </Label>
            </div>
            
            <Button 
              variant={isRunning ? "destructive" : "default"}
              size="sm"
              onClick={toggleService}
              className={isRunning ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"}
            >
              {isRunning ? "Stop Orchestrator" : "Start Orchestrator"}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status indicator */}
        {processingEvent && (
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-md p-3 flex items-center gap-3">
            <RefreshCw className="h-4 w-4 text-purple-400 animate-spin" />
            <p className="text-sm text-purple-300">{processingEvent}</p>
          </div>
        )}
        
        {/* Main tabs */}
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="events" className="flex items-center gap-1">
              <Activity className="h-4 w-4" /> 
              <span>Events</span>
            </TabsTrigger>
            <TabsTrigger value="summaries" className="flex items-center gap-1">
              <FileText className="h-4 w-4" /> 
              <span>Data Summaries</span>
            </TabsTrigger>
            <TabsTrigger value="assessments" className="flex items-center gap-1">
              <Shield className="h-4 w-4" /> 
              <span>Access Assessments</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="events" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-white">Recent Blockchain Events</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addTestEvent} 
                disabled={!isRunning}
                className="text-xs h-7 px-2 border-purple-500/20"
              >
                Simulate Event
              </Button>
            </div>
            
            {events.length === 0 ? (
              <div className="text-center py-8">
                <Network className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No events yet. Start the orchestrator to listen for blockchain events.</p>
                {!isRunning && (
                  <Button className="mt-4 bg-purple-600 hover:bg-purple-700" onClick={toggleService}>
                    Start Orchestrator
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {events.map((event) => (
                  <div 
                    key={event.id}
                    className="bg-gray-900/70 border border-gray-800 rounded-md p-3 text-xs"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <Badge 
                        variant={
                          event.type === 'AccessApproved' ? "default" :
                          event.type === 'AccessDenied' ? "destructive" :
                          "outline"
                        }
                        className={
                          event.type === 'AccessApproved' ? "bg-green-700/20 text-green-300 hover:bg-green-700/30 border-green-700/30" :
                          event.type === 'AccessDenied' ? "bg-red-700/20 text-red-300 hover:bg-red-700/30 border-red-700/30" :
                          event.type === 'DataRegistered' ? "bg-blue-700/20 text-blue-300 hover:bg-blue-700/30 border-blue-700/30" :
                          event.type === 'DataSummarized' ? "bg-purple-700/20 text-purple-300 hover:bg-purple-700/30 border-purple-700/30" :
                          "bg-gray-700/20 text-gray-300 hover:bg-gray-700/30 border-gray-700/30"
                        }
                      >
                        {event.type}
                      </Badge>
                      <span className="text-gray-400">{formatTime(event.timestamp)}</span>
                    </div>
                    
                    <div className="space-y-1 text-gray-300">
                      {event.type === 'DataRegistered' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Data ID:</span>
                            <span>{event.details.dataId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Owner:</span>
                            <span>{event.details.owner}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">IPFS Hash:</span>
                            <span className="truncate max-w-[200px]">{event.details.ipfsHash}</span>
                          </div>
                        </>
                      )}
                      
                      {event.type === 'DataSummarized' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Data ID:</span>
                            <span>{event.details.dataId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Summary CID:</span>
                            <span className="truncate max-w-[200px]">{event.details.summaryCID}</span>
                          </div>
                        </>
                      )}
                      
                      {event.type === 'AccessRequested' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Request ID:</span>
                            <span>{event.details.requestId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Data ID:</span>
                            <span>{event.details.dataId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Requester:</span>
                            <span>{event.details.requester}</span>
                          </div>
                        </>
                      )}
                      
                      {(event.type === 'AccessApproved' || event.type === 'AccessDenied') && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Request ID:</span>
                            <span>{event.details.requestId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Data ID:</span>
                            <span>{event.details.dataId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Requester:</span>
                            <span>{event.details.requester}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="summaries" className="space-y-4">
            <h3 className="text-sm font-medium text-white">AGI Generated Dataset Summaries</h3>
            
            {summaries.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No data summaries generated yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                {summaries.map((summary, index) => (
                  <div 
                    key={`summary_${index}`}
                    className="bg-gray-900/70 border border-gray-800 rounded-md p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <Badge className="bg-purple-700/20 text-purple-300 hover:bg-purple-700/30 border-purple-700/30">
                          Dataset Summary
                        </Badge>
                        <h4 className="text-sm font-medium text-white mt-1">Data ID: {summary.dataId}</h4>
                      </div>
                      <span className="text-xs text-gray-400">{formatTime(summary.timestamp)}</span>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-3">{summary.summary}</p>
                    
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">CID: {summary.summaryCID}</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-purple-400 hover:text-purple-300">
                        <span>View on IPFS</span>
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="assessments" className="space-y-4">
            <h3 className="text-sm font-medium text-white">AGI Access Control Assessments</h3>
            
            {assessments.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No access assessments performed yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                {assessments.map((assessment, index) => (
                  <div 
                    key={`assessment_${index}`}
                    className={`bg-gray-900/70 border rounded-md p-4 ${
                      assessment.approved 
                        ? "border-green-800/30" 
                        : "border-red-800/30"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <Badge 
                          variant={assessment.approved ? "outline" : "destructive"}
                          className={
                            assessment.approved 
                              ? "bg-green-700/20 text-green-300 hover:bg-green-700/30 border-green-700/30" 
                              : "bg-red-700/20 text-red-300 hover:bg-red-700/30 border-red-700/30"
                          }
                        >
                          {assessment.approved ? (
                            <><CheckCircle className="h-3 w-3 mr-1" /> Access Granted</>
                          ) : (
                            <><XCircle className="h-3 w-3 mr-1" /> Access Denied</>
                          )}
                        </Badge>
                        <h4 className="text-sm font-medium text-white mt-1">
                          Request ID: {assessment.requestId}
                        </h4>
                      </div>
                      <span className="text-xs text-gray-400">{formatTime(assessment.timestamp)}</span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex gap-1 text-xs text-gray-400 mb-1">
                        <span className="font-medium">Requester:</span>
                        <span>{assessment.requester}</span>
                      </div>
                      <div className="flex gap-1 text-xs text-gray-400 mb-2">
                        <span className="font-medium">Data ID:</span>
                        <span>{assessment.dataId}</span>
                      </div>
                      
                      <p className="text-sm text-gray-300">{assessment.assessment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default AGIOrchestrator;
