import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";

import HomeScreen from "./screens/HomeScreen";
import HistoryScreen from "./screens/HistoryScreen";
import ProfileScreen from "./screens/ProfileScreen";
import BillDetailScreen from "./screens/BillDetailScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import CreateBillScreen from "./screens/CreateBillScreen";
import MiniGamesScreen from "./screens/MiniGamesScreen";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [routeParams, setRouteParams] = useState({});

  const navigate = (screen, params = {}) => {
    setCurrentScreen(screen);
    setRouteParams(params);
  };

  // Safe logout helper
  const handleLogout = () => {
    setCurrentUser(null);
    navigate("login");
  };

  let screenComponent;

  // Simple Router Switch
  if (currentScreen === "login") {
    screenComponent = (
      <LoginScreen 
        onNavigate={navigate} 
        setCurrentUser={setCurrentUser} 
      />
    );
  } else if (currentScreen === "register") {
    screenComponent = (
      <RegisterScreen 
        onNavigate={navigate} 
      />
    );
  } else if (!currentUser) {
    // Force login if not authenticated
    screenComponent = (
      <LoginScreen 
        onNavigate={navigate} 
        setCurrentUser={setCurrentUser} 
      />
    );
  } else {
    // Authenticated screens
    switch (currentScreen) {
      case "home":
        screenComponent = (
          <HomeScreen 
            onNavigate={navigate} 
            currentUser={currentUser} 
          />
        );
        break;
      case "history":
        screenComponent = (
          <HistoryScreen 
            onNavigate={navigate} 
            currentUser={currentUser} 
          />
        );
        break;
      case "profile":
        screenComponent = (
          <ProfileScreen 
            onNavigate={navigate} 
            currentUser={currentUser} 
            onLogout={handleLogout}
          />
        );
        break;
      case "billdetail":
        screenComponent = (
          <BillDetailScreen 
            onNavigate={navigate} 
            routeParams={routeParams}
            currentUser={currentUser}
          />
        );
        break;
      case "createbill":
        screenComponent = (
          <CreateBillScreen 
            onNavigate={navigate} 
            routeParams={routeParams}
            currentUser={currentUser}
          />
        );
        break;
      case "minigames":
        screenComponent = (
          <MiniGamesScreen 
            onNavigate={navigate} 
            routeParams={routeParams}
            currentUser={currentUser}
          />
        );
        break;
      default:
        screenComponent = (
          <View style={styles.container}>
            <Text style={styles.paragraph}>Màn hình không tồn tại</Text>
          </View>
        );
    }
  }

  return (
    <PaperProvider>
      <View style={{ flex: 1 }}>
        {screenComponent}
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
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
