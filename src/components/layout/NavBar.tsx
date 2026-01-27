import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Gem, ChevronDown, Menu, X, ArrowUpDown, Bot } from "lucide-react";
import WalletConnector from "../wallet/WalletConnector";
import { LogoIconType } from "../layout/Logo";
import { DeploymentStatus } from '../deployment/DeploymentStatus';
import { AuthButton } from '../home/AuthButton';
import { NotificationsCenter } from '../notifications/NotificationsCenter';

interface NavBarProps {
  logoType?: LogoIconType; // Update to use the full LogoIconType
  onLogoClick?: () => void;
  selectedWallet: string | null;
  onConnectWallet: () => void;
  onShowCharts: () => void;
  onShowAIChat: () => void;
  onShowSwap: () => void;
  showCharts: boolean;
  showAIChat: boolean;
  showSwap: boolean;
}
export function NavBar({
  logoType = "gem",
  onLogoClick,
  selectedWallet,
  onConnectWallet,
  onShowCharts,
  onShowAIChat,
  onShowSwap,
  showCharts,
  showAIChat,
  showSwap
}: NavBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  return <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled || isMenuOpen ? "bg-black/80 backdrop-blur-md shadow-lg" : "bg-transparent"}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center space-x-2 text-white" onClick={onLogoClick}>
              <Gem className="h-8 w-8 text-purple-500" />
              <span className="text-xl font-bold">Quantum Coin</span>
            </Link>
            
            {/* Deployment Status */}
            <div className="hidden md:block">
              <DeploymentStatus />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white ${currentPath === "/" ? "text-purple-400" : ""}`}>
              Home
            </Link>
            
            <Link to="/wallet" className={`px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white ${currentPath === "/wallet" ? "text-purple-400" : ""}`}>
              Wallet
            </Link>

            {/* Quantum dropdown */}
            <div className="relative group">
              <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white group flex items-center">
                Quantum
                <ChevronDown className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-black/90 backdrop-blur-md ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out">
                <div className="py-1 border border-gray-800 rounded-md">
                  <Link to="/quantum-circuits" className="block px-4 py-2 text-sm text-gray-300 hover:bg-purple-900/30 hover:text-white">
                    Quantum Circuits
                  </Link>
                  <Link to="/quantum-operations" className="block px-4 py-2 text-sm text-gray-300 hover:bg-purple-900/30 hover:text-white">
                    Quantum Operations
                  </Link>
                  <Link to="/quantum-ai" className="block px-4 py-2 text-sm text-gray-300 hover:bg-purple-900/30 hover:text-white">
                    Quantum AI
                  </Link>
                </div>
              </div>
            </div>

            {/* New Action Buttons */}
            <button 
              onClick={onShowSwap}
              className="px-3 py-2 rounded-md text-sm font-medium text-purple-300 hover:text-white hover:bg-purple-900/30 transition-colors flex items-center gap-2"
            >
              <ArrowUpDown className="h-4 w-4" />
              Try QuantumSwap
            </button>

            <button 
              onClick={onShowAIChat}
              className="px-3 py-2 rounded-md text-sm font-medium text-blue-300 hover:text-white hover:bg-blue-900/30 transition-colors flex items-center gap-2"
            >
              <Bot className="h-4 w-4" />
              AI Assistant
            </button>
          </div>

          {/* Notifications, Auth & Wallet Connection */}
          <div className="hidden md:flex items-center gap-3">
            <NotificationsCenter />
            <AuthButton />
            <WalletConnector />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-white">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && <div className="md:hidden py-3 space-y-2 pb-5">
            <Link to="/" className={`block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white ${currentPath === "/" ? "bg-purple-900/30 text-white" : ""}`} onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link to="/crypto-market" className={`block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white ${currentPath === "/crypto-market" ? "bg-purple-900/30 text-white" : ""}`} onClick={() => setIsMenuOpen(false)}>
              Markets
            </Link>
            <Link to="/wallet" className={`block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white ${currentPath === "/wallet" ? "bg-purple-900/30 text-white" : ""}`} onClick={() => setIsMenuOpen(false)}>
              Wallet
            </Link>

            {/* Mobile Action Buttons */}
            <button 
              onClick={() => {
                onShowSwap();
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-purple-300 hover:bg-purple-900/30 hover:text-white flex items-center gap-2"
            >
              <ArrowUpDown className="h-4 w-4" />
              Try QuantumSwap
            </button>

            <button 
              onClick={() => {
                onShowAIChat();
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-blue-300 hover:bg-blue-900/30 hover:text-white flex items-center gap-2"
            >
              <Bot className="h-4 w-4" />
              AI Assistant
            </button>

            {/* Mobile Quantum submenu */}
            <div className="px-3 py-2">
              <div className="block text-base font-medium text-gray-300 mb-2">
                Quantum
              </div>
              <div className="pl-4 space-y-2 border-l border-gray-700">
                <Link to="/quantum-circuits" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white" onClick={() => setIsMenuOpen(false)}>
                  Quantum Circuits
                </Link>
                <Link to="/quantum-operations" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white" onClick={() => setIsMenuOpen(false)}>
                  Quantum Operations
                </Link>
                <Link to="/quantum-ai" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white" onClick={() => setIsMenuOpen(false)}>
                  Quantum AI
                </Link>
              </div>
            </div>

            {/* Mobile Deployment Status */}
            <div className="px-3 py-2">
              <DeploymentStatus />
            </div>

            {/* Mobile Notifications & Auth */}
            <div className="px-3 py-2 flex items-center gap-2">
              <NotificationsCenter />
              <AuthButton />
            </div>

            {/* Mobile Wallet Connection */}
            <div className="pt-2 pb-3 px-3">
              <WalletConnector />
            </div>
          </div>}
      </div>
    </nav>;
}
