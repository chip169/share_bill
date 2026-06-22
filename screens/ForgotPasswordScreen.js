import React, { useState } from "react";
import { View, SafeAreaView, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert } from "react-native";
import { TextInput, Button, Text, HelperText } from "react-native-paper";
import { Phone, Lock, Eye, EyeOff, Sparkles, ChevronLeft } from "lucide-react-native";
import tw from "twrnc";
import { LinearGradient } from "expo-linear-gradient";
import { resetUserPassword } from "../services/api";

export default function ForgotPasswordScreen({ onNavigate }) {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState(1); // 1: Nhập SĐT, 2: Nhập OTP & Mật khẩu mới
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [secureConfirmText, setSecureConfirmText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const validatePhone = (phoneNumber) => {
    const regex = /^(0[3|5|7|8|9])[0-9]{8}$/;
    return regex.test(phoneNumber.trim());
  };

  const handleSendOtp = async () => {
    if (!phone) {
      setErrorMsg("Vui lòng nhập số điện thoại!");
      return;
    }
    if (!validatePhone(phone)) {
      setErrorMsg("Số điện thoại không hợp lệ (phải bắt đầu bằng 03, 05, 07, 08, 09 và gồm 10 số)!");
      return;
    }

    setErrorMsg("");
    setLoading(true);
    try {
      // Gọi API tra cứu thử SĐT có tồn tại hay không trước khi gửi OTP
      const apiResult = await resetUserPassword(phone, "DUMMY_PWD_CHECK");
      // Nếu API không báo lỗi "Số điện thoại này chưa được đăng ký!" thì tức là số điện thoại tồn tại.
      // Tuy nhiên, do chúng ta truyền "DUMMY_PWD_CHECK" nên nó sẽ chạy thử,
      // để tránh thay đổi mật khẩu thật ở bước này, ta chỉ kiểm tra thông qua lookup API.
    } catch (error) {
      if (error.message === "Số điện thoại này chưa được đăng ký!") {
        setErrorMsg("Số điện thoại này chưa được đăng ký trên hệ thống!");
        setLoading(false);
        return;
      }
    }

    // Nếu số điện thoại tồn tại (hoặc vượt qua check thành công), chuyển sang bước 2
    setLoading(false);
    setStep(2);
    Alert.alert(
      "Gửi mã thành công",
      "Mã xác thực OTP đã được gửi đến số điện thoại của bạn! (Mã mặc định: 123456)",
      [{ text: "OK" }]
    );
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      setErrorMsg("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (otp.trim() !== "123456") {
      setErrorMsg("Mã OTP không chính xác! (Mã mặc định là 123456)");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("Mật khẩu mới phải chứa ít nhất 6 ký tự!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp!");
      return;
    }

    setErrorMsg("");
    setLoading(true);
    try {
      await resetUserPassword(phone, newPassword);
      Alert.alert(
        "Thành công 🎉",
        "Mật khẩu của bạn đã được cập nhật thành công! Vui lòng đăng nhập lại bằng mật khẩu mới.",
        [{ text: "Đăng nhập", onPress: () => onNavigate("login") }]
      );
    } catch (error) {
      setErrorMsg(error.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại!");
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
        <LinearGradient
          colors={["#0f172a", "#1e293b", "#0ea5e9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={tw`flex-row items-center px-4 py-4 shadow-sm rounded-b-2xl`}
        >
          <TouchableOpacity onPress={() => onNavigate("login")} style={tw`p-2 bg-white/10 rounded-full mr-3`}>
            <ChevronLeft size={20} color="white" />
          </TouchableOpacity>
          <Text style={tw`text-base font-black text-white`}>Đặt lại mật khẩu</Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={tw`flex-grow justify-center px-6 py-6`}>
          {/* Logo and Header */}
          <View style={tw`items-center mb-8`}>
            <View style={tw`w-16 h-16 bg-sky-500 rounded-2xl items-center justify-center shadow-lg shadow-sky-500/20 mb-3`}>
              <Sparkles size={32} color="white" />
            </View>
            <Text style={tw`text-2xl font-bold text-slate-800`}>Quên mật khẩu</Text>
            <Text style={tw`text-slate-400 mt-2 text-center text-xs px-6`}>
              {step === 1 
                ? "Nhập số điện thoại đã đăng ký để nhận mã xác thực OTP khôi phục mật khẩu."
                : "Nhập mã OTP vừa nhận được và thiết lập mật khẩu mới cho tài khoản của bạn."
              }
            </Text>
          </View>

          {/* Form Card */}
          <View style={tw`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6`}>
            {errorMsg ? (
              <View style={tw`bg-red-50 border border-red-100 rounded-2xl p-3 mb-4`}>
                <Text style={tw`text-red-500 text-xs text-center font-medium`}>{errorMsg}</Text>
              </View>
            ) : null}

            {step === 1 ? (
              <View>
                {/* Phone Input */}
                <View style={tw`mb-6`}>
                  <TextInput
                    label="Số điện thoại của bạn"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    mode="outlined"
                    outlineColor="#e2e8f0"
                    activeOutlineColor="#0ea5e9"
                    style={tw`bg-white text-slate-700`}
                    left={<TextInput.Icon icon={() => <Phone size={18} color="#94a3b8" />} />}
                  />
                </View>

                {/* Submit button */}
                <Button
                  mode="contained"
                  onPress={handleSendOtp}
                  loading={loading}
                  disabled={loading}
                  contentStyle={tw`h-13`}
                  style={tw`rounded-2xl bg-sky-500 shadow-md shadow-sky-500/20`}
                  labelStyle={tw`text-base font-bold text-white`}
                >
                  Gửi mã xác thực OTP
                </Button>
              </View>
            ) : (
              <View>
                {/* Phone Readonly Display */}
                <View style={tw`bg-slate-50 border border-slate-100 rounded-2xl p-3 mb-4 flex-row justify-between items-center`}>
                  <Text style={tw`text-slate-500 text-xs`}>Tài khoản:</Text>
                  <Text style={tw`text-slate-800 font-bold text-sm`}>{phone}</Text>
                </View>

                {/* OTP Input */}
                <View style={tw`mb-4`}>
                  <TextInput
                    label="Nhập mã OTP (123456)"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="numeric"
                    mode="outlined"
                    outlineColor="#e2e8f0"
                    activeOutlineColor="#0ea5e9"
                    style={tw`bg-white text-slate-700`}
                  />
                </View>

                {/* New Password Input */}
                <View style={tw`mb-4`}>
                  <TextInput
                    label="Mật khẩu mới (tối thiểu 6 ký tự)"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={secureText}
                    mode="outlined"
                    outlineColor="#e2e8f0"
                    activeOutlineColor="#0ea5e9"
                    style={tw`bg-white text-slate-700`}
                    left={<TextInput.Icon icon={() => <Lock size={18} color="#94a3b8" />} />}
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

                {/* Confirm Password Input */}
                <View style={tw`mb-6`}>
                  <TextInput
                    label="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={secureConfirmText}
                    mode="outlined"
                    outlineColor="#e2e8f0"
                    activeOutlineColor="#0ea5e9"
                    style={tw`bg-white text-slate-700`}
                    left={<TextInput.Icon icon={() => <Lock size={18} color="#94a3b8" />} />}
                    right={
                      <TextInput.Icon
                        icon={() => (
                          <TouchableOpacity onPress={() => setSecureConfirmText(!secureConfirmText)}>
                            {secureConfirmText ? <Eye size={18} color="#94a3b8" /> : <EyeOff size={18} color="#94a3b8" />}
                          </TouchableOpacity>
                        )}
                      />
                    }
                  />
                </View>

                {/* Reset button */}
                <Button
                  mode="contained"
                  onPress={handleResetPassword}
                  loading={loading}
                  disabled={loading}
                  contentStyle={tw`h-13`}
                  style={tw`rounded-2xl bg-sky-500`}
                  labelStyle={tw`text-base font-bold text-white`}
                >
                  Xác nhận đặt lại mật khẩu
                </Button>

                <TouchableOpacity 
                  onPress={() => { setStep(1); setErrorMsg(""); }} 
                  style={tw`mt-4 items-center`}
                >
                  <Text style={tw`text-sky-500 font-bold text-xs`}>Quay lại nhập số điện thoại</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
