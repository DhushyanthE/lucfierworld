
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../config/env';

// Environment configuration
const getApiConfig = () => {
  // In Vite, environment variables must be prefixed with VITE_
  // and accessed through import.meta.env
  const apiUrl = API_CONFIG.BASE_URL;
  const apiKey = API_CONFIG.API_KEY; // Now this will exist
  const apiTimeout = API_CONFIG.TIMEOUT;
  
  return {
    apiUrl,
    apiKey,
    apiTimeout
  };
};

// API configuration
const { apiUrl, apiKey, apiTimeout } = getApiConfig();

// Create API client with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  timeout: apiTimeout
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // You can modify request config here (add headers, authentication, etc)
    const modifiedConfig = { ...config };
    
    // Add timestamp to requests to prevent caching
    if (modifiedConfig.params) {
      modifiedConfig.params = { ...modifiedConfig.params, _t: Date.now() };
    } else {
      modifiedConfig.params = { _t: Date.now() };
    }
    
    return modifiedConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // You can modify successful responses here
    return response;
  },
  (error) => {
    // Handle API errors globally
    const errorData = error.response?.data || {};
    const errorStatus = error.response?.status || 0;
    const errorMethod = error.config?.method?.toUpperCase() || 'UNKNOWN';
    const errorUrl = error.config?.url || 'UNKNOWN';
    
    console.error(`API Error [${errorStatus}] ${errorMethod} ${errorUrl}:`, errorData);
    
    // Handle rate limiting
    if (errorStatus === 429) {
      console.warn('API rate limit reached. Retrying after cooldown...');
      // Implement retry logic here if needed
    }
    
    // Handle authentication errors
    if (errorStatus === 401) {
      // Handle token refresh or redirect to login
      console.warn('Authentication error: Token may be expired or invalid');
    }
    
    return Promise.reject(error);
  }
);

// API service functions
const apiService = {
  // Core request methods
  get: <T = any>(endpoint: string, params?: object): Promise<T> => 
    apiClient.get(endpoint, { params }).then(response => response.data),
  
  post: <T = any>(endpoint: string, data?: object): Promise<T> => 
    apiClient.post(endpoint, data).then(response => response.data),
  
  put: <T = any>(endpoint: string, data?: object): Promise<T> => 
    apiClient.put(endpoint, data).then(response => response.data),
  
  delete: <T = any>(endpoint: string): Promise<T> => 
    apiClient.delete(endpoint).then(response => response.data),
  
  // Quantum API specific methods
  getQuantumStatus: () => apiClient.get('/quantum/status').then(response => response.data),
  
  submitQuantumTask: (taskType: string, payload: object) => 
    apiClient.post('/quantum/tasks', { taskType, payload }).then(response => response.data),
  
  getQuantumTaskResult: (taskId: string) => 
    apiClient.get(`/quantum/tasks/${taskId}`).then(response => response.data),
  
  // Health check for API connectivity testing
  healthCheck: () => apiClient.get('/health').then(response => response.data),
  
  // Client configuration accessor
  getConfig: () => ({
    baseURL: apiClient.defaults.baseURL,
    timeout: apiClient.defaults.timeout
  })
};

export default apiService;
