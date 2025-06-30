import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import ApiService from '../services/api';

export default function ProductAnalysisScreen({ navigation }) {
  const [productName, setProductName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!productName.trim() && !ingredients.trim()) {
      Alert.alert('Error', 'Please enter either a product name or ingredients list');
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await ApiService.analyzeProduct(
        productName.trim() || null,
        ingredients.trim() || null
      );

      navigation.navigate('AnalysisResult', { analysis: result });
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert(
        'Analysis Failed',
        error.message || 'Failed to analyze product. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <StatusBar style="light" />
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        className="flex-1"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="px-6 pt-12 pb-6">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="w-12 h-12 rounded-full items-center justify-center mb-6"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>

              <Text className="text-3xl font-bold text-white mb-2">
                Product Analysis
              </Text>
              <Text className="text-gray-300 text-lg">
                Analyze if products are suitable for your skin
              </Text>
            </View>

            {/* Analysis Form */}
            <View className="px-6 space-y-6">
              {/* Product Name */}
              <View className="space-y-2">
                <Text className="text-gray-300 text-sm font-medium ml-1">
                  Product Name (Optional)
                </Text>
                <View 
                  className="rounded-2xl px-4 py-4"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <TextInput
                    className="text-white text-base"
                    placeholder="e.g., Neutrogena Hydra Boost"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={productName}
                    onChangeText={setProductName}
                    editable={!isAnalyzing}
                  />
                </View>
              </View>

              {/* Ingredients */}
              <View className="space-y-2">
                <Text className="text-gray-300 text-sm font-medium ml-1">
                  Ingredients List
                </Text>
                <View 
                  className="rounded-2xl px-4 py-4"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    minHeight: 120,
                  }}
                >
                  <TextInput
                    className="text-white text-base"
                    placeholder="Enter the ingredients list from the product label..."
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={ingredients}
                    onChangeText={setIngredients}
                    multiline
                    textAlignVertical="top"
                    editable={!isAnalyzing}
                  />
                </View>
                <Text className="text-gray-400 text-xs ml-1">
                  Copy and paste the ingredients from the product packaging
                </Text>
              </View>

              {/* Analyze Button */}
              <TouchableOpacity
                onPress={handleAnalyze}
                disabled={isAnalyzing}
                className="rounded-2xl py-4 mt-6 overflow-hidden"
                style={{ opacity: isAnalyzing ? 0.7 : 1 }}
              >
                <LinearGradient
                  colors={['#00f5ff', '#0080ff', '#8000ff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-4 rounded-2xl"
                >
                  <Text className="text-black text-center text-lg font-bold">
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Product'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Info Card */}
              <View 
                className="rounded-2xl p-4 mt-6"
                style={{
                  backgroundColor: 'rgba(0, 245, 255, 0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(0, 245, 255, 0.1)',
                }}
              >
                <View className="flex-row items-center mb-2">
                  <Ionicons name="information-circle" size={20} color="#00f5ff" />
                  <Text className="text-cyan-400 font-semibold ml-2">
                    How it works
                  </Text>
                </View>
                <Text className="text-gray-300 text-sm">
                  Our AI analyzes the ingredients based on your skin type and provides 
                  personalized recommendations and warnings.
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}