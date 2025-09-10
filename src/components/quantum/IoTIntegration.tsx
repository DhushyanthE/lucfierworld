import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Cpu, Wifi, Cloud, Settings, 
  PlusCircle, RefreshCw, AlertCircle
} from "lucide-react";
import { BarometricIcon } from "@/components/icons/BarometricIcon";

export function IoTIntegration() {
  
  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-purple-400" />
          <span>Quantum IoT Integration</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/60 p-4 rounded-lg border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-green-400" />
                <span className="font-medium text-white">Connected Devices</span>
              </div>
              <div className="text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full">
                Online
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Cpu className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-gray-300">Quantum Sensor #1</span>
                </div>
                <span className="text-green-400">Active</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <BarometricIcon className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-gray-300">Pressure Sensor</span>
                </div>
                <span className="text-green-400">Active</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Settings className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-gray-300">Edge Processor</span>
                </div>
                <span className="text-yellow-400">Syncing</span>
              </div>
            </div>
            
            <div className="mt-4">
              <Button size="sm" variant="outline" className="text-xs border-purple-500/30 text-purple-400 w-full">
                <PlusCircle className="h-3 w-3 mr-1" /> Add Device
              </Button>
            </div>
          </div>
          
          <div className="bg-gray-800/60 p-4 rounded-lg border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-blue-400" />
                <span className="font-medium text-white">Cloud Connectivity</span>
              </div>
              <div className="text-xs bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded-full">
                Stable
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Data Upload Rate</span>
                <span className="text-white">12 Mbps</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Data Download Rate</span>
                <span className="text-white">8 Mbps</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Latency</span>
                <span className="text-white">25 ms</span>
              </div>
            </div>
            
            <div className="mt-4">
              <Button size="sm" variant="outline" className="text-xs border-purple-500/30 text-purple-400 w-full">
                <RefreshCw className="h-3 w-3 mr-1" /> Refresh Stats
              </Button>
            </div>
          </div>
          
          <div className="bg-gray-800/60 p-4 rounded-lg border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-yellow-400" />
                <span className="font-medium text-white">System Status</span>
              </div>
              <div className="text-xs bg-yellow-900/40 text-yellow-400 px-2 py-0.5 rounded-full">
                Warning
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">CPU Usage</span>
                <span className="text-white">75%</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Memory Usage</span>
                <span className="text-white">80%</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Disk Usage</span>
                <span className="text-white">90%</span>
              </div>
            </div>
            
            <div className="mt-4">
              <Button size="sm" variant="outline" className="text-xs border-red-500/30 text-red-400 w-full">
                <AlertCircle className="h-3 w-3 mr-1" /> View Logs
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
