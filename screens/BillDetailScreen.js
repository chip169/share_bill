import React, { useEffect, useState } from "react";
import { View, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, Dialog, Portal } from "react-native-paper";
import tw from "twrnc";
import { LinearGradient } from "expo-linear-gradient";
import { Home, FileText, User, ChevronLeft, QrCode } from "lucide-react-native";
import BillInfoCard from "../components/bill/BillInfoCard";
import BillItemsCard from "../components/bill/BillItemsCard";
import PaymentCard from "../components/bill/PaymentCard";
import MemberStatusList from "../components/bill/MemberStatusList";
import BankInfoCard from "../components/bill/BankInfoCard";

import { fetchBillDetail, settleParticipantPayment, sendPaymentReminder } from "../services/api";
import { sendLocalNotification } from "../services/notifications";
import * as Clipboard from "expo-clipboard";
import * as Speech from "expo-speech";
import BottomNav from "../components/navigation/BottomNav";

const getVietQrBankCode = (bankName) => {
  if (!bankName) return "970436"; // VCB BIN
  const name = bankName.trim().toUpperCase();
  if (name.includes("VIETCOMBANK") || name === "VCB") return "970436"; // Vietcombank BIN
  if (name.includes("MB") || name.includes("MILITARY")) return "970422"; // MBBank BIN
  if (name.includes("TECHCOMBANK") || name === "TCB") return "970407"; // Techcombank BIN
  if (name.includes("BIDV")) return "970418"; // BIDV BIN
  if (name.includes("VIETIN") || name === "CTG" || name === "ICB") return "970415"; // VietinBank BIN
  if (name.includes("AGRI") || name === "VARB") return "970405"; // Agribank BIN
  if (name.includes("VP") || name === "VPB") return "970432"; // VPBank BIN
  if (name.includes("TP") || name === "TPB") return "970423"; // TPBank BIN
  if (name.includes("ACB")) return "970416"; // ACB BIN
  if (name.includes("SACOMBANK") || name === "STB") return "970403"; // Sacombank BIN
  if (name.includes("VIB")) return "970441"; // VIB BIN
  return name.replace(/\s+/g, "");
};

export default function BillDetailScreen({ onNavigate, routeParams, currentUser }) {
  const insets = useSafeAreaInsets();
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

  const handleRemindPayment = async (member) => {
    Alert.alert(
      "Lựa chọn cách nhắc nợ 🤔",
      `Bạn muốn đòi tiền thành viên ${member.name} theo hình thức nào?`,
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Nhắc nhở lịch sự 📝",
          onPress: async () => {
            try {
              // 1. Gửi thông báo trong hệ thống
              await sendPaymentReminder(
                member.id,
                currentUser.fullName,
                bill.title,
                member.remainingAmount,
                bill.id
              );

              // 2. Sao chép nội dung đòi nợ vào Clipboard
              const bankInfoStr = bank.bankName ? `qua tài khoản ${bank.bankName} - ${bank.accountNumber} (${bank.owner})` : "trực tiếp";
              const reminderMessage = `${member.name} ơi, thanh toán hóa đơn "${bill.title}" giúp mình nhé. Số tiền: ${member.remainingAmount.toLocaleString("vi-VN")} đ. Chuyển khoản ${bankInfoStr} với nội dung chuyển khoản: ${bank.transferContent}. Cảm ơn bạn!`;
              
              await Clipboard.setStringAsync(reminderMessage);

              Alert.alert(
                "Đã gửi nhắc nhở đòi nợ! ⏰",
                `1. Hệ thống đã gửi thông báo nhắc nợ lịch sự đến ${member.name}.\n\n2. Đã sao chép tin nhắn đòi nợ vào khay nhớ tạm để gửi qua Zalo/Messenger!`,
                [{ text: "Đồng ý" }]
              );
            } catch (e) {
              Alert.alert("Lỗi", "Không thể gửi nhắc nhở.");
            }
          }
        },
        {
          text: "Văn khấn đòi nợ 🙏😂",
          onPress: async () => {
            try {
              // Tạo nội dung văn khấn đòi nợ hài hước
              const bankInfoStr = bank.bankName ? `qua tài khoản ${bank.bankName} - ${bank.accountNumber} (${bank.owner})` : "trực tiếp";
              const amountStr = `${member.remainingAmount.toLocaleString("vi-VN")} đ`;
              const prayerMessage = `Nam mô A Di Đà Phật! Con lạy chín phương trời, con lạy mười phương đất. Con lạy thí chủ ${member.name} tôn kính! Hôm ấy trời quang mây tạnh, chúng ta cùng ăn uống vui vẻ nghĩa tình, thanh toán hóa đơn "${bill.title}". Nay hóa đơn đã đến kỳ kết sổ, số tiền tuy nhỏ chỉ có ${amountStr}, nhưng là mồ hôi nước mắt, là tiền ăn sáng, tiền đổ xăng của con. Nay con cúi đầu xin thí chủ từ bi hỷ xả, thương xót thân con nghèo khó, mau mau chuyển khoản ${bankInfoStr} với nội dung "${bank.transferContent || "CHIA BILL"}" để giải thoát cho khoản nợ này. Kính mong thí chủ sớm thanh toán, tâm can con mới đặng bình an. Con xin thành tâm cảm tạ thí chủ cát tường vạn sự như ý!`;

              // Phát giọng đọc TTS chậm và trầm (dramatize) để chủ nợ nghe thử
              Speech.stop();
              Speech.speak(prayerMessage, {
                language: "vi-VN",
                pitch: 0.8,
                rate: 0.8
              });

              Alert.alert(
                "Đang nghe thử văn khấn đòi nợ! 🙏",
                `Bài văn khấn đòi nợ đang phát. Bấm "Đồng ý" để tắt tiếng, sao chép văn bản vào khay nhớ tạm và gửi trực tiếp sang tài khoản của ${member.name}.`,
                [
                  {
                    text: "Đồng ý",
                    onPress: async () => {
                      Speech.stop();
                      try {
                        // 1. Gửi thông báo loại PRAYER cho con nợ
                        await sendPaymentReminder(
                          member.id,
                          currentUser.fullName,
                          bill.title,
                          member.remainingAmount,
                          bill.id,
                          prayerMessage
                        );

                        // 2. Sao chép vào clipboard để gửi mạng xã hội
                        await Clipboard.setStringAsync(prayerMessage);
                      } catch (err) {
                        console.log("Lỗi gửi văn khấn:", err);
                      }
                    }
                  }
                ]
              );
            } catch (e) {
              Alert.alert("Lỗi", "Không thể tạo văn khấn.");
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
        contentContainerStyle={tw`p-4 pb-60`}
      >
        <PaymentCard amount={displayAmount} members={bill.members} isOwner={isOwner} />

        <BillInfoCard bill={bill} />

        <BillItemsCard bill={bill} />

        <MemberStatusList
          members={members}
          showSettleButton={isOwner}
          onSettle={handleSettlePayment}
          onRemind={handleRemindPayment}
        />

        <BankInfoCard bank={bank} />
      </ScrollView>

      {/* QR BUTTON */}
      <View style={[tw`absolute left-0 right-0 px-4`, { bottom: 56 + insets.bottom + 12 }]}>
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
