import React from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import tw from "twrnc";

const AuthLayout = ({
  title,
  subtitle,
  showLogo = false,
  children,
  footer,
}) => {
  return (
    <LinearGradient
      colors={["#2ECC71", "#3498DB"]}
      style={tw`flex-1`}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={tw`flex-grow justify-center px-6 py-12`}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {showLogo && (
            <View style={tw`items-center mb-6`}>
              <View
                style={tw`w-20 h-20 bg-white rounded-2xl items-center justify-center mb-4 shadow-lg`}
              >
                <Text style={tw`text-4xl`}>💰</Text>
              </View>
              <Text style={tw`text-white text-3xl font-bold`}>ChiaBill</Text>
              <Text style={tw`text-white/80 text-sm mt-1 text-center`}>
                Chia tiền dễ dàng, thanh toán nhanh chóng
              </Text>
            </View>
          )}

          {!showLogo && title && (
            <View style={tw`items-center mb-8`}>
              <Text style={tw`text-white text-2xl font-bold`}>{title}</Text>
              {subtitle && (
                <Text style={tw`text-white/80 text-sm mt-2 text-center px-4`}>
                  {subtitle}
                </Text>
              )}
            </View>
          )}

          <View
            style={tw`bg-white rounded-3xl p-6 shadow-lg`}
          >
            {children}
          </View>

          {footer && <View style={tw`mt-6 items-center`}>{footer}</View>}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default AuthLayout;
