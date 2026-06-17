import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";

const CATEGORY_MAP = {
  c1: { name: "Ăn uống", icon: "🍔" },
  c2: { name: "Du lịch", icon: "✈️" },
  c3: { name: "Mua sắm", icon: "🛍️" },
  c4: { name: "Giải trí", icon: "🎉" },
};

const ExpenseCard = ({ expense, onPress }) => {
  const isCompleted = expense.status === "COMPLETED";
  const cat = CATEGORY_MAP[expense.categoryId] || { name: "Khác", icon: "📝" };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={tw`bg-white rounded-2xl px-4 py-2.5 mb-2 shadow-sm border border-slate-100 mx-4 flex-row items-center justify-between h-[62px]`}
    >
      {/* Left side: Category icon in circle */}
      <View style={tw`flex-row items-center flex-1 mr-3`}>
        <View style={tw`w-10 h-10 rounded-full bg-slate-50 border border-slate-100 items-center justify-center mr-3`}>
          <Text style={tw`text-lg`}>{cat.icon}</Text>
        </View>

        {/* Center: Title & Date */}
        <View style={tw`flex-1`}>
          <Text style={tw`text-slate-800 font-bold text-sm`} numberOfLines={1}>
            {expense.title}
          </Text>
          <Text style={tw`text-slate-400 text-[10px] mt-0.5`}>
            {expense.date} • {expense.memberCount} người
          </Text>
        </View>
      </View>

      {/* Right side: Amount & Status */}
      <View style={tw`items-end`}>
        <Text style={tw`text-slate-800 font-bold text-sm`}>
          {expense.totalAmount.toLocaleString("vi-VN")} đ
        </Text>
        <View style={tw`mt-0.5 px-2 py-0.5 rounded-full ${isCompleted ? "bg-emerald-50" : "bg-orange-50"}`}>
          <Text style={tw`text-[9px] font-bold ${isCompleted ? "text-emerald-600" : "text-orange-600"}`}>
            {isCompleted ? "Đã xong" : "Chờ thu/trả"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ExpenseCard;
