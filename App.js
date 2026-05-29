<<<<<<< Updated upstream
import { StyleSheet, Text, View } from 'react-native';

// You can import supported modules from npm
import { Card } from 'react-native-paper';

// or any files within the Snack
import AssetExample from './components/AssetExample';

import React from "react";
import BillDetailScreen
from "./screens/BillDetailScreen";

export default function App() {
  return (
    <View style={styles.container}>
      {/* <Text style={styles.paragraph}>
        Change code in the editor and watch it change on your phone! Save to get a shareable url.
      </Text>
      <Card>
        <AssetExample />
      </Card> */}
      <BillDetailScreen />
    </View>
  );
=======
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



>>>>>>> Stashed changes
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
