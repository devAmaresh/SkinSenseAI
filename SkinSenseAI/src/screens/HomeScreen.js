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
  const quickActions = [
    { icon: 'scan-outline', label: 'Scan Skin', color: '#00f5ff' },
    { icon: 'analytics-outline', label: 'Progress', color: '#0080ff' },
    { icon: 'heart-outline', label: 'Routine', color: '#8000ff' },
  ];

  return (
    <SafeAreaView className="flex-1">
      <StatusBar style="light" />
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-12 pb-8">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-gray-400 text-lg">Welcome back!</Text>
                <Text className="text-2xl font-bold text-white">Your Skin Journey</Text>
              </View>
              <TouchableOpacity 
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <Ionicons name="person-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="px-6 mb-8">
            <Text className="text-xl font-semibold text-white mb-4">Quick Actions</Text>
            <View className="flex-row space-x-4">
              {quickActions.map((action, index) => (
                <TouchableOpacity 
                  key={index}
                  className="flex-1 rounded-2xl p-4 items-center"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <View 
                    className="w-12 h-12 rounded-full items-center justify-center mb-2"
                    style={{
                      backgroundColor: `${action.color}20`,
                      borderWidth: 1,
                      borderColor: `${action.color}40`,
                    }}
                  >
                    <Ionicons name={action.icon} size={24} color={action.color} />
                  </View>
                  <Text className="text-gray-300 text-sm font-medium">{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Main Content */}
          <View 
            className="flex-1 rounded-t-3xl px-6 py-8"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderTopWidth: 1,
              borderTopColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <Text className="text-2xl font-bold text-white mb-6">
              Today's Recommendations
            </Text>
            
            <View 
              className="rounded-2xl p-6 mb-6"
              style={{
                backgroundColor: 'rgba(0, 245, 255, 0.05)',
                borderWidth: 1,
                borderColor: 'rgba(0, 245, 255, 0.1)',
              }}
            >
              <Text className="text-lg font-semibold text-cyan-400 mb-2">
                Your Skin Type: Combination
              </Text>
              <Text className="text-gray-300">
                Based on your assessment, we've personalized your skincare routine.
              </Text>
            </View>

            <View className="space-y-4">
              {[
                {
                  title: 'Morning Routine',
                  description: 'Gentle cleanser → Vitamin C serum → Moisturizer → SPF',
                  icon: 'sunny-outline',
                  color: '#00f5ff'
                },
                {
                  title: 'Evening Routine',
                  description: 'Double cleanse → Retinol (3x/week) → Hydrating serum → Night cream',
                  icon: 'moon-outline',
                  color: '#8000ff'
                }
              ].map((routine, index) => (
                <View 
                  key={index}
                  className="rounded-2xl p-4"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <View className="flex-row items-center mb-2">
                    <View 
                      className="w-8 h-8 rounded-full items-center justify-center mr-3"
                      style={{
                        backgroundColor: `${routine.color}20`,
                        borderWidth: 1,
                        borderColor: `${routine.color}40`,
                      }}
                    >
                      <Ionicons name={routine.icon} size={16} color={routine.color} />
                    </View>
                    <Text className="text-lg font-semibold text-white">
                      {routine.title}
                    </Text>
                  </View>
                  <Text className="text-gray-300 ml-11">
                    {routine.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
