import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  const { isDark, colors } = useTheme();
  
  return (
    <SafeAreaView className="flex-1">
      <StatusBar style={isDark ? "light" : "dark"} />
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMiddle, colors.gradientEnd]}
        className="flex-1"
      >
        <View className="flex-1 justify-between px-8 py-12">
          {/* Header Section */}
          <View className="flex-1 justify-center items-center">
            <View 
              className="w-32 h-32 rounded-full items-center justify-center mb-8"
              style={{
                backgroundColor: colors.surfaceLight,
                borderWidth: 1,
                borderColor: colors.surfaceBorder,
                backdropFilter: 'blur(20px)',
              }}
            >
              <LinearGradient
                colors={['#00f5ff', '#0080ff', '#8000ff']}
                className="w-16 h-16 rounded-full items-center justify-center"
              >
                <Ionicons name="scan-outline" size={32} color={isDark ? "#000" : "#FFF"} />
              </LinearGradient>
            </View>
            
            <Text className="text-5xl font-bold text-center mb-4" style={{ color: colors.text }}>
              SkinSense
              <Text style={{ 
                background: 'linear-gradient(45deg, #00f5ff, #0080ff, #8000ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent' 
              }}>AI</Text>
            </Text>
            
            <Text className="text-xl text-center mb-8 leading-relaxed" style={{ color: colors.textSecondary }}>
              Your AI-powered skincare companion for{'\n'}personalized beauty solutions
            </Text>

            {/* Features */}
            <View className="space-y-4 w-full max-w-sm gap-2">
              {[
                { icon: 'scan', text: 'Smart skin analysis' },
                { icon: 'sparkles', text: 'AI-powered recommendations' },
                { icon: 'trending-up', text: 'Track skin progress' }
              ].map((feature, index) => (
                <View 
                  key={index}
                  className="flex-row items-center p-3 rounded-2xl"
                  style={{
                    backgroundColor: colors.surfaceLight,
                    borderWidth: 1,
                    borderColor: colors.surfaceBorder,
                  }}
                >
                  <View 
                    className="w-10 h-10 rounded-full items-center justify-center mr-4"
                    style={{
                      backgroundColor: 'rgba(0, 245, 255, 0.1)',
                      borderWidth: 1,
                      borderColor: 'rgba(0, 245, 255, 0.2)',
                    }}
                  >
                    <Ionicons name={feature.icon} size={18} color="#00f5ff" />
                  </View>
                  <Text className="text-base" style={{ color: colors.text }}>{feature.text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Bottom Section */}
          <View className="space-y-4">
            {/* Get Started Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Signup')}
              className="rounded-2xl py-4 overflow-hidden"
            >
              <LinearGradient
                colors={['#00f5ff', '#0080ff', '#8000ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-4 rounded-2xl"
              >
                <Text className="text-black text-center text-lg font-bold">
                  Get Started
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              className="rounded-2xl py-4"
              style={{
                backgroundColor: colors.surfaceLight,
                borderWidth: 1,
                borderColor: colors.surfaceBorder,
              }}
            >
              <Text className="text-center text-lg font-semibold" style={{ color: colors.text }}>
                I already have an account
              </Text>
            </TouchableOpacity>

            {/* Terms */}
            <Text className="text-center text-sm mt-4" style={{ color: colors.textSecondary }}>
              By continuing, you agree to our{' '}
              <Text className="font-medium" style={{ color: colors.textSecondary }}>Terms of Service</Text>
              {' '}and{' '}
              <Text className="font-medium" style={{ color: colors.textSecondary }}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
