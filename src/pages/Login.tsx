import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegistering) {
        // Registration logic
        if (!name || !email || !password) {
          setError('All fields are required');
          return;
        }
        
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }
        
        // Call the register function from AuthContext
        await register(name, email, password);
        navigate('/dashboard');
      } else {
        // Login logic
        await login(email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      console.log(err);
      setError(isRegistering ? 'Registration failed' : 'Invalid email or password');
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="bg-blue-500 p-3 rounded-full">
              {isRegistering ? (
                <UserPlus className="h-8 w-8 text-white" />
              ) : (
                <Lock className="h-8 w-8 text-white" />
              )}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            {isRegistering ? 'Create an Account' : 'Welcome Back'}
          </h2>
          <p className="text-center text-gray-600 mb-8">
            {isRegistering ? 'Join CivicConnect today' : 'Sign in to CivicConnect'}
          </p>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm"
            >
              {error}
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit}>
            {isRegistering && (
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                    required={isRegistering}
                  />
                </div>
              </div>
            )}
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder={isRegistering ? "Create a password" : "Enter your password"}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {!isRegistering && (
                <div className="flex justify-end mt-2">
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Forgot password?
                  </a>
                </div>
              )}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isRegistering ? 'Creating account...' : 'Signing in...'}
                </div>
              ) : (
                isRegistering ? 'Create Account' : 'Sign in'
              )}
            </motion.button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isRegistering ? 'Already have an account?' : 'Don\'t have an account?'}{' '}
              <button 
                onClick={toggleMode}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {isRegistering ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
          
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>For demo purposes, you can use:</p>
            <p>Email: user@example.com | Password: admin123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;