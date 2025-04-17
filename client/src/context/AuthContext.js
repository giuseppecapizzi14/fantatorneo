import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Function to check token validity and refresh user data
  const checkAuthStatus = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    
    try {
      // Set default headers for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await axios.get('/api/auth/me');
      setUser(response.data);
      setError(null);
    } catch (err) {
      console.error('Auth check failed:', err);
      
      // Only logout if it's an authentication error (401)
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
      }
      
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Check auth status when component mounts
  useEffect(() => {
    checkAuthStatus();
    
    // Set up an interval to periodically check auth status (every 5 minutes)
    const intervalId = setInterval(() => {
      checkAuthStatus();
    }, 5 * 60 * 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [checkAuthStatus]);
  
  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setError(null);
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };
  
  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/register', userData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      logout, 
      register,
      checkAuthStatus, // Export this function to allow manual refresh
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};