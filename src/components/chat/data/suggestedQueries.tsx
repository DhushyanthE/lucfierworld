
import React from "react";
import { 
  LineChart, PieChart, TrendingUp, BarChart2, GraduationCap, 
  BookOpen, School, Users, Gem, Calendar, BarChart3, 
  FileText, Server, Cpu, DollarSign, HardDrive, 
  Coins, Wallet, BrainCircuit, Presentation, Atom, Orbit, Share2, Lightbulb, Shield
} from "lucide-react";
import { QuerySuggestion } from "../types";

export const suggestedQueries: QuerySuggestion[] = [
  // Quantum Coin specific queries
  { text: "What is Quantum Coin?", icon: <Gem className="w-4 h-4" /> },
  { text: "Quantum Coin price prediction", icon: <LineChart className="w-4 h-4" /> },
  { text: "Quantum Coin tokenomics", icon: <BarChart3 className="w-4 h-4" /> },
  { text: "Quantum Coin market projection", icon: <TrendingUp className="w-4 h-4" /> },
  { text: "Quantum Coin educational foundation", icon: <GraduationCap className="w-4 h-4" /> },
  
  // Quantum AI analysis
  { text: "Explain Quantum AI analysis", icon: <BrainCircuit className="w-4 h-4" /> },
  { text: "How accurate is Quantum AI?", icon: <Lightbulb className="w-4 h-4" /> },
  { text: "Quantum AI market predictions", icon: <PieChart className="w-4 h-4" /> },
  { text: "Quantum computing and cryptocurrency", icon: <Cpu className="w-4 h-4" /> },
  { text: "Quantum resistance in blockchain", icon: <Shield className="w-4 h-4" /> },
  
  // Investment and valuation queries
  { text: "Investment opportunity analysis", icon: <TrendingUp className="w-4 h-4" /> },
  { text: "Tokenomics valuation", icon: <BarChart2 className="w-4 h-4" /> },
  { text: "7-year ROI projection", icon: <Calendar className="w-4 h-4" /> },
  { text: "Value drivers for Quantum Coin", icon: <Orbit className="w-4 h-4" /> },
  { text: "Staking rewards calculation", icon: <Coins className="w-4 h-4" /> },
  
  // Educational foundation queries
  { text: "Blockchain education initiatives", icon: <BookOpen className="w-4 h-4" /> },
  { text: "Educational grants program", icon: <School className="w-4 h-4" /> },
  { text: "Community learning platform", icon: <Users className="w-4 h-4" /> },
  { text: "Quantum learning resources", icon: <Atom className="w-4 h-4" /> },
  { text: "Developer education program", icon: <FileText className="w-4 h-4" /> },
  
  // Project details
  { text: "Quantum Coin project overview", icon: <FileText className="w-4 h-4" /> },
  { text: "Technical architecture", icon: <Server className="w-4 h-4" /> },
  { text: "Development milestones", icon: <Calendar className="w-4 h-4" /> },
  { text: "Quantum Coin use cases", icon: <FileText className="w-4 h-4" /> },
  { text: "Community governance system", icon: <Users className="w-4 h-4" /> },
  
  // Mining experience
  { text: "Mining equipment setup", icon: <Cpu className="w-4 h-4" /> },
  { text: "Mining profitability", icon: <DollarSign className="w-4 h-4" /> },
  { text: "Mining pool strategies", icon: <HardDrive className="w-4 h-4" /> },
  { text: "Energy efficiency in mining", icon: <Cpu className="w-4 h-4" /> },
  
  // Market analysis
  { text: "Crypto market analysis", icon: <BarChart2 className="w-4 h-4" /> },
  { text: "Top cryptocurrencies", icon: <DollarSign className="w-4 h-4" /> },
  { text: "Bitcoin vs Quantum Coin", icon: <Coins className="w-4 h-4" /> },
  { text: "Ethereum vs Quantum Coin", icon: <Coins className="w-4 h-4" /> },
  
  // General crypto concepts
  { text: "What is staking?", icon: <Wallet className="w-4 h-4" /> },
  { text: "Explain blockchain", icon: <BrainCircuit className="w-4 h-4" /> },
  { text: "What is DeFi?", icon: <Coins className="w-4 h-4" /> },
  { text: "How to share Quantum Coin", icon: <Share2 className="w-4 h-4" /> },
  
  // Presentation
  { text: "Quantum Coin presentation outline", icon: <Presentation className="w-4 h-4" /> },
];
