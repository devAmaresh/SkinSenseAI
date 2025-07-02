import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Modal,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import ApiService from '../services/api';
import { Skeleton, TextSkeleton } from '../components/Skeleton';

export default function MyAnalysesScreen({ navigation }) {
  const [analyses, setAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAnalyses, setSelectedAnalyses] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteType, setDeleteType] = useState(null); // 'single', 'selected', 'all'
  const [analysisToDelete, setAnalysisToDelete] = useState(null);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      setIsLoading(true);
      const data = await ApiService.getMyAnalyses();
      
      const transformedAnalyses = data?.analyses?.map(analysis => {
        const result = analysis.metadata?.analysis_result || {};
        return {
          id: analysis.id,
          product_name: result.product_name || 'Unknown Product',
          suitability_score: result.suitability_score || 5,
          recommendation: result.personalized_recommendation || analysis.content,
          warnings: result.allergen_warnings?.join('. ') || null,
          created_at: analysis.created_at,
          analysis_result: {
            beneficial_ingredients: result.beneficial_ingredients || [],
            problematic_ingredients: result.watch_ingredients || [],
            allergen_warnings: result.allergen_warnings || [],
            skin_benefits: result.potential_issues || [],
            usage_tips: result.usage_instructions || null,
            key_ingredients: result.key_ingredients || [],
            brand: result.brand || null,
            product_type: result.product_type || null
          }
        };
      }) || [];
      
      setAnalyses(transformedAnalyses);
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

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedAnalyses(new Set());
  };

  const toggleAnalysisSelection = (analysisId) => {
    const newSelected = new Set(selectedAnalyses);
    if (newSelected.has(analysisId)) {
      newSelected.delete(analysisId);
    } else {
      newSelected.add(analysisId);
    }
    setSelectedAnalyses(newSelected);
  };

  const selectAllAnalyses = () => {
    const allIds = new Set(analyses.map(a => a.id));
    setSelectedAnalyses(allIds);
  };

  const deselectAllAnalyses = () => {
    setSelectedAnalyses(new Set());
  };

  const handleDeleteSingle = (analysis) => {
    setAnalysisToDelete(analysis);
    setDeleteType('single');
    setDeleteModalVisible(true);
  };

  const handleDeleteSelected = () => {
    if (selectedAnalyses.size === 0) {
      Alert.alert('No Selection', 'Please select analyses to delete');
      return;
    }
    setDeleteType('selected');
    setDeleteModalVisible(true);
  };

  const handleDeleteAll = () => {
    if (analyses.length === 0) {
      Alert.alert('No Analyses', 'No analyses to delete');
      return;
    }
    setDeleteType('all');
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    setDeleteModalVisible(false);
    
    try {
      if (deleteType === 'single' && analysisToDelete) {
        await ApiService.deleteAnalysis(analysisToDelete.id);
        setAnalyses(prev => prev.filter(a => a.id !== analysisToDelete.id));
        Alert.alert('Success', 'Analysis deleted successfully');
        
      } else if (deleteType === 'selected') {
        // Delete multiple analyses
        const deletePromises = Array.from(selectedAnalyses).map(id => 
          ApiService.deleteAnalysis(id)
        );
        await Promise.all(deletePromises);
        setAnalyses(prev => prev.filter(a => !selectedAnalyses.has(a.id)));
        setSelectedAnalyses(new Set());
        setIsSelectionMode(false);
        Alert.alert('Success', `${selectedAnalyses.size} analyses deleted successfully`);
        
      } else if (deleteType === 'all') {
        await ApiService.deleteAllAnalyses();
        setAnalyses([]);
        Alert.alert('Success', 'All analyses deleted successfully');
      }
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete analysis. Please try again.');
    }
    
    setAnalysisToDelete(null);
    setDeleteType(null);
  };

  const getSuitabilityColor = (score) => {
    if (score >= 8) return '#00ff88';
    if (score >= 6) return '#ffaa00';
    if (score >= 4) return '#ff6600';
    return '#ff4444';
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

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const viewAnalysisDetails = (analysis) => {
    if (isSelectionMode) {
      toggleAnalysisSelection(analysis.id);
    } else {
      navigation.navigate('AnalysisResult', { analysis });
    }
  };

  const DeleteConfirmationModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={deleteModalVisible}
      onRequestClose={() => setDeleteModalVisible(false)}
    >
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
        <View 
          className="mx-6 rounded-3xl p-6 w-80"
          style={{
            backgroundColor: '#1a1a1a',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <View className="items-center mb-4">
            <View 
              className="w-16 h-16 rounded-full items-center justify-center mb-3"
              style={{
                backgroundColor: 'rgba(255, 68, 68, 0.1)',
                borderWidth: 1,
                borderColor: 'rgba(255, 68, 68, 0.2)',
              }}
            >
              <Ionicons name="trash-outline" size={32} color="#ff4444" />
            </View>
            
            <Text className="text-white text-xl font-bold mb-2">
              Delete Analysis
            </Text>
            
            <Text className="text-gray-300 text-center text-sm">
              {deleteType === 'single' && `Delete "${analysisToDelete?.product_name}"?`}
              {deleteType === 'selected' && `Delete ${selectedAnalyses.size} selected analyses?`}
              {deleteType === 'all' && `Delete all ${analyses.length} analyses?`}
              {'\n\n'}This action cannot be undone.
            </Text>
          </View>

          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={() => setDeleteModalVisible(false)}
              className="flex-1 rounded-2xl py-3"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              <Text className="text-white text-center font-semibold">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={confirmDelete}
              className="flex-1 rounded-2xl py-3"
              style={{
                backgroundColor: '#ff4444',
              }}
            >
              <Text className="text-white text-center font-semibold">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#000000' }}>
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

              <View className="flex-row space-x-3">
                {analyses.length > 0 && !isSelectionMode && (
                  <TouchableOpacity
                    onPress={toggleSelectionMode}
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: 'rgba(255, 68, 68, 0.1)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 68, 68, 0.2)',
                    }}
                  >
                    <Ionicons name="checkmark-circle-outline" size={24} color="#ff4444" />
                  </TouchableOpacity>
                )}

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
            </View>

            <Text className="text-3xl font-bold text-white mb-2">
              My Analyses
            </Text>
            <Text className="text-gray-300 text-lg">
              {isSelectionMode ? `${selectedAnalyses.size} selected` : 'Your product analysis history'}
            </Text>
          </View>

          {/* Selection Mode Controls */}
          {isSelectionMode && (
            <View className="px-6 mb-4">
              <View 
                className="rounded-2xl p-4"
                style={{
                  backgroundColor: 'rgba(255, 68, 68, 0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 68, 68, 0.1)',
                }}
              >
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-red-400 font-semibold">
                    Selection Mode
                  </Text>
                  <TouchableOpacity
                    onPress={toggleSelectionMode}
                    className="px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <Text className="text-white text-sm">Done</Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row justify-between">
                  <TouchableOpacity
                    onPress={selectedAnalyses.size === analyses.length ? deselectAllAnalyses : selectAllAnalyses}
                    className="flex-row items-center"
                  >
                    <Ionicons 
                      name={selectedAnalyses.size === analyses.length ? "checkbox" : "square-outline"} 
                      size={20} 
                      color="#00f5ff" 
                    />
                    <Text className="text-cyan-400 ml-2">
                      {selectedAnalyses.size === analyses.length ? 'Deselect All' : 'Select All'}
                    </Text>
                  </TouchableOpacity>

                  <View className="flex-row space-x-4">
                    <TouchableOpacity
                      onPress={handleDeleteSelected}
                      disabled={selectedAnalyses.size === 0}
                      className="flex-row items-center"
                      style={{ opacity: selectedAnalyses.size === 0 ? 0.5 : 1 }}
                    >
                      <Ionicons name="trash-outline" size={20} color="#ff4444" />
                      <Text className="text-red-400 ml-1">Delete</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleDeleteAll}
                      className="flex-row items-center"
                    >
                      <Ionicons name="trash-bin-outline" size={20} color="#ff4444" />
                      <Text className="text-red-400 ml-1">Delete All</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}

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
                {isLoading ? (
                  <>
                    <Skeleton width={40} height={28} borderRadius={14} style={{ marginBottom: 8 }} />
                    <Skeleton width={80} height={14} borderRadius={7} />
                  </>
                ) : (
                  <>
                    <Text className="text-cyan-400 text-2xl font-bold">
                      {analyses.length}
                    </Text>
                    <Text className="text-gray-300 text-sm">
                      Total Analyses
                    </Text>
                  </>
                )}
              </View>
              
              <View 
                className="flex-1 rounded-2xl p-4"
                style={{
                  backgroundColor: 'rgba(0, 255, 136, 0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(0, 255, 136, 0.1)',
                }}
              >
                {isLoading ? (
                  <>
                    <Skeleton width={40} height={28} borderRadius={14} style={{ marginBottom: 8 }} />
                    <Skeleton width={100} height={14} borderRadius={7} />
                  </>
                ) : (
                  <>
                    <Text className="text-green-400 text-2xl font-bold">
                      {analyses.filter(a => a.suitability_score >= 6).length}
                    </Text>
                    <Text className="text-gray-300 text-sm">
                      Suitable Products
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Analyses List */}
          <View className="px-6">
            {isLoading ? (
              // Skeleton loading...
              <View className="space-y-4 pb-8">
                {Array.from({ length: 3 }).map((_, index) => (
                  <View
                    key={index}
                    className="rounded-2xl p-4"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1 mr-3">
                        <Skeleton width="80%" height={20} borderRadius={10} style={{ marginBottom: 8 }} />
                        <Skeleton width="40%" height={14} borderRadius={7} />
                      </View>
                      <Skeleton width={50} height={24} borderRadius={12} />
                    </View>
                    <View className="flex-row items-center mb-3">
                      <Skeleton width={16} height={16} borderRadius={8} style={{ marginRight: 8 }} />
                      <Skeleton width="50%" height={16} borderRadius={8} />
                    </View>
                    <Skeleton width="100%" height={16} borderRadius={8} style={{ marginBottom: 4 }} />
                    <Skeleton width="70%" height={16} borderRadius={8} style={{ marginBottom: 12 }} />
                  </View>
                ))}
              </View>
            ) : analyses.length === 0 ? (
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
                      backgroundColor: isSelectionMode && selectedAnalyses.has(analysis.id) 
                        ? 'rgba(0, 245, 255, 0.1)' 
                        : 'rgba(255, 255, 255, 0.03)',
                      borderWidth: 1,
                      borderColor: isSelectionMode && selectedAnalyses.has(analysis.id)
                        ? 'rgba(0, 245, 255, 0.3)'
                        : 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-row items-center flex-1">
                        {isSelectionMode && (
                          <TouchableOpacity
                            onPress={() => toggleAnalysisSelection(analysis.id)}
                            className="mr-3"
                          >
                            <Ionicons 
                              name={selectedAnalyses.has(analysis.id) ? "checkbox" : "square-outline"} 
                              size={24} 
                              color={selectedAnalyses.has(analysis.id) ? "#00f5ff" : "#666"} 
                            />
                          </TouchableOpacity>
                        )}
                        
                        <View className="flex-1 mr-3">
                          <Text className="text-white text-lg font-semibold mb-1">
                            {analysis.product_name}
                          </Text>
                          <Text className="text-gray-400 text-sm">
                            {formatDate(analysis.created_at)}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center space-x-2">
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

                        {!isSelectionMode && (
                          <TouchableOpacity
                            onPress={() => handleDeleteSingle(analysis)}
                            className="w-8 h-8 rounded-full items-center justify-center"
                            style={{
                              backgroundColor: 'rgba(255, 68, 68, 0.1)',
                            }}
                          >
                            <Ionicons name="trash-outline" size={16} color="#ff4444" />
                          </TouchableOpacity>
                        )}
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
                    {!isSelectionMode && (
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
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <DeleteConfirmationModal />
      </LinearGradient>
    </SafeAreaView>
  );
}