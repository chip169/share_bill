import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import HomeScreen from "./screens/HomeScreen";
import HistoryScreen from "./screens/HistoryScreen";
import ProfileScreen from "./screens/ProfileScreen";
import BillDetailScreen from "./screens/BillDetailScreen";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("home");

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

  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>Màn hình không tồn tại</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justify: "center",
    backgroundColor: "#ecf0f1",
    padding: 8,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
