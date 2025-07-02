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

export default function ChatSessionsScreen({ navigation }) {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadChatSessions();
  }, []);

  const loadChatSessions = async () => {
    try {
      setIsLoading(true);
      const sessionsData = await ApiService.getChatSessions();
      setSessions(sessionsData);
    } catch (error) {
      console.error("Load sessions error:", error);
      Alert.alert("Error", "Failed to load chat sessions");
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadChatSessions();
    setIsRefreshing(false);
  };

  const handleDeleteSession = (sessionId, sessionTitle) => {
    Alert.alert(
      "Delete Chat",
      `Are you sure you want to delete "${sessionTitle}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteSession(sessionId),
        },
      ]
    );
  };

  const deleteSession = async (sessionId) => {
    try {
      await ApiService.deleteChatSession(sessionId);
      setSessions((prev) => prev.filter((session) => session.id !== sessionId));
    } catch (error) {
      console.error("Delete session error:", error);
      Alert.alert("Error", "Failed to delete chat session");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const startNewChat = () => {
    navigation.navigate("Chat");
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
              <Ionicons name="chatbubbles" size={32} color="#00f5ff" />
            </View>
            <Text className="text-white text-lg font-semibold">
              Loading your chats...
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
            <View className="flex-row items-center justify-between mb-6">
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
                onPress={startNewChat}
                className="w-12 h-12 rounded-full items-center justify-center overflow-hidden"
              >
                <LinearGradient
                  colors={["#00f5ff", "#0080ff"]}
                  className="w-12 h-12 rounded-full items-center justify-center"
                >
                  <Ionicons name="add" size={24} color="#000" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <Text className="text-3xl font-bold text-white mb-2">
              Your Chats
            </Text>
            <Text className="text-gray-300 text-lg">
              Continue your skincare conversations
            </Text>
          </View>

          {/* New Chat Button */}
          <View className="px-6 mb-6">
            <TouchableOpacity
              onPress={startNewChat}
              className="rounded-2xl p-4 overflow-hidden"
            >
              <LinearGradient
                colors={["#00f5ff", "#0080ff", "#8000ff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="p-4 rounded-2xl"
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="add-circle" size={24} color="#000" />
                  <Text className="text-black text-lg font-bold ml-2">
                    Start New Chat
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Chat Sessions */}
          <View className="px-6 pb-8">
            {sessions.length === 0 ? (
              <View
                className="rounded-2xl p-6 items-center"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.08)",
                }}
              >
                <View
                  className="w-16 h-16 rounded-full items-center justify-center mb-4"
                  style={{
                    backgroundColor: "rgba(0, 245, 255, 0.1)",
                    borderWidth: 2,
                    borderColor: "rgba(0, 245, 255, 0.2)",
                  }}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={32}
                    color="#00f5ff"
                  />
                </View>
                <Text className="text-white text-lg font-semibold mb-2">
                  No chats yet
                </Text>
                <Text className="text-gray-400 text-center">
                  Start your first conversation with our AI skincare assistant
                </Text>
              </View>
            ) : (
              <View className="space-y-3">
                {sessions.map((session) => (
                  <TouchableOpacity
                    key={session.id}
                    onPress={() =>
                      navigation.navigate("Chat", { sessionId: session.id })
                    }
                    className="rounded-2xl p-4"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 mr-3">
                        <Text className="text-white text-lg font-semibold mb-1">
                          {session.title || "Chat Session"}
                        </Text>
                        {session.last_message && (
                          <Text
                            className="text-gray-400 text-sm mb-2"
                            numberOfLines={2}
                          >
                            {session.last_message}
                          </Text>
                        )}
                        <View className="flex-row items-center justify-between">
                          <Text className="text-gray-500 text-xs">
                            {formatDate(session.updated_at)} •{" "}
                            {session.message_count} messages
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() =>
                          handleDeleteSession(session.id, session.title)
                        }
                        className="w-8 h-8 rounded-full items-center justify-center"
                        style={{
                          backgroundColor: "rgba(255, 0, 0, 0.1)",
                          borderWidth: 1,
                          borderColor: "rgba(255, 0, 0, 0.2)",
                        }}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color="#ff4444"
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
