import React, { useState } from "react";
import { Text, TouchableOpacity, Alert } from "react-native";
import tw from "twrnc";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthInput from "../../components/auth/AuthInput";
import GradientButton from "../../components/auth/GradientButton";
import { register } from "../../services/authApi";

const RegisterScreen = ({ onNavigate }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setEmailError("");
    setLoading(true);
    try {
      await register({ fullName, email: email.trim(), password });
      Alert.alert(
        "Thành công",
        "Đăng ký tài khoản thành công! Vui lòng đăng nhập.",
        [{ text: "OK", onPress: () => onNavigate("login") }]
      );
    } catch (error) {
      Alert.alert("Đăng ký thất bại", error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Đăng ký tài khoản"
      subtitle="Tạo tài khoản để bắt đầu sử dụng"
      footer={
        <TouchableOpacity onPress={() => onNavigate("login")}>
          <Text style={tw`text-white text-sm`}>
            Đã có tài khoản?{" "}
            <Text style={tw`underline font-bold`}>Đăng nhập</Text>
          </Text>
        </TouchableOpacity>
      }
    >
      <AuthInput
        label="Họ và tên"
        value={fullName}
        onChangeText={setFullName}
        placeholder="Nhập họ và tên"
        autoCapitalize="words"
      />
      <AuthInput
        label="Email"
        value={email}
        onChangeText={handleEmailChange}
        onBlur={handleEmailBlur}
        placeholder="Nhập email của bạn"
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
      <AuthInput
        label="Xác nhận mật khẩu"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Nhập lại mật khẩu"
        secureTextEntry={!showConfirmPassword}
        showToggle
        onToggleSecure={() => setShowConfirmPassword(!showConfirmPassword)}
      />

      <GradientButton
        title="Đăng ký"
        onPress={handleRegister}
        loading={loading}
      />
    </AuthLayout>
  );
};

export default RegisterScreen;
