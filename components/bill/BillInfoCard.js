import React from "react";
import { View, Text } from "react-native";
import tw from "twrnc";

const CATEGORY_MAP = {
  c1: { name: "Ăn uống", icon: "🍔" },
  c2: { name: "Du lịch", icon: "✈️" },
  c3: { name: "Mua sắm", icon: "🛍️" },
  c4: { name: "Giải trí", icon: "🎉" },
};

export default function BillInfoCard({ bill }) {
  const cat = CATEGORY_MAP[bill.categoryId] || { name: "Khác", icon: "📝" };

  return (
    <View
      style={tw`bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100`}
    >
      <View style={tw`flex-row items-center mb-5 border-b border-slate-50 pb-3`}>
        <View style={tw`w-12 h-12 rounded-2xl bg-sky-50 items-center justify-center mr-3 border border-sky-100`}>
          <Text style={tw`text-2xl`}>{cat.icon}</Text>
        </View>
        <View style={tw`flex-1`}>
          <Text style={tw`text-[10px] font-black text-sky-500 uppercase tracking-wider`}>{cat.name}</Text>
          <Text style={tw`text-lg font-bold text-slate-800`}>
            {bill.title}
          </Text>
        </View>
      </View>

      <InfoRow label="Mã hóa đơn" value={bill.billCode} />

      <InfoRow label="Ngày tạo" value={bill.createdAt} />

      <InfoRow label="Người tạo" value={bill.creator} />

      <InfoRow label="Số thành viên" value={`${bill.members} người`} />
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={tw`flex-row justify-between items-center mb-3`}>
      <Text style={tw`text-slate-400 text-xs font-medium`}>{label}</Text>

      <Text style={tw`text-slate-800 font-semibold text-sm`}>{value}</Text>
    </View>
  );
}
