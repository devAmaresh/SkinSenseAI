import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView className="flex-1">
      <StatusBar style="light" />
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-12 pb-8">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white/80 text-lg">Welcome back!</Text>
                <Text className="text-2xl font-bold text-white">Your Skin Journey</Text>
              </View>
              <TouchableOpacity className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
                <Ionicons name="person-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="px-6 mb-8">
            <Text className="text-xl font-semibold text-white mb-4">Quick Actions</Text>
            <View className="flex-row space-x-4">
              <TouchableOpacity className="flex-1 bg-white/10 rounded-2xl p-4 items-center border border-white/20">
                <Ionicons name="scan-outline" size={32} color="white" />
                <Text className="text-white text-sm font-medium mt-2">Scan Skin</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-white/10 rounded-2xl p-4 items-center border border-white/20">
                <Ionicons name="analytics-outline" size={32} color="white" />
                <Text className="text-white text-sm font-medium mt-2">Progress</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-white/10 rounded-2xl p-4 items-center border border-white/20">
                <Ionicons name="heart-outline" size={32} color="white" />
                <Text className="text-white text-sm font-medium mt-2">Routine</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Content */}
          <View className="flex-1 bg-white rounded-t-3xl px-6 py-8">
            <Text className="text-2xl font-bold text-gray-800 mb-6">
              Today's Recommendations
            </Text>
            
            <View className="bg-purple-50 rounded-2xl p-6 mb-6">
              <Text className="text-lg font-semibold text-purple-600 mb-2">
                Your Skin Type: Combination
              </Text>
              <Text className="text-gray-600">
                Based on your assessment, we've personalized your skincare routine.
              </Text>
            </View>

            <View className="space-y-4">
              <View className="bg-gray-50 rounded-2xl p-4">
                <Text className="text-lg font-semibold text-gray-800 mb-2">
                  Morning Routine
                </Text>
                <Text className="text-gray-600">
                  Gentle cleanser → Vitamin C serum → Moisturizer → SPF
                </Text>
              </View>

              <View className="bg-gray-50 rounded-2xl p-4">
                <Text className="text-lg font-semibold text-gray-800 mb-2">
                  Evening Routine
                </Text>
                <Text className="text-gray-600">
                  Double cleanse → Retinol (3x/week) → Hydrating serum → Night cream
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
