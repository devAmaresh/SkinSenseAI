import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'mild':
      return '#10B981'; // green
    case 'moderate':
      return '#F59E0B'; // amber
    case 'severe':
      return '#EF4444'; // red
    default:
      return '#6B7280'; // gray
  }
};

const getSeverityIcon = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'mild':
      return 'alert-circle-outline';
    case 'moderate':
      return 'warning-outline';
    case 'severe':
      return 'alert-outline';
    default:
      return 'help-circle-outline';
  }
};

export default function AllergenCard({ allergen, onEdit, onDelete }) {
  const severityColor = getSeverityColor(allergen.severity);
  const severityIcon = getSeverityIcon(allergen.severity);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <View
      className="rounded-2xl p-4 mb-3"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-white text-lg font-semibold">
            {allergen.ingredient_name}
          </Text>
          <View className="flex-row items-center mt-1">
            <Ionicons 
              name={severityIcon} 
              size={16} 
              color={severityColor} 
            />
            <Text 
              className="text-sm font-medium ml-1 capitalize"
              style={{ color: severityColor }}
            >
              {allergen.severity || 'Unknown'} severity
            </Text>
          </View>
        </View>

        <View className="flex-row">
          <TouchableOpacity
            onPress={() => onEdit(allergen)}
            className="w-8 h-8 rounded-full items-center justify-center mr-2"
            style={{
              backgroundColor: 'rgba(0, 245, 255, 0.1)',
              borderWidth: 1,
              borderColor: 'rgba(0, 245, 255, 0.2)',
            }}
          >
            <Ionicons name="pencil" size={16} color="#00f5ff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onDelete(allergen)}
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.2)',
            }}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notes */}
      {allergen.notes && (
        <Text className="text-gray-300 text-sm mb-2">
          {allergen.notes}
        </Text>
      )}

      {/* Status and Date */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <View
            className="w-2 h-2 rounded-full mr-2"
            style={{
              backgroundColor: allergen.confirmed ? '#10B981' : '#F59E0B'
            }}
          />
          <Text className="text-gray-400 text-xs">
            {allergen.confirmed ? 'Confirmed' : 'Unconfirmed'}
          </Text>
        </View>

        <Text className="text-gray-500 text-xs">
          Added {formatDate(allergen.first_detected)}
        </Text>
      </View>
    </View>
  );
}