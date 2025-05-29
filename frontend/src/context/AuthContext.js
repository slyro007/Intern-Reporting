import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication on mount
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5678/webhook/auth-login', {
        email,
        password
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Handle n8n "Workflow was started" response
      if (response.data.includes && response.data.includes('Workflow was started')) {
        // Wait a moment and try to get the actual result
        await new Promise(resolve => setTimeout(resolve, 1000));
        throw new Error('Authentication service is processing your request. Please try again in a moment.');
      }

      // Handle actual response data
      let authData;
      if (typeof response.data === 'string') {
        try {
          authData = JSON.parse(response.data);
        } catch {
          // If it's not JSON, treat as error
          throw new Error('Invalid response from authentication service');
        }
      } else {
        authData = response.data;
      }

      if (authData.success && authData.user) {
        const userData = {
          ...authData.user,
          loginTime: authData.loginTime,
          token: 'authenticated'
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        const errorMessage = authData.error || 'Invalid credentials';
        throw new Error(errorMessage);
      }

    } catch (error) {
      console.error('Login error:', error);
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Login request timed out. Please check your connection and try again.');
      }
      
      if (error.response?.status === 404) {
        throw new Error('Authentication service not available. Please contact support.');
      }
      
      if (error.message.includes('Network Error')) {
        throw new Error('Unable to connect to authentication service. Please check your connection.');
      }

      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Helper function to check if user has specific permission
  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false;
  };

  // Helper function to check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Helper function to check if user is intern
  const isIntern = () => {
    return user?.role === 'intern';
  };

  const value = {
    user,
    login,
    logout,
    loading,
    hasPermission,
    isAdmin,
    isIntern
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 