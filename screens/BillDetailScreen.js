import React, { useEffect, useState } from "react";

import { View, ScrollView, ActivityIndicator, TouchableOpacity, SafeAreaView} from "react-native";
import { Button, Text } from "react-native-paper";
import tw from "twrnc";
import { Home, FileText, User } from "lucide-react-native";
import BillInfoCard from "../components/bill/BillInfoCard";
import BillItemsCard from "../components/bill/BillItemsCard";
import PaymentCard from "../components/bill/PaymentCard";
import MemberStatusList from "../components/bill/MemberStatusList";
import BankInfoCard from "../components/bill/BankInfoCard";

import { fetchBillDetail } from "../services/api";

export default function BillDetailScreen({ onNavigate }) {
  const [billData, setBillData] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBillDetail();
  }, []);

  const loadBillDetail = async () => {
    try {
      const data = await fetchBillDetail("e1");

      setBillData(data);
    } catch (error) {
      console.log("Lỗi fetch bill detail:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 justify-center items-center bg-slate-100`}>
        <ActivityIndicator size="large" color="#0284c7" />

        <Text style={tw`mt-3 text-base`}>Đang tải hóa đơn...</Text>
      </SafeAreaView>
    );
  }

  if (!billData) {
    return (
      <SafeAreaView style={tw`flex-1 justify-center items-center bg-slate-100`}>
        <Text>Không tìm thấy dữ liệu hóa đơn</Text>
      </SafeAreaView>
    );
  }

  const { bill, members, bank } = billData;

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-100`}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`p-4 pb-40`}
      >
        <PaymentCard amount={bill.splitAmount} members={bill.members} />

        <BillInfoCard bill={bill} />

        <BillItemsCard bill={bill} />

        <MemberStatusList members={members} />

        <BankInfoCard bank={bank} />
      </ScrollView>

      {/* QR BUTTON */}
      <View style={tw`absolute bottom-20 left-0 right-0 px-4`}>
        <Button
          mode="contained"
          icon="qrcode"
          contentStyle={tw`h-14`}
          style={tw`rounded-2xl bg-sky-600`}
          labelStyle={tw`text-base`}
        >
          Xem mã QR thanh toán
        </Button>
      </View>

      {/* BOTTOM NAV */}
      <View
        style={tw`absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-4 flex-row justify-around items-center`}
      >
        <TouchableOpacity
          style={tw`items-center flex-1 py-1`}
          onPress={() => onNavigate("home")}
        >
          <Home size={22} color="#94a3b8" />

          <Text style={tw`text-[10px] text-slate-400 mt-1`}>Trang chủ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`items-center flex-1 py-1`}
          onPress={() => onNavigate("history")}
        >
          <FileText size={22} color="#00b894" />

          <Text style={tw`text-[10px] text-[#00b894] font-bold mt-1`}>
            Lịch sử
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`items-center flex-1 py-1`}
          onPress={() => onNavigate("profile")}
        >
          <User size={22} color="#94a3b8" />

          <Text style={tw`text-[10px] text-slate-400 mt-1`}>Cá nhân</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
