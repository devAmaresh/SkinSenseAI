import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
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
        colors={['#000000', '#1a1a1a', '#000000']}
        className="flex-1"
      >
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 6 }}
          enableOnAndroid={true}
          extraScrollHeight={20} // adjust as needed
          >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="absolute top-12 left-6 z-10 w-12 h-12 rounded-full items-center justify-center"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View className="flex-1 justify-center px-8 mt-10">
            {/* Header */}
            <View className="items-center mb-10">
              <View 
                className="w-24 h-24 rounded-full items-center justify-center mb-6"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <LinearGradient
                  colors={['#8000ff', '#0080ff']}
                  className="w-12 h-12 rounded-full items-center justify-center"
                >
                  <Ionicons name="lock-closed" size={24} color="#000" />
                </LinearGradient>
              </View>
              <Text className="text-4xl font-bold text-white text-center mb-2">
                Forgot Password?
              </Text>
              <Text className="text-gray-300 text-center text-lg leading-relaxed">
                Don't worry! Enter your email address and we'll send you a reset link.
              </Text>
            </View>

            {/* Reset Form */}
            <View className="space-y-6">
              {/* Email Input */}
              <View className="space-y-2">
                <Text className="text-gray-300 text-sm font-medium ml-1">
                  Email Address
                </Text>
                <View 
                  className="rounded-2xl px-4 py-2"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <TextInput
                    className="text-white text-base"
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(255,255,255,0.4)"
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
                className="rounded-2xl py-4 mt-6 overflow-hidden"
              >
                <LinearGradient
                  colors={['#8000ff', '#0080ff', '#00f5ff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-4 rounded-2xl"
                >
                  <Text className="text-black text-center text-lg font-bold">
                    {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Additional Info */}
              <View 
                className="rounded-2xl p-4 mt-6"
                style={{
                  backgroundColor: 'rgba(128, 0, 255, 0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(128, 0, 255, 0.1)',
                }}
              >
                <View className="flex-row items-center mb-2">
                  <Ionicons name="information-circle" size={20} color="#8000ff" />
                  <Text className="text-purple-400 font-semibold ml-2">
                    Quick Tip
                  </Text>
                </View>
                <Text className="text-gray-300 text-sm">
                  Check your spam folder if you don't see the reset email in your inbox within a few minutes.
                </Text>
              </View>

              {/* Back to Login */}
              <View className="flex-row justify-center items-center mt-8">
                <Text className="text-gray-400 text-base">
                  Remember your password? 
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  className="ml-2"
                >
                  <Text className="text-cyan-400 text-base font-bold">
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
