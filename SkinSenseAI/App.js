import "./global.css";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Context
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { GuestGuard,AuthGuard } from "./src/components/AuthGuard";

// Screens
import WelcomeScreen from "./src/screens/WelcomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import SkinTypeQuestionsScreen from "./src/screens/SkinTypeQuestionsScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import EditProfileScreen from "./src/screens/EditProfileScreen";
import ProductAnalysisScreen from "./src/screens/ProductAnalysisScreen";
import MyAnalysesScreen from "./src/screens/MyAnalysesScreen";
import AnalysisResultScreen from "./src/screens/AnalysisResultScreen";
import SkinProfileScreen from "./src/screens/SkinProfileScreen";
import ChatSessionsScreen from "./src/screens/ChatSessionsScreen";
import ChatScreen from "./src/screens/ChatScreen";
import SkinMemoryScreen from "./src/screens/SkinMemoryScreen";

const Stack = createStackNavigator();

function AuthenticatedApp() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: "horizontal",
        cardStyle: { backgroundColor: '#000000' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="SkinTypeQuestions" component={SkinTypeQuestionsScreen} />
      <Stack.Screen name="ProductAnalysis" component={ProductAnalysisScreen} />
      <Stack.Screen name="MyAnalyses" component={MyAnalysesScreen} />
      <Stack.Screen name="AnalysisResult" component={AnalysisResultScreen} />
      <Stack.Screen name="SkinProfile" component={SkinProfileScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="ChatSessions" component={ChatSessionsScreen} />
      <Stack.Screen name="SkinMemory" component={SkinMemoryScreen} />
    </Stack.Navigator>
  );
}

function UnauthenticatedApp() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: "horizontal",
        cardStyle: { backgroundColor: '#000000' },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated } = useAuth();
  
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {isAuthenticated ? <AuthenticatedApp /> : <UnauthenticatedApp />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
