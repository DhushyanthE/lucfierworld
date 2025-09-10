
import { AIGenerationResponse } from './types';
import { generatePresentationResponse, generatePracticalReportResponse, generatePricePredictionResponse, generateValuationResponse, generateInvestmentAnalysisResponse, generateEducationalResponse } from './responses';

// Predefined responses for QuantumBot AI Assistant
const quantumBotResponses = {
  "What is Quantum Coin?": "Quantum Coin is a decentralized digital currency and payment network, designed for energy efficiency, ultra-low transaction fees, and scalability. It uses a proof-of-work consensus mechanism and features a fixed maximum supply of 100 million tokens, making it both scarce and censorship-resistant. The project emphasizes security, decentralization, and long-term value as a store of value and medium of exchange.",

  "Quantum Coin price prediction": "Quantum Coin's price outlook is influenced by its fixed supply, increasing adoption, and its unique position as a decentralized, secure, and energy-efficient digital asset. Price projections depend on adoption rates, network effects, and broader crypto market trends, with detailed analyses available in annual reports.",

  "Quantum Coin tokenomics": "Quantum Coin has a maximum supply of 100 million tokens, enforced by network consensus. Tokens are issued programmatically, and the supply cannot be changed without majority agreement. Validator incentives include block rewards and transaction fees, with a portion of fees burned to control inflation. Staking and validator participation are key to network security.",

  "Quantum Coin market projection": "Market projections for Quantum Coin suggest strong growth potential due to its energy efficiency, scalability, and secure consensus. Its adoption as a store of value and medium of exchange, combined with global expansion plans and DeFi integration, position it for increased market share over time.",

  "Quantum Coin educational foundation": "The Quantum Coin educational initiative includes an interactive learning platform, community tutorials, and developer documentation. The foundation aims to foster blockchain literacy, support developers, and encourage ecosystem growth, with grant programs for research and outreach.",

  "Explain Quantum AI analysis": "Quantum AI analysis refers to the use of advanced generative AI models integrated with the Quantum Coin platform for predictive analytics, market forecasting, and decentralized application development. AI-driven tools help users and developers gain insights and optimize strategies.",

  "How accurate is Quantum AI?": "The accuracy of Quantum AI depends on model quality, data inputs, and the reliability of decentralized oracles. Ongoing improvements and integration with blockchain oracles enhance prediction reliability and decision-making.",

  "Quantum AI market predictions": "Quantum AI leverages machine learning and blockchain data to forecast market trends, investment opportunities, and token valuations, providing users with actionable intelligence for the crypto sector.",

  "Quantum computing and cryptocurrency": "Quantum computing has the potential to revolutionize blockchain security and transaction processing. Quantum Coin is actively researching and implementing quantum-resistant cryptography to future-proof its network against quantum attacks.",

  "Quantum resistance in blockchain": "Quantum Coin employs advanced cryptographic techniques and is planning post-quantum upgrades to ensure the blockchain remains secure even as quantum computing capabilities evolve.",

  "Investment opportunity analysis": "Quantum Coin represents a compelling investment opportunity due to its fixed supply, energy efficiency, and robust security model. Its roadmap includes global expansion, DeFi integration, and enterprise adoption, which are key value drivers.",

  "Tokenomics valuation": "The valuation of Quantum Coin is based on its capped supply, staking rewards, transaction fee structure, and network utility. The burn mechanism for transaction fees helps control inflation and supports long-term value.",

  "7-year ROI projection": "7-year return on investment projections consider adoption rates, staking rewards, network growth, and market expansion. Conservative estimates show potential for significant returns as the ecosystem matures and achieves global reach.",

  "Value drivers for Quantum Coin": "Key value drivers include decentralization, energy efficiency (0.01 kWh per transaction), low transaction fees (0.0001 per tx), staking incentives, and ongoing technological innovation such as sharding and quantum resistance.",

  "Staking rewards calculation": "Staking rewards are calculated based on the number of tokens staked, network participation, and block rewards. Validators must stake 10,000 Quantum Coin tokens, with slashing penalties for malicious behavior. Rewards are distributed from block issuance and transaction fees, with a portion of fees burned to maintain value.",

  "Blockchain education initiatives": "Education initiatives include interactive modules, community learning platforms, developer programs, and grant funding for research and outreach. These efforts aim to build a knowledgeable and engaged Quantum Coin community.",

  "Educational grants program": "The grants program supports research, development, and educational outreach related to blockchain technology and Quantum Coin, fostering innovation and ecosystem growth.",

  "Community learning platform": "The community learning platform offers collaborative tutorials, knowledge sharing, and developer resources to support users and builders in the Quantum Coin ecosystem.",

  "Quantum learning resources": "Learning resources include step-by-step guides, technical documentation, AI-driven tutorials, and community support channels for all levels of users.",

  "Developer education program": "The developer program provides training on Quantum Coin technology, smart contract development, and integration with DeFi and AI tools, supporting a robust developer ecosystem.",

  "Quantum Coin project overview": "Quantum Coin is a decentralized, energy-efficient blockchain with a fixed supply, advanced consensus, and a strong focus on security, scalability, and educational outreach. The project roadmap includes DeFi, quantum resistance, and global expansion.",

  "Technical architecture": "Quantum Coin uses a hybrid consensus mechanism, sharding for parallel transaction processing (up to 10,000 TPS), Layer-2 rollups for scalability, and quantum-resistant cryptography for future-proof security.",

  "Development milestones": "Key milestones include the launch of the educational platform (2025), GameFi and NFT integration (2026), DeFi and governance rollout (2027), global expansion and quantum resistance (2027+), and enterprise solutions (2028).",

  "Quantum Coin use cases": "Use cases include digital payments, decentralized finance (DeFi), AI-driven analytics, staking, gaming (GameFi), NFTs, and enterprise blockchain solutions.",

  "Community governance system": "Quantum Coin features on-chain governance, allowing token holders to vote on protocol upgrades, fee adjustments, and ecosystem initiatives, ensuring decentralized decision-making.",

  "Mining equipment setup": "Validators use energy-efficient hardware (e.g., Raspberry Pi equivalents) to participate in the network, minimizing energy consumption and supporting sustainability.",

  "Mining profitability": "Profitability is determined by block rewards, transaction fees, hardware costs, and energy efficiency. Validators earn both block rewards and a share of transaction fees, with a portion of fees burned to maintain value.",

  "Mining pool strategies": "Participating in mining pools can help validators optimize rewards and reduce variance, especially for those with smaller stakes or less powerful hardware.",

  "Energy efficiency in mining": "Quantum Coin achieves ultra-low energy consumption (0.01 kWh per transaction) through efficient consensus and hardware requirements, making it one of the most sustainable blockchains.",

  "Crypto market analysis": "Market analysis covers trends in adoption, competitor comparison, regulatory developments, and investment opportunities, highlighting Quantum Coin's advantages in efficiency and security.",

  "Top cryptocurrencies": "Quantum Coin is compared with leading cryptocurrencies like Bitcoin and Ethereum, offering lower fees, higher energy efficiency, and advanced scalability features.",

  "Bitcoin vs Quantum Coin": "Compared to Bitcoin, Quantum Coin offers much lower energy use (0.01 kWh vs. 1,147 kWh per transaction), lower fees (0.0001 vs. $5+), and faster transaction speeds due to sharding and rollups.",

  "Ethereum vs Quantum Coin": "Quantum Coin provides lower fees, higher scalability, and quantum-resistant security compared to Ethereum, with a focus on educational outreach and DeFi integration.",

  "What is staking?": "Staking involves locking Quantum Coin tokens to support network security, validate transactions, and earn rewards. Validators must stake a minimum amount and are subject to slashing for malicious activity.",

  "Explain blockchain": "Blockchain is a decentralized ledger technology that records transactions securely and transparently, enabling peer-to-peer digital payments and decentralized applications.",

  "What is DeFi?": "Decentralized Finance (DeFi) uses blockchain technology to provide financial services like lending, borrowing, and trading without intermediaries, increasing accessibility and transparency.",

  "How to share Quantum Coin": "Quantum Coin can be transferred securely between users via wallet addresses on the blockchain, with ultra-low transaction fees and fast settlement times.",

  "Quantum Coin presentation outline": "A standard presentation covers Quantum Coin's introduction, tokenomics, technical architecture, energy efficiency, security features, use cases, roadmap milestones, and community governance."
};

export const chatService = {
  generateChatResponse: async (message: string): Promise<AIGenerationResponse> => {
    try {
      console.log('AI Chat request:', message);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let response = '';

      // First check for exact matches in our predefined responses
      const exactMatch = Object.keys(quantumBotResponses).find(
        key => message.toLowerCase() === key.toLowerCase()
      );
      
      if (exactMatch) {
        response = quantumBotResponses[exactMatch];
      }
      // Then check for partial matches in our predefined responses
      else {
        const partialMatch = Object.keys(quantumBotResponses).find(
          key => message.toLowerCase().includes(key.toLowerCase())
        );
        
        if (partialMatch) {
          response = quantumBotResponses[partialMatch];
        }
        // If no match, use the existing response logic
        else if (message.toLowerCase().includes('presentation') || message.toLowerCase().includes('slides')) {
          response = generatePresentationResponse();
        } else if (message.toLowerCase().includes('practical report')) {
          response = generatePracticalReportResponse();
        } else if (message.toLowerCase().includes('price prediction')) {
          response = generatePricePredictionResponse();
        } else if (message.toLowerCase().includes('valuation')) {
          response = generateValuationResponse();
        } else if (message.toLowerCase().includes('investment analysis')) {
          response = generateInvestmentAnalysisResponse();
        } else if (message.toLowerCase().includes('educational foundation')) {
          response = generateEducationalResponse();
        } else {
          response = "I'm excited to assist you with information about QuantumCoin. Please let me know what specific aspects you'd like to learn more about.";
        }
      }
      
      return {
        text: response,
        status: 'success'
      };
      
    } catch (error) {
      console.error('Error in chat response:', error);
      return {
        text: '',
        status: 'error',
        message: 'Failed to generate chat response. Please try again.'
      };
    }
  }
};
