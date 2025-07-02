import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import ApiService from '../services/api';

export default function MyAnalysesScreen({ navigation }) {
  const [analyses, setAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      setIsLoading(true);
      const data = await ApiService.getMyAnalyses();
      setAnalyses(data);
    } catch (error) {
      console.error('Error loading analyses:', error);
      Alert.alert('Error', 'Failed to load your analyses');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadAnalyses();
    setIsRefreshing(false);
  };

  const getSuitabilityColor = (score) => {
    if (score >= 8) return '#00ff88'; // Green for highly suitable
    if (score >= 6) return '#ffaa00'; // Orange for moderately suitable
    if (score >= 4) return '#ff6600'; // Red-orange for questionable
    return '#ff4444'; // Red for not suitable
  };

  const getSuitabilityText = (score) => {
    if (score >= 8) return 'Highly Suitable';
    if (score >= 6) return 'Moderately Suitable';
    if (score >= 4) return 'Use with Caution';
    return 'Not Recommended';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const viewAnalysisDetails = (analysis) => {
    navigation.navigate('AnalysisResult', { analysis });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1">
        <LinearGradient colors={['#000000', '#1a1a1a', '#000000']} className="flex-1">
          <View className="flex-1 justify-center items-center">
            <View 
              className="w-16 h-16 rounded-full mb-4 items-center justify-center"
              style={{
                backgroundColor: 'rgba(0, 245, 255, 0.1)',
                borderWidth: 1,
                borderColor: 'rgba(0, 245, 255, 0.2)',
              }}
            >
              <Ionicons name="analytics-outline" size={32} color="#00f5ff" />
            </View>
            <Text className="text-white text-lg">Loading your analyses...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <StatusBar style="light" />
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#00f5ff"
              colors={['#00f5ff']}
            />
          }
        >
          {/* Header */}
          <View className="px-6 pt-1 pb-6">
            <View className="flex-row justify-between items-center mb-6">
              <TouchableOpacity
                onPress={() => navigation.navigate('Home')}
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('ProductAnalysis')}
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{
                  backgroundColor: 'rgba(0, 245, 255, 0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(0, 245, 255, 0.2)',
                }}
              >
                <Ionicons name="add" size={24} color="#00f5ff" />
              </TouchableOpacity>
            </View>

            <Text className="text-3xl font-bold text-white mb-2">
              My Analyses
            </Text>
            <Text className="text-gray-300 text-lg">
              Your product analysis history
            </Text>
          </View>

          {/* Statistics */}
          <View className="px-6 mb-6">
            <View className="flex-row space-x-4">
              <View 
                className="flex-1 rounded-2xl p-4"
                style={{
                  backgroundColor: 'rgba(0, 245, 255, 0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(0, 245, 255, 0.1)',
                }}
              >
                <Text className="text-cyan-400 text-2xl font-bold">
                  {analyses.length}
                </Text>
                <Text className="text-gray-300 text-sm">
                  Total Analyses
                </Text>
              </View>
              
              <View 
                className="flex-1 rounded-2xl p-4"
                style={{
                  backgroundColor: 'rgba(0, 255, 136, 0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(0, 255, 136, 0.1)',
                }}
              >
                <Text className="text-green-400 text-2xl font-bold">
                  {analyses.filter(a => a.suitability_score >= 6).length}
                </Text>
                <Text className="text-gray-300 text-sm">
                  Suitable Products
                </Text>
              </View>
            </View>
          </View>

          {/* Analyses List */}
          <View className="px-6">
            {analyses.length === 0 ? (
              <View className="items-center py-12">
                <View 
                  className="w-20 h-20 rounded-full mb-4 items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Ionicons name="analytics-outline" size={40} color="rgba(255,255,255,0.4)" />
                </View>
                <Text className="text-gray-400 text-lg mb-2">No analyses yet</Text>
                <Text className="text-gray-500 text-center mb-6">
                  Start analyzing products to see them here
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ProductAnalysis')}
                  className="rounded-2xl py-3 px-6 overflow-hidden"
                >
                  <LinearGradient
                    colors={['#00f5ff', '#0080ff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="py-3 px-6 rounded-2xl"
                  >
                    <Text className="text-black text-center font-semibold">
                      Analyze Your First Product
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="space-y-4 pb-8">
                {analyses.map((analysis) => (
                  <TouchableOpacity
                    key={analysis.id}
                    onPress={() => viewAnalysisDetails(analysis)}
                    className="rounded-2xl p-4"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    {/* Analysis Header */}
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1 mr-3">
                        <Text className="text-white text-lg font-semibold mb-1">
                          {analysis.product_name || 'Unknown Product'}
                        </Text>
                        <Text className="text-gray-400 text-sm">
                          {formatDate(analysis.created_at)}
                        </Text>
                      </View>
                      
                      {/* Suitability Score */}
                      <View 
                        className="px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: `${getSuitabilityColor(analysis.suitability_score)}20`,
                          borderWidth: 1,
                          borderColor: `${getSuitabilityColor(analysis.suitability_score)}40`,
                        }}
                      >
                        <Text 
                          className="text-sm font-medium"
                          style={{ color: getSuitabilityColor(analysis.suitability_score) }}
                        >
                          {analysis.suitability_score}/10
                        </Text>
                      </View>
                    </View>

                    {/* Suitability Status */}
                    <View className="flex-row items-center mb-3">
                      <Ionicons 
                        name={analysis.suitability_score >= 6 ? "checkmark-circle" : "warning"} 
                        size={16} 
                        color={getSuitabilityColor(analysis.suitability_score)}
                      />
                      <Text 
                        className="ml-2 text-sm font-medium"
                        style={{ color: getSuitabilityColor(analysis.suitability_score) }}
                      >
                        {getSuitabilityText(analysis.suitability_score)}
                      </Text>
                    </View>

                    {/* Preview of recommendation */}
                    {analysis.recommendation && (
                      <Text className="text-gray-300 text-sm mb-3" numberOfLines={2}>
                        {analysis.recommendation}
                      </Text>
                    )}

                    {/* Warnings indicator */}
                    {analysis.warnings && (
                      <View className="flex-row items-center mb-3">
                        <Ionicons name="alert-circle-outline" size={16} color="#ff6600" />
                        <Text className="text-orange-400 text-xs ml-2">
                          Contains warnings
                        </Text>
                      </View>
                    )}

                    {/* Beneficial/Problematic ingredients preview */}
                    <View className="flex-row space-x-4">
                      {analysis.analysis_result?.beneficial_ingredients?.length > 0 && (
                        <View className="flex-1">
                          <View className="flex-row items-center mb-1">
                            <Ionicons name="leaf-outline" size={14} color="#00ff88" />
                            <Text className="text-green-400 text-xs ml-1">
                              Beneficial ({analysis.analysis_result.beneficial_ingredients.length})
                            </Text>
                          </View>
                        </View>
                      )}
                      
                      {analysis.analysis_result?.problematic_ingredients?.length > 0 && (
                        <View className="flex-1">
                          <View className="flex-row items-center mb-1">
                            <Ionicons name="warning-outline" size={14} color="#ff6600" />
                            <Text className="text-orange-400 text-xs ml-1">
                              Caution ({analysis.analysis_result.problematic_ingredients.length})
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>

                    {/* View details indicator */}
                    <View className="flex-row items-center justify-between mt-3 pt-3"
                      style={{
                        borderTopWidth: 1,
                        borderTopColor: 'rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <Text className="text-cyan-400 text-sm font-medium">
                        View Full Analysis
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color="#00f5ff" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}