import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', 'system'
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themeMode');
      if (savedTheme) {
        setThemeMode(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (mode) => {
    try {
      setThemeMode(mode);
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Determine active theme based on mode and system preference
  const activeTheme = themeMode === 'system' 
    ? (systemColorScheme === 'dark' ? 'dark' : 'light')
    : themeMode;

  const isDark = activeTheme === 'dark';

  // Theme colors
  const colors = {
    // Background colors
    background: isDark ? '#000000' : '#FFFFFF',
    surface: isDark ? '#1a1a1a' : '#F5F5F5',
    surfaceLight: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    surfaceBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    
    // Text colors
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#888888' : '#666666',
    textTertiary: isDark ? '#666666' : '#999999',
    
    // Accent colors (remain consistent)
    primary: '#00f5ff',
    primaryBlue: '#0080ff',
    primaryPurple: '#8000ff',
    
    // Status colors
    success: '#00ff88',
    warning: '#ffaa00',
    error: '#ff4444',
    info: '#00f5ff',
    
    // Gradient colors
    gradientStart: isDark ? '#000000' : '#FFFFFF',
    gradientMiddle: isDark ? '#1a1a1a' : '#F5F5F5',
    gradientEnd: isDark ? '#000000' : '#FFFFFF',
  };

  const value = {
    themeMode,
    setTheme,
    isDark,
    colors,
    isLoading,
    activeTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
