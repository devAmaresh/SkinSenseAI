import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import ApiService from "../services/api";
import { Skeleton, TextSkeleton } from "../components/Skeleton";
import { useAuth } from "../contexts/AuthContext";
import { ActivityIndicator } from "react-native-paper";

export default function ProfileScreen({ navigation }) {
  const { logout, deleteAccount } = useAuth();
  const [user, setUser] = useState(null);
  const [skinProfile, setSkinProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

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
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Logout Error", "Something went wrong. Please try again.");
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
    setIsDeleting(true);
    try {
      await deleteAccount();
      Alert.alert(
        "Account Deleted",
        "Your account has been successfully deleted."
      );
    } catch (error) {
      console.error("Delete account error:", error);
      Alert.alert(
        "Error",
        "Failed to delete account. Please try again or contact support."
      );
    } finally {
      setIsDeleting(false);
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
            ? () => navigation.navigate("SkinProfile")
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

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#000000" }}>
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
                <Image
                  src={
                    user?.profile_picture ||
                    "https://avatar.iran.liara.run/public/42"
                  }
                  alt="Profile"
                  className="w-full h-full rounded-full"
                />
              </View>

              {/* Name with skeleton */}
              {isLoading ? (
                <View className="items-center">
                  <Skeleton
                    width={180}
                    height={28}
                    borderRadius={14}
                    style={{ marginBottom: 8 }}
                  />
                  <Skeleton width={140} height={16} borderRadius={8} />
                </View>
              ) : (
                <>
                  <Text className="text-2xl font-bold text-white mb-1">
                    {user?.full_name || "User"}
                  </Text>
                  <Text className="text-gray-400 text-base">{user?.email}</Text>
                </>
              )}

              {/* Skin type badge */}
              {!isLoading && skinProfile && (
                <View
                  className="mt-3 px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: "rgba(0, 245, 255, 0.1)",
                    borderWidth: 1,
                    borderColor: "rgba(0, 245, 255, 0.2)",
                  }}
                >
                  <Text className="text-cyan-400 text-sm font-medium">
                    {skinProfile?.skin_type?.toUpperCase()} SKIN
                  </Text>
                </View>
              )}

              {isLoading && (
                <Skeleton
                  width={120}
                  height={24}
                  borderRadius={12}
                  style={{ marginTop: 12 }}
                />
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
                          <>
                            {isLoading &&
                            (item.label === "Email" ||
                              item.label === "Member Since") ? (
                              <Skeleton
                                width={120}
                                height={14}
                                borderRadius={7}
                                style={{ marginTop: 4 }}
                              />
                            ) : (
                              <Text className="text-gray-400 text-sm mt-1">
                                {item.value}
                              </Text>
                            )}
                          </>
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
                disabled={isDeleting}
                className="p-4 rounded-2xl flex-row items-center"
                style={{
                  backgroundColor: "rgba(255, 0, 0, 0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 0, 0, 0.1)",
                  opacity: isDeleting ? 0.7 : 1, // visual disabled state
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

                {isDeleting ? (
                  <ActivityIndicator size="small" color="#ff4444" />
                ) : (
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="rgba(255,68,68,0.6)"
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
          {/* Full-screen loader overlay */}
          {isDeleting && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999,
              }}
            >
              <ActivityIndicator size="large" color="#00f5ff" />
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
