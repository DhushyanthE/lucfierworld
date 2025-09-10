
import { ArrowRight, BrainCircuit, Zap, Cpu, Database, AlertCircle, ArrowUpRight, ShieldCheck, Workflow } from "lucide-react";

export function CompetitiveAnalysis() {
  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-white mb-6">Competitive Analysis</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-4 text-gray-400">Feature</th>
              <th className="text-left py-4 text-purple-400">Quantum Coin</th>
              <th className="text-left py-4 text-gray-400">Ripple</th>
              <th className="text-left py-4 text-gray-400">Ethereum</th>
              <th className="text-left py-4 text-gray-400">Traditional</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/10">
              <td className="py-4 text-gray-400">Transaction Speed</td>
              <td className="py-4 text-purple-400 font-medium">&lt;1 second</td>
              <td className="py-4 text-gray-400">3-5 seconds</td>
              <td className="py-4 text-gray-400">15 seconds</td>
              <td className="py-4 text-gray-400">2-5 days</td>
            </tr>
            <tr className="border-b border-white/10">
              <td className="py-4 text-gray-400">Transaction Cost</td>
              <td className="py-4 text-purple-400 font-medium">$0.0001</td>
              <td className="py-4 text-gray-400">$0.0002</td>
              <td className="py-4 text-gray-400">$10+</td>
              <td className="py-4 text-gray-400">$25-45</td>
            </tr>
            <tr className="border-b border-white/10">
              <td className="py-4 text-gray-400">Energy Usage</td>
              <td className="py-4 text-purple-400 font-medium">0.01 kWh</td>
              <td className="py-4 text-gray-400">0.01 kWh</td>
              <td className="py-4 text-gray-400">~100 kWh</td>
              <td className="py-4 text-gray-400">N/A</td>
            </tr>
            <tr className="border-b border-white/10">
              <td className="py-4 text-gray-400">Smart Contracts</td>
              <td className="py-4 text-purple-400 font-medium">Full</td>
              <td className="py-4 text-gray-400">Limited</td>
              <td className="py-4 text-gray-400">Full</td>
              <td className="py-4 text-gray-400">None</td>
            </tr>
            <tr className="border-b border-white/10">
              <td className="py-4 text-gray-400">Quantum AI Integration</td>
              <td className="py-4 text-purple-400 font-medium">Native</td>
              <td className="py-4 text-gray-400">None</td>
              <td className="py-4 text-gray-400">Limited</td>
              <td className="py-4 text-gray-400">None</td>
            </tr>
            <tr className="border-b border-white/10">
              <td className="py-4 text-gray-400">Multi-language Support</td>
              <td className="py-4 text-purple-400 font-medium">15 languages</td>
              <td className="py-4 text-gray-400">4 languages</td>
              <td className="py-4 text-gray-400">5 languages</td>
              <td className="py-4 text-gray-400">Varies</td>
            </tr>
            <tr className="border-b border-white/10">
              <td className="py-4 text-gray-400">Quantum-resistant Security</td>
              <td className="py-4 text-purple-400 font-medium">Advanced</td>
              <td className="py-4 text-gray-400">Basic</td>
              <td className="py-4 text-gray-400">In development</td>
              <td className="py-4 text-gray-400">None</td>
            </tr>
            <tr className="border-b border-white/10">
              <td className="py-4 text-gray-400">Wallet Compatibility</td>
              <td className="py-4 text-purple-400 font-medium">Universal</td>
              <td className="py-4 text-gray-400">Limited</td>
              <td className="py-4 text-gray-400">Extensive</td>
              <td className="py-4 text-gray-400">Bank-only</td>
            </tr>
            <tr className="border-b border-white/10">
              <td className="py-4 text-gray-400">Real-time Gen AI Analytics</td>
              <td className="py-4 text-purple-400 font-medium">Built-in</td>
              <td className="py-4 text-gray-400">Third-party</td>
              <td className="py-4 text-gray-400">Third-party</td>
              <td className="py-4 text-gray-400">None</td>
            </tr>
            <tr className="border-b border-white/10">
              <td className="py-4 text-gray-400">Cross-chain Integration</td>
              <td className="py-4 text-purple-400 font-medium">Native</td>
              <td className="py-4 text-gray-400">Limited</td>
              <td className="py-4 text-gray-400">Via bridges</td>
              <td className="py-4 text-gray-400">None</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-12 bg-black/40 rounded-xl p-6 border border-purple-500/20">
        <h3 className="text-xl font-bold text-white mb-4">Quantum Coin Wallet Integration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-black/40 p-4 rounded-lg border border-purple-500/20 transition-all duration-300 hover:border-purple-500/50 hover:bg-black/50">
            <h4 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
              <div className="bg-orange-500/20 p-1.5 rounded-full">
                <Zap className="h-4 w-4 text-orange-500" />
              </div>
              MetaMask
            </h4>
            <p className="text-gray-300 text-sm">Seamless integration with Ethereum's most popular wallet. Connect with one click and manage your Quantum Coin assets directly.</p>
            <button className="mt-3 text-xs text-purple-400 flex items-center">
              Learn more <ArrowUpRight className="h-3 w-3 ml-1" />
            </button>
          </div>
          <div className="bg-black/40 p-4 rounded-lg border border-purple-500/20 transition-all duration-300 hover:border-purple-500/50 hover:bg-black/50">
            <h4 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
              <div className="bg-blue-500/20 p-1.5 rounded-full">
                <ShieldCheck className="h-4 w-4 text-blue-500" />
              </div>
              Trust Wallet
            </h4>
            <p className="text-gray-300 text-sm">Full mobile support with Trust Wallet integration. Access your Quantum Coin assets on the go with enhanced security features.</p>
            <button className="mt-3 text-xs text-purple-400 flex items-center">
              Learn more <ArrowUpRight className="h-3 w-3 ml-1" />
            </button>
          </div>
          <div className="bg-black/40 p-4 rounded-lg border border-purple-500/20 transition-all duration-300 hover:border-purple-500/50 hover:bg-black/50">
            <h4 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
              <div className="bg-purple-500/20 p-1.5 rounded-full">
                <Cpu className="h-4 w-4 text-purple-500" />
              </div>
              Phantom
            </h4>
            <p className="text-gray-300 text-sm">Solana-based integration for high-speed transactions. Leverage Solana's infrastructure with Quantum Coin's advanced features.</p>
            <button className="mt-3 text-xs text-purple-400 flex items-center">
              Learn more <ArrowUpRight className="h-3 w-3 ml-1" />
            </button>
          </div>
          <div className="bg-black/40 p-4 rounded-lg border border-purple-500/20 transition-all duration-300 hover:border-purple-500/50 hover:bg-black/50">
            <h4 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
              <div className="bg-green-500/20 p-1.5 rounded-full">
                <Workflow className="h-4 w-4 text-green-500" />
              </div>
              WalletConnect
            </h4>
            <p className="text-gray-300 text-sm">Universal protocol support for connecting to any compatible wallet. One protocol to connect them all with Quantum AI security.</p>
            <button className="mt-3 text-xs text-purple-400 flex items-center">
              Learn more <ArrowUpRight className="h-3 w-3 ml-1" />
            </button>
          </div>
        </div>
        
        <div className="mt-10">
          <h3 className="text-xl font-bold text-white mb-6">Quantum AI Workflow Integration</h3>
          <div className="bg-black/40 p-6 rounded-lg border border-purple-500/20">
            <div className="flex flex-col md:flex-row items-stretch gap-8">
              <div className="flex-1 space-y-6">
                <div className="bg-gradient-to-r from-purple-900/30 to-black/20 p-5 rounded-lg border border-purple-500/10 transition-transform hover:scale-105 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/80 flex items-center justify-center text-white font-bold">1</div>
                    <div>
                      <h5 className="text-white font-medium flex items-center">
                        <Database className="w-4 h-4 mr-2 text-purple-400" />
                        Data Collection
                      </h5>
                      <p className="text-gray-300 text-sm mt-1">Real-time market data from 50+ exchanges processed through quantum neural networks</p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <ArrowRight className="w-5 h-5 text-purple-400 animate-pulse" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-900/30 to-black/20 p-5 rounded-lg border border-purple-500/10 transition-transform hover:scale-105 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/80 flex items-center justify-center text-white font-bold">2</div>
                    <div>
                      <h5 className="text-white font-medium flex items-center">
                        <BrainCircuit className="w-4 h-4 mr-2 text-purple-400" />
                        AI Processing
                      </h5>
                      <p className="text-gray-300 text-sm mt-1">Quantum computing algorithms analyze patterns and predict market movements</p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <ArrowRight className="w-5 h-5 text-purple-400 animate-pulse" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-900/30 to-black/20 p-5 rounded-lg border border-purple-500/10 transition-transform hover:scale-105 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/80 flex items-center justify-center text-white font-bold">3</div>
                    <div>
                      <h5 className="text-white font-medium flex items-center">
                        <Cpu className="w-4 h-4 mr-2 text-purple-400" />
                        Smart Contract Execution
                      </h5>
                      <p className="text-gray-300 text-sm mt-1">Automated execution of transactions based on AI predictions and user preferences</p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <ArrowRight className="w-5 h-5 text-purple-400 animate-pulse" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-900/30 to-black/20 p-5 rounded-lg border border-purple-500/10 transition-transform hover:scale-105 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/80 flex items-center justify-center text-white font-bold">4</div>
                    <div>
                      <h5 className="text-white font-medium flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 text-purple-400" />
                        User Interface
                      </h5>
                      <p className="text-gray-300 text-sm mt-1">Intuitive dashboard with real-time analytics and personalized recommendations</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-2/5 bg-gradient-to-br from-purple-900/20 to-purple-600/10 rounded-lg border border-purple-500/20 p-6 flex flex-col justify-center items-center">
                <div className="relative w-32 h-32 mb-5">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping opacity-50"></div>
                  <div className="relative z-10 bg-gradient-to-br from-purple-800 to-purple-500 rounded-full w-full h-full flex items-center justify-center">
                    <BrainCircuit className="w-16 h-16 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 font-bold text-xl mb-3">Quantum AI Engine</div>
                  <div className="space-y-2">
                    <div className="text-sm text-white flex items-center justify-center">
                      <Cpu className="w-4 h-4 mr-2 text-purple-300" />
                      Custom SHA256 algorithm
                    </div>
                    <div className="text-sm text-white flex items-center justify-center">
                      <Workflow className="w-4 h-4 mr-2 text-purple-300" />
                      15 language processing capabilities
                    </div>
                    <div className="text-sm text-white flex items-center justify-center">
                      <Zap className="w-4 h-4 mr-2 text-purple-300" />
                      Enhanced by quantum computing
                    </div>
                  </div>
                  <div className="mt-5 text-xs text-purple-300 bg-purple-500/10 rounded-full px-4 py-1.5 inline-flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse mr-2"></div>
                    Active Monitoring
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
