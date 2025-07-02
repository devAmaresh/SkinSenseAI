import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  style = {},
  ...props
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View style={[{ marginBottom: 16 }, style]}>
      {label && (
        <Text style={{
          color: '#FFFFFF',
          fontSize: 14,
          fontWeight: '500',
          marginBottom: 8,
        }}>
          {label}
        </Text>
      )}
      
      <View style={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: error ? '#FF4757' : 'rgba(255, 255, 255, 0.1)',
        flexDirection: 'row',
        alignItems: multiline ? 'flex-start' : 'center',
        paddingHorizontal: 16,
        paddingVertical: multiline ? 12 : 16,
      }}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isSecure}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={{
            flex: 1,
            color: '#FFFFFF',
            fontSize: 16,
            textAlignVertical: multiline ? 'top' : 'center',
          }}
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setIsSecure(!isSecure)}>
            <Ionicons 
              name={isSecure ? 'eye-off' : 'eye'} 
              size={20} 
              color="rgba(255, 255, 255, 0.5)" 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={{
          color: '#FF4757',
          fontSize: 12,
          marginTop: 4,
        }}>
          {error}
        </Text>
      )}
    </View>
  );
};