import React, { useState, useEffect } from "react";
import { View, SafeAreaView, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert, Image } from "react-native";
import { TextInput, Button, Text, HelperText, Portal, Dialog } from "react-native-paper";
import { User, Phone, Lock, CreditCard, Sparkles, ChevronLeft, Search } from "lucide-react-native";
import tw from "twrnc";
import { registerUser, fetchBankList } from "../services/api";
import { sendLocalNotification } from "../services/notifications";

const POPULAR_BANKS = [
  { code: "MB", shortName: "MBBank", name: "Ngân hàng TMCP Quân Đội", bin: "970422", logo: "https://api.vietqr.io/img/MB.png" },
  { code: "VCB", shortName: "Vietcombank", name: "Ngân hàng TMCP Ngoại Thương", bin: "970436", logo: "https://api.vietqr.io/img/VCB.png" },
  { code: "TCB", shortName: "Techcombank", name: "Ngân hàng TMCP Kỹ Thương", bin: "970407", logo: "https://api.vietqr.io/img/TCB.png" },
  { code: "BIDV", shortName: "BIDV", name: "Ngân hàng TMCP Đầu Tư và Phát Triển", bin: "970418", logo: "https://api.vietqr.io/img/BIDV.png" },
  { code: "CTG", shortName: "VietinBank", name: "Ngân hàng TMCP Công Thương", bin: "970415", logo: "https://api.vietqr.io/img/CTG.png" },
  { code: "ACB", shortName: "ACB", name: "Ngân hàng TMCP Á Châu", bin: "970416", logo: "https://api.vietqr.io/img/ACB.png" },
  { code: "AGRIBANK", shortName: "Agribank", name: "Ngân hàng Nông nghiệp & PTNT", bin: "970405", logo: "https://api.vietqr.io/img/AGRIBANK.png" },
  { code: "VPB", shortName: "VPBank", name: "Ngân hàng TMCP Việt Nam Thịnh Vượng", bin: "970432", logo: "https://api.vietqr.io/img/VPB.png" },
  { code: "TPB", shortName: "TPBank", name: "Ngân hàng TMCP Tiên Phong", bin: "970423", logo: "https://api.vietqr.io/img/TPB.png" },
  { code: "STB", shortName: "Sacombank", name: "Ngân hàng TMCP Sài Gòn Thương Tín", bin: "970403", logo: "https://api.vietqr.io/img/STB.png" }
];

export default function RegisterScreen({ onNavigate }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  
  // Bank Picker states
  const [bankList, setBankList] = useState(POPULAR_BANKS);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [bankSearch, setBankSearch] = useState("");

  useEffect(() => {
    const loadBanks = async () => {
      const apiBanks = await fetchBankList();
      if (apiBanks && apiBanks.length > 0) {
        const mapped = apiBanks.map(b => ({
          code: b.code,
          shortName: b.shortName || b.code,
          name: b.name,
          bin: b.bin,
          logo: b.logo || `https://api.vietqr.io/img/${b.code}.png`
        }));
        setBankList(mapped);
      }
    };
    loadBanks();
  }, []);

  const filteredBanks = bankList.filter(b => 
    b.code.toLowerCase().includes(bankSearch.toLowerCase()) ||
    b.shortName.toLowerCase().includes(bankSearch.toLowerCase()) ||
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  );
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const validatePhone = (phoneNumber) => {
    // Số điện thoại Việt Nam chuẩn: 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09
    const regex = /^(0[3|5|7|8|9])[0-9]{8}$/;
    return regex.test(phoneNumber.trim());
  };

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

    if (!validatePhone(phone)) {
      setErrorMsg("Số điện thoại không hợp lệ (phải bắt đầu bằng 03, 05, 07, 08, 09 và gồm 10 số)!");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Mật khẩu không hợp lệ (phải có ít nhất 6 ký tự)!");
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
      
      // Gửi thông báo đăng ký thành công
      sendLocalNotification(
        "Đăng ký tài khoản thành công! 🎉",
        `Chào mừng ${fullName} đã tham gia ShareBill. Hãy bắt đầu tạo bill và chia sẻ chi tiêu!`
      );

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
            <TouchableOpacity onPress={() => setShowBankPicker(true)} style={tw`mb-4`}>
              <View pointerEvents="none">
                <TextInput
                  label="Ngân hàng thụ hưởng"
                  value={bankName}
                  placeholder="Bấm để chọn ngân hàng"
                  mode="outlined"
                  outlineColor="#e2e8f0"
                  activeOutlineColor="#0ea5e9"
                  style={tw`bg-white text-slate-700`}
                  left={<TextInput.Icon icon={() => <CreditCard size={18} color="#94a3b8" />} />}
                  editable={false}
                />
              </View>
            </TouchableOpacity>

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

      {/* Bank Picker Dialog */}
      <Portal>
        <Dialog visible={showBankPicker} onDismiss={() => { setShowBankPicker(false); setBankSearch(""); }} style={tw`bg-white rounded-3xl max-h-[80%]`}>
          <Dialog.Title style={tw`font-bold text-slate-800`}>Chọn Ngân hàng</Dialog.Title>
          <Dialog.Content style={tw`gap-3`}>
            <TextInput
              label="Tìm kiếm ngân hàng..."
              value={bankSearch}
              onChangeText={setBankSearch}
              mode="outlined"
              outlineColor="#e2e8f0"
              activeOutlineColor="#0ea5e9"
              style={tw`bg-white text-slate-700 mb-2 h-11 text-xs`}
              left={<TextInput.Icon icon={() => <Search size={18} color="#94a3b8" />} />}
              dense
            />
            <ScrollView style={tw`max-h-80`}>
              {filteredBanks.length === 0 ? (
                <View style={tw`items-center py-6`}>
                  <Text style={tw`text-slate-400 text-sm`}>Không tìm thấy ngân hàng!</Text>
                </View>
              ) : (
                filteredBanks.map((b) => (
                  <TouchableOpacity
                    key={b.bin}
                    onPress={() => {
                      setBankName(b.code);
                      setShowBankPicker(false);
                      setBankSearch("");
                    }}
                    style={tw`flex-row items-center py-3 border-b border-slate-50`}
                  >
                    <Image source={{ uri: b.logo }} style={tw`w-12 h-6 mr-3`} resizeMode="contain" />
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-slate-800 font-bold text-sm`}>{b.shortName}</Text>
                      <Text style={tw`text-slate-400 text-[10px]`} numberOfLines={1}>{b.name}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions style={tw`pb-4 pr-4`}>
            <Button onPress={() => { setShowBankPicker(false); setBankSearch(""); }} labelStyle={tw`text-sky-500 font-bold`}>Đóng</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}
