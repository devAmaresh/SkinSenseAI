import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const userData = await ApiService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.log('User not authenticated:', error);
      setUser(null);
      setIsAuthenticated(false);
      await ApiService.removeAuthToken();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await ApiService.login(credentials);
      const userData = await ApiService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await ApiService.register(userData);
      const userDetails = await ApiService.getCurrentUser();
      setUser(userDetails);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await ApiService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear authentication state
      setUser(null);
      setIsAuthenticated(false);
      setIsNewUser(false);
      
      // Clear stored tokens
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('refreshToken');
      
      // Don't navigate manually - GuestGuard will handle it
    }
  };

  const deleteAccount = async () => {
    try {
      await ApiService.deleteAccount();
      
      // Clear authentication state
      setUser(null);
      setIsAuthenticated(false);
      setIsNewUser(false);
      
      // Clear stored tokens
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('refreshToken');
      
      // Don't navigate manually - GuestGuard will handle it
      
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkAuthStatus,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};