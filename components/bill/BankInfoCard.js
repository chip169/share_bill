import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Copy } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import tw from "twrnc";

export default function BankInfoCard({ bank }) {
  const handleCopy = async (label, value) => {
    if (!value) return;
    await Clipboard.setStringAsync(value);
    Alert.alert("Đã sao chép", `Đã sao chép ${label.toLowerCase()}: ${value}`);
  };

  return (
    <View
      style={tw`bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100`}
    >
      <Text style={tw`text-base font-black text-slate-800 mb-5`}>
        Thông tin chuyển khoản 💳
      </Text>

      <View style={tw`mb-4`}>
        <Text style={tw`text-slate-400 text-xs mb-1.5 font-semibold`}>Ngân hàng thụ hưởng</Text>
        <View style={tw`bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5`}>
          <Text style={tw`text-slate-800 font-bold text-sm`}>
            {bank.bankName}
          </Text>
        </View>
      </View>

      <View style={tw`mb-4`}>
        <Text style={tw`text-slate-400 text-xs mb-1.5 font-semibold`}>Số tài khoản</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleCopy("Số tài khoản", bank.accountNumber)}
          style={tw`flex-row items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5`}
        >
          <Text style={tw`text-slate-800 font-bold text-sm`}>
            {bank.accountNumber}
          </Text>
          <Copy size={15} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <View style={tw`mb-4`}>
        <Text style={tw`text-slate-400 text-xs mb-1.5 font-semibold`}>Chủ tài khoản</Text>
        <View style={tw`bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5`}>
          <Text style={tw`text-slate-800 font-bold text-sm`}>
            {bank.owner}
          </Text>
        </View>
      </View>

      <View>
        <Text style={tw`text-slate-400 text-xs mb-1.5 font-semibold`}>
          Nội dung chuyển khoản
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleCopy("Nội dung chuyển khoản", bank.transferContent)}
          style={tw`flex-row items-center justify-between bg-emerald-50/50 border border-emerald-100 rounded-2xl px-4 py-3.5`}
        >
          <Text style={tw`text-emerald-600 font-bold text-sm`}>
            {bank.transferContent}
          </Text>
          <Copy size={15} color="#10b981" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
