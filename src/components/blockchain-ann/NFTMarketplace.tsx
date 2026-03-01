import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Image, ShoppingCart, Plus, TrendingUp, Heart, ExternalLink } from 'lucide-react';

interface NFT {
  id: string;
  name: string;
  collection: string;
  image: string;
  price: number;
  currency: string;
  owner: string;
  creator: string;
  listed: boolean;
  likes: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  attributes: { trait: string; value: string }[];
}

const MOCK_NFTS: NFT[] = [
  { id: 'nft-1', name: 'Quantum Shield #001', collection: 'Quantum Defenders', image: '🛡️', price: 2.5, currency: 'ETH', owner: '0xAb...3f', creator: '0xDe...9a', listed: true, likes: 142, rarity: 'legendary', attributes: [{ trait: 'Defense Level', value: '99' }, { trait: 'Quantum Fidelity', value: '0.998' }] },
  { id: 'nft-2', name: 'Neural Node #042', collection: 'ANN Genesis', image: '🧠', price: 0.8, currency: 'ETH', owner: '0xBc...7e', creator: '0xFa...1b', listed: true, likes: 89, rarity: 'epic', attributes: [{ trait: 'Neurons', value: '1024' }, { trait: 'Accuracy', value: '97.3%' }] },
  { id: 'nft-3', name: 'Block Cipher #108', collection: 'Crypto Arts', image: '🔐', price: 1.2, currency: 'ETH', owner: '0xCd...2f', creator: '0xAb...3f', listed: true, likes: 67, rarity: 'rare', attributes: [{ trait: 'Algorithm', value: 'PQC-Lattice' }, { trait: 'Key Size', value: '4096' }] },
  { id: 'nft-4', name: 'Qubit State #777', collection: 'Quantum Defenders', image: '⚛️', price: 5.0, currency: 'ETH', owner: '0xEf...8c', creator: '0xDe...9a', listed: true, likes: 234, rarity: 'legendary', attributes: [{ trait: 'Superposition', value: 'Active' }, { trait: 'Entanglement', value: '128 pairs' }] },
  { id: 'nft-5', name: 'Firewall Art #023', collection: 'Cyber Canvas', image: '🔥', price: 0.3, currency: 'ETH', owner: '0xFa...1b', creator: '0xBc...7e', listed: true, likes: 45, rarity: 'uncommon', attributes: [{ trait: 'Layers', value: '20' }, { trait: 'Style', value: 'Abstract' }] },
  { id: 'nft-6', name: 'DAO Vote Badge', collection: 'Governance', image: '🗳️', price: 0.1, currency: 'ETH', owner: '0xAb...3f', creator: '0xAb...3f', listed: false, likes: 312, rarity: 'common', attributes: [{ trait: 'Voting Power', value: '1x' }, { trait: 'Tier', value: 'Member' }] },
];

const rarityColor: Record<string, string> = {
  common: 'text-muted-foreground',
  uncommon: 'text-green-500',
  rare: 'text-blue-500',
  epic: 'text-purple-500',
  legendary: 'text-yellow-500',
};

export function NFTMarketplace() {
  const { toast } = useToast();
  const [nfts] = useState<NFT[]>(MOCK_NFTS);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = nfts.filter(n => {
    if (filter !== 'all' && n.rarity !== filter) return false;
    if (searchQuery && !n.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleBuy = (nft: NFT) => {
    toast({ title: 'Purchase Initiated', description: `Buying ${nft.name} for ${nft.price} ${nft.currency}` });
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-pink-600/5 to-violet-600/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-6 w-6 text-pink-500" />
                NFT Marketplace
              </CardTitle>
              <CardDescription>Mint, trade, and collect quantum-secured NFTs</CardDescription>
            </div>
            <Button><Plus className="h-4 w-4 mr-2" />Mint NFT</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-primary">{nfts.length}</div>
              <div className="text-xs text-muted-foreground">Total NFTs</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-green-500">{nfts.filter(n => n.listed).length}</div>
              <div className="text-xs text-muted-foreground">Listed</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-yellow-500">{nfts.reduce((s, n) => s + n.price, 0).toFixed(1)} ETH</div>
              <div className="text-xs text-muted-foreground">Total Volume</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-purple-500">{new Set(nfts.map(n => n.collection)).size}</div>
              <div className="text-xs text-muted-foreground">Collections</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Input placeholder="Search NFTs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="max-w-xs" />
        <div className="flex gap-1">
          {['all', 'legendary', 'epic', 'rare', 'uncommon', 'common'].map(r => (
            <Button key={r} variant={filter === r ? 'default' : 'outline'} size="sm" className="text-xs" onClick={() => setFilter(r)}>
              {r}
            </Button>
          ))}
        </div>
      </div>

      {/* NFT Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(nft => (
          <Card key={nft.id} className="overflow-hidden hover:border-primary/50 transition-all">
            <div className="h-32 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-5xl">
              {nft.image}
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">{nft.name}</h3>
                <Badge variant="outline" className={`text-[10px] ${rarityColor[nft.rarity]}`}>{nft.rarity}</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground mb-3">{nft.collection}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {nft.attributes.map((a, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{a.trait}: {a.value}</span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="font-bold text-sm">{nft.price} {nft.currency}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Heart className="h-3 w-3" />{nft.likes}
                  </span>
                  {nft.listed && (
                    <Button size="sm" className="h-7 text-xs" onClick={() => handleBuy(nft)}>
                      <ShoppingCart className="h-3 w-3 mr-1" />Buy
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
