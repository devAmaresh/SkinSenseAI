import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

export function AuthGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // User is not authenticated, redirect to Welcome
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    }
  }, [isAuthenticated, isLoading, navigation]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#000',
        }}
      >
        <ActivityIndicator size="large" color="#00f5ff" />
      </View>
    );
  }

  // Only render children if authenticated
  return isAuthenticated ? children : null;
}

export function GuestGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // User is authenticated, redirect to Home
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  }, [isAuthenticated, isLoading, navigation]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#000',
        }}
      >
        <ActivityIndicator size="large" color="#00f5ff" />
      </View>
    );
  }

  // Only render children if NOT authenticated
  return !isAuthenticated ? children : null;
}