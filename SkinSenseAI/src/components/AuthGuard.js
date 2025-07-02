import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../contexts/AuthContext';

export const AuthGuard = ({ children, fallback }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1">
        <LinearGradient
          colors={['#000000', '#1a1a1a', '#000000']}
          className="flex-1 justify-center items-center"
        >
          <View className="items-center">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{
                backgroundColor: 'rgba(0, 245, 255, 0.1)',
                borderWidth: 2,
                borderColor: 'rgba(0, 245, 255, 0.3)',
              }}
            >
              <Ionicons name="hourglass" size={32} color="#00f5ff" />
            </View>
            <Text className="text-white text-lg font-semibold">
              Loading...
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return fallback || null;
  }

  return children;
};

export const GuestGuard = ({ children, fallback }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1">
        <LinearGradient
          colors={['#000000', '#1a1a1a', '#000000']}
          className="flex-1 justify-center items-center"
        >
          <View className="items-center">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{
                backgroundColor: 'rgba(0, 245, 255, 0.1)',
                borderWidth: 2,
                borderColor: 'rgba(0, 245, 255, 0.3)',
              }}
            >
              <Ionicons name="hourglass" size={32} color="#00f5ff" />
            </View>
            <Text className="text-white text-lg font-semibold">
              Loading...
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (isAuthenticated) {
    return fallback || null;
  }

  return children;
};