
import apiClient from './api';
import { toast } from 'sonner';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'crypto';
  name: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  methodId: string;
  purpose: 'buy' | 'sell' | 'swap';
  description?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  details?: string;
}

export const paymentService = {
  // Get user's saved payment methods
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    try {
      // This would be a real API call in production
      // const response = await apiClient.get('/payment/methods');
      // return response.data;
      
      // Mock implementation for now
      return [
        {
          id: 'card_1',
          type: 'card',
          name: 'Visa ending in 4242',
          lastFour: '4242',
          expiryDate: '12/25',
          isDefault: true
        },
        {
          id: 'bank_1',
          type: 'bank',
          name: 'Chase Bank Account',
          lastFour: '6789',
          isDefault: false
        },
        {
          id: 'crypto_1',
          type: 'crypto',
          name: 'Ethereum Wallet',
          isDefault: false
        }
      ];
    } catch (error) {
      toast.error('Failed to fetch payment methods');
      console.error('Error fetching payment methods:', error);
      return [];
    }
  },
  
  // Process a payment
  processPayment: async (request: PaymentRequest): Promise<PaymentResponse> => {
    try {
      // This would be a real API call in production
      // const response = await apiClient.post('/payment/process', request);
      // return response.data;
      
      // Mock implementation for now
      console.log('Processing payment:', request);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success with 90% probability
      const isSuccess = Math.random() < 0.9;
      
      if (isSuccess) {
        const response: PaymentResponse = {
          success: true,
          transactionId: `tx_${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'completed'
        };
        
        toast.success(`Payment of ${request.amount} ${request.currency} processed successfully`);
        return response;
      } else {
        const response: PaymentResponse = {
          success: false,
          timestamp: new Date().toISOString(),
          status: 'failed',
          details: 'Transaction declined by payment processor'
        };
        
        toast.error(`Payment failed: ${response.details}`);
        return response;
      }
    } catch (error) {
      toast.error('Payment processing failed');
      console.error('Error processing payment:', error);
      
      return {
        success: false,
        timestamp: new Date().toISOString(),
        status: 'failed',
        details: 'Service unavailable'
      };
    }
  },
  
  // Add a new payment method
  addPaymentMethod: async (methodDetails: Partial<PaymentMethod>): Promise<PaymentMethod | null> => {
    try {
      // This would be a real API call in production
      // const response = await apiClient.post('/payment/methods', methodDetails);
      // return response.data;
      
      // Mock implementation for now
      console.log('Adding payment method:', methodDetails);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newMethod: PaymentMethod = {
        id: `method_${Date.now()}`,
        type: methodDetails.type || 'card',
        name: methodDetails.name || 'New Payment Method',
        lastFour: methodDetails.lastFour,
        expiryDate: methodDetails.expiryDate,
        isDefault: methodDetails.isDefault || false
      };
      
      toast.success('Payment method added successfully');
      return newMethod;
    } catch (error) {
      toast.error('Failed to add payment method');
      console.error('Error adding payment method:', error);
      return null;
    }
  }
};

export default paymentService;
