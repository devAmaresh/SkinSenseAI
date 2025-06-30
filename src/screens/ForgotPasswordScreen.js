import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Reset Link Sent',
        'We have sent a password reset link to your email address.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 2000);
  };

  return (
    <SafeAreaView className="flex-1">
      <StatusBar style="light" />
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        className="flex-1"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="absolute top-12 left-6 z-10 w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View className="flex-1 justify-center px-8">
            {/* Header */}
            <View className="items-center mb-10">
              <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center mb-6">
                <Ionicons name="lock-closed-outline" size={40} color="white" />
              </View>
              <Text className="text-4xl font-bold text-white text-center mb-2">
                Forgot Password?
              </Text>
              <Text className="text-white/80 text-center text-lg leading-relaxed">
                Don't worry! Enter your email address and we'll send you a reset link.
              </Text>
            </View>

            {/* Reset Form */}
            <View className="space-y-6">
              {/* Email Input */}
              <View className="space-y-2">
                <Text className="text-white/90 text-sm font-medium ml-1">
                  Email Address
                </Text>
                <View className="bg-white/10 rounded-2xl px-4 py-4 border border-white/20">
                  <TextInput
                    className="text-white text-base"
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Reset Button */}
              <TouchableOpacity
                onPress={handleResetPassword}
                disabled={isLoading}
                className="bg-white rounded-2xl py-4 mt-6"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Text className="text-purple-600 text-center text-lg font-bold">
                  {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
                </Text>
              </TouchableOpacity>

              {/* Back to Login */}
              <View className="flex-row justify-center items-center mt-8">
                <Text className="text-white/80 text-base">
                  Remember your password? 
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  className="ml-2"
                >
                  <Text className="text-white text-base font-bold">
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
