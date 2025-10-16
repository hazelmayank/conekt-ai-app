import { API_CONFIG, ApiResponse, AuthResponse, User } from '../types/api';
import { mockResponses } from './mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  private baseURL: string;
  private token: string | null = null;
  private pendingRequests = new Map<string, Promise<any>>();

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    // Load token from storage if available
    this.loadToken();
  }

  async loadToken() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      this.token = token;
      console.log('Token loaded from storage:', token ? 'Present' : 'Not found');
    } catch (error) {
      console.error('Error loading token:', error);
    }
  }

  async saveToken(token: string) {
    try {
      this.token = token;
      await AsyncStorage.setItem('auth_token', token);
      console.log('Token saved to storage successfully');
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  private async clearToken() {
    try {
      this.token = null;
      await AsyncStorage.removeItem('auth_token');
      console.log('Token cleared from storage');
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  private getHeaders(): Record<string, string> {
    const headers = { ...API_CONFIG.HEADERS };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const requestKey = this.generateRequestKey(endpoint, options);
    
    // Check if request is already pending
    if (this.pendingRequests.has(requestKey)) {
      console.log(`🔄 Request deduplication: ${endpoint}`);
      return this.pendingRequests.get(requestKey);
    }

    const requestPromise = this.makeRequest<T>(endpoint, options);
    this.pendingRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingRequests.delete(requestKey);
    }
  }

  private generateRequestKey(endpoint: string, options: RequestInit): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${endpoint}:${body}`;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If we can't parse error response, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // Handle network errors specifically
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Network error: Unable to connect to server. Please check your internet connection and ensure the backend server is running.');
      }
      
      throw error;
    }
  }

  // Authentication Methods
  async sendLoginOTP(phone: string): Promise<AuthResponse> {
    if (API_CONFIG.USE_MOCK_DATA) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockResponses.sendLoginOTP();
    }
    
    return this.request<AuthResponse>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async verifyLoginOTP(phone: string, otp: string): Promise<AuthResponse> {
    if (API_CONFIG.USE_MOCK_DATA) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = mockResponses.verifyLoginOTP();
      await this.saveToken(response.token!);
      
      // Store user data
      if (response.user) {
        await this.storeUser(response.user);
      }
      
      return response;
    }
    
    const response = await this.request<AuthResponse>('/admin/auth/login/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });

    // Handle the response format from your backend
    if (response.token) {
      await this.saveToken(response.token);
    }

    // Store user data
    if (response.user) {
      await this.storeUser(response.user);
    }

    return response;
  }

  async createAdmin(phone: string, name: string): Promise<AuthResponse> {
    if (API_CONFIG.USE_MOCK_DATA) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockResponses.createAdmin();
    }
    
    return this.request<AuthResponse>('/admin/auth/create-admin', {
      method: 'POST',
      body: JSON.stringify({ phone, name }),
    });
  }

  async verifyAdminAccount(phone: string, otp: string): Promise<AuthResponse> {
    if (API_CONFIG.USE_MOCK_DATA) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = mockResponses.verifyAdminAccount();
      // Store JWT token if available
      if (response.token) {
        await this.saveToken(response.token);
      }
      
      // Store user data
      if (response.user) {
        await this.storeUser(response.user);
      }
      
      return response;
    }
    
    const response = await this.request<AuthResponse>('/admin/auth/create-admin/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });

    // Store JWT token if available (same as login verification)
    if (response.token) {
      await this.saveToken(response.token);
      console.log('JWT token stored from admin account verification');
    }

    // Store user data
    if (response.user) {
      await this.storeUser(response.user);
    }

    return response;
  }

  async logout(): Promise<void> {
    await this.clearToken();
    await AsyncStorage.removeItem('user_data');
  }

  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  async storeUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      console.log('User data stored successfully');
    } catch (error) {
      console.error('Error storing user:', error);
    }
  }

  // Utility Methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
  }
}

export const apiService = new ApiService();
