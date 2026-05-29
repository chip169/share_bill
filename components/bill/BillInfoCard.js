import React from "react";

import { View, Text } from "react-native";

import tw from "twrnc";

export default function BillInfoCard({ bill }) {
  return (
    <View
      style={tw`bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100`}
    >
      <Text style={tw`text-2xl font-bold text-slate-800 mb-5`}>
        {bill.title}
      </Text>

      <InfoRow label="Ngày tạo" value={bill.createdAt} />

      <InfoRow label="Người tạo" value={bill.creator} />

      <InfoRow label="Số thành viên" value={`${bill.members} người`} />
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={tw`flex-row justify-between items-center mb-4`}>
      <Text style={tw`text-slate-400 text-sm`}>{label}</Text>

      <Text style={tw`text-slate-800 font-semibold text-base`}>{value}</Text>
    </View>
  );
}
