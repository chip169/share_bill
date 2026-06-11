import React, { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import tw from "twrnc";

import { AuthProvider, useAuth } from "./context/AuthContext";
import HomeScreen from "./screens/HomeScreen";
import HistoryScreen from "./screens/HistoryScreen";
import ProfileScreen from "./screens/ProfileScreen";
import BillDetailScreen from "./screens/BillDetailScreen";
import LoginScreen from "./screens/auth/LoginScreen";
import RegisterScreen from "./screens/auth/RegisterScreen";
import ForgotPasswordScreen from "./screens/auth/ForgotPasswordScreen";

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState("login");

  if (isLoading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-[#f8fafc]`}>
        <ActivityIndicator size="large" color="#00b894" />
      </View>
    );
  }

  if (!isAuthenticated) {
    if (currentScreen === "register") {
      return <RegisterScreen onNavigate={setCurrentScreen} />;
    }
    if (currentScreen === "forgotpassword") {
      return <ForgotPasswordScreen onNavigate={setCurrentScreen} />;
    }
    return <LoginScreen onNavigate={setCurrentScreen} />;
  }

  if (currentScreen === "home") {
    return <HomeScreen onNavigate={setCurrentScreen} />;
  }

  if (currentScreen === "history") {
    return <HistoryScreen onNavigate={setCurrentScreen} />;
  }

  if (currentScreen === "profile") {
    return <ProfileScreen onNavigate={setCurrentScreen} />;
  }

  if (currentScreen === "billdetail") {
    return <BillDetailScreen onNavigate={setCurrentScreen} />;
  }

  return <HomeScreen onNavigate={setCurrentScreen} />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
