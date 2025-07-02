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

const issueTypes = [
  'Acne', 'Dryness', 'Oiliness', 'Sensitivity', 'Redness', 'Dark Spots',
  'Fine Lines', 'Wrinkles', 'Pores', 'Blackheads', 'Eczema', 'Rosacea',
  'Hyperpigmentation', 'Scarring', 'Dehydration', 'Other'
];

const statusOptions = [
  { value: 'active', label: 'Active', color: '#EF4444' },
  { value: 'improving', label: 'Improving', color: '#F59E0B' },
  { value: 'resolved', label: 'Resolved', color: '#10B981' },
];

const commonTriggers = [
  'Stress', 'Diet', 'Weather', 'Hormones', 'Sleep', 'Products',
  'Sun Exposure', 'Pollution', 'Exercise', 'Makeup', 'Fragrances'
];

const SkinIssueForm = ({ issue, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    issue_type: '',
    description: '',
    severity: 5,
    status: 'active',
    triggers: [],
  });

  const [customTrigger, setCustomTrigger] = useState('');
  const [showCustomTrigger, setShowCustomTrigger] = useState(false);

  useEffect(() => {
    if (issue) {
      setFormData({
        issue_type: issue.issue_type || '',
        description: issue.description || '',
        severity: issue.severity || 5,
        status: issue.status || 'active',
        triggers: issue.triggers || [],
      });
    }
  }, [issue]);

  const handleSave = () => {
    if (!formData.issue_type.trim()) {
      Alert.alert('Error', 'Please select or enter an issue type');
      return;
    }

    onSave(formData);
  };

  const toggleTrigger = (trigger) => {
    const triggers = formData.triggers || [];
    if (triggers.includes(trigger)) {
      setFormData({
        ...formData,
        triggers: triggers.filter(t => t !== trigger)
      });
    } else {
      setFormData({
        ...formData,
        triggers: [...triggers, trigger]
      });
    }
  };

  const addCustomTrigger = () => {
    if (customTrigger.trim() && !formData.triggers.includes(customTrigger.trim())) {
      setFormData({
        ...formData,
        triggers: [...(formData.triggers || []), customTrigger.trim()]
      });
      setCustomTrigger('');
      setShowCustomTrigger(false);
    }
  };

  const getSeverityColor = (severity) => {
    if (severity >= 8) return '#EF4444';
    if (severity >= 5) return '#F59E0B';
    if (severity >= 3) return '#10B981';
    return '#6B7280';
  };

  const isEditing = !!issue;

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
                {isEditing ? 'Edit Skin Issue' : 'Add New Issue'}
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

            {/* Issue Type */}
            <View className="mb-6">
              <Text className="text-white text-sm font-medium mb-3">
                Issue Type *
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                className="mb-2"
              >
                <View className="flex-row">
                  {issueTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setFormData({...formData, issue_type: type})}
                      className="px-4 py-2 rounded-full mr-2"
                      style={{
                        backgroundColor: formData.issue_type === type 
                          ? '#00f5ff' 
                          : 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        borderColor: formData.issue_type === type 
                          ? '#00f5ff' 
                          : 'rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <Text
                        className="font-medium"
                        style={{
                          color: formData.issue_type === type ? 'black' : 'white'
                        }}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Custom Issue Type */}
              {formData.issue_type === 'Other' && (
                <TextInput
                  value={formData.issue_type === 'Other' ? '' : formData.issue_type}
                  onChangeText={(text) => setFormData({...formData, issue_type: text})}
                  placeholder="Enter custom issue type"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  className="text-white text-base p-4 rounded-2xl mt-2"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                />
              )}
            </View>

            {/* Severity Level */}
            <View className="mb-6">
              <Text className="text-white text-sm font-medium mb-3">
                Severity Level: {formData.severity}/10
              </Text>
              <View className="flex-row items-center">
                {Array.from({ length: 10 }).map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setFormData({...formData, severity: index + 1})}
                    className="w-8 h-8 rounded-full items-center justify-center mr-2"
                    style={{
                      backgroundColor: index < formData.severity 
                        ? getSeverityColor(formData.severity) 
                        : 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <Text 
                      className="text-xs font-bold"
                      style={{
                        color: index < formData.severity ? 'white' : 'gray'
                      }}
                    >
                      {index + 1}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status */}
            <View className="mb-6">
              <Text className="text-white text-sm font-medium mb-3">
                Current Status
              </Text>
              <View className="flex-row space-x-2">
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setFormData({...formData, status: option.value})}
                    className="flex-1 p-3 rounded-2xl items-center"
                    style={{
                      backgroundColor: formData.status === option.value 
                        ? `${option.color}20` 
                        : 'rgba(255, 255, 255, 0.05)',
                      borderWidth: 1,
                      borderColor: formData.status === option.value 
                        ? option.color 
                        : 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <Text 
                      className="font-medium"
                      style={{ 
                        color: formData.status === option.value 
                          ? option.color 
                          : 'white' 
                      }}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="text-white text-sm font-medium mb-2">
                Description (Optional)
              </Text>
              <TextInput
                value={formData.description}
                onChangeText={(text) => setFormData({...formData, description: text})}
                placeholder="Describe the issue, affected areas, or any specific concerns..."
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

            {/* Triggers */}
            <View className="mb-8">
              <Text className="text-white text-sm font-medium mb-3">
                Known Triggers (Optional)
              </Text>
              <View className="flex-row flex-wrap mb-3">
                {commonTriggers.map((trigger) => (
                  <TouchableOpacity
                    key={trigger}
                    onPress={() => toggleTrigger(trigger)}
                    className="px-3 py-2 rounded-full mr-2 mb-2"
                    style={{
                      backgroundColor: (formData.triggers || []).includes(trigger)
                        ? 'rgba(239, 68, 68, 0.2)' 
                        : 'rgba(255, 255, 255, 0.05)',
                      borderWidth: 1,
                      borderColor: (formData.triggers || []).includes(trigger)
                        ? '#EF4444' 
                        : 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <Text
                      className="text-sm font-medium"
                      style={{
                        color: (formData.triggers || []).includes(trigger) 
                          ? '#EF4444' 
                          : 'white'
                      }}
                    >
                      {trigger}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Trigger */}
              {showCustomTrigger ? (
                <View className="flex-row space-x-2">
                  <TextInput
                    value={customTrigger}
                    onChangeText={setCustomTrigger}
                    placeholder="Add custom trigger"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    className="flex-1 text-white text-base p-3 rounded-xl"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    }}
                  />
                  <TouchableOpacity
                    onPress={addCustomTrigger}
                    className="px-4 py-3 rounded-xl"
                    style={{
                      backgroundColor: '#00f5ff',
                    }}
                  >
                    <Text className="text-black font-medium">Add</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowCustomTrigger(true)}
                  className="flex-row items-center py-2"
                >
                  <Ionicons name="add-circle-outline" size={20} color="#00f5ff" />
                  <Text className="text-cyan-400 ml-2 font-medium">
                    Add custom trigger
                  </Text>
                </TouchableOpacity>
              )}
            </View>

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
                  {isEditing ? 'Update' : 'Add'} Issue
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </BlurView>
    </KeyboardAvoidingView>
  );
};

export default SkinIssueForm;