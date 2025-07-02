import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import ApiService from '../services/api';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [skinProfile, setSkinProfile] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await ApiService.getCurrentUser();
      setUser(userData);
      
      try {
        const skinData = await ApiService.getSkinProfile();
        setSkinProfile(skinData);
        console.log('Skin profile loaded:', skinData);
      } catch (skinError) {
        console.log('No skin profile found');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            }
          },
        },
      ]
    );
  };

  const quickActions = [
    { 
      icon: 'scan-outline', 
      label: 'Analyze Product', 
      color: '#00f5ff',
      onPress: () => navigation.navigate('ProductAnalysis')
    },
    { 
      icon: 'chatbubbles-outline', 
      label: 'AI Chat', 
      color: '#00ff88',
      onPress: () => navigation.navigate('ChatSessions')
    },
    { 
      icon: 'analytics-outline', 
      label: 'My Analyses', 
      color: '#0080ff',
      onPress: () => navigation.navigate('MyAnalyses')
    }
  ];

  return (
    <SafeAreaView className="flex-1" >
      <StatusBar style="light" />
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-1 pb-8">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-gray-400 text-lg">Welcome back!</Text>
                <Text className="text-2xl font-bold text-white">
                  {user?.full_name || 'User'}
                </Text>
                {skinProfile && (
                  <View 
                    className="mt-2 px-3 py-1 rounded-full self-start"
                    style={{
                      backgroundColor: 'rgba(0, 245, 255, 0.1)',
                      borderWidth: 1,
                      borderColor: 'rgba(0, 245, 255, 0.2)',
                    }}
                  >
                    <Text className="text-cyan-400 text-sm font-medium">
                      {skinProfile.skin_type.toUpperCase()} SKIN
                    </Text>
                  </View>
                )}
              </View>
              
              <View className="flex-row space-x-3">
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Profile')}
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Ionicons name="person-outline" size={24} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={handleLogout}
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 0, 0, 0.2)',
                  }}
                >
                  <Ionicons name="log-out-outline" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="px-6 mb-8">
            <Text className="text-xl font-semibold text-white mb-4">Quick Actions</Text>
            <View className="flex-row space-x-4">
              {quickActions.map((action, index) => (
                <TouchableOpacity 
                  key={index}
                  onPress={action.onPress}
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
                  <Text className="text-gray-300 text-sm font-medium text-center">{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Skin Assessment Card */}
          {!skinProfile && (
            <View className="px-6 mb-8">
              <TouchableOpacity
                onPress={() => navigation.navigate('SkinTypeQuestions')}
                className="rounded-2xl p-6"
                style={{
                  backgroundColor: 'rgba(0, 245, 255, 0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(0, 245, 255, 0.1)',
                }}
              >
                <View className="flex-row items-center mb-3">
                  <Ionicons name="flask-outline" size={24} color="#00f5ff" />
                  <Text className="text-lg font-semibold text-cyan-400 ml-2">
                    Complete Your Skin Assessment
                  </Text>
                </View>
                <Text className="text-gray-300 mb-3">
                  Take our quick assessment to get personalized product recommendations.
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-cyan-400 font-medium">Start Assessment</Text>
                  <Ionicons name="chevron-forward" size={16} color="#00f5ff" className="ml-2" />
                </View>
              </TouchableOpacity>
            </View>
          )}

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
              {skinProfile ? "Today's Recommendations" : "Getting Started"}
            </Text>
            
            {skinProfile ? (
              <View 
                className="rounded-2xl p-6 mb-6"
                style={{
                  backgroundColor: 'rgba(0, 245, 255, 0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(0, 245, 255, 0.1)',
                }}
              >
                <Text className="text-lg font-semibold text-cyan-400 mb-2">
                  Your Skin Type: {skinProfile.skin_type.toUpperCase()}
                </Text>
                <Text className="text-gray-300">
                  Based on your assessment, we've personalized your skincare routine.
                </Text>
              </View>
            ) : (
              <View 
                className="rounded-2xl p-6 mb-6"
                style={{
                  backgroundColor: 'rgba(128, 0, 255, 0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(128, 0, 255, 0.1)',
                }}
              >
                <Text className="text-lg font-semibold text-purple-400 mb-2">
                  Welcome to SkinSenseAI!
                </Text>
                <Text className="text-gray-300">
                  Complete your skin assessment to unlock personalized features.
                </Text>
              </View>
            )}

            <View className="space-y-4">
              {skinProfile?.routine?.map((routine, index) => (
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
