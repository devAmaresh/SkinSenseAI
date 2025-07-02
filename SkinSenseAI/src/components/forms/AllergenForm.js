import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Ionicons from '@expo/vector-icons/Ionicons';

const severityOptions = [
  { value: 'mild', label: 'Mild', color: '#10B981', description: 'Minor irritation' },
  { value: 'moderate', label: 'Moderate', color: '#F59E0B', description: 'Noticeable reaction' },
  { value: 'severe', label: 'Severe', color: '#EF4444', description: 'Strong reaction' },
];

export default function AllergenForm({ allergen, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    ingredient_name: '',
    severity: 'mild',
    notes: '',
    confirmed: false,
  });

  useEffect(() => {
    if (allergen) {
      setFormData({
        ingredient_name: allergen.ingredient_name || '',
        severity: allergen.severity || 'mild',
        notes: allergen.notes || '',
        confirmed: allergen.confirmed || false,
      });
    }
  }, [allergen]);

  const handleSave = () => {
    if (!formData.ingredient_name.trim()) {
      Alert.alert('Error', 'Please enter an ingredient name');
      return;
    }

    onSave(formData);
  };

  const isEditing = !!allergen;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <BlurView intensity={20} className="flex-1 justify-end">
        <View
          className="rounded-t-3xl p-6"
          style={{
            backgroundColor: 'rgba(26, 26, 26, 0.95)',
            borderTopWidth: 1,
            borderTopColor: 'rgba(255, 255, 255, 0.1)',
            maxHeight: '80%',
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-white text-xl font-bold">
                {isEditing ? 'Edit Allergen' : 'Add New Allergen'}
              </Text>
              <TouchableOpacity
                onPress={onCancel}
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Ingredient Name */}
            <View className="mb-6">
              <Text className="text-white text-sm font-medium mb-2">
                Ingredient Name *
              </Text>
              <TextInput
                value={formData.ingredient_name}
                onChangeText={(text) => setFormData({...formData, ingredient_name: text})}
                placeholder="e.g., Fragrance, Sulfates, Parabens"
                placeholderTextColor="rgba(255,255,255,0.4)"
                className="text-white text-base p-4 rounded-2xl"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
              />
            </View>

            {/* Severity Level */}
            <View className="mb-6">
              <Text className="text-white text-sm font-medium mb-3">
                Severity Level
              </Text>
              <View className="space-y-2">
                {severityOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setFormData({...formData, severity: option.value})}
                    className="p-4 rounded-2xl flex-row items-center"
                    style={{
                      backgroundColor: formData.severity === option.value 
                        ? `${option.color}20` 
                        : 'rgba(255, 255, 255, 0.03)',
                      borderWidth: 1,
                      borderColor: formData.severity === option.value 
                        ? `${option.color}60` 
                        : 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <View
                      className="w-4 h-4 rounded-full mr-3"
                      style={{
                        backgroundColor: formData.severity === option.value 
                          ? option.color 
                          : 'rgba(255, 255, 255, 0.2)',
                      }}
                    />
                    <View className="flex-1">
                      <Text 
                        className="font-medium"
                        style={{ 
                          color: formData.severity === option.value 
                            ? option.color 
                            : 'white' 
                        }}
                      >
                        {option.label}
                      </Text>
                      <Text className="text-gray-400 text-sm">
                        {option.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View className="mb-6">
              <Text className="text-white text-sm font-medium mb-2">
                Notes (Optional)
              </Text>
              <TextInput
                value={formData.notes}
                onChangeText={(text) => setFormData({...formData, notes: text})}
                placeholder="Describe your reaction or add any additional details..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="text-white text-base p-4 rounded-2xl"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  height: 80,
                }}
              />
            </View>

            {/* Confirmed Status */}
            <TouchableOpacity
              onPress={() => setFormData({...formData, confirmed: !formData.confirmed})}
              className="flex-row items-center mb-8"
            >
              <View
                className="w-6 h-6 rounded-md items-center justify-center mr-3"
                style={{
                  backgroundColor: formData.confirmed 
                    ? '#00f5ff' 
                    : 'rgba(255, 255, 255, 0.1)',
                  borderWidth: 1,
                  borderColor: formData.confirmed 
                    ? '#00f5ff' 
                    : 'rgba(255, 255, 255, 0.2)',
                }}
              >
                {formData.confirmed && (
                  <Ionicons name="checkmark" size={16} color="black" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-white font-medium">
                  Confirmed allergen
                </Text>
                <Text className="text-gray-400 text-sm">
                  You've experienced reactions to this ingredient
                </Text>
              </View>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={onCancel}
                className="flex-1 py-4 rounded-2xl items-center"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <Text className="text-white font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                className="flex-1 py-4 rounded-2xl items-center"
                style={{
                  backgroundColor: '#00f5ff',
                  borderWidth: 1,
                  borderColor: '#00f5ff',
                }}
              >
                <Text className="text-black font-semibold">
                  {isEditing ? 'Update' : 'Add'} Allergen
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </BlurView>
    </KeyboardAvoidingView>
  );
}