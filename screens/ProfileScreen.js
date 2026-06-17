import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from "react-native";
import { Portal, Dialog, Button, TextInput } from "react-native-paper";
import { CreditCard, QrCode, Bell, Settings, HelpCircle, LogOut, Home, FileText, User, ChevronRight, Check } from "lucide-react-native";
import tw from "twrnc";

import Header from "../components/profile/Header";
import PersonalInfo from "../components/profile/PersonalInfo";
import MenuItem from "../components/profile/MenuItem";
import { fetchUserProfile, updateUserProfile, fetchNotifications, markNotificationRead } from "../services/api";

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

  useEffect(() => {
    loadProfile();
  }, [currentUser]);

  const loadProfile = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const profileData = await fetchUserProfile(currentUser.id);
      setUser(profileData);
      setEditBankName(profileData.bankName || "");
      setEditBankAccount(profileData.bankAccount || "");
    } catch (error) {
      console.log("Lỗi kết nối API profile:", error);
    } finally {
      setLoading(false);
    }
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
      <SafeAreaView style={tw`flex-1 justify-center items-center bg-[#f8fafc]`}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-[#f8fafc]`}>
      <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-24`}>
        <Header user={user} />
        <PersonalInfo user={user} />
        
        <View style={tw`px-4 mt-4`}>
          <View
            style={tw`bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100`}
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
        {/* Modal chỉnh sửa Ngân hàng */}
        <Dialog visible={showBankModal} onDismiss={() => setShowBankModal(false)} style={tw`bg-white rounded-3xl`}>
          <Dialog.Title style={tw`font-bold text-slate-800`}>Tài khoản ngân hàng</Dialog.Title>
          <Dialog.Content style={tw`gap-4`}>
            <TextInput
              label="Tên Ngân hàng (VCB, MB...)"
              value={editBankName}
              onChangeText={setEditBankName}
              mode="outlined"
              outlineColor="#e2e8f0"
              activeOutlineColor="#0ea5e9"
              style={tw`bg-white text-slate-700`}
            />
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

        {/* Modal xem QR Code */}
        <Dialog visible={showQrModal} onDismiss={() => setShowQrModal(false)} style={tw`bg-white rounded-3xl`}>
          <Dialog.Title style={tw`text-center font-bold text-slate-800`}>Mã QR Nhận Tiền</Dialog.Title>
          <Dialog.Content style={tw`items-center py-4`}>
            <View style={tw`w-52 h-52 bg-slate-50 border border-slate-200 rounded-2xl items-center justify-center mb-4`}>
              <QrCode size={130} color="#0284c7" />
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
        <Dialog visible={showNotifModal} onDismiss={() => setShowNotifModal(false)} style={tw`bg-white rounded-3xl max-h-[80%]`}>
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
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </Dialog.Content>
          <Dialog.Actions style={tw`pb-4 pr-4`}>
            <Button onPress={() => setShowNotifModal(false)} labelStyle={tw`text-sky-500 font-bold`}>Đóng</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Navigation bottom bar */}
      <View
        style={tw`absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-4 flex-row justify-around items-center`}
      >
        <TouchableOpacity
          style={tw`items-center flex-1 py-1`}
          onPress={() => onNavigate("home")}
        >
          <Home size={22} color="#94a3b8" />
          <Text style={tw`text-slate-400 text-[10px] mt-1`}>Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`items-center flex-1 py-1`}
          onPress={() => onNavigate("history")}
        >
          <FileText size={22} color="#94a3b8" />
          <Text style={tw`text-slate-400 text-[10px] mt-1`}>Lịch sử</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tw`items-center flex-1 py-1`}>
          <User size={22} color="#0ea5e9" />
          <Text style={tw`text-[10px] text-[#0ea5e9] font-bold mt-1`}>
            Cá nhân
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
