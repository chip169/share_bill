import React, { useState } from "react";
import HistoryScreen from "./screens/HistoryScreen";
import ProfileScreen from "./screens/ProfileScreen";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("history"); // Mặc định mở màn lịch sử trước

  if (currentScreen === "history") {
    return <HistoryScreen onNavigate={setCurrentScreen} />;
  }

  if (currentScreen === "profile") {
    return <ProfileScreen onNavigate={setCurrentScreen} />;
  }
}
