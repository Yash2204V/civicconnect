import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  resendVerification: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user data exists in localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setIsAuthenticated(true);
      
      // Set authorization header for API requests
      axios.defaults.headers.common['Authorization'] = parsedUser._id;
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      if (!response.data.isVerified) {
        throw new Error('Please verify your email before logging in');
      }

      const userData = {
        _id: response.data.userId,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        isVerified: response.data.isVerified
      };
      
      // Save user data to localStorage
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Set authorization header for API requests
      axios.defaults.headers.common['Authorization'] = userData._id;
      
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.data?.needsVerification) {
        throw new Error('Please verify your email before logging in');
      }
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      
      // Don't automatically log in after registration - require email verification
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async (email: string) => {
    try {
      await axios.post('http://localhost:5000/api/auth/resend-verification', { email });
    } catch (error: any) {
      console.error('Resend verification error:', error);
      throw new Error(error.response?.data?.message || 'Failed to resend verification email');
    }
  };

  const logout = () => {
    // Remove user data from localStorage
    localStorage.removeItem('userData');
    
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      register, 
      logout, 
      loading,
      resendVerification 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};