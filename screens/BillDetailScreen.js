import React, { useEffect, useState } from "react";
import { View, ScrollView, ActivityIndicator, TouchableOpacity, SafeAreaView, Alert, Image } from "react-native";
import { Button, Text, Dialog, Portal } from "react-native-paper";
import tw from "twrnc";
import { LinearGradient } from "expo-linear-gradient";
import { Home, FileText, User, ChevronLeft, QrCode } from "lucide-react-native";
import BillInfoCard from "../components/bill/BillInfoCard";
import BillItemsCard from "../components/bill/BillItemsCard";
import PaymentCard from "../components/bill/PaymentCard";
import MemberStatusList from "../components/bill/MemberStatusList";
import BankInfoCard from "../components/bill/BankInfoCard";

import { fetchBillDetail, settleParticipantPayment } from "../services/api";
import { sendLocalNotification } from "../services/notifications";
import BottomNav from "../components/navigation/BottomNav";

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

export default function BillDetailScreen({ onNavigate, routeParams, currentUser }) {
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);

  const billId = routeParams?.billId || "e1";

  useEffect(() => {
    loadBillDetail();
  }, [billId]);

  const loadBillDetail = async () => {
    setLoading(true);
    try {
      const data = await fetchBillDetail(billId);
      setBillData(data);
    } catch (error) {
      console.log("Lỗi fetch bill detail:", error);
      Alert.alert("Lỗi", "Không thể tải chi tiết hóa đơn này!");
      onNavigate("home");
    } finally {
      setLoading(false);
    }
  };

  const handleSettlePayment = async (member) => {
    Alert.alert(
      "Xác nhận thanh toán",
      `Bạn xác nhận thành viên ${member.name} đã thanh toán chuyển khoản đủ tiền?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: async () => {
            try {
              await settleParticipantPayment(member.participantId);
              
              // Gửi thông báo thanh toán thành công
              sendLocalNotification(
                "Xác nhận thanh toán thành công! 💰",
                `Bạn đã xác nhận thành viên ${member.name} thanh toán thành công.`
              );

              Alert.alert("Thành công", "Đã xác nhận thanh toán thành công!");
              // Refresh page
              loadBillDetail();
            } catch (e) {
              Alert.alert("Lỗi", "Không thể xác nhận thanh toán.");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 justify-center items-center bg-slate-50`}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={tw`mt-3 text-slate-500 text-sm`}>Đang tải hóa đơn...</Text>
      </SafeAreaView>
    );
  }

  if (!billData) {
    return (
      <SafeAreaView style={tw`flex-1 justify-center items-center bg-slate-50`}>
        <Text>Không tìm thấy dữ liệu hóa đơn</Text>
      </SafeAreaView>
    );
  }

  const { bill, members, bank } = billData;
  const isOwner = currentUser?.id === bill.creatorId;

  // Tính số tiền dựa trên vai trò của người đang đăng nhập
  const myMemberRecord = members.find((m) => m.id === currentUser?.id);
  const myOwedAmount = myMemberRecord ? myMemberRecord.remainingAmount : 0;

  const remainingToCollect = members
    .filter((m) => m.id !== bill.creatorId)
    .reduce((sum, m) => sum + (m.remainingAmount || 0), 0);

  const displayAmount = isOwner ? remainingToCollect : myOwedAmount;

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      {/* Top Header */}
      <LinearGradient
        colors={["#0369a1", "#0ea5e9"]} // Unified premium Sky Blue gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={tw`flex-row items-center justify-between px-4 py-4 shadow-sm rounded-b-2xl`}
      >
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={() => onNavigate("home")} style={tw`p-2 bg-white/10 rounded-full mr-3`}>
            <ChevronLeft size={20} color="white" />
          </TouchableOpacity>
          <Text style={tw`text-base font-black text-white`}>Chi tiết hóa đơn</Text>
        </View>
        {isOwner && (
          <TouchableOpacity
            onPress={() => onNavigate("createbill", { editBillId: bill.id })}
            style={tw`bg-sky-500/20 border border-sky-400/30 px-3.5 py-1.5 rounded-full`}
          >
            <Text style={tw`text-sky-400 text-xs font-black`}>✏️ Sửa</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`p-4 pb-44`}
      >
        <PaymentCard amount={displayAmount} members={bill.members} isOwner={isOwner} />

        <BillInfoCard bill={bill} />

        <BillItemsCard bill={bill} />

        <MemberStatusList
          members={members}
          showSettleButton={isOwner}
          onSettle={handleSettlePayment}
        />

        <BankInfoCard bank={bank} />
      </ScrollView>

      {/* QR BUTTON */}
      <View style={tw`absolute bottom-20 left-0 right-0 px-4`}>
        <Button
          mode="contained"
          icon={() => <QrCode size={18} color="white" style={tw`mr-2`} />}
          contentStyle={tw`h-13`}
          style={tw`rounded-2xl bg-sky-500 shadow-md shadow-sky-500/20`}
          labelStyle={tw`text-base font-bold text-white`}
          onPress={() => setShowQrModal(true)}
        >
          Xem mã QR chuyển khoản
        </Button>
      </View>

      {/* QR Code Dialog Modal */}
      <Portal>
        <Dialog visible={showQrModal} onDismiss={() => setShowQrModal(false)} style={tw`bg-white rounded-3xl`}>
          <Dialog.Title style={tw`text-center font-bold text-slate-800`}>Mã QR Chuyển Khoản</Dialog.Title>
          <Dialog.Content style={tw`items-center py-4`}>
            {/* Displaying simple VietQR simulation */}
            <View style={tw`w-52 h-52 bg-white border border-slate-100 rounded-2xl items-center justify-center mb-4 overflow-hidden shadow-sm`}>
              <Image
                source={{ uri: `https://img.vietqr.io/image/${getVietQrBankCode(bank.bankName)}-${bank.accountNumber}-compact2.png?amount=${displayAmount}&addInfo=${encodeURIComponent(bank.transferContent)}&accountName=${encodeURIComponent(bank.owner)}` }}
                style={tw`w-full h-full`}
                resizeMode="contain"
              />
            </View>
            <Text style={tw`text-slate-800 font-bold text-sm text-center mb-1`}>
              {bank.bankName} - {bank.accountNumber}
            </Text>
            <Text style={tw`text-slate-500 text-xs text-center mb-3`}>
              Chủ TK: {bank.owner}
            </Text>
            <Text style={tw`text-emerald-500 text-xs font-bold text-center`}>
              Cú pháp: {bank.transferContent}
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={tw`justify-center pb-4`}>
            <Button onPress={() => setShowQrModal(false)} labelStyle={tw`text-sky-500 font-bold`}>Đóng</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* BOTTOM NAV */}
      <BottomNav onNavigate={onNavigate} currentScreen="" />
    </SafeAreaView>
  );
}
