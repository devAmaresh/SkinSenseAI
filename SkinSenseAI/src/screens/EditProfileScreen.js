import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import ApiService from '../services/api';

export default function EditProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const userData = await ApiService.getCurrentUser();
      setUser(userData);
      setFormData({
        full_name: userData.full_name || '',
        username: userData.username || '',
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!formData.full_name.trim()) {
      Alert.alert('Error', 'Full name is required');
      return;
    }

    if (!formData.username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    setIsSaving(true);

    try {
      const updatedUser = await ApiService.updateProfile({
        full_name: formData.full_name.trim(),
        username: formData.username.trim(),
      });

      setUser(updatedUser);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.current_password) {
      Alert.alert('Error', 'Current password is required');
      return;
    }

    if (!passwordData.new_password) {
      Alert.alert('Error', 'New password is required');
      return;
    }

    if (passwordData.new_password.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setIsChangingPassword(true);

    try {
      await ApiService.changePassword(
        passwordData.current_password,
        passwordData.new_password
      );

      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setShowPasswordSection(false);
      Alert.alert('Success', 'Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to change password. Please try again.'
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1">
        <LinearGradient colors={['#000000', '#1a1a1a', '#000000']} className="flex-1">
          <View className="flex-1 justify-center items-center">
            <Text className="text-white text-lg">Loading profile...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <StatusBar style="light" />
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        className="flex-1"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="px-6 pt-12 pb-6">
              <View className="flex-row justify-between items-center mb-6">
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleUpdateProfile}
                  disabled={isSaving}
                  className="px-6 py-2 rounded-2xl"
                  style={{
                    backgroundColor: isSaving 
                      ? 'rgba(0, 245, 255, 0.3)' 
                      : 'rgba(0, 245, 255, 0.1)',
                    borderWidth: 1,
                    borderColor: 'rgba(0, 245, 255, 0.2)',
                    opacity: isSaving ? 0.7 : 1,
                  }}
                >
                  <Text className="text-cyan-400 font-semibold">
                    {isSaving ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text className="text-3xl font-bold text-white mb-2">
                Edit Profile
              </Text>
              <Text className="text-gray-300 text-lg">
                Update your account information
              </Text>
            </View>

            <View className="px-6 space-y-6">
              {/* Profile Picture Section */}
              <View className="items-center mb-6">
                <View 
                  className="w-24 h-24 rounded-full items-center justify-center mb-4"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <LinearGradient
                    colors={['#00f5ff', '#0080ff']}
                    className="w-16 h-16 rounded-full items-center justify-center"
                  >
                    <Ionicons name="person" size={32} color="#000" />
                  </LinearGradient>
                </View>
                <TouchableOpacity
                  className="px-4 py-2 rounded-2xl"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Text className="text-gray-400 text-sm">Change Photo</Text>
                </TouchableOpacity>
              </View>

              {/* Basic Information */}
              <View 
                className="rounded-2xl p-6"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <Text className="text-xl font-semibold text-white mb-4">
                  Basic Information
                </Text>

                {/* Full Name */}
                <View className="space-y-2 mb-4">
                  <Text className="text-gray-300 text-sm font-medium ml-1">
                    Full Name
                  </Text>
                  <View 
                    className="rounded-2xl px-4 py-4"
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
                      value={formData.full_name}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
                      editable={!isSaving}
                    />
                  </View>
                </View>

                {/* Username */}
                <View className="space-y-2 mb-4">
                  <Text className="text-gray-300 text-sm font-medium ml-1">
                    Username
                  </Text>
                  <View 
                    className="rounded-2xl px-4 py-4"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <TextInput
                      className="text-white text-base"
                      placeholder="Enter your username"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      value={formData.username}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
                      autoCapitalize="none"
                      editable={!isSaving}
                    />
                  </View>
                </View>

                {/* Email (Read-only) */}
                <View className="space-y-2">
                  <Text className="text-gray-300 text-sm font-medium ml-1">
                    Email Address
                  </Text>
                  <View 
                    className="rounded-2xl px-4 py-4"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <Text className="text-gray-400 text-base">
                      {user?.email}
                    </Text>
                  </View>
                  <Text className="text-gray-500 text-xs ml-1">
                    Email cannot be changed for security reasons
                  </Text>
                </View>
              </View>

              {/* Password Section */}
              <View 
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <TouchableOpacity
                  onPress={() => setShowPasswordSection(!showPasswordSection)}
                  className="p-6 flex-row justify-between items-center"
                >
                  <View>
                    <Text className="text-xl font-semibold text-white mb-1">
                      Change Password
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      Update your account password
                    </Text>
                  </View>
                  <Ionicons 
                    name={showPasswordSection ? "chevron-up" : "chevron-down"} 
                    size={24} 
                    color="rgba(255,255,255,0.6)" 
                  />
                </TouchableOpacity>

                {showPasswordSection && (
                  <View className="px-6 pb-6 space-y-4">
                    {/* Current Password */}
                    <View className="space-y-2">
                      <Text className="text-gray-300 text-sm font-medium ml-1">
                        Current Password
                      </Text>
                      <View 
                        className="rounded-2xl px-4 py-4 flex-row items-center"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <TextInput
                          className="flex-1 text-white text-base"
                          placeholder="Enter current password"
                          placeholderTextColor="rgba(255,255,255,0.4)"
                          value={passwordData.current_password}
                          onChangeText={(text) => setPasswordData(prev => ({ ...prev, current_password: text }))}
                          secureTextEntry={!showPasswords.current}
                          editable={!isChangingPassword}
                        />
                        <TouchableOpacity
                          onPress={() => togglePasswordVisibility('current')}
                          className="ml-3"
                        >
                          <Ionicons 
                            name={showPasswords.current ? "eye-off" : "eye"} 
                            size={20} 
                            color="rgba(255,255,255,0.6)" 
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* New Password */}
                    <View className="space-y-2">
                      <Text className="text-gray-300 text-sm font-medium ml-1">
                        New Password
                      </Text>
                      <View 
                        className="rounded-2xl px-4 py-4 flex-row items-center"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <TextInput
                          className="flex-1 text-white text-base"
                          placeholder="Enter new password"
                          placeholderTextColor="rgba(255,255,255,0.4)"
                          value={passwordData.new_password}
                          onChangeText={(text) => setPasswordData(prev => ({ ...prev, new_password: text }))}
                          secureTextEntry={!showPasswords.new}
                          editable={!isChangingPassword}
                        />
                        <TouchableOpacity
                          onPress={() => togglePasswordVisibility('new')}
                          className="ml-3"
                        >
                          <Ionicons 
                            name={showPasswords.new ? "eye-off" : "eye"} 
                            size={20} 
                            color="rgba(255,255,255,0.6)" 
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Confirm New Password */}
                    <View className="space-y-2">
                      <Text className="text-gray-300 text-sm font-medium ml-1">
                        Confirm New Password
                      </Text>
                      <View 
                        className="rounded-2xl px-4 py-4 flex-row items-center"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <TextInput
                          className="flex-1 text-white text-base"
                          placeholder="Confirm new password"
                          placeholderTextColor="rgba(255,255,255,0.4)"
                          value={passwordData.confirm_password}
                          onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirm_password: text }))}
                          secureTextEntry={!showPasswords.confirm}
                          editable={!isChangingPassword}
                        />
                        <TouchableOpacity
                          onPress={() => togglePasswordVisibility('confirm')}
                          className="ml-3"
                        >
                          <Ionicons 
                            name={showPasswords.confirm ? "eye-off" : "eye"} 
                            size={20} 
                            color="rgba(255,255,255,0.6)" 
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Change Password Button */}
                    <TouchableOpacity
                      onPress={handleChangePassword}
                      disabled={isChangingPassword}
                      className="rounded-2xl py-4 mt-4 overflow-hidden"
                      style={{ opacity: isChangingPassword ? 0.7 : 1 }}
                    >
                      <LinearGradient
                        colors={['#ff6600', '#ff4444']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="py-4 rounded-2xl"
                      >
                        <Text className="text-white text-center text-lg font-bold">
                          {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Account Info */}
              <View 
                className="rounded-2xl p-6 mb-8"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <Text className="text-xl font-semibold text-white mb-4">
                  Account Information
                </Text>
                
                <View className="space-y-3">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-400">Member Since</Text>
                    <Text className="text-white">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </Text>
                  </View>
                  
                  <View className="flex-row justify-between">
                    <Text className="text-gray-400">Account Status</Text>
                    <View className="flex-row items-center">
                      <Ionicons 
                        name={user?.is_verified ? "checkmark-circle" : "alert-circle"} 
                        size={16} 
                        color={user?.is_verified ? "#00ff88" : "#ffaa00"} 
                      />
                      <Text 
                        className="ml-2 text-sm font-medium"
                        style={{ color: user?.is_verified ? "#00ff88" : "#ffaa00" }}
                      >
                        {user?.is_verified ? 'Verified' : 'Unverified'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}