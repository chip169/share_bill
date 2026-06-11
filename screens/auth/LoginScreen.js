import React, { useState } from "react";
import { Text, TouchableOpacity, Alert } from "react-native";
import tw from "twrnc";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthInput from "../../components/auth/AuthInput";
import GradientButton from "../../components/auth/GradientButton";
import { login as loginApi } from "../../services/authApi";
import { useAuth } from "../../context/AuthContext";

const LoginScreen = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (text) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!text.trim()) {
      return "Vui lòng nhập email";
    } else if (!emailRegex.test(text.trim())) {
      return "Định dạng email không hợp lệ (Ví dụ: example@gmail.com)";
    }
    return "";
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (emailError) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(text.trim()) || !text.trim()) {
        setEmailError("");
      }
    }
  };

  const handleEmailBlur = () => {
    if (!email.trim()) {
      setEmailError("Vui lòng nhập email");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setEmailError("Định dạng email không hợp lệ (Ví dụ: example@gmail.com)");
      } else {
        setEmailError("");
      }
    }
  };

  const handleLogin = async () => {
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }
    if (!password) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
      return;
    }

    setEmailError("");
    setLoading(true);
    try {
      const { id, user } = await loginApi(email.trim(), password);
      await login(id, user);
      onNavigate("home");
    } catch (error) {
      Alert.alert(
        "Đăng nhập thất bại",
        error.message || "Email hoặc mật khẩu không đúng",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      showLogo
      footer={
        <>
          <TouchableOpacity onPress={() => onNavigate("forgotpassword")}>
            <Text style={tw`text-white underline text-sm`}>Quên mật khẩu?</Text>
          </TouchableOpacity>
        </>
      }
    >
      <AuthInput
        label="Email"
        value={email}
        onChangeText={handleEmailChange}
        onBlur={handleEmailBlur}
        placeholder="Nhập email"
        keyboardType="email-address"
        error={emailError}
      />
      <AuthInput
        label="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        placeholder="Nhập mật khẩu"
        secureTextEntry={!showPassword}
        showToggle
        onToggleSecure={() => setShowPassword(!showPassword)}
      />

      <GradientButton
        title="Đăng nhập"
        onPress={handleLogin}
        loading={loading}
      />

      <TouchableOpacity
        style={tw`mt-5 items-center`}
        onPress={() => onNavigate("register")}
      >
        <Text style={tw`text-slate-500 text-sm`}>
          Chưa có tài khoản?{" "}
          <Text style={tw`text-[#2ECC71] font-bold`}>Đăng ký ngay</Text>
        </Text>
      </TouchableOpacity>
    </AuthLayout>
  );
};

export default LoginScreen;
