import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const getEmptyStateInfo = (type) => {
  switch (type) {
    case 'allergens':
      return {
        icon: 'warning-outline',
        color: '#F59E0B',
        title: 'No allergens tracked',
        description: 'Add ingredients you\'re allergic to for personalized product analysis'
      };
    case 'issues':
      return {
        icon: 'medical-outline',
        color: '#00f5ff',
        title: 'No issues tracked',
        description: 'Track your skin concerns to get better personalized recommendations'
      };
    case 'memories':
      return {
        icon: 'library-outline',
        color: '#8B5CF6',
        title: 'No memories yet',
        description: 'Your AI will remember important insights from product analyses and chats'
      };
    default:
      return {
        icon: 'document-outline',
        color: '#6B7280',
        title: 'No data available',
        description: 'Start using the app to see your data here'
      };
  }
};

export default function EmptyState({ type, title, description }) {
  const info = getEmptyStateInfo(type);
  const displayTitle = title || info.title;
  const displayDescription = description || info.description;

  return (
    <View className="items-center justify-center py-12">
      <View
        className="w-16 h-16 rounded-full items-center justify-center mb-4"
        style={{
          backgroundColor: `${info.color}20`,
          borderWidth: 2,
          borderColor: `${info.color}40`,
        }}
      >
        <Ionicons 
          name={info.icon} 
          size={32} 
          color={info.color} 
        />
      </View>

      <Text className="text-white text-lg font-semibold mb-2 text-center">
        {displayTitle}
      </Text>

      <Text className="text-gray-400 text-sm text-center px-8 leading-5">
        {displayDescription}
      </Text>
    </View>
  );
}