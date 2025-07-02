import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import ApiService from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function ProductAnalysisScreen({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const pickImage = async () => {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    // Request permission
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera is required!');
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      Alert.alert('No Image Selected', 'Please select an image of the product ingredients');
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await ApiService.analyzeProduct(null, null, selectedImage);
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

  const removeImage = () => {
    setSelectedImage(null);
  };

  return (
    <SafeAreaView className="flex-1">
      <StatusBar style="light" />
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-1 pb-6">
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
              Upload an image of ingredients to analyze
            </Text>
          </View>

          <View className="px-6 space-y-6">
            {/* Image Upload Section */}
            {!selectedImage ? (
              <View 
                className="rounded-2xl p-8 items-center"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderWidth: 2,
                  borderColor: 'rgba(0, 245, 255, 0.2)',
                  borderStyle: 'dashed',
                }}
              >
                <View 
                  className="w-20 h-20 rounded-full items-center justify-center mb-4"
                  style={{
                    backgroundColor: 'rgba(0, 245, 255, 0.1)',
                    borderWidth: 1,
                    borderColor: 'rgba(0, 245, 255, 0.2)',
                  }}
                >
                  <Ionicons name="camera-outline" size={40} color="#00f5ff" />
                </View>

                <Text className="text-white text-lg font-semibold mb-2">
                  Upload Ingredients Image
                </Text>
                <Text className="text-gray-400 text-center mb-6">
                  Take a photo or select from gallery to analyze the product ingredients
                </Text>

                <View className="flex-row space-x-4">
                  <TouchableOpacity
                    onPress={takePhoto}
                    className="flex-1 rounded-2xl py-4 overflow-hidden"
                  >
                    <LinearGradient
                      colors={['#00f5ff', '#0080ff']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="py-4 rounded-2xl"
                    >
                      <View className="flex-row items-center justify-center">
                        <Ionicons name="camera" size={20} color="#000" />
                        <Text className="text-black font-bold ml-2">Camera</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={pickImage}
                    className="flex-1 rounded-2xl py-4 overflow-hidden"
                  >
                    <View
                      
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="py-4 rounded-2xl bg-zinc-900"
                    >
                      <View className="flex-row items-center justify-center">
                        <Ionicons name="image" size={20} color="#fff" />
                        <Text className="text-zinc-100 font-bold ml-2">Gallery</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* Selected Image Display */
              <View 
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <View className="relative">
                  <Image
                    source={{ uri: selectedImage.uri }}
                    className="w-full h-64"
                    style={{ resizeMode: 'cover' }}
                  />
                  
                  <TouchableOpacity
                    onPress={removeImage}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: 'rgba(255, 0, 0, 0.8)',
                    }}
                  >
                    <Ionicons name="close" size={20} color="white" />
                  </TouchableOpacity>
                </View>

                <View className="p-4">
                  <Text className="text-white font-semibold mb-2">
                    Image Selected
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    Ready to analyze ingredients from this image
                  </Text>
                </View>
              </View>
            )}

            {/* Analyze Button */}
            {selectedImage && (
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
                  <View className="flex-row items-center justify-center">
                    {isAnalyzing && (
                      <Ionicons name="refresh" size={20} color="#000" />
                    )}
                    <Text className="text-black text-center text-lg font-bold ml-2">
                      {isAnalyzing ? 'Analyzing Image...' : 'Analyze Ingredients'}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Info Card */}
            <View 
              className="rounded-2xl p-4"
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
                Our AI analyzes the ingredients image, extracts the ingredients list, 
                and provides personalized recommendations based on your skin type.
              </Text>
            </View>

            {/* Tips */}
            <View 
              className="rounded-2xl p-4 mb-8"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <View className="flex-row items-center mb-3">
                <Ionicons name="lightbulb-outline" size={20} color="#ffaa00" />
                <Text className="text-orange-400 font-semibold ml-2">
                  Tips for better results
                </Text>
              </View>
              <View className="space-y-2">
                <Text className="text-gray-300 text-sm">• Ensure good lighting</Text>
                <Text className="text-gray-300 text-sm">• Keep the image clear and focused</Text>
                <Text className="text-gray-300 text-sm">• Make sure ingredients text is readable</Text>
                <Text className="text-gray-300 text-sm">• Avoid shadows on the label</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}