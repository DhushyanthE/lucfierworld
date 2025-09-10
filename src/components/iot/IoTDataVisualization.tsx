import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Smartphone, Cpu, Activity, AlertTriangle, Wifi } from 'lucide-react';

interface IoTDevice {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning';
  lastSeen: Date;
  metrics: {
    temperature: number[];
    cpu: number[];
    memory: number[];
    network: number[];
  };
  anomalies: {
    detected: boolean;
    count: number;
    lastDetected?: Date;
  };
}

const generateMockData = () => {
  // Generate 15 data points for each metric
  const getMetricData = () => {
    const baseValue = Math.random() * 50 + 20;
    return Array(15).fill(0).map((_, i) => {
      // Add some randomness but keep it reasonably consistent
      return baseValue + Math.sin(i / 3) * 10 + (Math.random() * 5);
    });
  };
  
  // Create 3 mock devices
  return [
    {
      id: 'dev-001',
      name: 'Edge Sensor Alpha',
      status: 'online' as const,
      lastSeen: new Date(),
      metrics: {
        temperature: getMetricData(),
        cpu: getMetricData(),
        memory: getMetricData(),
        network: getMetricData(),
      },
      anomalies: {
        detected: Math.random() > 0.7,
        count: Math.floor(Math.random() * 5),
        lastDetected: new Date(Date.now() - Math.random() * 3600000),
      }
    },
    {
      id: 'dev-002',
      name: 'Quantum Node Beta',
      status: 'warning' as const,
      lastSeen: new Date(Date.now() - 120000), // 2 minutes ago
      metrics: {
        temperature: getMetricData(),
        cpu: getMetricData(),
        memory: getMetricData(),
        network: getMetricData(),
      },
      anomalies: {
        detected: true,
        count: 3,
        lastDetected: new Date(Date.now() - 300000), // 5 minutes ago
      }
    },
    {
      id: 'dev-003',
      name: 'Gateway Gamma',
      status: 'offline' as const, 
      lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
      metrics: {
        temperature: getMetricData(),
        cpu: getMetricData(),
        memory: getMetricData(),
        network: getMetricData(),
      },
      anomalies: {
        detected: false,
        count: 0
      }
    }
  ];
};

export function IoTDataVisualization() {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'cpu' | 'memory' | 'network'>('temperature');
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize with mock data
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API fetch delay
    setTimeout(() => {
      const data = generateMockData();
      setDevices(data);
      setSelectedDevice(data[0].id);
      setIsLoading(false);
    }, 1000);
    
    // Set up real-time updates
    const intervalId = setInterval(() => {
      setDevices(prev => prev.map(device => ({
        ...device,
        lastSeen: device.status === 'online' ? new Date() : device.lastSeen,
        metrics: {
          temperature: [...device.metrics.temperature.slice(1), device.metrics.temperature[0] + (Math.random() * 4 - 2)],
          cpu: [...device.metrics.cpu.slice(1), device.metrics.cpu[0] + (Math.random() * 8 - 4)],
          memory: [...device.metrics.memory.slice(1), device.metrics.memory[0] + (Math.random() * 6 - 3)],
          network: [...device.metrics.network.slice(1), device.metrics.network[0] + (Math.random() * 10 - 5)]
        }
      })));
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Get the currently selected device
  const currentDevice = devices.find(d => d.id === selectedDevice);
  
  // Prepare chart data
  const chartData = currentDevice ? currentDevice.metrics[selectedMetric].map((value, index) => ({
    time: `T-${currentDevice.metrics[selectedMetric].length - index}`,
    value
  })) : [];
  
  return (
    <Card className="bg-gray-900/70 border-blue-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-blue-400" />
            IoT Device Network
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Device List */}
            <div className="grid grid-cols-3 gap-3">
              {devices.map(device => (
                <div 
                  key={device.id}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    selectedDevice === device.id 
                      ? 'bg-blue-900/40 border border-blue-500/40' 
                      : 'bg-gray-800/40 hover:bg-gray-700/40'
                  }`}
                  onClick={() => setSelectedDevice(device.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-white">{device.name}</div>
                      <div className="text-xs text-gray-400">
                        ID: {device.id}
                      </div>
                    </div>
                    <Badge className={
                      device.status === 'online' ? 'bg-green-600' :
                      device.status === 'warning' ? 'bg-yellow-600' :
                      'bg-red-600'
                    }>
                      {device.status}
                    </Badge>
                  </div>
                  
                  <div className="mt-2 flex justify-between items-center text-xs">
                    <div className="text-gray-400">
                      {device.status === 'online' 
                        ? 'Online now' 
                        : `Last seen: ${new Date(device.lastSeen).toLocaleTimeString()}`
                      }
                    </div>
                    
                    {device.anomalies.detected && (
                      <div className="flex items-center text-yellow-500">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {device.anomalies.count}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Metrics View */}
            {currentDevice && (
              <div className="bg-gray-800/40 p-4 rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">{currentDevice.name} Metrics</h3>
                  
                  {currentDevice.anomalies.detected && (
                    <Badge className="bg-yellow-600 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Anomaly Detected
                    </Badge>
                  )}
                </div>
                
                <Tabs 
                  value={selectedMetric} 
                  onValueChange={(value) => setSelectedMetric(value as any)}
                >
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="temperature">Temperature</TabsTrigger>
                    <TabsTrigger value="cpu">CPU</TabsTrigger>
                    <TabsTrigger value="memory">Memory</TabsTrigger>
                    <TabsTrigger value="network">Network</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value={selectedMetric}>
                    <div className="h-64 bg-gray-900/40 rounded-md p-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="time" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "#1F2937", 
                              borderColor: "#4B5563",
                              color: "#F9FAFB"
                            }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#3B82F6" 
                            strokeWidth={2} 
                            activeDot={{ r: 6 }}
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
                
                {/* Device status bar */}
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div className="bg-gray-900/40 p-2 rounded flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-blue-400" />
                    <span className="text-xs text-gray-300">Status: </span>
                    <Badge className={
                      currentDevice.status === 'online' ? 'bg-green-600 ml-auto' :
                      currentDevice.status === 'warning' ? 'bg-yellow-600 ml-auto' :
                      'bg-red-600 ml-auto'
                    }>
                      {currentDevice.status}
                    </Badge>
                  </div>
                  <div className="bg-gray-900/40 p-2 rounded flex items-center">
                    <Cpu className="h-4 w-4 mr-2 text-blue-400" />
                    <span className="text-xs text-gray-300">Processing: </span>
                    <span className="text-xs ml-auto text-white">
                      {currentDevice.metrics.cpu[currentDevice.metrics.cpu.length - 1].toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-gray-900/40 p-2 rounded flex items-center">
                    <Wifi className="h-4 w-4 mr-2 text-blue-400" />
                    <span className="text-xs text-gray-300">Signal: </span>
                    <span className="text-xs ml-auto text-white">
                      {currentDevice.status === 'offline' ? 'None' : 'Strong'}
                    </span>
                  </div>
                  <div className="bg-gray-900/40 p-2 rounded flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-blue-400" />
                    <span className="text-xs text-gray-300">Anomalies: </span>
                    <span className="text-xs ml-auto text-white">
                      {currentDevice.anomalies.count}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
