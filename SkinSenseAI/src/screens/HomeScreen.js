import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import ApiService from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Skeleton, TextSkeleton } from "../components/Skeleton";

export default function HomeScreen({ navigation }) {
  const [skinProfile, setSkinProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    loadSkinProfile();
  }, []);

  const loadSkinProfile = async () => {
    try {
      setIsLoading(true);
      const skinData = await ApiService.getSkinProfile();
      setSkinProfile(skinData);
      console.log("Skin profile loaded:", skinData);
    } catch (skinError) {
      console.log("No skin profile found");
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
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error("Logout error:", error);
          }
        },
      },
    ]);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "#ff4444";
      case "high":
        return "#ff6600";
      case "medium":
        return "#ffaa00";
      case "low":
        return "#00ff88";
      default:
        return "#00f5ff";
    }
  };

  const getSeverityColor = (severity) => {
    if (severity >= 8) return "#ff4444";
    if (severity >= 6) return "#ff6600";
    if (severity >= 4) return "#ffaa00";
    return "#00ff88";
  };

  const quickActions = [
    {
      icon: "scan-outline",
      label: "Analyze Product",
      color: "#00f5ff",
      onPress: () => navigation.navigate("ProductAnalysis"),
    },
    {
      icon: "chatbubbles-outline",
      label: "AI Chat",
      color: "#00ff88",
      onPress: () => navigation.navigate("ChatSessions"),
    },
    {
      icon: "analytics-outline",
      label: "My Analyses",
      color: "#0080ff",
      onPress: () => navigation.navigate("MyAnalyses"),
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
          <View className="px-6 pt-1 pb-8">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-gray-400 text-lg">Welcome back!</Text>

                {/* Name with skeleton */}
                {isLoading ? (
                  <Skeleton
                    width={160}
                    height={28}
                    borderRadius={14}
                    style={{ marginTop: 4, marginBottom: 8 }}
                  />
                ) : (
                  <Text className="text-2xl font-bold text-white">
                    {user?.full_name || "User"}
                  </Text>
                )}

                {/* Skin type badge with skeleton */}
                {isLoading ? (
                  <Skeleton
                    width={100}
                    height={20}
                    borderRadius={10}
                    style={{ marginTop: 8 }}
                  />
                ) : (
                  skinProfile?.skin_type && (
                    <View
                      className="mt-2 px-3 py-1 rounded-full self-start"
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
                  )
                )}
              </View>

              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => navigation.navigate("Profile")}
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <Ionicons name="person-outline" size={24} color="white" />
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
            </View>
          </View>

          {/* Quick Actions */}
          <View className="px-6 mb-6">
            <Text className="text-xl font-semibold text-white mb-4">
              Quick Actions
            </Text>
            <View className="flex-row space-x-4">
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={action.onPress}
                  className="flex-1 rounded-2xl p-4 items-center"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mb-2"
                    style={{
                      backgroundColor: `${action.color}20`,
                      borderWidth: 1,
                      borderColor: `${action.color}40`,
                    }}
                  >
                    <Ionicons
                      name={action.icon}
                      size={24}
                      color={action.color}
                    />
                  </View>
                  <Text className="text-gray-300 text-sm font-medium text-center">
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Skin Memory button */}
          <TouchableOpacity
            onPress={() => navigation.navigate("SkinMemory")}
            className="rounded-2xl p-4 mt-6"
            style={{
              backgroundColor: "rgba(139, 92, 246, 0.1)",
              borderWidth: 1,
              borderColor: "rgba(139, 92, 246, 0.2)",
            }}
          >
            <View className="flex-row items-center">
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{
                  backgroundColor: "rgba(139, 92, 246, 0.2)",
                }}
              >
                <Ionicons name="library" size={24} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-lg font-semibold">
                  Skin Memory
                </Text>
                <Text className="text-gray-400 text-sm">
                  Track allergens, issues & insights
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="rgba(255,255,255,0.4)"
              />
            </View>
          </TouchableOpacity>
          </View>
          

          {/* Skin Assessment Card */}
          {!isLoading && !skinProfile?.skin_type && (
            <View className="px-6 mb-8">
              <TouchableOpacity
                onPress={() => navigation.navigate("SkinTypeQuestions")}
                className="rounded-2xl p-6"
                style={{
                  backgroundColor: "rgba(0, 245, 255, 0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(0, 245, 255, 0.1)",
                }}
              >
                <View className="flex-row items-center mb-3">
                  <Ionicons name="flask-outline" size={24} color="#00f5ff" />
                  <Text className="text-lg font-semibold text-cyan-400 ml-2">
                    Complete Your Skin Assessment
                  </Text>
                </View>
                <Text className="text-gray-300 mb-3">
                  Take our quick assessment to get personalized product
                  recommendations.
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-cyan-400 font-medium">
                    Start Assessment
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#00f5ff"
                    className="ml-2"
                  />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Skin Profile Summary */}
          {!isLoading && skinProfile && (
            <View className="px-6 mb-6">
              <View className="flex-row space-x-4 mb-4">
                {/* Allergens Summary */}
                <View
                  className="flex-1 rounded-2xl p-4"
                  style={{
                    backgroundColor: "rgba(255, 102, 0, 0.05)",
                    borderWidth: 1,
                    borderColor: "rgba(255, 102, 0, 0.1)",
                  }}
                >
                  <View className="flex-row items-center mb-2">
                    <Ionicons
                      name="alert-circle-outline"
                      size={20}
                      color="#ff6600"
                    />
                    <Text className="text-orange-400 text-sm font-medium ml-2">
                      Allergens
                    </Text>
                  </View>
                  <Text className="text-white text-2xl font-bold">
                    {skinProfile.allergens?.length || 0}
                  </Text>
                  <Text className="text-gray-400 text-xs">Known allergies</Text>
                </View>

                {/* Skin Issues Summary */}
                <View
                  className="flex-1 rounded-2xl p-4"
                  style={{
                    backgroundColor: "rgba(139, 92, 246, 0.05)",
                    borderWidth: 1,
                    borderColor: "rgba(139, 92, 246, 0.1)",
                  }}
                >
                  <View className="flex-row items-center mb-2">
                    <Ionicons
                      name="medical-outline"
                      size={20}
                      color="#8B5CF6"
                    />
                    <Text className="text-purple-400 text-sm font-medium ml-2">
                      Active Issues
                    </Text>
                  </View>
                  <Text className="text-white text-2xl font-bold">
                    {skinProfile.skin_issues?.filter(
                      (issue) => issue.status === "active"
                    ).length || 0}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    Current concerns
                  </Text>
                </View>
              </View>

              {/* Allergens Detail */}
              {skinProfile.allergens && skinProfile.allergens.length > 0 && (
                <View
                  className="rounded-2xl p-4 mb-4"
                  style={{
                    backgroundColor: "rgba(255, 102, 0, 0.05)",
                    borderWidth: 1,
                    borderColor: "rgba(255, 102, 0, 0.1)",
                  }}
                >
                  <View className="flex-row items-center mb-3">
                    <Ionicons
                      name="warning-outline"
                      size={20}
                      color="#ff6600"
                    />
                    <Text className="text-orange-400 font-semibold ml-2 text-lg">
                      Known Allergens
                    </Text>
                  </View>
                  <View className="space-y-2">
                    {skinProfile.allergens.map((allergen, index) => (
                      <View
                        key={index}
                        className="flex-row items-center justify-between"
                      >
                        <Text className="text-white flex-1">
                          {allergen.ingredient_name}
                        </Text>
                        <View
                          className="px-2 py-1 rounded-full"
                          style={{
                            backgroundColor:
                              allergen.severity === "severe"
                                ? "rgba(255, 68, 68, 0.2)"
                                : allergen.severity === "moderate"
                                ? "rgba(255, 166, 0, 0.2)"
                                : "rgba(255, 255, 0, 0.2)",
                          }}
                        >
                          <Text
                            className="text-xs font-medium"
                            style={{
                              color:
                                allergen.severity === "severe"
                                  ? "#ff4444"
                                  : allergen.severity === "moderate"
                                  ? "#ffaa00"
                                  : "#ffff00",
                            }}
                          >
                            {allergen?.severity?.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Skin Issues Detail */}
              {skinProfile.skin_issues &&
                skinProfile.skin_issues.length > 0 && (
                  <View
                    className="rounded-2xl p-4 mb-4"
                    style={{
                      backgroundColor: "rgba(139, 92, 246, 0.05)",
                      borderWidth: 1,
                      borderColor: "rgba(139, 92, 246, 0.1)",
                    }}
                  >
                    <View className="flex-row items-center mb-3">
                      <Ionicons
                        name="fitness-outline"
                        size={20}
                        color="#8B5CF6"
                      />
                      <Text className="text-purple-400 font-semibold ml-2 text-lg">
                        Current Skin Issues
                      </Text>
                    </View>
                    <View className="space-y-3">
                      {skinProfile.skin_issues.map((issue, index) => (
                        <View
                          key={index}
                          className="flex-row items-start justify-between"
                        >
                          <View className="flex-1">
                            <Text className="text-white font-medium">
                              {issue.issue_type}
                            </Text>
                            {issue.description && (
                              <Text className="text-gray-400 text-sm mt-1">
                                {issue.description}
                              </Text>
                            )}
                          </View>
                          <View className="flex-row items-center ml-3">
                            <View
                              className="w-3 h-3 rounded-full mr-2"
                              style={{
                                backgroundColor: getSeverityColor(
                                  issue.severity
                                ),
                              }}
                            />
                            <Text className="text-gray-300 text-sm">
                              {issue.severity}/10
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
            </View>
          )}

          {/* Main Content */}
          <View
            className="flex-1 rounded-t-3xl px-6 py-8"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              borderTopWidth: 1,
              borderTopColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* Title with skeleton */}
            {isLoading ? (
              <Skeleton
                width="60%"
                height={32}
                borderRadius={16}
                style={{ marginBottom: 24 }}
              />
            ) : (
              <Text className="text-2xl font-bold text-white mb-6">
                {skinProfile?.recommendations?.length > 0
                  ? "Personalized Recommendations"
                  : "Getting Started"}
              </Text>
            )}

            {/* Dynamic Recommendations */}
            <View className="space-y-4">
              {isLoading ? (
                // Skeleton recommendations
                Array.from({ length: 3 }).map((_, index) => (
                  <View
                    key={index}
                    className="rounded-2xl p-4"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <View className="flex-row items-center mb-2">
                      <Skeleton
                        width={32}
                        height={32}
                        borderRadius={16}
                        style={{ marginRight: 12 }}
                      />
                      <Skeleton width="40%" height={20} borderRadius={10} />
                    </View>
                    <View style={{ marginLeft: 44 }}>
                      <Skeleton
                        width="90%"
                        height={16}
                        borderRadius={8}
                        style={{ marginBottom: 4 }}
                      />
                      <Skeleton width="70%" height={16} borderRadius={8} />
                    </View>
                  </View>
                ))
              ) : skinProfile?.recommendations?.length > 0 ? (
                skinProfile.recommendations.map((recommendation, index) => (
                  <View
                    key={index}
                    className="rounded-2xl p-4"
                    style={{
                      backgroundColor: `${recommendation.color}10`,
                      borderWidth: 1,
                      borderColor: `${recommendation.color}30`,
                    }}
                  >
                    <View className="flex-row items-center mb-2">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{
                          backgroundColor: `${recommendation.color}20`,
                          borderWidth: 1,
                          borderColor: `${recommendation.color}40`,
                        }}
                      >
                        <Ionicons
                          name={recommendation.icon}
                          size={20}
                          color={recommendation.color}
                        />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Text className="text-white text-lg font-semibold flex-1">
                            {recommendation.title}
                          </Text>
                          {recommendation.priority === "urgent" && (
                            <View
                              className="px-2 py-1 rounded-full ml-2"
                              style={{
                                backgroundColor: "rgba(255, 68, 68, 0.2)",
                              }}
                            >
                              <Text className="text-red-400 text-xs font-bold">
                                URGENT
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                    <Text className="text-gray-300 ml-13">
                      {recommendation.description}
                    </Text>
                  </View>
                ))
              ) : (
                <View
                  className="rounded-2xl p-6 mb-6"
                  style={{
                    backgroundColor: "rgba(128, 0, 255, 0.05)",
                    borderWidth: 1,
                    borderColor: "rgba(128, 0, 255, 0.1)",
                  }}
                >
                  <Text className="text-lg font-semibold text-purple-400 mb-2">
                    Welcome to SkinSenseAI!
                  </Text>
                  <Text className="text-gray-300">
                    Complete your skin assessment to unlock personalized
                    features.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
