import { createContext, useContext, useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import api, { setAuth } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      checkExistingAuth();
    } else {
      logout();
    }
  }, [address, isConnected]);

  async function checkExistingAuth() {
    const token = localStorage.getItem('monpay_jwt');
    const savedAddress = localStorage.getItem('monpay_address');
    
    if (token && savedAddress === address) {
      setAuth(token);
      try {
        const { data } = await api.get('/api/auth/me');
        setUser(data);
        setIsAuthenticated(true);
      } catch (error) {
        // Token is invalid, clear it
        logout();
      }
    } else {
      // Address changed or no token, need to re-authenticate
      localStorage.removeItem('monpay_jwt');
      localStorage.removeItem('monpay_address');
    }
  }

  async function login() {
    if (!address) {
      toast.error('Please connect your wallet first');
      return false;
    }

    try {
      setLoading(true);
      
      // Get nonce from backend
      const { data: nonceData } = await api.get(`/api/auth/nonce/${address}`);
      const nonce = nonceData.nonce;
      
      // Create sign message
      const message = `Sign this message to authenticate with MonPay.\n\nNonce: ${nonce}\nAddress: ${address}`;
      
      // Sign message
      const signature = await signMessageAsync({ message });
      
      // Verify signature and get JWT
      const { data: authData } = await api.post('/api/auth/verify', {
        address,
        message,
        signature
      });
      
      // Store auth data
      localStorage.setItem('monpay_jwt', authData.token);
      localStorage.setItem('monpay_address', address);
      setAuth(authData.token);
      setUser(authData.user);
      setIsAuthenticated(true);
      
      toast.success('Successfully authenticated!');
      return true;
      
    } catch (error) {
      console.error('Authentication failed:', error);
      toast.error('Authentication failed: ' + (error.message || 'Unknown error'));
      return false;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('monpay_jwt');
    localStorage.removeItem('monpay_address');
    setAuth(null);
    setUser(null);
    setIsAuthenticated(false);
  }

  async function updateProfile(profileData) {
    try {
      const { data } = await api.put(`/api/creator/${address}`, profileData);
      setUser({ ...user, ...data });
      return true;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateProfile,
    address
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}