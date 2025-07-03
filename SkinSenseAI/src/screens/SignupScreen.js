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

export default function SignupScreen({ navigation }) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async () => {
    // Validation
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
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

    try {
      const userData = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
      };

      const response = await register(userData);
      
      Alert.alert(
        'Success!', 
        'Account created successfully!',
        [{ text: 'OK', onPress: () => navigation.navigate('SkinTypeQuestions') }]
      );
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert(
        'Signup Failed', 
        error.message || 'Failed to create account. Please try again.'
      );
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
              className="absolute top-4 left-6 z-10 w-12 h-12 rounded-full items-center justify-center"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <View className="flex-1 justify-center px-8 pt-11">
              {/* Header */}
              <View className="items-center mb-8">
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
                    <Ionicons name="person-add" size={24} color="#000" />
                  </LinearGradient>
                </View>
                <Text className="text-4xl font-bold text-white text-center mb-2">
                  Create Account
                </Text>
                <Text className="text-gray-300 text-center text-lg">
                  Join SkinSenseAI and start your journey
                </Text>
              </View>

              {/* Signup Form */}
              <View className="space-y-5 gap-2">
                {/* Full Name Input */}
                <View className="space-y-2">
                  <Text className="text-gray-300 text-sm font-medium ml-1">
                    Full Name
                  </Text>
                  <View 
                    className="rounded-2xl px-4 py-1"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <TextInput
                      className="text-white text-base"
                      placeholder="Enter your full name"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                  </View>
                </View>

                {/* Email Input */}
                <View className="space-y-2">
                  <Text className="text-gray-300 text-sm font-medium ml-1">
                    Email Address
                  </Text>
                  <View 
                    className="rounded-2xl px-4 py-1"
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
                    className="rounded-2xl px-4 py-1 flex-row items-center"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <TextInput
                      className="text-white text-base flex-1"
                      placeholder="Create a password"
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

                {/* Confirm Password Input */}
                <View className="space-y-2">
                  <Text className="text-gray-300 text-sm font-medium ml-1">
                    Confirm Password
                  </Text>
                  <View 
                    className="rounded-2xl px-4 py-1 flex-row items-center"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <TextInput
                      className="text-white text-base flex-1"
                      placeholder="Confirm your password"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="ml-2"
                      disabled={isLoading}
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye-off" : "eye"}
                        size={20}
                        color="rgba(255,255,255,0.6)"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Terms and Conditions */}
                <TouchableOpacity
                  onPress={() => setAgreeToTerms(!agreeToTerms)}
                  className="flex-row items-center mt-2"
                  disabled={isLoading}
                >
                  <View 
                    className={`w-5 h-5 rounded mr-3 items-center justify-center`}
                    style={{
                      backgroundColor: agreeToTerms 
                        ? 'rgba(0, 245, 255, 0.2)' 
                        : 'rgba(255, 255, 255, 0.03)',
                      borderWidth: 1,
                      borderColor: agreeToTerms 
                        ? 'rgba(0, 245, 255, 0.4)' 
                        : 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {agreeToTerms && (
                      <Ionicons name="checkmark" size={12} color="#00f5ff" />
                    )}
                  </View>
                  <Text className="text-gray-300 text-sm flex-1">
                    I agree to the{' '}
                    <Text className="text-cyan-400 font-medium">Terms of Service</Text>
                    {' '}and{' '}
                    <Text className="text-cyan-400 font-medium">Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>

                {/* Signup Button */}
                <TouchableOpacity
                  onPress={handleSignup}
                  disabled={isLoading}
                  className="rounded-2xl py-4 mt-2 overflow-hidden"
                  style={{ opacity: isLoading ? 0.7 : 1 }}
                >
                  <LinearGradient
                    colors={['#00f5ff', '#0080ff', '#8000ff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="py-4 rounded-2xl"
                  >
                    <Text className="text-black text-center text-lg font-bold">
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center my-2">
                  <View className="flex-1 h-px bg-gray-700" />
                  <Text className="mx-4 text-gray-400 text-sm">or sign up with</Text>
                  <View className="flex-1 h-px bg-gray-700" />
                </View>

                {/* Social Signup Buttons */}
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

                {/* Login Link */}
                <View className="flex-row justify-center items-center mt-6 mb-8">
                  <Text className="text-gray-400 text-base">
                    Already have an account? 
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    className="ml-2"
                    disabled={isLoading}
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
