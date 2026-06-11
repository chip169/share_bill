import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import tw from "twrnc";

const GradientButton = ({ title, onPress, loading = false, disabled = false }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={tw`${disabled || loading ? "opacity-60" : ""}`}
    >
      <LinearGradient
        colors={["#2ECC71", "#3498DB"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={tw`rounded-xl py-4 items-center`}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={tw`text-white font-bold text-base`}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default GradientButton;
