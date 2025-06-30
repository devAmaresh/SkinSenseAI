import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView className="flex-1">
      <StatusBar style="light" />
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        className="flex-1"
      >
        <View className="flex-1 justify-between px-8 py-12">
          {/* Header Section */}
          <View className="flex-1 justify-center items-center">
            <View className="w-32 h-32 rounded-full bg-white/20 items-center justify-center mb-8">
              <Ionicons name="scan-outline" size={64} color="white" />
            </View>
            
            <Text className="text-5xl font-bold text-white text-center mb-4">
              SkinSenseAI
            </Text>
            
            <Text className="text-xl text-white/80 text-center mb-8 leading-relaxed">
              Your AI-powered skincare companion for personalized beauty solutions
            </Text>

            {/* Features */}
            <View className="space-y-4 w-full max-w-sm">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-4">
                  <Ionicons name="scan" size={16} color="white" />
                </View>
                <Text className="text-white/90 text-base">
                  Smart skin analysis
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-4">
                  <Ionicons name="sparkles" size={16} color="white" />
                </View>
                <Text className="text-white/90 text-base">
                  Personalized recommendations
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-4">
                  <Ionicons name="trending-up" size={16} color="white" />
                </View>
                <Text className="text-white/90 text-base">
                  Track your skin progress
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom Section */}
          <View className="space-y-4">
            {/* Get Started Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Signup')}
              className="bg-white rounded-2xl py-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Text className="text-purple-600 text-center text-lg font-bold">
                Get Started
              </Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              className="bg-white/10 rounded-2xl py-4 border border-white/30"
            >
              <Text className="text-white text-center text-lg font-semibold">
                I already have an account
              </Text>
            </TouchableOpacity>

            {/* Terms */}
            <Text className="text-white/60 text-center text-sm mt-4">
              By continuing, you agree to our{' '}
              <Text className="text-white/80 font-medium">Terms of Service</Text>
              {' '}and{' '}
              <Text className="text-white/80 font-medium">Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
