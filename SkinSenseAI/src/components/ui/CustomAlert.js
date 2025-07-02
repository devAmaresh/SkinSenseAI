import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

const CustomAlert = ({ 
  visible, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'info', 'warning', 'danger', 'success'
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  showCancel = false,
  isLoading = false
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'trash-outline',
          iconColor: '#ff4444',
          backgroundColor: 'rgba(255, 68, 68, 0.1)',
          borderColor: 'rgba(255, 68, 68, 0.2)',
          confirmColor: '#ff4444'
        };
      case 'warning':
        return {
          icon: 'warning-outline',
          iconColor: '#ff6600',
          backgroundColor: 'rgba(255, 102, 0, 0.1)',
          borderColor: 'rgba(255, 102, 0, 0.2)',
          confirmColor: '#ff6600'
        };
      case 'success':
        return {
          icon: 'checkmark-circle-outline',
          iconColor: '#00ff88',
          backgroundColor: 'rgba(0, 255, 136, 0.1)',
          borderColor: 'rgba(0, 255, 136, 0.2)',
          confirmColor: '#00ff88'
        };
      default:
        return {
          icon: 'information-circle-outline',
          iconColor: '#00f5ff',
          backgroundColor: 'rgba(0, 245, 255, 0.1)',
          borderColor: 'rgba(0, 245, 255, 0.2)',
          confirmColor: '#00f5ff'
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View 
        className="flex-1 justify-center items-center px-6"
        style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
      >
        <View 
          className="w-full max-w-sm rounded-3xl p-6"
          style={{
            backgroundColor: '#1a1a1a',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Icon */}
          <View className="items-center mb-4">
            <View 
              className="w-16 h-16 rounded-full items-center justify-center mb-3"
              style={{
                backgroundColor: config.backgroundColor,
                borderWidth: 1,
                borderColor: config.borderColor,
              }}
            >
              <Ionicons name={config.icon} size={32} color={config.iconColor} />
            </View>
            
            <Text className="text-white text-xl font-bold text-center mb-2">
              {title}
            </Text>
            
            <Text className="text-gray-300 text-center text-sm leading-relaxed">
              {message}
            </Text>

            {/* Permanent deletion warning */}
            {type === 'danger' && (
              <View 
                className="mt-3 p-3 rounded-2xl"
                style={{
                  backgroundColor: 'rgba(255, 68, 68, 0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 68, 68, 0.1)',
                }}
              >
                <View className="flex-row items-center mb-1">
                  <Ionicons name="alert-circle-outline" size={16} color="#ff4444" />
                  <Text className="text-red-400 text-xs font-semibold ml-2">
                    PERMANENT DELETION
                  </Text>
                </View>
                <Text className="text-red-300 text-xs">
                  This action cannot be undone. The data will be permanently removed from our servers.
                </Text>
              </View>
            )}
          </View>

          {/* Buttons */}
          <View className={`flex-row ${showCancel ? 'space-x-3' : ''}`}>
            {showCancel && (
              <TouchableOpacity
                onPress={onClose}
                disabled={isLoading}
                className="flex-1 rounded-2xl py-3"
                style={{
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                <View
                  className="py-3 rounded-2xl"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                >
                <Text className="text-white text-center font-semibold">
                  {cancelText}
                </Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onConfirm || onClose}
              disabled={isLoading}
              className={`${showCancel ? 'flex-1' : 'w-full'} rounded-2xl py-3 overflow-hidden`}
              style={{ opacity: isLoading ? 0.8 : 1 }}
            >
              {type === 'danger' ? (
                <View
                  className="py-3 rounded-2xl"
                  style={{ backgroundColor: config.confirmColor }}
                >
                  <View className="flex-row items-center justify-center">
                    {isLoading && (
                      <Ionicons name="refresh" size={16} color="white" style={{ marginRight: 8 }} />
                    )}
                    <Text className="text-white text-center font-semibold">
                      {isLoading ? 'Deleting Forever...' : `${confirmText} Forever`}
                    </Text>
                  </View>
                </View>
              ) : (
                <LinearGradient
                  colors={type === 'success' ? ['#00ff88', '#00cc6a'] : ['#00f5ff', '#0080ff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-3 rounded-2xl"
                >
                  <View className="flex-row items-center justify-center">
                    {isLoading && (
                      <Ionicons name="refresh" size={16} color="white" style={{ marginRight: 8 }} />
                    )}
                    <Text className="text-black text-center font-semibold">
                      {isLoading ? 'Processing...' : confirmText}
                    </Text>
                  </View>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;