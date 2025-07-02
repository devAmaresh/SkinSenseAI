import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const Card = ({ 
  children, 
  onPress, 
  style = {}, 
  gradient = false,
  padding = 16 
}) => {
  const cardStyle = {
    borderRadius: 16,
    padding: padding,
    ...style
  };

  if (gradient) {
    return (
      <TouchableOpacity onPress={onPress} disabled={!onPress}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[cardStyle, { 
            borderWidth: 1, 
            borderColor: 'rgba(255, 255, 255, 0.1)' 
          }]}
        >
          {children}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const Component = onPress ? TouchableOpacity : View;
  
  return (
    <Component 
      onPress={onPress}
      style={[cardStyle, {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }]}
    >
      {children}
    </Component>
  );
};