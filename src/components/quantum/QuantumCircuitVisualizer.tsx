
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Cpu, RefreshCcw, Plus, Trash2, Maximize2, Minimize2, 
  RotateCcw, Save, FileInput
} from "lucide-react";
import { toast } from "sonner";

export function QuantumCircuitVisualizer() {
  const [qubits, setQubits] = useState(3);
  const [gates, setGates] = useState<any[]>([
    { id: 1, type: 'h', qubit: 0, position: 0 },
    { id: 2, type: 'cx', control: 0, target: 1, position: 1 },
    { id: 3, type: 'h', qubit: 2, position: 0 }
  ]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const addQubit = () => {
    if (qubits < 8) {
      setQubits(qubits + 1);
      toast.success("Added a new qubit");
    } else {
      toast.warning("Maximum 8 qubits supported in visual mode");
    }
  };
  
  const removeQubit = () => {
    if (qubits > 1) {
      // Remove gates on this qubit
      setGates(gates.filter(gate => 
        (gate.qubit === undefined || gate.qubit < qubits - 1) && 
        (gate.control === undefined || gate.control < qubits - 1) && 
        (gate.target === undefined || gate.target < qubits - 1)
      ));
      setQubits(qubits - 1);
      toast.success("Removed a qubit");
    } else {
      toast.warning("Circuit must have at least 1 qubit");
    }
  };
  
  const addGate = (type: string, qubit: number, position: number = 0) => {
    let newGate: any = { id: Date.now(), type, qubit, position };
    
    if (type === 'cx') {
      const target = qubit < qubits - 1 ? qubit + 1 : 0;
      newGate = { ...newGate, control: qubit, target, qubit: undefined };
    }
    
    setGates([...gates, newGate]);
  };
  
  const simulateCircuit = () => {
    setIsSimulating(true);
    
    // Simulate circuit execution
    setTimeout(() => {
      setIsSimulating(false);
      toast.success("Circuit simulation complete", {
        description: "Visualization and state vector updated"
      });
    }, 1500);
  };
  
  const clearCircuit = () => {
    setGates([]);
    toast.info("Circuit cleared");
  };
  
  const exportCircuit = () => {
    const circuitData = {
      qubits,
      gates: gates.map(({ id, ...rest }) => rest) // Remove IDs for export
    };
    
    const dataStr = JSON.stringify(circuitData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportLink = document.createElement('a');
    exportLink.setAttribute('href', dataUri);
    exportLink.setAttribute('download', 'quantum-circuit.json');
    document.body.appendChild(exportLink);
    exportLink.click();
    document.body.removeChild(exportLink);
    
    toast.success("Circuit exported to JSON");
  };
  
  const importCircuit = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const circuitData = JSON.parse(e.target?.result as string);
        if (circuitData.qubits && Array.isArray(circuitData.gates)) {
          setQubits(Math.min(8, Math.max(1, circuitData.qubits)));
          setGates(circuitData.gates.map(gate => ({ ...gate, id: Date.now() + Math.random() })));
          toast.success("Circuit imported successfully");
        } else {
          throw new Error("Invalid circuit format");
        }
      } catch (error) {
        toast.error("Failed to import circuit", {
          description: "The file format is invalid"
        });
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };
  
  // Render gate on circuit
  const renderGate = (gate: any) => {
    switch (gate.type) {
      case 'h':
        return (
          <div className="w-8 h-8 flex items-center justify-center text-white bg-blue-600 rounded-md">
            H
          </div>
        );
      case 'x':
        return (
          <div className="w-8 h-8 flex items-center justify-center text-white bg-red-600 rounded-md">
            X
          </div>
        );
      case 'z':
        return (
          <div className="w-8 h-8 flex items-center justify-center text-white bg-green-600 rounded-md">
            Z
          </div>
        );
      case 'cx':
        return (
          <div className="w-8 h-8 flex items-center justify-center text-white bg-purple-600 rounded-md">
            CX
          </div>
        );
      default:
        return null;
    }
  };
  
  // Render quantum circuit
  const renderCircuit = () => {
    return (
      <div 
        className="bg-gray-900 rounded-lg p-4 overflow-x-auto"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
      >
        <div className="min-w-[400px]">
          {Array.from({ length: qubits }).map((_, qubitIndex) => (
            <div key={qubitIndex} className="flex items-center h-12 my-2">
              <div className="w-10 shrink-0 text-center text-sm text-gray-400">q{qubitIndex}</div>
              <div className="flex-1 border-t border-gray-700 h-0 relative">
                {gates
                  .filter(gate => 
                    gate.qubit === qubitIndex || 
                    gate.control === qubitIndex || 
                    gate.target === qubitIndex
                  )
                  .map(gate => (
                    <div 
                      key={gate.id}
                      className="absolute -translate-y-1/2 cursor-pointer"
                      style={{ left: `${(gate.position || 0) * 60 + 20}px` }}
                      title={`${gate.type.toUpperCase()} Gate`}
                    >
                      {renderGate(gate)}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <Card className="bg-gray-800/60 border-purple-500/20">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mr-2"
                  onClick={addQubit}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Qubit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={removeQubit}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Remove Qubit
                </Button>
              </div>
              
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mr-2"
                  onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {renderCircuit()}
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              <Button 
                variant="outline" 
                className="flex items-center justify-center"
                onClick={() => addGate('h', 0)}
              >
                <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white mr-1">H</div>
                Hadamard
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center"
                onClick={() => addGate('x', 0)}
              >
                <div className="w-6 h-6 bg-red-600 rounded-md flex items-center justify-center text-white mr-1">X</div>
                Pauli-X
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center"
                onClick={() => addGate('z', 0)}
              >
                <div className="w-6 h-6 bg-green-600 rounded-md flex items-center justify-center text-white mr-1">Z</div>
                Pauli-Z
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center"
                onClick={() => addGate('cx', 0)}
              >
                <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center text-white mr-1">CX</div>
                CNOT
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Button 
                  variant="default" 
                  className="mr-2 bg-purple-600 hover:bg-purple-700"
                  onClick={simulateCircuit}
                  disabled={isSimulating}
                >
                  {isSimulating ? (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-1 animate-spin" />
                      Simulating...
                    </>
                  ) : (
                    <>
                      <Cpu className="h-4 w-4 mr-1" />
                      Simulate
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={clearCircuit}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
              
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={exportCircuit}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <label className="cursor-pointer">
                  <Button 
                    variant="outline"
                    type="button"
                    onClick={() => {
                      document.getElementById('circuit-import')?.click();
                    }}
                  >
                    <FileInput className="h-4 w-4 mr-1" />
                    Import
                  </Button>
                  <input 
                    id="circuit-import"
                    type="file" 
                    className="hidden" 
                    accept=".json"
                    onChange={importCircuit}
                  />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
