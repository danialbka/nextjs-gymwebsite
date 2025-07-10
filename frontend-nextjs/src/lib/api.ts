import { ApiConfig } from './types';
import { getToken } from './auth';

// API Configuration
const API_CONFIG: ApiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000
};

// Get authorization headers
export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Utility functions for API calls
export async function fetchAPI<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      ...options,
      signal: AbortSignal.timeout(API_CONFIG.timeout || 10000)
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      
      try {
        // Try to get error message from response body
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }
    
    return await response.json() as T;
  } catch (error) {
    // Don't log in production to avoid console spam
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error);
    }
    throw error;
  }
}

// Utility function to validate required fields
export function validateRequiredFields(data: Record<string, unknown> | object, requiredFields: string[]): string[] {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    const value = (data as Record<string, unknown>)[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missingFields.push(field);
    }
  }
  
  return missingFields;
}

// Export API config
export { API_CONFIG }; 