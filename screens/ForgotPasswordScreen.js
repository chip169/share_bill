import React, { useState } from "react";
import { View, SafeAreaView, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { Mail, Lock, Eye, EyeOff, Sparkles, ChevronLeft } from "lucide-react-native";
import tw from "twrnc";
import { LinearGradient } from "expo-linear-gradient";
import { fetchUserByIdentifier, resetUserPassword } from "../services/api";

const QUESTION = "Màu bạn yêu thích là gì? ";

export default function ForgotPasswordScreen({ onNavigate }) {
  const [identifier, setIdentifier] = useState("");
  const [step, setStep] = useState(1); // 1: Nhập tài khoản, 2: Trả lời câu hỏi bảo mật, 3: Thiết lập mật khẩu mới
  const [targetUser, setTargetUser] = useState(null);

  // Câu trả lời của người dùng
  const [ans, setAns] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [secureConfirmText, setSecureConfirmText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFindUser = async () => {
    if (!identifier.trim()) {
      setErrorMsg("Vui lòng nhập Số điện thoại hoặc Email!");
      return;
    }

    setErrorMsg("");
    setLoading(true);
    try {
      const user = await fetchUserByIdentifier(identifier);
      if (!user) {
        setErrorMsg("Không tìm thấy tài khoản nào khớp với thông tin đã nhập!");
        setLoading(false);
        return;
      }

      setTargetUser(user);
      setStep(2); // Chuyển sang bước 2 để trả lời câu hỏi bảo mật
    } catch (error) {
      setErrorMsg("Đã xảy ra lỗi khi tìm kiếm tài khoản. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyQuestion = () => {
    if (!ans.trim()) {
      setErrorMsg("Vui lòng nhập câu trả lời bảo mật!");
      return;
    }

    // Lấy câu trả lời chính xác lưu trong user hoặc giá trị mặc định fallback
    const expectedAns = (targetUser.securityAnswer || "xanh").trim().toLowerCase();
    const userAns = ans.trim().toLowerCase();

    if (userAns === expectedAns) {
      setErrorMsg("");
      setStep(3); // Đi tiếp sang bước 3 nhập mật khẩu mới
    } else {
      setErrorMsg("Câu trả lời bảo mật không chính xác! Vui lòng thử lại.");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setErrorMsg("Vui lòng nhập đầy đủ mật khẩu mới!");
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
      await resetUserPassword(targetUser.phone, newPassword);
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
          colors={["#0369a1", "#0ea5e9"]} // Unified premium Sky Blue gradient
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
              {step === 1 && "Nhập Số điện thoại hoặc Email tài khoản để khôi phục."}
              {step === 2 && "Vui lòng trả lời câu hỏi bảo mật để xác thực danh tính chủ sở hữu tài khoản."}
              {step === 3 && "Thiết lập mật khẩu mới cho tài khoản của bạn để tiếp tục sử dụng."}
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
                {/* Identifier Input */}
                <View style={tw`mb-6`}>
                  <TextInput
                    label="Số điện thoại"
                    value={identifier}
                    onChangeText={setIdentifier}
                    keyboardType="default"
                    autoCapitalize="none"
                    mode="outlined"
                    outlineColor="#e2e8f0"
                    activeOutlineColor="#0ea5e9"
                    style={tw`bg-white text-slate-700`}
                    left={<TextInput.Icon icon={() => <Mail size={18} color="#94a3b8" />} />}
                  />
                </View>

                {/* Submit button */}
                <Button
                  mode="contained"
                  onPress={handleFindUser}
                  loading={loading}
                  disabled={loading}
                  contentStyle={tw`h-13`}
                  style={tw`rounded-2xl bg-sky-500 shadow-md shadow-sky-500/20`}
                  labelStyle={tw`text-base font-bold text-white`}
                >
                  Tiếp tục
                </Button>
              </View>
            ) : step === 2 ? (
              <View>
                {/* Security Question Field */}
                <Text style={tw`text-slate-800 font-bold text-sm mb-4`}>Câu hỏi xác minh:</Text>

                <View style={tw`mb-6`}>
                  <Text style={tw`text-slate-500 text-xs mb-2`}>{QUESTION}</Text>
                  <TextInput
                    value={ans}
                    onChangeText={setAns}
                    mode="outlined"
                    outlineColor="#e2e8f0"
                    activeOutlineColor="#0ea5e9"
                    style={tw`bg-white h-11 text-xs`}
                    placeholder="Nhập câu trả lời"
                    dense
                  />
                </View>

                <Button
                  mode="contained"
                  onPress={handleVerifyQuestion}
                  contentStyle={tw`h-13`}
                  style={tw`rounded-2xl bg-sky-500`}
                  labelStyle={tw`text-base font-bold text-white`}
                >
                  Xác minh câu trả lời
                </Button>

                <TouchableOpacity
                  onPress={() => { setStep(1); setErrorMsg(""); }}
                  style={tw`mt-4 items-center`}
                >
                  <Text style={tw`text-slate-400 font-bold text-xs`}>Quay lại nhập tài khoản</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
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
                  onPress={() => { setStep(2); setErrorMsg(""); }}
                  style={tw`mt-4 items-center`}
                >
                  <Text style={tw`text-sky-500 font-bold text-xs`}>Quay lại</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
