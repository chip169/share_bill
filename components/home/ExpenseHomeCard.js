import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { Users } from "lucide-react-native";
import tw from "twrnc";

export default function ExpenseHomeCard({ expense, onPress }) {
  const isPartial = expense.status === "PARTIAL";

  return (
    <TouchableOpacity
      style={tw`bg-white rounded-3xl p-5 mx-4 mb-5 shadow-sm`}
      onPress={onPress}
    >
      <View style={tw`flex-row justify-between items-start`}>
        <View style={tw`flex-1 pr-3`}>
          <Text style={tw`text-2xl font-bold text-slate-800`}>
            {expense.title}
          </Text>

          <Text style={tw`text-slate-500 mt-2`}>{expense.date}</Text>
        </View>

        <View
          style={tw`px-2 py-1 rounded-full self-start ${
            isPartial ? "bg-orange-100" : "bg-red-100"
          }`}
        >
          <Text
            numberOfLines={1}
            style={tw`${isPartial ? "text-orange-500" : "text-red-500"} text-xs`}
          >
            {isPartial ? "Một phần" : "Chưa thanh toán"}
          </Text>
        </View>
      </View>

      <View style={tw`border-b border-slate-200 my-5`} />

      <View style={tw`flex-row justify-between`}>
        <View>
          <Text style={tw`text-slate-400`}>Tổng hóa đơn</Text>

          <Text style={tw`text-2xl font-bold mt-2`}>
            {expense.totalAmount.toLocaleString("vi-VN")} đ
          </Text>
        </View>

        <View style={tw`items-end`}>
          <Text style={tw`text-slate-400`}>Bạn phải trả</Text>

          <Text style={tw`text-emerald-500 text-2xl font-bold mt-2`}>
            {expense.paidAmount.toLocaleString("vi-VN")} đ
          </Text>
        </View>
      </View>

      <View style={tw`border-b border-slate-200 my-5`} />

      <View style={tw`flex-row items-center`}>
        <Users size={16} color="#64748b" />

        <Text style={tw`ml-2 text-slate-500`}>{expense.memberCount} người</Text>
      </View>
    </TouchableOpacity>
  );
}
