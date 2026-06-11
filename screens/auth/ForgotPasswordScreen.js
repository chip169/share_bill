import React, { useState } from "react";
import { Text, TouchableOpacity, Alert } from "react-native";
import tw from "twrnc";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthInput from "../../components/auth/AuthInput";
import GradientButton from "../../components/auth/GradientButton";
import {
  requestPasswordReset,
  resetPassword,
  verifyOtp,
} from "../../services/authApi";

const ForgotPasswordScreen = ({ onNavigate }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
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

  const handleSendOtp = async () => {
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }

    setEmailError("");
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      Alert.alert(
        "Gửi OTP thành công",
        `Mã OTP đã được gửi tới ${email.trim()}`,
      );
      setStep(2);
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể gửi mã OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(email, otp.trim());
      Alert.alert("Thành công", "Mã OTP hợp lệ! Vui lòng nhập mật khẩu mới.");
      setStep(3);
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Mã OTP không chính xác hoặc đã hết hạn");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, otp.trim(), newPassword);
      Alert.alert(
        "Thành công",
        "Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.",
        [{ text: "OK", onPress: () => onNavigate("login") }],
      );
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể đặt lại mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <AuthLayout
        title="Xác thực OTP"
        subtitle={`Nhập mã OTP đã gửi tới ${email}`}
        footer={
          <TouchableOpacity onPress={() => onNavigate("login")}>
            <Text style={tw`text-white underline text-sm`}>
              Quay lại Đăng nhập
            </Text>
          </TouchableOpacity>
        }
      >
        <AuthInput
          label="Mã OTP"
          value={otp}
          onChangeText={setOtp}
          placeholder="Nhập mã OTP 6 số"
          keyboardType="number-pad"
        />

        <GradientButton
          title="Xác thực OTP"
          onPress={handleVerifyOtp}
          loading={loading}
        />
      </AuthLayout>
    );
  }

  if (step === 3) {
    return (
      <AuthLayout
        title="Đặt lại mật khẩu"
        subtitle="Nhập mật khẩu mới cho tài khoản của bạn"
        footer={
          <TouchableOpacity onPress={() => onNavigate("login")}>
            <Text style={tw`text-white underline text-sm`}>
              Quay lại Đăng nhập
            </Text>
          </TouchableOpacity>
        }
      >
        <AuthInput
          label="Mật khẩu mới"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Nhập mật khẩu mới"
          secureTextEntry={!showPassword}
          showToggle
          onToggleSecure={() => setShowPassword(!showPassword)}
        />
        <AuthInput
          label="Xác nhận mật khẩu mới"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Nhập lại mật khẩu mới"
          secureTextEntry={!showConfirmPassword}
          showToggle
          onToggleSecure={() => setShowConfirmPassword(!showConfirmPassword)}
        />

        <GradientButton
          title="Đặt lại mật khẩu"
          onPress={handleResetPassword}
          loading={loading}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Quên mật khẩu"
      subtitle="Nhập email để nhận mã OTP xác thực"
      footer={
        <TouchableOpacity onPress={() => onNavigate("login")}>
          <Text style={tw`text-white underline text-sm`}>
            Quay lại Đăng nhập
          </Text>
        </TouchableOpacity>
      }
    >
      <AuthInput
        label="Email đã đăng ký"
        value={email}
        onChangeText={handleEmailChange}
        onBlur={handleEmailBlur}
        placeholder="Nhập email"
        keyboardType="email-address"
        error={emailError}
      />

      <GradientButton
        title="Gửi mã OTP"
        onPress={handleSendOtp}
        loading={loading}
      />
    </AuthLayout>
  );
};

export default ForgotPasswordScreen;
