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
import { useAuth } from '../contexts/AuthContext';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const credentials = {
        email: email.trim().toLowerCase(),
        password: password,
      };

      await login(credentials);
      
      // Alert.alert(
      //   'Success!', 
      //   'Welcome back to SkinSenseAI!'
      // );
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.message.includes('Network connection failed')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection and ensure the backend is running.';
      } else if (error.message.includes('Incorrect email or password')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
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

            <View className="flex-1 justify-center px-8 pt-5">
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
                    colors={['#00f5ff', '#0080ff']}
                    className="w-12 h-12 rounded-full items-center justify-center"
                  >
                    <Ionicons name="person" size={24} color="#000" />
                  </LinearGradient>
                </View>
                <Text className="text-4xl font-bold text-white text-center mb-2">
                  Welcome Back
                </Text>
                <Text className="text-gray-300 text-center text-lg">
                  Sign in to continue to SkinSenseAI
                </Text>
              </View>

              {/* Login Form */}
              <View className="space-y-6 gap-2 pt-10">
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
                      editable={!isLoading}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View className="space-y-2">
                  <Text className="text-gray-300 text-sm font-medium ml-1">
                    Password
                  </Text>
                  <View 
                    className="rounded-2xl px-4 py-2 flex-row items-center"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <TextInput
                      className="text-white text-base flex-1"
                      placeholder="Enter your password"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="ml-2"
                      disabled={isLoading}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={20}
                        color="rgba(255,255,255,0.6)"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgotPassword')}
                  className="self-end"
                  disabled={isLoading}
                  >
                  <Text className="text-cyan-400 text-sm font-medium">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

                {/* Login Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={isLoading}
                  className="rounded-2xl py-4 mt-6 overflow-hidden"
                  style={{ opacity: isLoading ? 0.7 : 1 }}
                >
                  <LinearGradient
                    colors={['#00f5ff', '#0080ff', '#8000ff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="py-4 rounded-2xl"
                  >
                    <Text className="text-black text-center text-lg font-bold">
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center my-4">
                  <View className="flex-1 h-px bg-gray-700" />
                  <Text className="mx-4 text-gray-400 text-sm">or continue with</Text>
                  <View className="flex-1 h-px bg-gray-700" />
                </View>

                {/* Social Login Buttons */}
                <View className="flex-row space-x-4 gap-6">
                  {['logo-google', 'logo-apple', 'logo-facebook'].map((icon, index) => (
                    <TouchableOpacity 
                      key={index}
                      className="flex-1 rounded-2xl py-4 items-center"
                      disabled={isLoading}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.25)',
                      }}
                    >
                      <Ionicons name={icon} size={24} color="white" />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Sign Up Link */}
                <View className="flex-row justify-center items-center mt-8">
                  <Text className="text-gray-400 text-base">
                    Don't have an account? 
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Signup')}
                    className="ml-2"
                    disabled={isLoading}
                  >
                    <Text className="text-cyan-400 text-base font-bold">
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
        </KeyboardAwareScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
