import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { Home, FileText, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import tw from "twrnc";

export default function BottomNav({ onNavigate, currentScreen }) {
  const insets = useSafeAreaInsets();
  const tabs = [
    { id: "home", label: "Trang chủ", icon: Home },
    { id: "history", label: "Lịch sử", icon: FileText },
    { id: "profile", label: "Cá nhân", icon: User },
  ];

  return (
    <View
      style={[
        tw`absolute bottom-0 left-0 right-0 bg-white/95 border-t border-slate-200/80 px-4 flex-row justify-around items-center z-50 shadow-lg`,
        { paddingTop: 10, paddingBottom: Math.max(insets.bottom, 10) }
      ]}
    >
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = currentScreen === tab.id;
        const activeColor = "#0ea5e9";
        const inactiveColor = "#94a3b8";

        return (
          <TouchableOpacity
            key={tab.id}
            style={tw`items-center flex-1 py-1`}
            onPress={() => onNavigate(tab.id)}
          >
            <IconComponent size={22} color={isActive ? activeColor : inactiveColor} />
            <Text
              style={tw`text-[10px] mt-1 ${
                isActive ? "text-[#0ea5e9] font-black" : "text-slate-400 font-semibold"
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
