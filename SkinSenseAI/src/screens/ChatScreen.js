import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import ApiService from "../services/api";

export default function ChatScreen({ navigation, route }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const scrollViewRef = useRef();
  const textInputRef = useRef();

  const { sessionId: routeSessionId } = route.params || {};

  useEffect(() => {
    if (routeSessionId) {
      loadChatSession(routeSessionId);
    } else {
      createNewSession();
    }
  }, [routeSessionId]);

  const createNewSession = async () => {
    try {
      const session = await ApiService.createChatSession();
      setSessionId(session.id);

      // Add welcome message
      const welcomeMessage = {
        id: "welcome",
        message:
          "Hi! I'm your AI skincare assistant. I can help you with product recommendations, routine advice, ingredient questions, and more. What would you like to know about skincare?",
        is_user: false,
        created_at: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error("Create session error:", error);
      Alert.alert("Error", "Failed to start chat session");
    }
  };

  const loadChatSession = async (id) => {
    try {
      setIsLoading(true);
      const session = await ApiService.getChatSession(id);
      setSessionId(session.id);
      setMessages(session.messages || []);
    } catch (error) {
      console.error("Load session error:", error);
      Alert.alert("Error", "Failed to load chat session");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || isLoading) return;

    const userMessage = {
      id: `temp-${Date.now()}`,
      message: inputMessage.trim(),
      is_user: true,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    try {
      const aiResponse = await ApiService.sendChatMessage(
        sessionId,
        messageToSend
      );

      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== userMessage.id),
        { ...userMessage, id: `user-${Date.now()}` },
        aiResponse,
      ]);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Send message error:", error);
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      Alert.alert("Error", "Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessage = (message, index) => {
    const isUser = message.is_user;

    return (
      <View
        key={message.id || index}
        className={`flex-row mb-4 ${isUser ? "justify-end" : "justify-start"}`}
      >
        {!isUser && (
          <View
            className="w-8 h-8 rounded-full items-center justify-center mr-2 mt-1"
            style={{
              backgroundColor: "rgba(0, 245, 255, 0.1)",
              borderWidth: 1,
              borderColor: "rgba(0, 245, 255, 0.2)",
            }}
          >
            <Ionicons name="sparkles" size={16} color="#00f5ff" />
          </View>
        )}

        <View
          className={`max-w-[80%] p-3 rounded-2xl ${
            isUser ? "rounded-tr-md" : "rounded-tl-md"
          }`}
          style={{
            backgroundColor: isUser
              ? "rgba(0, 245, 255, 0.1)"
              : "rgba(255, 255, 255, 0.03)",
            borderWidth: 1,
            borderColor: isUser
              ? "rgba(0, 245, 255, 0.2)"
              : "rgba(255, 255, 255, 0.08)",
          }}
        >
          <Text
            className={`text-base leading-relaxed ${
              isUser ? "text-cyan-100" : "text-gray-100"
            }`}
          >
            {message.message}
          </Text>
          <Text
            className={`text-xs mt-1 ${
              isUser ? "text-cyan-400" : "text-gray-400"
            }`}
          >
            {formatTime(message.created_at)}
          </Text>
        </View>

        {isUser && (
          <View
            className="w-8 h-8 rounded-full items-center justify-center ml-2 mt-1"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            <Ionicons name="person" size={16} color="white" />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#000000" }}>
      <StatusBar style="light" backgroundColor="#000000" />
      <LinearGradient
        colors={["#000000", "#1a1a1a", "#000000"]}
        className="flex-1"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          {/* Header */}
          <View
            className="px-6 py-4 flex-row items-center"
            style={{
              borderBottomWidth: 1,
              borderBottomColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.1)",
              }}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>

            <View className="flex-1">
              <Text className="text-white text-lg font-semibold">
                SkinSense AI
              </Text>
              <Text className="text-gray-400 text-sm">
                Your skincare assistant
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate("ChatSessions")}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.1)",
              }}
            >
              <Ionicons name="chatbubbles-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <KeyboardAwareScrollView
            ref={scrollViewRef}
            className="flex-1 px-4 py-4"
            contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
            enableOnAndroid
            extraScrollHeight={20}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            {messages.map((message, index) => renderMessage(message, index))}

            {isLoading && (
              <View className="flex-row justify-start mb-4">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center mr-2 mt-1"
                  style={{
                    backgroundColor: "rgba(0, 245, 255, 0.1)",
                    borderWidth: 1,
                    borderColor: "rgba(0, 245, 255, 0.2)",
                  }}
                >
                  <Ionicons name="sparkles" size={16} color="#00f5ff" />
                </View>

                <View
                  className="p-3 rounded-2xl rounded-tl-md"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <View className="flex-row items-center space-x-1">
                    <View className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                    <View className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                    <View className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                  </View>
                </View>
              </View>
            )}
          </KeyboardAwareScrollView>

          {/* Input Section */}
          <View
            className="px-4 py-3"
            style={{
              backgroundColor: "#000000",
              borderTopWidth: 1,
              borderTopColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            <View className="flex-row items-end space-x-3">
              <View
                className="flex-1 rounded-2xl px-4 py-3"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  maxHeight: 100,
                }}
              >
                <TextInput
                  className="text-white text-base"
                  placeholder="Ask about skincare, products, routines..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={inputMessage}
                  onChangeText={setInputMessage}
                  multiline
                  editable={!isLoading}
                />
              </View>

              <TouchableOpacity
                onPress={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="w-12 h-12 rounded-full items-center justify-center overflow-hidden"
                style={{
                  opacity: !inputMessage.trim() || isLoading ? 0.5 : 1,
                }}
              >
                <LinearGradient
                  colors={["#00f5ff", "#0080ff"]}
                  className="w-12 h-12 rounded-full items-center justify-center"
                >
                  <Ionicons
                    name={isLoading ? "hourglass" : "send"}
                    size={20}
                    color="#000"
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
