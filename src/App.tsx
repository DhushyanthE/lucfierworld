
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
import MiningLeaderboardPage from './pages/MiningLeaderboardPage';
import DAOPage from './pages/DAO';
import SecurityDashboard from './pages/admin/SecurityDashboard';
import SecurityMemoryAdmin from './pages/admin/SecurityMemoryAdmin';
import DAOVotersAdmin from './pages/admin/DAOVotersAdmin';
import SecurityAlertSettings from './pages/admin/SecurityAlertSettings';
import SecurityAlertOutcomes from './pages/admin/SecurityAlertOutcomes';
import SecurityFindings from './pages/admin/SecurityFindings';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';
import QuantumLab from './pages/QuantumLab';
import RealtimeDemo from './pages/RealtimeDemo';
import Connect from './pages/Connect';
import ToolRunner from './pages/ToolRunner';
import QuantumCore from './pages/QuantumCore';
import Leviathan from './pages/Leviathan';
import AgentConsole from './pages/AgentConsole';
import QiskitVerification from './pages/QiskitVerification';
import QuantumResults from './pages/QuantumResults';
import QuantumFabric from './pages/QuantumFabric';
import CellularBlockchain from './pages/CellularBlockchain';
import Staking from './pages/Staking';
import DefenseCommand from './pages/DefenseCommand';
import SecurityTesting from './pages/SecurityTesting';
import OAuthConsent from './pages/OAuthConsent';
import AuthCallback from './pages/AuthCallback';
import { supabase } from '@/integrations/supabase/client';
import { OAUTH_RETURN_STORAGE_KEY, oauthReturnPath } from '@/lib/oauth-return-path';
import './App.css';

// After a social (Google/Apple) sign-in started from the OAuth consent page,
// the provider returns to the app origin; finish the pending consent redirect.
function ConsentSocialReturn() {
  useEffect(() => {
    const check = async () => {
      const pending = sessionStorage.getItem(OAUTH_RETURN_STORAGE_KEY);
      if (!pending) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        sessionStorage.removeItem(OAUTH_RETURN_STORAGE_KEY);
        window.location.assign(oauthReturnPath(pending));
      }
    };
    check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { check(); });
    return () => subscription.unsubscribe();
  }, []);
  return null;
}

function App() {
  const [count, setCount] = useState(0); // Force rebuild

  // Real-path routes that the hash router must not intercept.
  if (window.location.pathname === '/.lovable/oauth/consent') {
    return <OAuthConsent />;
  }
  if (window.location.pathname === '/auth/callback') {
    return <AuthCallback />;
  }

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
            <Route path="/leaderboard/mining" element={<MiningLeaderboardPage />} />
            <Route path="/dao" element={<DAOPage />} />
            <Route path="/admin/security-dashboard" element={<SecurityDashboard />} />
            <Route path="/admin/security-memory" element={<SecurityMemoryAdmin />} />
            <Route path="/admin/dao-voters" element={<DAOVotersAdmin />} />
            <Route path="/admin/alert-settings" element={<SecurityAlertSettings />} />
            <Route path="/admin/alert-outcomes" element={<SecurityAlertOutcomes />} />
            <Route path="/admin/security-findings" element={<SecurityFindings />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/checkout/cancel" element={<CheckoutCancel />} />
            <Route path="/quantum-lab" element={<QuantumLab />} />
            <Route path="/realtime-demo" element={<RealtimeDemo />} />
            <Route path="/connect" element={<Connect />} />
            <Route path="/tools" element={<ToolRunner />} />
            <Route path="/quantum-core" element={<QuantumCore />} />
            <Route path="/leviathan" element={<Leviathan />} />
            <Route path="/agent" element={<AgentConsole />} />
            <Route path="/qiskit" element={<QiskitVerification />} />
            <Route path="/quantum-results" element={<QuantumResults />} />
            <Route path="/fabric" element={<QuantumFabric />} />
            <Route path="/cells" element={<CellularBlockchain />} />
            <Route path="/staking" element={<Staking />} />
            <Route path="/defense" element={<DefenseCommand />} />
            <Route path="/security-testing" element={<SecurityTesting />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </HashRouter>
      </WalletProvider>
    </TranslationProvider>
  );
}

export default App;
