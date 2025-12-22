import { supabase } from '@/integrations/supabase/client';
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
      console.log('Submitting application data:', data);
      
      // Simulate network delay for demo purposes
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

  // Login functionality using Supabase Auth
  login: async (data: LoginData): Promise<UserData | null> => {
    try {
      console.log('Login attempt:', data.email);
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error('Login error:', error);
        toast.error('Invalid email or password');
        return null;
      }

      if (authData.user) {
        const userData: UserData = {
          id: authData.user.id,
          name: authData.user.email?.split('@')[0] || 'User',
          email: authData.user.email || '',
          isAuthenticated: true
        };
        
        toast.success('Login successful!');
        return userData;
      }
      
      return null;
    } catch (error) {
      toast.error('Login failed. Please try again.');
      console.error('Error during login:', error);
      return null;
    }
  },

  // Check if user is logged in using Supabase session
  getCurrentUser: async (): Promise<UserData | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        return {
          id: session.user.id,
          name: session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          isAuthenticated: true
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Logout functionality using Supabase Auth
  logout: async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast.error('Logout failed');
        return;
      }
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
};

export default applicationService;
