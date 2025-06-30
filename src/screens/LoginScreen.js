import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('Home');
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
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 justify-center px-8">
              {/* Header */}
              <View className="items-center mb-10">
                <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center mb-6">
                  <Ionicons name="person-circle-outline" size={40} color="white" />
                </View>
                <Text className="text-4xl font-bold text-white text-center mb-2">
                  Welcome Back
                </Text>
                <Text className="text-white/80 text-center text-lg">
                  Sign in to continue to SkinSenseAI
                </Text>
              </View>

              {/* Login Form */}
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

                {/* Password Input */}
                <View className="space-y-2">
                  <Text className="text-white/90 text-sm font-medium ml-1">
                    Password
                  </Text>
                  <View className="bg-white/10 rounded-2xl px-4 py-4 border border-white/20 flex-row items-center">
                    <TextInput
                      className="text-white text-base flex-1"
                      placeholder="Enter your password"
                      placeholderTextColor="rgba(255,255,255,0.6)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="ml-2"
                    >
                      <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={20}
                        color="rgba(255,255,255,0.7)"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgotPassword')}
                  className="self-end"
                >
                  <Text className="text-white/80 text-sm font-medium">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity
                  onPress={handleLogin}
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
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Text>
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center my-6">
                  <View className="flex-1 h-px bg-white/30" />
                  <Text className="mx-4 text-white/70 text-sm">or continue with</Text>
                  <View className="flex-1 h-px bg-white/30" />
                </View>

                {/* Social Login Buttons */}
                <View className="flex-row space-x-4">
                  <TouchableOpacity className="flex-1 bg-white/10 rounded-2xl py-4 items-center border border-white/20">
                    <Ionicons name="logo-google" size={24} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 bg-white/10 rounded-2xl py-4 items-center border border-white/20">
                    <Ionicons name="logo-apple" size={24} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 bg-white/10 rounded-2xl py-4 items-center border border-white/20">
                    <Ionicons name="logo-facebook" size={24} color="white" />
                  </TouchableOpacity>
                </View>

                {/* Sign Up Link */}
                <View className="flex-row justify-center items-center mt-8">
                  <Text className="text-white/80 text-base">
                    Don't have an account? 
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Signup')}
                    className="ml-2"
                  >
                    <Text className="text-white text-base font-bold">
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
