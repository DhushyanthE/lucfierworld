/**
 * Transaction History Panel
 * Real-time quantum transfer history with blockchain anchoring
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  History, RefreshCw, Search, 
  CheckCircle, XCircle, Clock, Loader2, Shield,
  ArrowRight, Copy, Calendar, X, Download, FileJson, FileSpreadsheet,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { useQuantumTransferHistory, QuantumTransfer } from '@/hooks/useQuantumTransferHistory';
import { toast } from 'sonner';
import { format, isAfter, isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';

const STATUS_CONFIG = {
  pending: { color: 'bg-yellow-500', label: 'Pending', icon: Clock },
  in_progress: { color: 'bg-blue-500', label: 'In Progress', icon: Loader2 },
  completed: { color: 'bg-green-500', label: 'Completed', icon: CheckCircle },
  failed: { color: 'bg-red-500', label: 'Failed', icon: XCircle }
};

function TransferCard({ transfer }: { transfer: QuantumTransfer }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = STATUS_CONFIG[transfer.transfer_status];
  const StatusIcon = status.icon;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const progress = (transfer.layers_passed / transfer.total_layers) * 100;

  return (
    <Card 
      className={`transition-all cursor-pointer hover:border-primary/50 ${
        isExpanded ? 'border-primary/30' : ''
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardContent className="pt-4">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full ${status.color}`}>
              <StatusIcon className={`h-3 w-3 text-white ${transfer.transfer_status === 'in_progress' ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <p className="text-sm font-medium">{transfer.session_id.slice(0, 20)}...</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(transfer.created_at), 'MMM d, yyyy HH:mm:ss')}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="capitalize">{status.label}</Badge>
        </div>

        {/* Transfer Summary */}
        <div className="flex items-center gap-2 text-xs mb-3">
          <span className="font-mono truncate max-w-[100px]" title={transfer.sender_address}>
            {transfer.sender_address.slice(0, 8)}...
          </span>
          <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="font-mono truncate max-w-[100px]" title={transfer.receiver_address}>
            {transfer.receiver_address.slice(0, 8)}...
          </span>
          <span className="ml-auto font-bold">{Number(transfer.amount).toLocaleString()} QU</span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Security Layers</span>
            <span>{transfer.layers_passed}/{transfer.total_layers}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                transfer.transfer_status === 'completed' ? 'bg-green-500' :
                transfer.transfer_status === 'failed' ? 'bg-red-500' :
                'bg-primary'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-3" onClick={e => e.stopPropagation()}>
            {/* Blockchain Hash */}
            {transfer.blockchain_hash && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Blockchain Hash</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted p-2 rounded flex-1 truncate">
                    {transfer.blockchain_hash}
                  </code>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(transfer.blockchain_hash!, 'Hash')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded bg-muted">
                <p className="text-lg font-bold">{transfer.security_score?.toFixed(1) || '—'}%</p>
                <p className="text-xs text-muted-foreground">Security</p>
              </div>
              <div className="p-2 rounded bg-muted">
                <p className="text-lg font-bold">{transfer.quantum_fidelity ? (Number(transfer.quantum_fidelity) * 100).toFixed(2) : '—'}%</p>
                <p className="text-xs text-muted-foreground">Fidelity</p>
              </div>
              <div className="p-2 rounded bg-muted">
                <p className="text-lg font-bold">{transfer.entanglement_pairs || '—'}</p>
                <p className="text-xs text-muted-foreground">EPR Pairs</p>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <p className="text-muted-foreground">Sender</p>
                <div className="flex items-center gap-1">
                  <code className="bg-muted p-1 rounded truncate flex-1">{transfer.sender_address}</code>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(transfer.sender_address, 'Sender')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Receiver</p>
                <div className="flex items-center gap-1">
                  <code className="bg-muted p-1 rounded truncate flex-1">{transfer.receiver_address}</code>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(transfer.receiver_address, 'Receiver')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Started: {format(new Date(transfer.started_at), 'HH:mm:ss')}</span>
              {transfer.completed_at && (
                <span>Completed: {format(new Date(transfer.completed_at), 'HH:mm:ss')}</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export function TransactionHistoryPanel() {
  const { transfers, isLoading, error, fetchTransfers, createTransfer } = useQuantumTransferHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setAmountMin('');
    setAmountMax('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || dateFrom || dateTo || amountMin || amountMax;

  const filteredTransfers = transfers.filter(t => {
    // Text search
    const matchesSearch = searchQuery === '' || 
      t.session_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sender_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.receiver_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.blockchain_hash && t.blockchain_hash.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || t.transfer_status === statusFilter;
    
    // Date range filter
    const transferDate = parseISO(t.created_at);
    const matchesDateFrom = !dateFrom || isAfter(transferDate, startOfDay(parseISO(dateFrom)));
    const matchesDateTo = !dateTo || isBefore(transferDate, endOfDay(parseISO(dateTo)));
    
    // Amount range filter
    const amount = Number(t.amount);
    const matchesAmountMin = !amountMin || amount >= parseFloat(amountMin);
    const matchesAmountMax = !amountMax || amount <= parseFloat(amountMax);
    
    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo && matchesAmountMin && matchesAmountMax;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransfers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransfers = filteredTransfers.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (val: string) => void) => (value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const stats = {
    total: transfers.length,
    completed: transfers.filter(t => t.transfer_status === 'completed').length,
    pending: transfers.filter(t => t.transfer_status === 'pending' || t.transfer_status === 'in_progress').length,
    failed: transfers.filter(t => t.transfer_status === 'failed').length
  };

  const handleCreateTestTransfer = async () => {
    await createTransfer({
      sender_address: '0x' + Math.random().toString(16).substr(2, 40),
      receiver_address: '0x' + Math.random().toString(16).substr(2, 40),
      amount: Math.floor(Math.random() * 10000) + 100,
      data_payload: 'Test quantum transfer payload'
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Session ID', 'Status', 'Sender', 'Receiver', 'Amount', 
      'Security Score', 'Layers Passed', 'Total Layers', 'Quantum Fidelity',
      'Blockchain Hash', 'Created At', 'Completed At'
    ];
    
    const rows = filteredTransfers.map(t => [
      t.session_id,
      t.transfer_status,
      t.sender_address,
      t.receiver_address,
      t.amount,
      t.security_score || '',
      t.layers_passed,
      t.total_layers,
      t.quantum_fidelity || '',
      t.blockchain_hash || '',
      t.created_at,
      t.completed_at || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quantum-transfers-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Exported to CSV', { description: `${filteredTransfers.length} transfers exported` });
  };

  // Export to JSON
  const exportToJSON = () => {
    const data = filteredTransfers.map(t => ({
      session_id: t.session_id,
      transfer_status: t.transfer_status,
      sender_address: t.sender_address,
      receiver_address: t.receiver_address,
      amount: t.amount,
      security_score: t.security_score,
      layers_passed: t.layers_passed,
      total_layers: t.total_layers,
      quantum_fidelity: t.quantum_fidelity,
      entanglement_pairs: t.entanglement_pairs,
      blockchain_hash: t.blockchain_hash,
      data_payload: t.data_payload,
      layer_results: t.layer_results,
      network_nodes: t.network_nodes,
      created_at: t.created_at,
      started_at: t.started_at,
      completed_at: t.completed_at
    }));

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quantum-transfers-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Exported to JSON', { description: `${filteredTransfers.length} transfers exported` });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/20">
                <History className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Quantum Transfer History</CardTitle>
                <CardDescription>
                  Real-time transaction logging with blockchain anchoring
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10">
                {stats.completed} Completed
              </Badge>
              <Badge variant="outline" className="bg-yellow-500/10">
                {stats.pending} Pending
              </Badge>
              <Button variant="outline" size="sm" onClick={() => fetchTransfers()}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Transfers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-500">{stats.completed}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-red-500">{stats.failed}</p>
            <p className="text-sm text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by session ID, address, or hash..."
                value={searchQuery}
                onChange={(e) => handleFilterChange(setSearchQuery)(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={exportToCSV} disabled={filteredTransfers.length === 0}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" onClick={exportToJSON} disabled={filteredTransfers.length === 0}>
              <FileJson className="h-4 w-4 mr-2" />
              JSON
            </Button>
            <Button onClick={handleCreateTestTransfer}>
              <Shield className="h-4 w-4 mr-2" />
              Test Transfer
            </Button>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* Status Filter */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={statusFilter} onValueChange={handleFilterChange(setStatusFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">From Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => handleFilterChange(setDateFrom)(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Date To */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">To Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => handleFilterChange(setDateTo)(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Date To */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">To Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Amount Min */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Min Amount</Label>
              <Input
                type="number"
                placeholder="0"
                value={amountMin}
                onChange={(e) => handleFilterChange(setAmountMin)(e.target.value)}
              />
            </div>

            {/* Amount Max */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Max Amount</Label>
              <Input
                type="number"
                placeholder="∞"
                value={amountMax}
                onChange={(e) => handleFilterChange(setAmountMax)(e.target.value)}
              />
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                {filteredTransfers.length} of {transfers.length} transfers match filters
              </p>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transfer List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Transfers</CardTitle>
              <CardDescription>
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTransfers.length)} of {filteredTransfers.length} transfers
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">Per page:</Label>
              <Select value={itemsPerPage.toString()} onValueChange={(val) => { setItemsPerPage(parseInt(val)); setCurrentPage(1); }}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEMS_PER_PAGE_OPTIONS.map(opt => (
                    <SelectItem key={opt} value={opt.toString()}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8 text-destructive">
              <XCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Error loading transfers: {error}</p>
            </div>
          ) : paginatedTransfers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="mb-2">No transfers found</p>
              <p className="text-sm">Create a test transfer to see it appear here in real-time</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3 pr-4">
                {paginatedTransfers.map(transfer => (
                  <TransferCard key={transfer.id} transfer={transfer} />
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        className="w-8"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
