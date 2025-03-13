import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string, address: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
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
      const userData = {
        _id: response.data.userId,
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone,
        address: response.data.address,
        role: response.data.role
      };
      
      // Save user data to localStorage
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Set authorization header for API requests
      axios.defaults.headers.common['Authorization'] = userData._id;
      
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone: string, address: string) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', { 
        name, 
        email, 
        password,
        phone,
        address
      });
      
      const userData = {
        _id: response.data.userId,
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone,
        address: response.data.address,
        role: response.data.role
      };

      // Save user data to localStorage
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Set authorization header for API requests
      axios.defaults.headers.common['Authorization'] = userData._id;
      
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed');
    } finally {
      setLoading(false);
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
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, loading }}>
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