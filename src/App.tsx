
import { useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CryptoMarket from "./pages/CryptoMarket";
import Wallet from "./pages/Wallet";
import QuantumOperations from './pages/QuantumOperations';
import QuantumAI from './pages/QuantumAI';
import QuantumCircuits from './pages/QuantumCircuits';
import QuantumWorkflow from './pages/QuantumWorkflow';
import AGIDashboard from './pages/AGIDashboard';
import GenomicSequencing from './pages/GenomicSequencing';
import TradingAssistant from './pages/TradingAssistant';
import { TranslationProvider } from './contexts/TranslationContext';
import { WalletProvider } from './contexts/wallet-context';
import QuantumIndex from './pages/quantum-index';
import BlockchainNetwork from './pages/BlockchainNetwork';
import QuantumComputing from './pages/QuantumComputing';
import QuantumValley150Qubit from './pages/QuantumValley150Qubit';
import BlockchainANN from './pages/BlockchainANN';
import NetworkExplorer from './pages/NetworkExplorer';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import DataScientist from './pages/DataScientist';
import PitchDeck from './pages/PitchDeck';
import QuantumHardwareBenchmark from './pages/QuantumHardwareBenchmark';
import WSQAOAConsole from './pages/WSQAOAConsole';
import QAOAApiSimulator from './pages/QAOAApiSimulator';
import './App.css';

function App() {
  const [count, setCount] = useState(0); // Force rebuild

  // Note: The hash router is used because it works well with Lovable's preview pane
  // For production, you might want to use BrowserRouter instead
  return (
    <TranslationProvider initialLanguage="en">
      <WalletProvider>
        <HashRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<Index />} />
            <Route path="/crypto-market" element={<CryptoMarket />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/quantum" element={<QuantumIndex />} />
            <Route path="/quantum-operations" element={<QuantumOperations />} />
            <Route path="/quantum-ai" element={<QuantumAI />} />
            <Route path="/quantum-circuits" element={<QuantumCircuits />} />
            <Route path="/quantum-valley-150" element={<QuantumValley150Qubit />} />
            <Route path="/quantum-workflow" element={<QuantumWorkflow />} />
            <Route path="/agi-dashboard" element={<AGIDashboard />} />
            <Route path="/genomic" element={<GenomicSequencing />} />
            <Route path="/trading-assistant" element={<TradingAssistant />} />
            <Route path="/blockchain" element={<BlockchainNetwork />} />
            <Route path="/quantum-computing" element={<QuantumComputing />} />
            <Route path="/blockchain-ann" element={<BlockchainANN />} />
            <Route path="/network-explorer" element={<NetworkExplorer />} />
            <Route path="/data-scientist" element={<DataScientist />} />
            <Route path="/pitch-deck" element={<PitchDeck />} />
            <Route path="/hardware-benchmark" element={<QuantumHardwareBenchmark />} />
            <Route path="/ws-qaoa" element={<WSQAOAConsole />} />
            <Route path="/qaoa-simulator" element={<QAOAApiSimulator />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </HashRouter>
      </WalletProvider>
    </TranslationProvider>
  );
}

export default App;
