/**
 * Layer Configuration Component
 * 
 * Configure blockchain consensus, ANN architecture, and hyperparameters
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BlockchainLayerType, 
  ANNLayerType, 
  ActivationFunction, 
  ConsensusType,
  OptimizationAlgorithm 
} from '@/types/blockchain-ann.types';
import { Network, Brain, Settings, Zap } from 'lucide-react';

interface LayerConfigurationProps {
  onSave: (config: ConfigurationData) => void;
  initialConfig?: ConfigurationData;
}

export interface ConfigurationData {
  blockchainConfig: {
    consensusType: ConsensusType;
    nodes: number;
    blockTime: number;
    networkTopology: 'mesh' | 'star' | 'ring';
  };
  annConfig: {
    layers: Array<{
      type: ANNLayerType;
      neurons: number;
      activation: ActivationFunction;
      dropout?: number;
    }>;
    optimizer: OptimizationAlgorithm;
    learningRate: number;
    batchSize: number;
  };
  quantumEnabled: boolean;
  distributedTraining: boolean;
}

export function LayerConfiguration({ onSave, initialConfig }: LayerConfigurationProps) {
  const [config, setConfig] = useState<ConfigurationData>(initialConfig || {
    blockchainConfig: {
      consensusType: 'proof-of-neural-work',
      nodes: 10,
      blockTime: 5,
      networkTopology: 'mesh'
    },
    annConfig: {
      layers: [
        { type: 'input', neurons: 784, activation: 'relu' },
        { type: 'hidden', neurons: 128, activation: 'relu', dropout: 0.2 },
        { type: 'hidden', neurons: 64, activation: 'relu', dropout: 0.2 },
        { type: 'output', neurons: 10, activation: 'softmax' }
      ],
      optimizer: 'adam',
      learningRate: 0.001,
      batchSize: 32
    },
    quantumEnabled: false,
    distributedTraining: true
  });

  const updateBlockchainConfig = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      blockchainConfig: { ...prev.blockchainConfig, [key]: value }
    }));
  };

  const updateANNConfig = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      annConfig: { ...prev.annConfig, [key]: value }
    }));
  };

  const updateLayer = (index: number, key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      annConfig: {
        ...prev.annConfig,
        layers: prev.annConfig.layers.map((layer, i) => 
          i === index ? { ...layer, [key]: value } : layer
        )
      }
    }));
  };

  const addLayer = () => {
    setConfig(prev => ({
      ...prev,
      annConfig: {
        ...prev.annConfig,
        layers: [
          ...prev.annConfig.layers.slice(0, -1),
          { type: 'hidden', neurons: 64, activation: 'relu', dropout: 0.2 },
          prev.annConfig.layers[prev.annConfig.layers.length - 1]
        ]
      }
    }));
  };

  const removeLayer = (index: number) => {
    if (config.annConfig.layers.length <= 2) return; // Keep at least input and output
    setConfig(prev => ({
      ...prev,
      annConfig: {
        ...prev.annConfig,
        layers: prev.annConfig.layers.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Architecture Configuration</h2>
          <p className="text-muted-foreground">Configure blockchain and neural network parameters</p>
        </div>
        <Button onClick={() => onSave(config)} size="lg">
          <Settings className="mr-2 h-4 w-4" />
          Save Configuration
        </Button>
      </div>

      <Tabs defaultValue="blockchain" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="blockchain">
            <Network className="mr-2 h-4 w-4" />
            Blockchain
          </TabsTrigger>
          <TabsTrigger value="ann">
            <Brain className="mr-2 h-4 w-4" />
            Neural Network
          </TabsTrigger>
          <TabsTrigger value="training">
            <Zap className="mr-2 h-4 w-4" />
            Training
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Settings className="mr-2 h-4 w-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* Blockchain Configuration */}
        <TabsContent value="blockchain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Layer Settings</CardTitle>
              <CardDescription>Configure consensus mechanism and network topology</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Consensus Mechanism</Label>
                  <Select 
                    value={config.blockchainConfig.consensusType}
                    onValueChange={(value) => updateBlockchainConfig('consensusType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proof-of-neural-work">Proof of Neural Work</SelectItem>
                      <SelectItem value="proof-of-stake">Proof of Stake</SelectItem>
                      <SelectItem value="proof-of-authority">Proof of Authority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Network Topology</Label>
                  <Select 
                    value={config.blockchainConfig.networkTopology}
                    onValueChange={(value) => updateBlockchainConfig('networkTopology', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mesh">Mesh Network</SelectItem>
                      <SelectItem value="star">Star Network</SelectItem>
                      <SelectItem value="ring">Ring Network</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Number of Nodes: {config.blockchainConfig.nodes}</Label>
                <Slider
                  value={[config.blockchainConfig.nodes]}
                  onValueChange={([value]) => updateBlockchainConfig('nodes', value)}
                  min={3}
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Block Time (seconds): {config.blockchainConfig.blockTime}</Label>
                <Slider
                  value={[config.blockchainConfig.blockTime]}
                  onValueChange={([value]) => updateBlockchainConfig('blockTime', value)}
                  min={1}
                  max={60}
                  step={1}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Neural Network Configuration */}
        <TabsContent value="ann" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Neural Network Architecture</CardTitle>
              <CardDescription>Define layer structure and activation functions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.annConfig.layers.map((layer, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant={layer.type === 'input' ? 'default' : layer.type === 'output' ? 'secondary' : 'outline'}>
                        {layer.type.toUpperCase()} LAYER {index + 1}
                      </Badge>
                      {layer.type === 'hidden' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeLayer(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Neurons</Label>
                        <Input
                          type="number"
                          value={layer.neurons}
                          onChange={(e) => updateLayer(index, 'neurons', parseInt(e.target.value))}
                          disabled={layer.type === 'input' || layer.type === 'output'}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Activation Function</Label>
                        <Select 
                          value={layer.activation}
                          onValueChange={(value) => updateLayer(index, 'activation', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="relu">ReLU</SelectItem>
                            <SelectItem value="sigmoid">Sigmoid</SelectItem>
                            <SelectItem value="tanh">Tanh</SelectItem>
                            <SelectItem value="softmax">Softmax</SelectItem>
                            <SelectItem value="leaky-relu">Leaky ReLU</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {layer.type === 'hidden' && (
                        <div className="space-y-2">
                          <Label>Dropout Rate: {layer.dropout?.toFixed(2)}</Label>
                          <Slider
                            value={[layer.dropout || 0]}
                            onValueChange={([value]) => updateLayer(index, 'dropout', value)}
                            min={0}
                            max={0.5}
                            step={0.05}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button onClick={addLayer} variant="outline" className="w-full">
                Add Hidden Layer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Configuration */}
        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Parameters</CardTitle>
              <CardDescription>Optimize learning rate and batch size</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Optimizer</Label>
                  <Select 
                    value={config.annConfig.optimizer}
                    onValueChange={(value) => updateANNConfig('optimizer', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adam">Adam</SelectItem>
                      <SelectItem value="sgd">SGD</SelectItem>
                      <SelectItem value="rmsprop">RMSProp</SelectItem>
                      <SelectItem value="adagrad">AdaGrad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Batch Size</Label>
                  <Select 
                    value={config.annConfig.batchSize.toString()}
                    onValueChange={(value) => updateANNConfig('batchSize', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16">16</SelectItem>
                      <SelectItem value="32">32</SelectItem>
                      <SelectItem value="64">64</SelectItem>
                      <SelectItem value="128">128</SelectItem>
                      <SelectItem value="256">256</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Learning Rate: {config.annConfig.learningRate}</Label>
                <Slider
                  value={[Math.log10(config.annConfig.learningRate) + 6]}
                  onValueChange={([value]) => updateANNConfig('learningRate', Math.pow(10, value - 6))}
                  min={0}
                  max={3}
                  step={0.1}
                />
                <p className="text-xs text-muted-foreground">
                  Range: 0.000001 to 0.1
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Features</CardTitle>
              <CardDescription>Enable experimental capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Quantum Enhancement</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable quantum-accelerated neural network training
                  </p>
                </div>
                <Switch
                  checked={config.quantumEnabled}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, quantumEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Distributed Training</Label>
                  <p className="text-sm text-muted-foreground">
                    Train model across multiple blockchain nodes
                  </p>
                </div>
                <Switch
                  checked={config.distributedTraining}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, distributedTraining: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
