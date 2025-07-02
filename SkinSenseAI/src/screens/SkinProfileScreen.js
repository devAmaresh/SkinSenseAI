import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import ApiService from "../services/api";

export default function SkinProfileScreen({ navigation, route }) {
  const [skinProfile, setSkinProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadSkinProfile();
  }, []);

  const loadSkinProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await ApiService.getSkinProfile();
      setSkinProfile(profile);
    } catch (error) {
      console.error("Load skin profile error:", error);
      Alert.alert("Error", "Failed to load skin profile. Please try again.", [
        { text: "Retry", onPress: loadSkinProfile },
        { text: "Go Back", onPress: () => navigation.goBack() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadSkinProfile();
    setIsRefreshing(false);
  };

  const getSkinTypeIcon = (skinType) => {
    const icons = {
      dry: "water-outline",
      oily: "flashlight-outline",
      combination: "layers-outline",
      sensitive: "leaf-outline",
      normal: "checkmark-circle-outline",
    };
    return icons[skinType?.toLowerCase()] || "help-circle-outline";
  };

  const getSkinTypeColor = (skinType) => {
    const colors = {
      dry: "#4FC3F7",
      oily: "#FFB74D",
      combination: "#BA68C8",
      sensitive: "#81C784",
      normal: "#64B5F6",
    };
    return colors[skinType?.toLowerCase()] || "#00f5ff";
  };

  const getSkinTypeDescription = (skinType) => {
    const descriptions = {
      dry: "Your skin tends to feel tight and may show signs of flaking. Focus on hydrating and nourishing products.",
      oily: "Your skin produces excess sebum, leading to shine and potential breakouts. Look for oil-controlling products.",
      combination:
        "Your skin varies across different areas. The T-zone is oily while cheeks may be normal or dry.",
      sensitive:
        "Your skin reacts easily to products and environmental factors. Choose gentle, fragrance-free formulations.",
      normal:
        "Your skin is well-balanced with minimal concerns. Maintain your routine with gentle, protective products.",
    };
    return (
      descriptions[skinType?.toLowerCase()] ||
      "Your skin type needs personalized care."
    );
  };

  const getRecommendations = (skinType) => {
    const recommendations = {
      dry: [
        {
          title: "Hydrating Cleanser",
          description: "Use cream or oil-based cleansers",
          icon: "water",
        },
        {
          title: "Rich Moisturizer",
          description: "Look for ceramides and hyaluronic acid",
          icon: "heart",
        },
        {
          title: "Gentle Exfoliation",
          description: "Use chemical exfoliants 1-2x per week",
          icon: "refresh",
        },
        {
          title: "Avoid",
          description: "Harsh scrubs, alcohol-based products",
          icon: "close-circle",
        },
      ],
      oily: [
        {
          title: "Foaming Cleanser",
          description: "Use gel or foam cleansers twice daily",
          icon: "water",
        },
        {
          title: "Oil-free Moisturizer",
          description: "Look for lightweight, non-comedogenic formulas",
          icon: "heart",
        },
        {
          title: "Salicylic Acid",
          description: "Use BHA products for pore control",
          icon: "medical",
        },
        {
          title: "Avoid",
          description: "Heavy oils, over-cleansing",
          icon: "close-circle",
        },
      ],
      combination: [
        {
          title: "Gentle Cleanser",
          description: "Use balanced cleansers for all areas",
          icon: "water",
        },
        {
          title: "Zone Treatment",
          description: "Different products for T-zone and cheeks",
          icon: "layers",
        },
        {
          title: "Balanced Routine",
          description: "Hydrate dry areas, control oily zones",
          icon: "balance",
        },
        {
          title: "Avoid",
          description: "One-size-fits-all approaches",
          icon: "close-circle",
        },
      ],
      sensitive: [
        {
          title: "Gentle Cleanser",
          description: "Use fragrance-free, hypoallergenic products",
          icon: "leaf",
        },
        {
          title: "Minimal Ingredients",
          description: "Choose products with fewer components",
          icon: "checkmark",
        },
        {
          title: "Patch Test",
          description: "Always test new products first",
          icon: "shield",
        },
        {
          title: "Avoid",
          description: "Fragrances, essential oils, harsh actives",
          icon: "close-circle",
        },
      ],
      normal: [
        {
          title: "Maintain Balance",
          description: "Use gentle, balanced products",
          icon: "checkmark-circle",
        },
        {
          title: "Sun Protection",
          description: "Daily SPF to prevent damage",
          icon: "sunny",
        },
        {
          title: "Antioxidants",
          description: "Vitamin C for protection and glow",
          icon: "nutrition",
        },
        {
          title: "Avoid",
          description: "Over-treating, harsh ingredients",
          icon: "close-circle",
        },
      ],
    };
    return recommendations[skinType?.toLowerCase()] || [];
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1">
        <StatusBar style="light" />
        <LinearGradient
          colors={["#000000", "#1a1a1a", "#000000"]}
          className="flex-1 justify-center items-center"
        >
          <View className="items-center">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{
                backgroundColor: "rgba(0, 245, 255, 0.1)",
                borderWidth: 2,
                borderColor: "rgba(0, 245, 255, 0.3)",
              }}
            >
              <Ionicons name="analytics" size={32} color="#00f5ff" />
            </View>
            <Text className="text-white text-lg font-semibold">
              Loading your skin profile...
            </Text>
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
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#00f5ff"
              colors={["#00f5ff"]}
            />
          }
        >
          {/* Header */}
          <View className="px-6 pt-1 pb-6">
            <TouchableOpacity
              onPress={() => navigation.navigate("Home")}
              className="w-12 h-12 rounded-full items-center justify-center mb-6"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.1)",
              }}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <Text className="text-3xl font-bold text-white mb-2">
              Your Skin Profile
            </Text>
            <Text className="text-gray-300 text-lg">
              Personalized insights and recommendations
            </Text>
          </View>

          {/* Skin Type Card */}
          <View className="px-6 mb-6">
            <View
              className="rounded-3xl p-6"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.08)",
              }}
            >
              <View className="flex-row items-center mb-4">
                <View
                  className="w-16 h-16 rounded-full items-center justify-center mr-4"
                  style={{
                    backgroundColor: `${getSkinTypeColor(
                      skinProfile?.skin_type
                    )}20`,
                    borderWidth: 2,
                    borderColor: `${getSkinTypeColor(
                      skinProfile?.skin_type
                    )}40`,
                  }}
                >
                  <Ionicons
                    name={getSkinTypeIcon(skinProfile?.skin_type)}
                    size={32}
                    color={getSkinTypeColor(skinProfile?.skin_type)}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-white mb-1">
                    {skinProfile?.skin_type?.charAt(0).toUpperCase() +
                      skinProfile?.skin_type?.slice(1)}{" "}
                    Skin
                  </Text>
                  <Text className="text-gray-300 text-sm">
                    Identified on{" "}
                    {new Date(
                      skinProfile?.updated_at || skinProfile?.created_at
                    ).toDateString()}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate("SkinTypeQuestions")}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <Ionicons name="create-outline" size={20} color="white" />
                </TouchableOpacity>
              </View>

              <Text className="text-gray-300 text-base leading-relaxed">
                {getSkinTypeDescription(skinProfile?.skin_type)}
              </Text>
            </View>
          </View>

          {/* Skin Concerns */}
          {skinProfile?.concerns && skinProfile.concerns.length > 0 && (
            <View className="px-6 mb-6">
              <Text className="text-white text-xl font-bold mb-4">
                Your Concerns
              </Text>
              <View
                className="rounded-2xl p-4"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.08)",
                }}
              >
                <View className="flex-row flex-wrap">
                  {skinProfile.concerns.map((concern, index) => (
                    <View
                      key={index}
                      className="rounded-full px-3 py-2 mr-2 mb-2"
                      style={{
                        backgroundColor: "rgba(0, 245, 255, 0.1)",
                        borderWidth: 1,
                        borderColor: "rgba(0, 245, 255, 0.2)",
                      }}
                    >
                      <Text className="text-cyan-400 text-sm font-medium">
                        {concern}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Recommendations */}
          <View className="px-6 mb-6">
            <Text className="text-white text-xl font-bold mb-4">
              Personalized Recommendations
            </Text>
            <View className="space-y-3">
              {getRecommendations(skinProfile?.skin_type).map((rec, index) => (
                <View
                  key={index}
                  className="rounded-2xl p-4 flex-row items-center"
                  style={{
                    backgroundColor:
                      rec.title === "Avoid"
                        ? "rgba(255, 87, 87, 0.05)"
                        : "rgba(255, 255, 255, 0.03)",
                    borderWidth: 1,
                    borderColor:
                      rec.title === "Avoid"
                        ? "rgba(255, 87, 87, 0.1)"
                        : "rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{
                      backgroundColor:
                        rec.title === "Avoid"
                          ? "rgba(255, 87, 87, 0.1)"
                          : "rgba(0, 245, 255, 0.1)",
                      borderWidth: 1,
                      borderColor:
                        rec.title === "Avoid"
                          ? "rgba(255, 87, 87, 0.2)"
                          : "rgba(0, 245, 255, 0.2)",
                    }}
                  >
                    <Ionicons
                      name={rec.icon}
                      size={20}
                      color={rec.title === "Avoid" ? "#ff5757" : "#00f5ff"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`font-semibold text-base mb-1 ${
                        rec.title === "Avoid" ? "text-red-400" : "text-white"
                      }`}
                    >
                      {rec.title}
                    </Text>
                    <Text className="text-gray-300 text-sm">
                      {rec.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="px-6 pb-8 space-y-4">
            <TouchableOpacity
              onPress={() => navigation.navigate("ProductAnalysis")}
              className="rounded-2xl overflow-hidden"
            >
              <LinearGradient
                colors={["#00f5ff", "#0080ff", "#8000ff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="p-4 flex-row items-center justify-center"
              >
                <Ionicons name="camera" size={24} color="#000" />
                <Text className="text-black text-lg font-bold ml-2">
                  Analyze a Product
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View className="flex-row space-x-4">
              <TouchableOpacity
                onPress={() => navigation.navigate("MyAnalyses")}
                className="flex-1 rounded-2xl p-4"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="analytics" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">
                    My Analyses
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate("SkinTypeQuestions")}
                className="flex-1 rounded-2xl p-4"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="refresh" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">
                    Retake Quiz
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tips Section */}
          <View className="px-6 pb-8">
            <View
              className="rounded-2xl p-4"
              style={{
                backgroundColor: "rgba(0, 245, 255, 0.05)",
                borderWidth: 1,
                borderColor: "rgba(0, 245, 255, 0.1)",
              }}
            >
              <View className="flex-row items-center mb-3">
                <Ionicons name="bulb-outline" size={20} color="#00f5ff" />
                <Text className="text-cyan-400 font-semibold ml-2">
                  Pro Tips for {skinProfile?.skin_type} Skin
                </Text>
              </View>
              <View className="space-y-2">
                <Text className="text-gray-300 text-sm">
                  • Always patch test new products
                </Text>
                <Text className="text-gray-300 text-sm">
                  • Be consistent with your routine
                </Text>
                <Text className="text-gray-300 text-sm">
                  • Listen to your skin and adjust as needed
                </Text>
                <Text className="text-gray-300 text-sm">
                  • Use sunscreen daily, regardless of skin type
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
