import "./global.css";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Context
import { AuthProvider } from "./src/contexts/AuthContext";
import { AuthGuard, GuestGuard } from "./src/components/AuthGuard";

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

function AppNavigator() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: "horizontal",
          cardStyle: { backgroundColor: '#000000' },
        }}
      >
        {/* Public Routes - Only accessible when NOT authenticated */}
        <Stack.Screen name="Welcome">
          {(props) => (
            <GuestGuard>
              <WelcomeScreen {...props} />
            </GuestGuard>
          )}
        </Stack.Screen>
        
        <Stack.Screen name="Login">
          {(props) => (
            <GuestGuard>
              <LoginScreen {...props} />
            </GuestGuard>
          )}
        </Stack.Screen>
        
        <Stack.Screen name="Signup">
          {(props) => (
            <GuestGuard>
              <SignupScreen {...props} />
            </GuestGuard>
          )}
        </Stack.Screen>
        
        <Stack.Screen name="ForgotPassword">
          {(props) => (
            <GuestGuard>
              <ForgotPasswordScreen {...props} />
            </GuestGuard>
          )}
        </Stack.Screen>

        {/* Protected Routes - Only accessible when authenticated */}
        <Stack.Screen name="Home">
          {(props) => (
            <AuthGuard>
              <HomeScreen {...props} />
            </AuthGuard>
          )}
        </Stack.Screen>
        
        <Stack.Screen name="Profile">
          {(props) => (
            <AuthGuard>
              <ProfileScreen {...props} />
            </AuthGuard>
          )}
        </Stack.Screen>
        
        <Stack.Screen name="EditProfile">
          {(props) => (
            <AuthGuard>
              <EditProfileScreen {...props} />
            </AuthGuard>
          )}
        </Stack.Screen>
        
        <Stack.Screen name="SkinTypeQuestions">
          {(props) => (
            <AuthGuard>
              <SkinTypeQuestionsScreen {...props} />
            </AuthGuard>
          )}
        </Stack.Screen>
        
        <Stack.Screen name="ProductAnalysis">
          {(props) => (
            <AuthGuard>
              <ProductAnalysisScreen {...props} />
            </AuthGuard>
          )}
        </Stack.Screen>
        
        <Stack.Screen name="MyAnalyses">
          {(props) => (
            <AuthGuard>
              <MyAnalysesScreen {...props} />
            </AuthGuard>
          )}
        </Stack.Screen>
        
        <Stack.Screen name="AnalysisResult">
          {(props) => (
            <AuthGuard>
              <AnalysisResultScreen {...props} />
            </AuthGuard>
          )}
        </Stack.Screen>
        
        <Stack.Screen name="SkinProfile">
          {(props) => (
            <AuthGuard>
              <SkinProfileScreen {...props} />
            </AuthGuard>
          )}
        </Stack.Screen>
        
        <Stack.Screen name="Chat">
          {(props) => (
            <AuthGuard>
              <ChatScreen {...props} />
            </AuthGuard>
          )}
        </Stack.Screen>
        
        <Stack.Screen name="ChatSessions">
          {(props) => (
            <AuthGuard>
              <ChatSessionsScreen {...props} />
            </AuthGuard>
          )}
        </Stack.Screen>
        
        <Stack.Screen name="SkinMemory">
          {(props) => (
            <AuthGuard>
              <SkinMemoryScreen {...props} />
            </AuthGuard>
          )}
        </Stack.Screen>
      </Stack.Navigator>
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
