import { StyleSheet, Text, View } from 'react-native';
import React, { useState } from "react";
import HistoryScreen from "./screens/HistoryScreen";
import ProfileScreen from "./screens/ProfileScreen";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("history"); // Mặc định mở màn lịch sử trước

  if (currentScreen === "history") {
    return <HistoryScreen onNavigate={setCurrentScreen} />;
  }

import React, { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import HistoryScreen from "./screens/HistoryScreen";
import ProfileScreen from "./screens/ProfileScreen";
import BillDetailScreen from "./screens/BillDetailScreen";


export default function App() {
  const [currentScreen, setCurrentScreen] = useState("home"); // Mặc định mở màn trang chủ trước

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


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});