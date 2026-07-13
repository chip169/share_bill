import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Portal, Dialog, Button, TextInput } from "react-native-paper";
import { CreditCard, QrCode, Bell, Settings, HelpCircle, LogOut } from "lucide-react-native";
import tw from "twrnc";

import Header from "../components/profile/Header";
import PersonalInfo from "../components/profile/PersonalInfo";
import MenuItem from "../components/profile/MenuItem";
import { fetchUserProfile, updateUserProfile, fetchNotifications, markNotificationRead, fetchBankList } from "../services/api";
import BottomNav from "../components/navigation/BottomNav";
import * as Speech from "expo-speech";

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

const getVietQrBankCode = (bankName) => {
  if (!bankName) return "VCB";
  const name = bankName.trim().toUpperCase();
  if (name.includes("VIETCOMBANK") || name === "VCB") return "VCB";
  if (name.includes("MB") || name.includes("MILITARY")) return "MB";
  if (name.includes("TECHCOMBANK") || name === "TCB") return "TCB";
  if (name.includes("BIDV")) return "BIDV";
  if (name.includes("VIETIN") || name === "CTG" || name === "ICB") return "ICB";
  if (name.includes("AGRI") || name === "VARB") return "AGRIBANK";
  if (name.includes("VP") || name === "VPB") return "VPB";
  if (name.includes("TP") || name === "TPB") return "TPB";
  if (name.includes("ACB")) return "ACB";
  if (name.includes("SACOMBANK") || name === "STB") return "STB";
  if (name.includes("VIB")) return "VIB";
  return name.replace(/\s+/g, "");
};

const ProfileScreen = ({ onNavigate, currentUser, onLogout }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showBankModal, setShowBankModal] = useState(false);
  const [editBankName, setEditBankName] = useState("");
  const [editBankAccount, setEditBankAccount] = useState("");

  const [showQrModal, setShowQrModal] = useState(false);

  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(false);

  // Bank Picker states
  const [bankList, setBankList] = useState(POPULAR_BANKS);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [bankSearch, setBankSearch] = useState("");

  // Security Question State
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editAns, setEditAns] = useState("");

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

  useEffect(() => {
    loadProfile();
  }, [currentUser]);

  const loadProfile = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [profileData, notifData] = await Promise.all([
        fetchUserProfile(currentUser.id),
        fetchNotifications(currentUser.id)
      ]);
      setUser(profileData);
      setEditBankName(profileData.bankName || "");
      setEditBankAccount(profileData.bankAccount || "");
      setNotifications(notifData);
      
      // Load câu hỏi bảo mật
      setEditAns(profileData.securityAnswer || "");
    } catch (error) {
      console.log("Lỗi kết nối API profile:", error);
    } finally {
      loadProfileDetailsEnd();
    }
  };

  const loadProfileDetailsEnd = () => {
    setLoading(false);
  };

  const handleSaveBank = async () => {
    if (!editBankName.trim() || !editBankAccount.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ tên ngân hàng và số tài khoản!");
      return;
    }
    // Validation số tài khoản: chỉ số, 9-15 ký tự
    const regex = /^[0-9]{9,15}$/;
    if (!regex.test(editBankAccount.trim())) {
      Alert.alert("Lỗi", "Số tài khoản ngân hàng phải chỉ chứa số, độ dài từ 9 đến 15 số!");
      return;
    }

    try {
      await updateUserProfile(currentUser.id, {
        bankName: editBankName.trim(),
        bankAccount: editBankAccount.trim()
      });
      Alert.alert("Thành công", "Đã cập nhật thông tin tài khoản ngân hàng!");
      setShowBankModal(false);
      loadProfile(); // Load lại profile
    } catch (e) {
      Alert.alert("Lỗi", "Không thể lưu thông tin. Vui lòng thử lại!");
    }
  };

  const handleSaveQuestion = async () => {
    if (!editAns.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập câu trả lời cho câu hỏi bảo mật!");
      return;
    }

    try {
      await updateUserProfile(currentUser.id, {
        securityAnswer: editAns.trim()
      });
      Alert.alert("Thành công 🎉", "Đã cập nhật câu trả lời bảo mật thành công!");
      setShowQuestionModal(false);
      loadProfile();
    } catch (e) {
      Alert.alert("Lỗi", "Không thể lưu câu hỏi bảo mật. Vui lòng thử lại!");
    }
  };

  const handleOpenNotifications = async () => {
    setShowNotifModal(true);
    setLoadingNotif(true);
    try {
      const data = await fetchNotifications(currentUser.id);
      setNotifications(data);
    } catch (e) {
      console.log("Lỗi tải thông báo:", e);
    } finally {
      setLoadingNotif(false);
    }
  };

  const handleReadNotif = async (notif) => {
    if (notif.isRead) return;
    try {
      await markNotificationRead(notif.id);
      setNotifications(prev =>
        prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
      );
    } catch (e) {
      console.log(e);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 justify-center items-center bg-slate-50`}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-24`}>
        <Header user={user} />
        <PersonalInfo user={user} />
        
        <View style={tw`px-4 mt-4`}>
          <View
            style={tw`bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100`}
          >
            <MenuItem 
              icon={CreditCard} 
              label="Tài khoản ngân hàng" 
              onPress={() => setShowBankModal(true)} 
            />
            <MenuItem 
              icon={QrCode} 
              label="Mã QR của tôi" 
              onPress={() => setShowQrModal(true)} 
            />
            <MenuItem 
              icon={Bell} 
              label="Thông báo" 
              onPress={handleOpenNotifications} 
              showBadge={notifications.some(n => !n.isRead)}
            />
            <MenuItem 
              icon={HelpCircle} 
              label="Thiết lập Câu hỏi bảo mật" 
              onPress={() => setShowQuestionModal(true)} 
            />
            <MenuItem 
              icon={Settings} 
              label="Cài đặt" 
              onPress={() => Alert.alert("Cài đặt", "Chức năng cài đặt hệ thống đang được phát triển.")} 
            />
            <MenuItem 
              icon={HelpCircle} 
              label="Trợ giúp & Hỗ trợ" 
              isLast 
              onPress={() => Alert.alert("Trợ giúp", "Hotline hỗ trợ: 1900 6868. Email: support@sharebill.vn")}
            />
          </View>
        </View>

        <View style={tw`px-4 mt-5`}>
          <TouchableOpacity
            onPress={onLogout}
            style={tw`w-full bg-white py-4 rounded-2xl shadow-sm flex-row items-center justify-center gap-2 border border-slate-100`}
          >
            <LogOut size={18} color="#ef4444" />
            <Text style={tw`text-red-500 font-bold text-sm`}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
        <Text style={tw`text-center text-xs text-slate-400 mt-6`}>
          ShareBill v1.0.0
        </Text>
      </ScrollView>

      {/* PORTAL MODALS */}
      <Portal>
        {/* Modal thiết lập Câu hỏi bảo mật */}
        <Dialog visible={showQuestionModal} onDismiss={() => setShowQuestionModal(false)} style={tw`bg-white rounded-3xl`}>
          <Dialog.Title style={tw`font-bold text-slate-800`}>Câu hỏi bảo mật</Dialog.Title>
          <Dialog.Content style={tw`gap-3`}>
            <Text style={tw`text-slate-500 text-xs mb-2`}>
              Thiết lập câu trả lời cho câu hỏi bảo mật bắt buộc để phục vụ khôi phục mật khẩu tài khoản:
            </Text>
            
            <View style={tw`mb-2`}>
              <Text style={tw`text-slate-700 text-xs font-bold mb-2`}>Màu bạn yêu thích là gì?</Text>
              <TextInput
                value={editAns}
                onChangeText={setEditAns}
                placeholder="Ví dụ: xanh"
                mode="outlined"
                outlineColor="#e2e8f0"
                activeOutlineColor="#0ea5e9"
                style={tw`bg-white h-11 text-xs`}
                dense
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions style={tw`pb-4 pr-4`}>
            <Button onPress={() => setShowQuestionModal(false)} labelStyle={tw`text-slate-400 font-bold`}>Hủy</Button>
            <Button onPress={handleSaveQuestion} labelStyle={tw`text-sky-500 font-bold`}>Lưu</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Modal chỉnh sửa Ngân hàng */}
        <Dialog visible={showBankModal} onDismiss={() => setShowBankModal(false)} style={tw`bg-white rounded-3xl`}>
          <Dialog.Title style={tw`font-bold text-slate-800`}>Tài khoản ngân hàng</Dialog.Title>
          <Dialog.Content style={tw`gap-4`}>
            <TouchableOpacity onPress={() => setShowBankPicker(true)}>
              <View pointerEvents="none">
                <TextInput
                  label="Ngân hàng"
                  value={editBankName}
                  placeholder="Bấm để chọn ngân hàng"
                  mode="outlined"
                  outlineColor="#e2e8f0"
                  activeOutlineColor="#0ea5e9"
                  style={tw`bg-white text-slate-700`}
                  editable={false}
                />
              </View>
            </TouchableOpacity>
            <TextInput
              label="Số tài khoản"
              value={editBankAccount}
              onChangeText={setEditBankAccount}
              keyboardType="numeric"
              mode="outlined"
              outlineColor="#e2e8f0"
              activeOutlineColor="#0ea5e9"
              style={tw`bg-white text-slate-700`}
            />
          </Dialog.Content>
          <Dialog.Actions style={tw`pb-4 pr-4`}>
            <Button onPress={() => setShowBankModal(false)} labelStyle={tw`text-slate-400 font-bold`}>Hủy</Button>
            <Button onPress={handleSaveBank} labelStyle={tw`text-sky-500 font-bold`}>Lưu</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Bank Picker Dialog */}
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
                      setEditBankName(b.code);
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

        {/* Modal xem QR Code */}
        <Dialog visible={showQrModal} onDismiss={() => setShowQrModal(false)} style={tw`bg-white rounded-3xl`}>
          <Dialog.Title style={tw`text-center font-bold text-slate-800`}>Mã QR Nhận Tiền</Dialog.Title>
          <Dialog.Content style={tw`items-center py-4`}>
            <View style={tw`w-52 h-52 bg-white border border-slate-100 rounded-2xl items-center justify-center mb-4 overflow-hidden shadow-sm`}>
              <Image 
                source={{ uri: `https://img.vietqr.io/image/${getVietQrBankCode(user?.bankName)}-${user?.bankAccount}-compact2.png?accountName=${encodeURIComponent(user?.fullName || "")}` }}
                style={tw`w-full h-full`}
                resizeMode="contain"
              />
            </View>
            <Text style={tw`text-slate-800 font-bold text-base text-center mb-1`}>
              {user?.bankName} - {user?.bankAccount}
            </Text>
            <Text style={tw`text-slate-500 text-sm text-center mb-1`}>
              Chủ tài khoản: {user?.fullName}
            </Text>
            <Text style={tw`text-emerald-500 text-xs font-bold text-center mt-2`}>
              Quét mã này để nhận chuyển khoản hóa đơn nhanh
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={tw`justify-center pb-4`}>
            <Button onPress={() => setShowQrModal(false)} labelStyle={tw`text-sky-500 font-bold`}>Đóng</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Modal xem danh sách Thông báo */}
        <Dialog visible={showNotifModal} onDismiss={() => { setShowNotifModal(false); Speech.stop(); }} style={tw`bg-white rounded-3xl max-h-[80%]`}>
          <Dialog.Title style={tw`font-bold text-slate-800`}>Thông báo</Dialog.Title>
          <Dialog.Content>
            {loadingNotif ? (
              <ActivityIndicator size="small" color="#0ea5e9" style={tw`py-6`} />
            ) : notifications.length === 0 ? (
              <View style={tw`items-center py-8`}>
                <Text style={tw`text-slate-400 text-sm`}>Không có thông báo nào!</Text>
              </View>
            ) : (
              <ScrollView style={tw`max-h-80`}>
                {notifications.map((notif) => (
                  <TouchableOpacity
                    key={notif.id}
                    onPress={() => handleReadNotif(notif)}
                    style={tw`flex-row items-start py-3.5 border-b border-slate-100 ${notif.isRead ? "opacity-60" : ""}`}
                  >
                    <View style={tw`w-2 h-2 rounded-full mt-1.5 mr-2.5 ${notif.isRead ? "bg-slate-300" : "bg-sky-500"}`} />
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-slate-800 text-sm ${notif.isRead ? "font-normal" : "font-bold"}`}>
                        {notif.title}
                      </Text>
                      <Text style={tw`text-slate-500 text-xs mt-1`}>
                        {notif.content}
                      </Text>
                      {notif.content.includes("Nam mô") && (
                        <TouchableOpacity
                          onPress={() => {
                            Speech.stop();
                            Speech.speak(notif.content, {
                              language: "vi-VN",
                              pitch: 0.8,
                              rate: 0.8
                            });
                            Alert.alert("Nam mô A Di Đà Phật 🙏", "Đang tụng văn khấn đòi nợ...", [
                              { text: "Dừng đọc", onPress: () => Speech.stop(), style: "destructive" },
                              { text: "Nghe tiếp" }
                            ]);
                          }}
                          style={tw`mt-2 bg-orange-500 px-3 py-1.5 rounded-full w-[120px] items-center`}
                        >
                          <Text style={tw`text-white text-[10px] font-bold`}>🔊 Nghe văn khấn</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </Dialog.Content>
          <Dialog.Actions style={tw`pb-4 pr-4`}>
            <Button onPress={() => { setShowNotifModal(false); Speech.stop(); }} labelStyle={tw`text-sky-500 font-bold`}>Đóng</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Navigation bottom bar */}
      <BottomNav onNavigate={onNavigate} currentScreen="profile" />
    </SafeAreaView>
  );
};

export default ProfileScreen;
