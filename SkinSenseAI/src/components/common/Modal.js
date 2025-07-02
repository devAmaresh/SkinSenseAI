import React from 'react';
import { 
  Modal as RNModal, 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import Ionicons from '@expo/vector-icons/Ionicons';

const { height } = Dimensions.get('window');

export const Modal = ({ 
  visible, 
  onClose, 
  title, 
  children, 
  height: modalHeight = height * 0.8 
}) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        <BlurView 
          intensity={20} 
          style={{ 
            flex: 1, 
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
        >
          <TouchableOpacity 
            style={{ flex: 1 }} 
            activeOpacity={1} 
            onPress={onClose}
          />
          
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{
              backgroundColor: '#1A1A1A',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: modalHeight,
              borderTopWidth: 1,
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255, 255, 255, 0.1)',
            }}>
              <Text style={{
                color: '#FFFFFF',
                fontSize: 18,
                fontWeight: '600',
              }}>
                {title}
              </Text>
              
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            {/* Content */}
            <View style={{ flex: 1, padding: 20 }}>
              {children}
            </View>
          </KeyboardAvoidingView>
        </BlurView>
      </View>
    </RNModal>
  );
};