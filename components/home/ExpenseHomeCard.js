import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { Users } from "lucide-react-native";
import tw from "twrnc";

export default function ExpenseHomeCard({ expense, onPress }) {
  const isCompleted = expense.status === "COMPLETED";
  const isPartial = expense.status === "PARTIAL";

  let statusLabel = "Chưa thanh toán";
  let bgClass = "bg-red-50 border border-red-100";
  let textClass = "text-red-500";

  if (isCompleted) {
    statusLabel = "Đã trả xong";
    bgClass = "bg-emerald-50 border border-emerald-100";
    textClass = "text-emerald-500";
  } else if (isPartial) {
    statusLabel = "Một phần";
    bgClass = "bg-orange-50 border border-orange-100";
    textClass = "text-orange-500";
  }

  return (
    <TouchableOpacity
      style={tw`bg-white rounded-3xl p-5 mx-4 mb-5 shadow-sm border border-slate-100`}
      onPress={onPress}
    >
      <View style={tw`flex-row justify-between items-start`}>
        <View style={tw`flex-1 pr-3`}>
          <Text style={tw`text-xl font-bold text-slate-800`}>
            {expense.title}
          </Text>

          <Text style={tw`text-slate-400 mt-1.5 text-xs`}>{expense.date}</Text>
        </View>

        <View style={tw`px-2.5 py-1 rounded-full self-start ${bgClass}`}>
          <Text
            numberOfLines={1}
            style={tw`${textClass} text-xs font-bold`}
          >
            {statusLabel}
          </Text>
        </View>
      </View>

      <View style={tw`border-b border-slate-100 my-4`} />

      <View style={tw`flex-row justify-between`}>
        <View>
          <Text style={tw`text-slate-400 text-xs`}>Tổng hóa đơn</Text>

          <Text style={tw`text-base font-bold text-slate-700 mt-1`}>
            {expense.totalAmount.toLocaleString("vi-VN")} đ
          </Text>
        </View>

        <View style={tw`items-end`}>
          <Text style={tw`text-slate-400 text-xs`}>Bạn gánh</Text>

          <Text style={tw`text-emerald-500 text-base font-bold mt-1`}>
            {expense.paidAmount.toLocaleString("vi-VN")} đ
          </Text>
        </View>
      </View>

      <View style={tw`border-b border-slate-100 my-4`} />

      <View style={tw`flex-row items-center`}>
        <Users size={14} color="#64748b" />

        <Text style={tw`ml-2 text-slate-500 text-xs`}>{expense.memberCount} người</Text>
      </View>
    </TouchableOpacity>
  );
}
