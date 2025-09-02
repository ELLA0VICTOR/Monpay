import axios from 'axios';
import { BACKEND } from './constants';

const api = axios.create({ 
  baseURL: BACKEND,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Set auth token for all requests
export function setAuth(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('monpay_jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('monpay_jwt');
      localStorage.removeItem('monpay_address');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH ENDPOINTS
// ============================================

export const auth = {
  // Get nonce for signature
  getNonce: (address) => api.get(`/api/auth/nonce/${address}`),
  
  // Verify signature and get JWT
  verifySignature: (data) => api.post('/api/auth/verify', data),
  
  // Get current user data
  me: () => api.get('/api/auth/me'),
  
  // Health check
  health: () => api.get('/health')
};

// ============================================
// CREATOR ENDPOINTS
// ============================================

export const creator = {
  // Get all creators for marketplace
  getAll: () => api.get('/api/creator/all'),
  
  // Get specific creator details
  getDetails: (address) => api.get(`/api/creator/${address}`),
  
  // Create/update creator profile
  updateProfile: (address, data) => api.put(`/api/creator/${address}`, data),
  
  // Get creator analytics
  getAnalytics: (address) => api.get(`/api/creator/${address}/analytics`),
  
  // Delete creator (if needed)
  delete: (address) => api.delete(`/api/creator/${address}`)
};

// ============================================
// SUBSCRIPTION ENDPOINTS
// ============================================

export const subscription = {
  // Get user's subscriptions
  getMine: () => api.get('/api/subscription/mine'),
  
  // Get all subscriptions for a creator
  getByCreator: (creatorAddress) => api.get(`/api/subscription/creator/${creatorAddress}`),
  
  // Create subscription (called after blockchain tx)
  create: (data) => api.post('/api/subscription', data),
  
  // Update subscription status
  update: (id, data) => api.put(`/api/subscription/${id}`, data),
  
  // Cancel subscription
  cancel: (id) => api.delete(`/api/subscription/${id}`),
  
  // Check subscription status
  checkStatus: (planId, subscriber) => api.get(`/api/subscription/status/${planId}/${subscriber}`)
};

// ============================================
// CONTENT ENDPOINTS
// ============================================

export const content = {
  // Get content by creator
  getByCreator: (creatorAddress) => api.get(`/api/content/creator/${creatorAddress}`),
  
  // Get specific content (with access control)
  getById: (id) => api.get(`/api/content/${id}`),
  
  // Upload new content
  create: (data) => api.post('/api/content', data),
  
  // Update content
  update: (id, data) => api.put(`/api/content/${id}`, data),
  
  // Delete content
  delete: (id) => api.delete(`/api/content/${id}`),
  
  // Check content access
  checkAccess: (contentId, subscriber) => api.get(`/api/content/${contentId}/access/${subscriber}`)
};

// ============================================
// PAYMENT ENDPOINTS
// ============================================

export const payment = {
  // Get payment history
  getHistory: () => api.get('/api/payment/history'),
  
  // Get payment by ID
  getById: (id) => api.get(`/api/payment/${id}`),
  
  // Create payment record
  create: (data) => api.post('/api/payment', data),
  
  // Update payment status
  updateStatus: (id, status) => api.put(`/api/payment/${id}/status`, { status })
};

// ============================================
// RELAYER ENDPOINTS
// ============================================

export const relayer = {
  // Get nonce for meta transaction
  getNonce: (address) => api.get('/api/relayer/nonce', { params: { address } }),
  
  // Submit meta transaction
  forward: (data) => api.post('/api/relayer/forward', data),
  
  // Get transaction status
  getStatus: (txHash) => api.get(`/api/relayer/status/${txHash}`)
};

// Export default api instance
export default api;