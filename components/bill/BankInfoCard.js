import React from "react";

import { View, Text } from "react-native";

import tw from "twrnc";

export default function BankInfoCard({ bank }) {
  return (
    <View
      style={tw`bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100`}
    >
      <Text style={tw`text-xl font-bold text-slate-800 mb-5`}>
        Thông tin chuyển khoản
      </Text>

      <View style={tw`mb-3`}>
        <Text style={tw`text-slate-400 text-xs mb-1`}>Ngân hàng</Text>

        <Text style={tw`text-slate-800 font-semibold text-base`}>
          {bank.bankName}
        </Text>
      </View>

      <View style={tw`mb-3`}>
        <Text style={tw`text-slate-400 text-xs mb-1`}>Số tài khoản</Text>

        <Text style={tw`text-slate-800 font-semibold text-base`}>
          {bank.accountNumber}
        </Text>
      </View>

      <View style={tw`mb-3`}>
        <Text style={tw`text-slate-400 text-xs mb-1`}>Chủ tài khoản</Text>

        <Text style={tw`text-slate-800 font-semibold text-base`}>
          {bank.owner}
        </Text>
      </View>

      <View>
        <Text style={tw`text-slate-400 text-xs mb-1`}>
          Nội dung chuyển khoản
        </Text>

        <Text style={tw`text-emerald-500 font-bold text-base`}>
          {bank.transferContent}
        </Text>
      </View>
    </View>
  );
}
