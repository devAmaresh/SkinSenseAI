import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  loading = false,
  icon = null,
  style = {},
  textStyle = {}
}) => {
  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    const sizeStyles = {
      small: { paddingVertical: 8, paddingHorizontal: 16 },
      medium: { paddingVertical: 12, paddingHorizontal: 20 },
      large: { paddingVertical: 16, paddingHorizontal: 24 },
    };

    return [baseStyle, sizeStyles[size], style];
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    const sizeTextStyles = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
    };

    const variantTextStyles = {
      primary: { color: '#FFFFFF' },
      secondary: { color: '#FF6B9D' },
      outline: { color: '#FF6B9D' },
      ghost: { color: '#FF6B9D' },
    };

    return [baseTextStyle, sizeTextStyles[size], variantTextStyles[variant], textStyle];
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={{ opacity: disabled ? 0.6 : 1 }}>
        <LinearGradient
          colors={['#FF6B9D', '#C147E9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={getButtonStyle()}
        >
          {loading && <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />}
          {icon && !loading && <Text style={{ marginRight: 8 }}>{icon}</Text>}
          <Text style={getTextStyle()}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles = {
    secondary: { backgroundColor: 'rgba(255, 107, 157, 0.1)', borderWidth: 1, borderColor: '#FF6B9D' },
    outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FF6B9D' },
    ghost: { backgroundColor: 'transparent' },
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled || loading} 
      style={[getButtonStyle(), variantStyles[variant], { opacity: disabled ? 0.6 : 1 }]}
    >
      {loading && <ActivityIndicator color="#FF6B9D" size="small" style={{ marginRight: 8 }} />}
      {icon && !loading && <Text style={{ marginRight: 8 }}>{icon}</Text>}
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};