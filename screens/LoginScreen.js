import React, { useState } from "react";
import { View, SafeAreaView, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from "react-native";
import { TextInput, Button, Text, HelperText } from "react-native-paper";
import { Phone, Lock, Eye, EyeOff, Sparkles } from "lucide-react-native";
import tw from "twrnc";
import { loginUser } from "../services/api";

export default function LoginScreen({ onNavigate, setCurrentUser }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    if (!phone || !password) {
      setErrorMsg("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    try {
      const user = await loginUser(phone, password);
      setCurrentUser(user);
      onNavigate("home");
    } catch (error) {
      setErrorMsg(error.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={tw`flex-1`}
      >
        <ScrollView contentContainerStyle={tw`flex-grow justify-center px-6 py-10`}>
          {/* Logo and Header */}
          <View style={tw`items-center mb-10`}>
            <View style={tw`w-20 h-20 bg-sky-500 rounded-3xl items-center justify-center shadow-lg shadow-sky-500/30 mb-4`}>
              <Sparkles size={40} color="white" />
            </View>
            <Text style={tw`text-3xl font-bold text-slate-800`}>ChiaBill</Text>
            <Text style={tw`text-slate-400 mt-2 text-center text-sm px-4`}>
              Chia sẻ hóa đơn sòng phẳng, chính xác và nhanh chóng cùng bạn bè!
            </Text>
          </View>

          {/* Form Card */}
          <View style={tw`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6`}>
            <Text style={tw`text-xl font-bold text-slate-800 mb-6`}>Đăng nhập</Text>

            {errorMsg ? (
              <View style={tw`bg-red-50 border border-red-100 rounded-2xl p-3 mb-4`}>
                <Text style={tw`text-red-500 text-xs text-center font-medium`}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Phone Input */}
            <View style={tw`mb-4`}>
              <TextInput
                label="Số điện thoại"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                mode="outlined"
                outlineColor="#e2e8f0"
                activeOutlineColor="#0ea5e9"
                style={tw`bg-white text-slate-700`}
                left={
                  <TextInput.Icon
                    icon={() => <Phone size={18} color="#94a3b8" />}
                  />
                }
              />
            </View>

            {/* Password Input */}
            <View style={tw`mb-6`}>
              <TextInput
                label="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureText}
                mode="outlined"
                outlineColor="#e2e8f0"
                activeOutlineColor="#0ea5e9"
                style={tw`bg-white text-slate-700`}
                left={
                  <TextInput.Icon
                    icon={() => <Lock size={18} color="#94a3b8" />}
                  />
                }
                right={
                  <TextInput.Icon
                    icon={() => (
                      <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                        {secureText ? <Eye size={18} color="#94a3b8" /> : <EyeOff size={18} color="#94a3b8" />}
                      </TouchableOpacity>
                    )}
                  />
                }
              />
            </View>

            {/* Login Button */}
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              contentStyle={tw`h-13`}
              style={tw`rounded-2xl bg-sky-500 shadow-md shadow-sky-500/20`}
              labelStyle={tw`text-base font-bold text-white`}
            >
              Đăng nhập
            </Button>
          </View>

          {/* Navigate to Register */}
          <View style={tw`flex-row justify-center items-center`}>
            <Text style={tw`text-slate-500 text-sm`}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => onNavigate("register")}>
              <Text style={tw`text-sky-500 font-bold text-sm`}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
