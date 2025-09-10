
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectMarinerWorkflow } from "@/components/workflows/ProjectMarinerWorkflow";
import { MarinerDataVisualization } from "@/components/workflows/MarinerDataVisualization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ship, Database, ChartBar, FileText, Anchor, Activity } from "lucide-react";

export default function ProjectMariner() {
  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Ship className="h-6 w-6 text-blue-400" />
            <span className="bg-gradient-to-r from-blue-400 to-teal-500 bg-clip-text text-transparent">
              Project Mariner: Deep Ocean Exploration
            </span>
          </h1>
        </div>
        
        <Tabs defaultValue="workflow" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl mx-auto">
            <TabsTrigger value="workflow">
              <Anchor className="w-4 h-4 mr-2" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="realtime">
              <Activity className="w-4 h-4 mr-2" />
              Real-time Data
            </TabsTrigger>
            <TabsTrigger value="data">
              <Database className="w-4 h-4 mr-2" />
              Data Collection
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <ChartBar className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="workflow" className="space-y-6">
            <ProjectMarinerWorkflow />
            
            <Card className="bg-black/40 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Ship className="h-5 w-5 text-blue-400" />
                  Project Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-gray-300">
                  <p>
                    Project Mariner is a cutting-edge deep ocean exploration initiative leveraging quantum computing, 
                    advanced AI systems, and blockchain technology to map and analyze the ocean's most remote regions.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <h3 className="text-blue-400 font-medium mb-2">Ocean Mapping</h3>
                      <p className="text-sm text-gray-400">High-resolution 3D mapping of deep ocean trenches and underwater geographic features.</p>
                    </div>
                    
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <h3 className="text-blue-400 font-medium mb-2">Marine Biology</h3>
                      <p className="text-sm text-gray-400">Genomic analysis and identification of previously undiscovered marine species.</p>
                    </div>
                    
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <h3 className="text-blue-400 font-medium mb-2">Climate Research</h3>
                      <p className="text-sm text-gray-400">Studying deep ocean currents and their impact on global climate patterns.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6">
            <Card className="bg-black/40 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-400" />
                  Real-time Ocean Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MarinerDataVisualization />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="data">
            <Card className="bg-black/40 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-400" />
                  Data Collection Systems
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 text-gray-400">
                  <p>Advanced data collection module will be implemented in the next phase.</p>
                  <p className="text-sm mt-2">Real-time data streaming is already active in the Real-time Data tab.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card className="bg-black/40 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <ChartBar className="h-5 w-5 text-blue-400" />
                  Analytics Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 text-gray-400">
                  <p>Comprehensive analytics dashboard will be implemented in the next phase.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports">
            <Card className="bg-black/40 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  Mission Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 text-gray-400">
                  <p>Automated mission reports will be implemented in the next phase.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
