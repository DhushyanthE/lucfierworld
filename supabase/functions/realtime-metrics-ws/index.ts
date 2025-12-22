import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let metricsInterval: number | null = null;

  socket.onopen = () => {
    console.log("WebSocket client connected for realtime metrics");
    
    // Send initial metrics immediately
    sendMetrics(socket);
    
    // Start sending metrics every 2 seconds
    metricsInterval = setInterval(() => {
      sendMetrics(socket);
    }, 2000);
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log("Received message:", message);
      
      if (message.type === 'subscribe') {
        // Handle subscription to specific metric types
        socket.send(JSON.stringify({
          type: 'subscribed',
          channel: message.channel,
          timestamp: new Date().toISOString()
        }));
      } else if (message.type === 'refresh') {
        // Manual refresh request
        sendMetrics(socket);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  };

  socket.onclose = () => {
    console.log("WebSocket client disconnected");
    if (metricsInterval) {
      clearInterval(metricsInterval);
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    if (metricsInterval) {
      clearInterval(metricsInterval);
    }
  };

  return response;
});

function sendMetrics(socket: WebSocket) {
  if (socket.readyState !== WebSocket.OPEN) return;

  const metrics = generateRealtimeMetrics();
  
  socket.send(JSON.stringify({
    type: 'metrics_update',
    data: metrics,
    timestamp: new Date().toISOString()
  }));
}

function generateRealtimeMetrics() {
  const baseTime = Date.now();
  
  return {
    quantum: {
      coherence: 0.85 + Math.random() * 0.1,
      entanglementFidelity: 0.92 + Math.random() * 0.06,
      gateErrorRate: 0.001 + Math.random() * 0.002,
      qubitCount: 128,
      circuitDepth: 50 + Math.floor(Math.random() * 20),
      measurementFidelity: 0.95 + Math.random() * 0.04
    },
    agi: {
      confidence: 0.88 + Math.random() * 0.08,
      processingPower: 5 + Math.random() * 3,
      optimizationScore: 0.82 + Math.random() * 0.12,
      activeModels: 3 + Math.floor(Math.random() * 2),
      inferenceLatency: 15 + Math.random() * 10
    },
    agentic: {
      activeAgents: 5 + Math.floor(Math.random() * 3),
      totalReward: 150 + Math.random() * 50,
      agentEfficiency: 0.78 + Math.random() * 0.15,
      annLayerCount: 12,
      qLearningProgress: 0.7 + Math.random() * 0.2
    },
    blockchain: {
      blockHeight: 1000000 + Math.floor(baseTime / 10000),
      transactionsPerSecond: 1000 + Math.random() * 500,
      consensusScore: 0.95 + Math.random() * 0.04,
      nodeCount: 50 + Math.floor(Math.random() * 10),
      gasPrice: 20 + Math.random() * 10
    },
    neural: {
      rnnAccuracy: 0.91 + Math.random() * 0.05,
      cnnAccuracy: 0.93 + Math.random() * 0.04,
      trainingLoss: 0.05 + Math.random() * 0.03,
      validationLoss: 0.06 + Math.random() * 0.04,
      throughput: 10000 + Math.random() * 2000
    },
    security: {
      activePatterns: 18 + Math.floor(Math.random() * 3),
      securityScore: 0.92 + Math.random() * 0.06,
      threatLevel: Math.random() < 0.1 ? 'elevated' : 'low',
      lastScanTime: new Date().toISOString()
    },
    anomaly: {
      detected: Math.floor(Math.random() * 3),
      riskScore: 0.1 + Math.random() * 0.2,
      alertsActive: Math.floor(Math.random() * 2)
    },
    system: {
      cpuUsage: 40 + Math.random() * 30,
      memoryUsage: 50 + Math.random() * 25,
      networkLatency: 5 + Math.random() * 10,
      uptime: 99.9 + Math.random() * 0.09
    }
  };
}
