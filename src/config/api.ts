// Central API configuration
// Uses environment variable or defaults to localhost:3001
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    changePassword: `${API_BASE_URL}/api/auth/change-password`,
  },
  creators: `${API_BASE_URL}/api/creators`,
  content: `${API_BASE_URL}/api/content`,
  payments: `${API_BASE_URL}/api/payments`,
  paypal: `${API_BASE_URL}/api/paypal`,
  messages: `${API_BASE_URL}/api/messages`,
  subscriptions: `${API_BASE_URL}/api/payments/subscriptions`,
};
