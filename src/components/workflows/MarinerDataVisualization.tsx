
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Waves, Fish, Navigation, Battery, Signal, Thermometer } from 'lucide-react';
import { projectMarinerRealtimeService, MarinerDataPoint } from '@/services/realtime/ProjectMarinerRealtimeService';

export function MarinerDataVisualization() {
  const [latestData, setLatestData] = useState<MarinerDataPoint | null>(null);
  const [dataHistory, setDataHistory] = useState<MarinerDataPoint[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Set initial connection status
    setIsConnected(projectMarinerRealtimeService.isConnectedToMariner());
    
    // Get initial data
    const initialData = projectMarinerRealtimeService.getLatestData(10);
    setDataHistory(initialData);
    if (initialData.length > 0) {
      setLatestData(initialData[initialData.length - 1]);
    }

    // Listen for real-time updates
    const handleDataReceived = (data: MarinerDataPoint) => {
      setLatestData(data);
      setDataHistory(prev => [...prev.slice(-9), data]); // Keep last 10 points
    };

    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    projectMarinerRealtimeService.on('dataReceived', handleDataReceived);
    projectMarinerRealtimeService.on('connected', handleConnected);
    projectMarinerRealtimeService.on('disconnected', handleDisconnected);

    return () => {
      projectMarinerRealtimeService.off('dataReceived', handleDataReceived);
      projectMarinerRealtimeService.off('connected', handleConnected);
      projectMarinerRealtimeService.off('disconnected', handleDisconnected);
    };
  }, []);

  if (!latestData) {
    return (
      <Card className="bg-black/40 border-blue-500/20">
        <CardContent className="p-6 text-center">
          <div className="text-gray-400">Loading ocean data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Connection Status */}
      <Card className="bg-black/40 border-blue-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Signal className="h-4 w-4" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          <div className="text-xs text-gray-400 mt-2">
            Communication: {latestData.navigation.communicationStrength.toFixed(1)}%
          </div>
        </CardContent>
      </Card>

      {/* Location Data */}
      <Card className="bg-black/40 border-blue-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Current Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            <div>Lat: {latestData.location.latitude.toFixed(4)}°</div>
            <div>Lng: {latestData.location.longitude.toFixed(4)}°</div>
            <div className="text-blue-400">Depth: {latestData.location.depth.toFixed(0)}m</div>
          </div>
        </CardContent>
      </Card>

      {/* Ocean Conditions */}
      <Card className="bg-black/40 border-blue-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Waves className="h-4 w-4" />
            Ocean Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-1">
              <Thermometer className="h-3 w-3" />
              {latestData.oceanData.temperature.toFixed(1)}°C
            </div>
            <div>Salinity: {latestData.oceanData.salinity.toFixed(1)}‰</div>
            <div>Pressure: {latestData.oceanData.pressure.toFixed(0)} bar</div>
          </div>
        </CardContent>
      </Card>

      {/* Marine Life */}
      <Card className="bg-black/40 border-blue-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Fish className="h-4 w-4" />
            Marine Life Detected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {latestData.marineLife.speciesDetected.slice(0, 2).map((species, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {species}
              </Badge>
            ))}
            <div className="text-xs text-gray-400">
              Diversity: {latestData.marineLife.diversityScore.toFixed(1)}/10
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Status */}
      <Card className="bg-black/40 border-blue-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Battery className="h-4 w-4" />
            Vehicle Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            <div>Speed: {latestData.navigation.speed.toFixed(1)} knots</div>
            <div>Heading: {latestData.navigation.heading.toFixed(0)}°</div>
            <div className="flex items-center gap-1">
              <Battery className="h-3 w-3" />
              {latestData.navigation.batteryLevel.toFixed(0)}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ocean Current */}
      <Card className="bg-black/40 border-blue-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Waves className="h-4 w-4" />
            Ocean Current
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            <div>Speed: {latestData.oceanData.currentSpeed.toFixed(2)} m/s</div>
            <div>Direction: {latestData.oceanData.currentDirection.toFixed(0)}°</div>
            <div className="text-xs text-gray-400">
              Updated: {new Date(latestData.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
