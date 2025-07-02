import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import ApiService from "../services/api";

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [skinProfile, setSkinProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);

      // Load user data
      const userData = await ApiService.getCurrentUser();
      setUser(userData);

      // Try to load skin profile
      try {
        const skinData = await ApiService.getSkinProfile();
        setSkinProfile(skinData);
      } catch (skinError) {
        console.log("No skin profile found:", skinError);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: performLogout,
      },
    ]);
  };

  const performLogout = async () => {
    try {
      await ApiService.logout();
      Alert.alert("Logged Out", "You have been successfully logged out.", [
        {
          text: "OK",
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: "Welcome" }],
            }),
        },
      ]);
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, navigate to welcome screen
      navigation.reset({
        index: 0,
        routes: [{ name: "Welcome" }],
      });
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "I understand, delete my account",
          style: "destructive",
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      "Final Confirmation",
      "This is your last chance to cancel. Your account and all associated data will be permanently deleted.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: performDeleteAccount,
        },
      ]
    );
  };

  const performDeleteAccount = async () => {
    try {
      await ApiService.deleteAccount();
      Alert.alert(
        "Account Deleted",
        "Your account has been successfully deleted.",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{ name: "Welcome" }],
              }),
          },
        ]
      );
    } catch (error) {
      console.error("Delete account error:", error);
      Alert.alert(
        "Error",
        "Failed to delete account. Please try again or contact support."
      );
    }
  };

  const profileSections = [
    {
      title: "Account",
      items: [
        {
          icon: "person-outline",
          label: "Edit Profile",
          onPress: () => navigation.navigate("EditProfile"),
          showArrow: true,
        },
        {
          icon: "mail-outline",
          label: "Email",
          value: user?.email,
          showArrow: false,
        },
        {
          icon: "time-outline",
          label: "Member Since",
          value: user?.created_at
            ? new Date(user.created_at).toLocaleDateString()
            : "N/A",
          showArrow: false,
        },
      ],
    },
    {
      title: "Skin Profile",
      items: [
        {
          icon: "flask-outline",
          label: "Skin Type",
          value: skinProfile?.skin_type?.toUpperCase() || "Not assessed",
          onPress: skinProfile
            ? null
            : () => navigation.navigate("SkinTypeQuestions"),
          showArrow: !skinProfile,
        },
        {
          icon: "analytics-outline",
          label: "My Analyses",
          onPress: () => navigation.navigate("MyAnalyses"),
          showArrow: true,
        },
        {
          icon: "refresh-outline",
          label: "Retake Assessment",
          onPress: () => navigation.navigate("SkinTypeQuestions"),
          showArrow: true,
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: "notifications-outline",
          label: "Push Notifications",
          component: (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#767577", true: "#00f5ff" }}
              thumbColor={notificationsEnabled ? "#ffffff" : "#f4f3f4"}
            />
          ),
          showArrow: false,
        },
        {
          icon: "help-circle-outline",
          label: "Help & Support",
          onPress: () => Alert.alert("Help", "Support feature coming soon!"),
          showArrow: true,
        },
        {
          icon: "document-text-outline",
          label: "Privacy Policy",
          onPress: () =>
            Alert.alert("Privacy Policy", "Privacy policy coming soon!"),
          showArrow: true,
        },
      ],
    },
  ];

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1">
        <LinearGradient
          colors={["#000000", "#1a1a1a", "#000000"]}
          className="flex-1"
        >
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
        colors={["#000000", "#1a1a1a", "#000000"]}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-1 pb-6">
            <View className="flex-row justify-between items-center mb-6">
              <TouchableOpacity
                onPress={() => navigation.navigate("Home")}
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogout}
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{
                  backgroundColor: "rgba(255, 0, 0, 0.1)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 0, 0, 0.2)",
                }}
              >
                <Ionicons name="log-out-outline" size={24} color="#ff4444" />
              </TouchableOpacity>
            </View>

            {/* Profile Header */}
            <View className="items-center">
              <View
                className="w-24 h-24 rounded-full items-center justify-center mb-4"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <LinearGradient
                  colors={["#00f5ff", "#0080ff"]}
                  className="w-12 h-12 rounded-full items-center justify-center"
                >
                  <Ionicons name="person" size={24} color="#000" />
                </LinearGradient>
              </View>

              <Text className="text-2xl font-bold text-white mb-1">
                {user?.full_name || "User"}
              </Text>

              <Text className="text-gray-400 text-base">{user?.email}</Text>

              {skinProfile && (
                <View
                  className="mt-3 px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: "rgba(0, 245, 255, 0.1)",
                    borderWidth: 1,
                    borderColor: "rgba(0, 245, 255, 0.2)",
                  }}
                >
                  <Text className="text-cyan-400 text-sm font-medium">
                    {skinProfile.skin_type.toUpperCase()} SKIN
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Profile Sections */}
          <View className="px-6 space-y-6">
            {profileSections.map((section, sectionIndex) => (
              <View key={sectionIndex} className="space-y-3">
                <Text className="text-lg font-semibold text-white mb-2">
                  {section.title}
                </Text>

                <View
                  className="rounded-2xl overflow-hidden"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {section.items.map((item, itemIndex) => (
                    <TouchableOpacity
                      key={itemIndex}
                      onPress={item.onPress}
                      disabled={!item.onPress}
                      className={`p-4 flex-row items-center ${
                        itemIndex < section.items.length - 1 ? "border-b" : ""
                      }`}
                      style={{
                        borderBottomColor: "rgba(255, 255, 255, 0.05)",
                        borderBottomWidth:
                          itemIndex < section.items.length - 1 ? 1 : 0,
                      }}
                    >
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{
                          backgroundColor: "rgba(0, 245, 255, 0.1)",
                          borderWidth: 1,
                          borderColor: "rgba(0, 245, 255, 0.2)",
                        }}
                      >
                        <Ionicons name={item.icon} size={20} color="#00f5ff" />
                      </View>

                      <View className="flex-1">
                        <Text className="text-white font-medium">
                          {item.label}
                        </Text>
                        {item.value && (
                          <Text className="text-gray-400 text-sm mt-1">
                            {item.value}
                          </Text>
                        )}
                      </View>

                      {item.component && item.component}

                      {item.showArrow && (
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="rgba(255,255,255,0.4)"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}

            {/* Danger Zone */}
            <View className="space-y-3 mb-8">
              <Text className="text-lg font-semibold text-red-400 mb-2">
                Danger Zone
              </Text>

              <TouchableOpacity
                onPress={handleDeleteAccount}
                className="p-4 rounded-2xl flex-row items-center"
                style={{
                  backgroundColor: "rgba(255, 0, 0, 0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 0, 0, 0.1)",
                }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderWidth: 1,
                    borderColor: "rgba(255, 0, 0, 0.2)",
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#ff4444" />
                </View>

                <View className="flex-1">
                  <Text className="text-red-400 font-medium">
                    Delete Account
                  </Text>
                  <Text className="text-red-300 text-sm mt-1 opacity-70">
                    Permanently delete your account and all data
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="rgba(255,68,68,0.6)"
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
