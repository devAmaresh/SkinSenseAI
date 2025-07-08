import React, { useState } from "react";
import { TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import  ApiService  from "../services/api";
import GoogleAuthService from "../services/googleAuth";
import { useAuth } from "../contexts/AuthContext";
const GoogleSignInButton = ({ onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setIsAuthenticated, setIsNewUser } = useAuth();
  const loginWithGoogle = async () => {
    try {
      const googleData = await GoogleAuthService.signInWithGoogle();
      const response = await ApiService.loginWithGoogle(googleData);
      const userData = await ApiService.getCurrentUser();

      setUser(userData);
      setIsAuthenticated(true);
      setIsNewUser(response.is_new_user || false);

      return response;
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await loginWithGoogle();
      onSuccess && onSuccess();
    } catch (error) {
      console.error("Google Sign-In failed:", error);

      let errorMessage = "Google Sign-In failed. Please try again.";

      if (error.code === "SIGN_IN_CANCELLED") {
        errorMessage = "Sign-in was cancelled.";
      } else if (error.code === "PLAY_SERVICES_NOT_AVAILABLE") {
        errorMessage = "Google Play Services not available.";
      } else if (error.code === "SIGN_IN_REQUIRED") {
        errorMessage = "Please sign in to continue.";
      }

      Alert.alert("Sign-In Error", errorMessage);
      onError && onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-row space-x-4 gap-6">
      {["logo-google"].map((icon, index) => (
        <TouchableOpacity
          key={index}
          className="flex-1 rounded-2xl py-4 items-center"
          disabled={isLoading}
          onPress={handleGoogleSignIn}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.25)",
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#4285F4" />
          ) : (
            <Ionicons name={icon} size={24} color="white" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default GoogleSignInButton;
