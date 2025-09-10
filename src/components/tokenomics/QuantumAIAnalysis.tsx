
import React from "react";
import { BrainCircuit, Coins, ArrowRight, Shield, TrendingUp, AlertTriangle, BarChart3 } from "lucide-react";
import { Activity } from "lucide-react";
import { AnalysisCard } from "./analysis/AnalysisCard";
import { AnalysisControls } from "./analysis/AnalysisControls";
import { SecurityAnalysisSection } from "./analysis/SecurityAnalysisSection";
import { AnalysisFooter } from "./analysis/AnalysisFooter";
import { useQuantumAnalysis } from "./analysis/useQuantumAnalysis";

export function QuantumAIAnalysis() {
  const {
    isLoading,
    analysis,
    currentPrice,
    priceChange,
    lastUpdated,
    aiConfidence,
    securityAnalysis,
    neuralNetworkActive,
    generateAnalysis,
    toggleNeuralNetwork
  } = useQuantumAnalysis();

  return (
    <AnalysisCard title="QuantumAI Market Analysis">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-purple-400" /> 
          QuantumAI Market Analysis
        </h3>
        <AnalysisControls
          isLoading={isLoading}
          currentPrice={currentPrice}
          priceChange={priceChange}
          neuralNetworkActive={neuralNetworkActive}
          onRefresh={generateAnalysis}
          onToggleNeuralNetwork={toggleNeuralNetwork}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Market Trend with enhanced information */}
          <div className="bg-gray-800/50 p-4 rounded-lg border border-purple-500/10">
            <h4 className="text-purple-400 font-medium mb-2 flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Market Trend
            </h4>
            <p className="text-gray-300 mb-3">{analysis.marketTrend}</p>
            
            <div className="space-y-2 mt-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Trading Volume</span>
                <span className="text-green-400">↑ 24.5%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Market Sentiment</span>
                <span className="text-green-400">Bullish</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Support Level</span>
                <span className="text-white">$1.05</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Resistance Level</span>
                <span className="text-white">$1.45</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Trend Strength</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{width: "72%"}}></div>
                  </div>
                  <span className="text-xs text-green-400">72%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Token Prediction with enhanced information */}
          <div className="bg-gray-800/50 p-4 rounded-lg border border-purple-500/10">
            <h4 className="text-purple-400 font-medium mb-2 flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Token Prediction
            </h4>
            <p className="text-gray-300 mb-3">{analysis.tokenPrediction}</p>
            
            <div className="space-y-4 mt-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-900/60 p-2 rounded">
                  <div className="text-xs text-gray-400 mb-1">24h</div>
                  <div className="text-sm text-green-400">+5.2%</div>
                </div>
                <div className="bg-gray-900/60 p-2 rounded">
                  <div className="text-xs text-gray-400 mb-1">7d</div>
                  <div className="text-sm text-green-400">+12.8%</div>
                </div>
                <div className="bg-gray-900/60 p-2 rounded">
                  <div className="text-xs text-gray-400 mb-1">30d</div>
                  <div className="text-sm text-green-400">+18.5%</div>
                </div>
              </div>
              
              <div className="bg-gray-900/60 p-2 rounded">
                <div className="text-xs text-gray-400 mb-1">Technical Indicators</div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">MACD</span>
                    <span className="text-green-400">Bullish</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">RSI</span>
                    <span className="text-yellow-400">Neutral (52)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">MA 50/200</span>
                    <span className="text-green-400">Golden Cross</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bollinger</span>
                    <span className="text-green-400">Expanding</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <SecurityAnalysisSection securityAnalysis={securityAnalysis} />
        </div>
        
        <div className="space-y-6">
          {/* Risk Management - New Section */}
          <div className="bg-gray-800/50 p-4 rounded-lg border border-purple-500/10">
            <h4 className="text-purple-400 font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risk Management
            </h4>
            <div className="space-y-4">
              <p className="text-gray-300">{analysis.riskAssessment}</p>
              
              <div className="bg-gray-900/60 p-3 rounded">
                <h5 className="text-sm font-medium text-white mb-2">Potential Risks</h5>
                <ul className="space-y-2">
                  <li className="flex items-start text-sm">
                    <span className="text-red-500 mr-2">•</span>
                    <div>
                      <span className="text-gray-300">Regulatory Changes</span>
                      <p className="text-xs text-gray-400 mt-0.5">Potential impact from new crypto regulations in major markets</p>
                    </div>
                  </li>
                  <li className="flex items-start text-sm">
                    <span className="text-yellow-500 mr-2">•</span>
                    <div>
                      <span className="text-gray-300">Market Liquidity</span>
                      <p className="text-xs text-gray-400 mt-0.5">Lower than optimal trading volume during off-peak hours</p>
                    </div>
                  </li>
                  <li className="flex items-start text-sm">
                    <span className="text-purple-500 mr-2">•</span>
                    <div>
                      <span className="text-gray-300">Technology Risk</span>
                      <p className="text-xs text-gray-400 mt-0.5">Upcoming network upgrade scheduled in 14 days</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Volatility Index</div>
                  <div className="flex items-center">
                    <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden mr-2">
                      <div className="h-full bg-yellow-500" style={{width: "45%"}}></div>
                    </div>
                    <span className="text-sm text-yellow-500">45%</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Risk Score</div>
                  <div className="flex items-center">
                    <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden mr-2">
                      <div className="h-full bg-green-500" style={{width: "28%"}}></div>
                    </div>
                    <span className="text-sm text-green-500">28%</span>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-gray-400">
                <div className="flex items-center mb-1">
                  <Shield className="h-3 w-3 mr-1 text-purple-400" />
                  <span className="text-purple-300">Risk Mitigation Strategy</span>
                </div>
                <p>Implement dollar-cost averaging and set strict stop-loss orders at $0.95. Consider allocating only 2-5% of portfolio based on risk tolerance.</p>
              </div>
            </div>
          </div>
          
          {/* Investment Recommendations - Enhanced */}
          <div className="bg-gray-800/50 p-4 rounded-lg border border-purple-500/10">
            <h4 className="text-purple-400 font-medium mb-2 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Investment Recommendations
            </h4>
            <div className="space-y-4">
              <p className="text-gray-300">{analysis.recommendation}</p>
              
              <div className="bg-gray-900/60 p-3 rounded">
                <h5 className="text-sm font-medium text-white mb-2">Strategic Entry Points</h5>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-green-900/20 p-2 rounded border border-green-500/20">
                    <div className="text-xs text-gray-400 mb-1">Strong Buy</div>
                    <div className="text-sm text-green-400">$0.95 - $1.05</div>
                  </div>
                  <div className="bg-blue-900/20 p-2 rounded border border-blue-500/20">
                    <div className="text-xs text-gray-400 mb-1">Accumulate</div>
                    <div className="text-sm text-blue-400">$1.05 - $1.15</div>
                  </div>
                  <div className="bg-yellow-900/20 p-2 rounded border border-yellow-500/20">
                    <div className="text-xs text-gray-400 mb-1">Hold</div>
                    <div className="text-sm text-yellow-400">$1.15 - $1.35</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/60 p-3 rounded">
                <h5 className="text-sm font-medium text-white mb-2">Trading Strategy</h5>
                <ul className="space-y-2">
                  <li className="flex items-start text-sm">
                    <span className="text-purple-500 mr-2">•</span>
                    <div>
                      <span className="text-gray-300">Short-term</span>
                      <p className="text-xs text-gray-400 mt-0.5">Buy at support levels, set take-profit orders at $1.42</p>
                    </div>
                  </li>
                  <li className="flex items-start text-sm">
                    <span className="text-purple-500 mr-2">•</span>
                    <div>
                      <span className="text-gray-300">Mid-term</span>
                      <p className="text-xs text-gray-400 mt-0.5">Dollar-cost average over 30 days, target 3-month hold</p>
                    </div>
                  </li>
                  <li className="flex items-start text-sm">
                    <span className="text-purple-500 mr-2">•</span>
                    <div>
                      <span className="text-gray-300">Long-term</span>
                      <p className="text-xs text-gray-400 mt-0.5">Core holding position with 5% portfolio allocation</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="text-gray-400 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-400" />
                  <span>AI Trade Confidence</span>
                </div>
                <div className="text-green-400 font-medium">Very High (89%)</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg border border-purple-500/10">
              <div className="text-gray-400 text-sm flex items-center">
                <BrainCircuit className="h-4 w-4 mr-1.5 text-purple-400" />
                AI confidence level
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{width: `${aiConfidence}%`}}></div>
                </div>
                <span className="text-purple-400 text-sm">{aiConfidence}%</span>
              </div>
            </div>
            
            {neuralNetworkActive && (
              <div className="bg-gray-800/50 p-3 rounded-lg border border-purple-500/10">
                <div className="text-xs text-gray-300">
                  <div className="flex items-center gap-1.5 text-purple-300 mb-2">
                    <Activity className="h-3.5 w-3.5" />
                    <span className="font-medium">Neural Network Analysis Active</span>
                  </div>
                  <p className="text-gray-400">
                    Utilizing multi-layer perceptron with 3 hidden layers and ReLU activation functions.
                    Quantum resistance verification through lattice-based cryptography methods.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AnalysisFooter isLoading={isLoading} lastUpdated={lastUpdated} />
    </AnalysisCard>
  );
}
