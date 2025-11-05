/**
 * API Configuration
 * Centralized configuration for API base URL and endpoints
 */

// Get the base API URL from environment variables
// Vite exposes env variables that start with VITE_ prefix via import.meta.env
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/api';

// Export for backward compatibility
export const API_URL = API_BASE_URL;

// You can also export specific endpoint builders here if needed
export const getAuthEndpoint = (path: string) => `${API_BASE_URL}${path}`;
export const getApiEndpoint = (path: string) => `${API_BASE_URL}${path}`;
