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

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (!agreeToTerms) {
      Alert.alert('Error', 'Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('SkinTypeQuestions');
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
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="absolute top-12 left-6 z-10 w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <View className="flex-1 justify-center px-8 pt-20">
              {/* Header */}
              <View className="items-center mb-8">
                <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center mb-6">
                  <Ionicons name="person-add-outline" size={40} color="white" />
                </View>
                <Text className="text-4xl font-bold text-white text-center mb-2">
                  Create Account
                </Text>
                <Text className="text-white/80 text-center text-lg">
                  Join SkinSenseAI and start your journey
                </Text>
              </View>

              {/* Signup Form */}
              <View className="space-y-5">
                {/* Full Name Input */}
                <View className="space-y-2">
                  <Text className="text-white/90 text-sm font-medium ml-1">
                    Full Name
                  </Text>
                  <View className="bg-white/10 rounded-2xl px-4 py-4 border border-white/20">
                    <TextInput
                      className="text-white text-base"
                      placeholder="Enter your full name"
                      placeholderTextColor="rgba(255,255,255,0.6)"
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                </View>

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
                      placeholder="Create a password"
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

                {/* Confirm Password Input */}
                <View className="space-y-2">
                  <Text className="text-white/90 text-sm font-medium ml-1">
                    Confirm Password
                  </Text>
                  <View className="bg-white/10 rounded-2xl px-4 py-4 border border-white/20 flex-row items-center">
                    <TextInput
                      className="text-white text-base flex-1"
                      placeholder="Confirm your password"
                      placeholderTextColor="rgba(255,255,255,0.6)"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="ml-2"
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye-off" : "eye"}
                        size={20}
                        color="rgba(255,255,255,0.7)"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Terms and Conditions */}
                <TouchableOpacity
                  onPress={() => setAgreeToTerms(!agreeToTerms)}
                  className="flex-row items-center mt-4"
                >
                  <View className={`w-5 h-5 rounded border-2 border-white/50 mr-3 items-center justify-center ${agreeToTerms ? 'bg-white' : 'bg-transparent'}`}>
                    {agreeToTerms && (
                      <Ionicons name="checkmark" size={12} color="#667eea" />
                    )}
                  </View>
                  <Text className="text-white/80 text-sm flex-1">
                    I agree to the{' '}
                    <Text className="text-white font-medium">Terms of Service</Text>
                    {' '}and{' '}
                    <Text className="text-white font-medium">Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>

                {/* Signup Button */}
                <TouchableOpacity
                  onPress={handleSignup}
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
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center my-6">
                  <View className="flex-1 h-px bg-white/30" />
                  <Text className="mx-4 text-white/70 text-sm">or sign up with</Text>
                  <View className="flex-1 h-px bg-white/30" />
                </View>

                {/* Social Signup Buttons */}
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

                {/* Login Link */}
                <View className="flex-row justify-center items-center mt-6 mb-8">
                  <Text className="text-white/80 text-base">
                    Already have an account? 
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
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
