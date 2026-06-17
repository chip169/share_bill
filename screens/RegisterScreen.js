import React, { useState } from "react";
import { View, SafeAreaView, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert } from "react-native";
import { TextInput, Button, Text, HelperText } from "react-native-paper";
import { User, Phone, Lock, CreditCard, Sparkles, ChevronLeft } from "lucide-react-native";
import tw from "twrnc";
import { registerUser } from "../services/api";

export default function RegisterScreen({ onNavigate }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const validateBankAccount = (account) => {
    // Chỉ cho phép chữ số, độ dài từ 9 đến 15 ký tự
    const regex = /^[0-9]{9,15}$/;
    return regex.test(account);
  };

  const handleRegister = async () => {
    if (!fullName || !phone || !password || !bankName || !bankAccount) {
      setErrorMsg("Vui lòng nhập đầy đủ các trường thông tin!");
      return;
    }

    if (phone.length < 10) {
      setErrorMsg("Số điện thoại không hợp lệ (tối thiểu 10 số)!");
      return;
    }

    if (!validateBankAccount(bankAccount)) {
      setErrorMsg("Số tài khoản ngân hàng không hợp lệ (phải là số, từ 9 đến 15 số)!");
      return;
    }

    setErrorMsg("");
    setLoading(true);
    try {
      await registerUser({
        fullName,
        phone,
        password,
        bankName,
        bankAccount,
      });
      
      Alert.alert(
        "Đăng ký thành công",
        "Tài khoản của bạn đã được khởi tạo! Vui lòng đăng nhập lại.",
        [{ text: "OK", onPress: () => onNavigate("login") }]
      );
    } catch (error) {
      setErrorMsg(error.message || "Lỗi đăng ký tài khoản. Vui lòng thử lại!");
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
        <View style={tw`flex-row items-center px-4 py-3 border-b border-slate-100 bg-white`}>
          <TouchableOpacity onPress={() => onNavigate("login")} style={tw`p-1 mr-2`}>
            <ChevronLeft size={24} color="#334155" />
          </TouchableOpacity>
          <Text style={tw`text-lg font-bold text-slate-800`}>Tạo tài khoản</Text>
        </View>

        <ScrollView contentContainerStyle={tw`px-6 py-6`}>
          {/* Header text */}
          <View style={tw`items-center mb-6`}>
            <Text style={tw`text-base text-slate-400 text-center`}>
              Bắt đầu chia sẻ chi tiêu cùng hội bạn thân ngay hôm nay!
            </Text>
          </View>

          {/* Form Card */}
          <View style={tw`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6`}>
            {errorMsg ? (
              <View style={tw`bg-red-50 border border-red-100 rounded-2xl p-3 mb-4`}>
                <Text style={tw`text-red-500 text-xs text-center font-medium`}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Full Name */}
            <View style={tw`mb-4`}>
              <TextInput
                label="Họ và tên"
                value={fullName}
                onChangeText={setFullName}
                mode="outlined"
                outlineColor="#e2e8f0"
                activeOutlineColor="#0ea5e9"
                style={tw`bg-white text-slate-700`}
                left={<TextInput.Icon icon={() => <User size={18} color="#94a3b8" />} />}
              />
            </View>

            {/* Phone */}
            <View style={tw`mb-4`}>
              <TextInput
                label="Số điện thoại đăng nhập"
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

            {/* Password */}
            <View style={tw`mb-4`}>
              <TextInput
                label="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                mode="outlined"
                outlineColor="#e2e8f0"
                activeOutlineColor="#0ea5e9"
                style={tw`bg-white text-slate-700`}
                left={<TextInput.Icon icon={() => <Lock size={18} color="#94a3b8" />} />}
              />
            </View>

            <Text style={tw`text-sm font-bold text-slate-400 mt-2 mb-3`}>
              THÔNG TIN THANH TOÁN (ĐỂ NHẬN CHUYỂN KHOẢN)
            </Text>

            {/* Bank Name */}
            <View style={tw`mb-4`}>
              <TextInput
                label="Tên Ngân hàng (Ví dụ: MB, VCB...)"
                value={bankName}
                onChangeText={setBankName}
                mode="outlined"
                outlineColor="#e2e8f0"
                activeOutlineColor="#0ea5e9"
                style={tw`bg-white text-slate-700`}
                left={<TextInput.Icon icon={() => <CreditCard size={18} color="#94a3b8" />} />}
              />
            </View>

            {/* Bank Account */}
            <View style={tw`mb-6`}>
              <TextInput
                label="Số tài khoản ngân hàng"
                value={bankAccount}
                onChangeText={setBankAccount}
                keyboardType="numeric"
                mode="outlined"
                outlineColor="#e2e8f0"
                activeOutlineColor="#0ea5e9"
                style={tw`bg-white text-slate-700`}
                left={<TextInput.Icon icon={() => <CreditCard size={18} color="#94a3b8" />} />}
              />
              <HelperText type="info" visible style={tw`text-slate-400 text-[10px] -mt-1`}>
                Số tài khoản phải chỉ chứa số, độ dài từ 9 đến 15 số.
              </HelperText>
            </View>

            {/* Submit button */}
            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              contentStyle={tw`h-13`}
              style={tw`rounded-2xl bg-sky-500 shadow-md shadow-sky-500/20`}
              labelStyle={tw`text-base font-bold text-white`}
            >
              Đăng ký tài khoản
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
