
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/hooks/use-wallet';
import { Search, Lock, Shield, Dna, Clock, Zap, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { requestGenomicDataAccess } from '@/lib/quantum/workflow/utils/genomicBlockchain';

interface GenomicDataset {
  id: string;
  name: string;
  description: string;
  owner: string;
  ownerName: string;
  size: number;
  price: number;
  encryptionType: 'standard' | 'quantum' | 'hybrid';
  isPublic: boolean;
  sequenceType: 'genomic' | 'proteomic' | 'metagenome';
  createdAt: number;
  accessCount: number;
}

export function GenomicDataMarketplace() {
  const { walletAddress, isConnected } = useWallet();
  const [datasets, setDatasets] = useState<GenomicDataset[]>([]);
  const [filteredDatasets, setFilteredDatasets] = useState<GenomicDataset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  useEffect(() => {
    loadDatasets();
  }, []);
  
  useEffect(() => {
    filterDatasets();
  }, [searchTerm, datasets]);

  const loadDatasets = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch datasets from a backend API
      // For demo purposes, we'll generate mock datasets
      const mockDatasets = generateMockDatasets();
      setDatasets(mockDatasets);
      setFilteredDatasets(mockDatasets);
    } catch (error) {
      console.error('Error loading genomic datasets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterDatasets = () => {
    if (!searchTerm.trim()) {
      setFilteredDatasets(datasets);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = datasets.filter(
      dataset =>
        dataset.name.toLowerCase().includes(term) ||
        dataset.description.toLowerCase().includes(term) ||
        dataset.ownerName.toLowerCase().includes(term) ||
        dataset.sequenceType.toLowerCase().includes(term)
    );
    
    setFilteredDatasets(filtered);
  };

  const handleRequestAccess = async (dataset: GenomicDataset) => {
    if (!isConnected || !walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    setProcessingIds(prev => [...prev, dataset.id]);
    
    try {
      // Request access to the dataset
      const request = await requestGenomicDataAccess(dataset.id, walletAddress);
      
      toast.success('Access request submitted successfully');
      
      // In a real implementation, we would handle the payment workflow here
      // For demo purposes, we just show a success message
    } catch (error) {
      console.error('Error requesting access:', error);
      toast.error('Failed to request access');
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== dataset.id));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(2)} MB`;
    return `${(bytes / 1073741824).toFixed(2)} GB`;
  };

  // Generate mock datasets for demo purposes
  const generateMockDatasets = (): GenomicDataset[] => {
    const owners = [
      { address: '0x8f2b5e012a9a1a9e305a842091b909c23c053a7f', name: 'GenomeResearch Institute' },
      { address: '0x3f4d6b80291ca87d5493242c9c73282c70723345', name: 'BioData Foundation' },
      { address: '0x9d6c73bceab6528fb6ccb3ff20ab35dbef1a3b94', name: 'QuantumGenomics Lab' },
      { address: '0x2a7bc7b107bb463638eaff7151f97db8a592da4e', name: 'MedTech Innovations' },
    ];
    
    const types = ['genomic', 'proteomic', 'metagenome'] as const;
    const encTypes = ['standard', 'quantum', 'hybrid'] as const;
    
    // Generate 8-12 datasets
    const count = Math.floor(Math.random() * 5) + 8;
    const mockData: GenomicDataset[] = [];
    
    for (let i = 0; i < count; i++) {
      const owner = owners[Math.floor(Math.random() * owners.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const encType = encTypes[Math.floor(Math.random() * encTypes.length)];
      const isPublic = Math.random() > 0.7;
      
      mockData.push({
        id: `dataset_${i + 1}_${Date.now().toString(36)}`,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Dataset ${i + 1}`,
        description: `High-quality ${type} data for research purposes with comprehensive annotations.`,
        owner: owner.address,
        ownerName: owner.name,
        size: Math.floor(Math.random() * 5000000000) + 50000000,
        price: Math.floor(Math.random() * 150) + 50,
        encryptionType: encType,
        isPublic,
        sequenceType: type,
        createdAt: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
        accessCount: Math.floor(Math.random() * 50)
      });
    }
    
    return mockData;
  };

  return (
    <Card className="bg-black/60 border-purple-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <Dna className="h-5 w-5 text-purple-400" />
          Genomic Data Marketplace
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mb-6">
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search by name, owner, or type..."
            className="pl-10 bg-gray-900/70 border-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-t-purple-500 border-purple-300/30 rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-400 mt-3">Loading genomic datasets...</p>
          </div>
        ) : filteredDatasets.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/50 rounded-lg">
            <AlertCircle className="h-16 w-16 text-purple-400/30 mx-auto mb-3" />
            <p className="text-lg font-medium text-white">No datasets found</p>
            <p className="text-gray-400 mt-1">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDatasets.map((dataset) => (
              <div key={dataset.id} className="bg-gray-900/50 rounded-lg p-4 hover:bg-gray-900/70 transition-colors">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      {dataset.name}
                      {dataset.encryptionType === 'quantum' && (
                        <Badge className="bg-purple-600">Quantum Secured</Badge>
                      )}
                      {dataset.encryptionType === 'hybrid' && (
                        <Badge className="bg-blue-600">Hybrid Security</Badge>
                      )}
                      {dataset.isPublic ? (
                        <Badge variant="outline" className="text-green-300 border-green-600">Public</Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-300 border-amber-600">Private</Badge>
                      )}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">{dataset.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-white">{dataset.price} <span className="text-sm text-purple-400">KTC</span></div>
                    <div className="text-xs text-gray-400 mt-1">
                      {dataset.accessCount} accesses
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mt-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    <span>{dataset.ownerName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    <span>{dataset.sequenceType.charAt(0).toUpperCase() + dataset.sequenceType.slice(1)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    <span>{formatFileSize(dataset.size)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{new Date(dataset.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-800 flex justify-end">
                  <Button 
                    onClick={() => handleRequestAccess(dataset)}
                    disabled={processingIds.includes(dataset.id) || !isConnected}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {processingIds.includes(dataset.id) ? (
                      <>
                        <div className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Request Access
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
