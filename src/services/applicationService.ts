
import apiClient from './api';
import { toast } from 'sonner';

export interface ApplicationData {
  name: string;
  email: string;
  stackingAmount: string;
  miningExperience: string;
  projectDescription: string;
  submittedAt?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  isAuthenticated: boolean;
}

export const applicationService = {
  // Submit application
  submitApplication: async (data: ApplicationData): Promise<boolean> => {
    try {
      // In a real app, this would call the actual API endpoint
      // const response = await apiClient.post('/applications', data);
      // return response.data.success;
      
      // For demonstration, simulating API call
      console.log('Submitting application data:', data);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate 95% success rate
      const isSuccess = Math.random() < 0.95;
      
      if (!isSuccess) {
        toast.error('Application submission failed. Please try again.');
        return false;
      }
      
      toast.success('Application submitted successfully!');
      return true;
    } catch (error) {
      toast.error('Failed to submit application');
      console.error('Error submitting application:', error);
      return false;
    }
  },
  
  // Get application status
  getApplicationStatus: async (email: string): Promise<string> => {
    try {
      // This would be a real API call in production
      // const response = await apiClient.get(`/applications/status/${email}`);
      // return response.data.status;
      
      // Mock implementation for now
      console.log(`Checking application status for: ${email}`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Return a random status
      const statuses = ['pending', 'approved', 'rejected', 'under review'];
      return statuses[Math.floor(Math.random() * statuses.length)];
    } catch (error) {
      console.error('Error fetching application status:', error);
      return 'unknown';
    }
  },

  // Login functionality
  login: async (data: LoginData): Promise<UserData | null> => {
    try {
      // This would be a real API call in production
      // const response = await apiClient.post('/auth/login', data);
      // return response.data.user;
      
      console.log('Login attempt:', data.email);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, accept any email with password "password"
      if (data.password === "password") {
        const userData: UserData = {
          id: `user_${Math.random().toString(36).substr(2, 9)}`,
          name: data.email.split('@')[0],
          email: data.email,
          isAuthenticated: true
        };
        
        // Store user in localStorage for persistence
        localStorage.setItem('sietkcoin_user', JSON.stringify(userData));
        
        toast.success('Login successful!');
        return userData;
      }
      
      toast.error('Invalid email or password');
      return null;
    } catch (error) {
      toast.error('Login failed. Please try again.');
      console.error('Error during login:', error);
      return null;
    }
  },

  // Check if user is logged in
  getCurrentUser: (): UserData | null => {
    try {
      const userJson = localStorage.getItem('sietkcoin_user');
      if (userJson) {
        return JSON.parse(userJson);
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Logout functionality
  logout: (): void => {
    try {
      localStorage.removeItem('sietkcoin_user');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
};

export default applicationService;
