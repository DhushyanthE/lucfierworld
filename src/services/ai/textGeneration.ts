import { toast } from 'sonner';
import { AIGenerationRequest, AIGenerationResponse } from './types';

export const textGenerationService = {
  generateText: async (data: AIGenerationRequest): Promise<AIGenerationResponse> => {
    try {
      console.log('AI Generation request:', data);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Simulate AI processing
      let generatedText = '';
      
      // Simple template-based generation based on prompt context
      if (data.prompt.toLowerCase().includes('mining experience')) {
        generatedText = "I've been mining cryptocurrencies since 2017, starting with Bitcoin using Antminer S9 hardware...";
      } else if (data.prompt.toLowerCase().includes('project description')) {
        generatedText = "My blockchain project aims to develop a decentralized marketplace for renewable energy certificates...";
      } else if (data.prompt.toLowerCase().includes('stacking')) {
        generatedText = "I plan to stack 5,000 QuantumCoins for a 12-month period...";
      } else if (data.feature) {
        switch (data.feature) {
          case 'governance':
            generatedText = "The QuantumCoin governance model empowers token holders...";
            break;
          case 'tokenomics':
            generatedText = "QuantumCoin features a deflationary tokenomic model with a maximum supply of 100 million tokens...";
            break;
          case 'defi':
            generatedText = "QuantumCoin's DeFi ecosystem includes a range of financial primitives...";
            break;
          case 'nft':
            generatedText = "The QuantumCoin NFT framework supports advanced non-fungible token capabilities...";
            break;
          case 'mining':
            generatedText = "QuantumCoin uses a hybrid Proof-of-Work consensus mechanism enhanced by neural network validations...";
            break;
          default:
            generatedText = "I'm excited to participate in the QuantumCoin ecosystem...";
        }
        
        // Add neural network terminology if requested
        if (data.neuralAnalysis) {
          generatedText += " The system employs multi-layer perceptron networks...";
        }
      } else {
        generatedText = "I'm excited to participate in the QuantumCoin ecosystem...";
      }
      
      // Limit text length if specified
      if (data.maxLength && generatedText.length > data.maxLength) {
        generatedText = generatedText.substring(0, data.maxLength);
      }
      
      return {
        text: generatedText,
        status: 'success'
      };
    } catch (error) {
      console.error('Error generating AI text:', error);
      toast.error('Failed to generate AI text');
      return {
        text: '',
        status: 'error',
        message: 'Failed to generate text. Please try again.'
      };
    }
  }
};
