import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";

const CATEGORY_MAP = {
  c1: { name: "Ăn uống", icon: "🍔" },
  c2: { name: "Du lịch", icon: "✈️" },
  c3: { name: "Mua sắm", icon: "🛍️" },
  c4: { name: "Giải trí", icon: "🎉" },
};

const ExpenseCard = ({ expense, currentUserId, onPress }) => {
  const isCompleted = expense.status === "COMPLETED";
  const isCreator = expense.createdBy === currentUserId;
  const cat = CATEGORY_MAP[expense.categoryId] || { name: "Khác", icon: "📝" };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={tw`bg-white rounded-3xl px-4 py-3 mb-3 shadow-sm border border-slate-100 mx-4 flex-row items-center justify-between`}
    >
      {/* Left side: Category icon in circle */}
      <View style={tw`flex-row items-center flex-1 mr-3`}>
        <View style={tw`w-12 h-12 rounded-full bg-slate-50 border border-slate-100 items-center justify-center mr-3`}>
          <Text style={tw`text-xl`}>{cat.icon}</Text>
        </View>

        {/* Center: Title, Role Badge, Date & Members */}
        <View style={tw`flex-1`}>
          <View style={tw`flex-row items-center flex-wrap gap-1.5`}>
            <Text style={tw`text-slate-800 font-bold text-sm`} numberOfLines={1}>
              {expense.title}
            </Text>
            {/* Role Badge */}
            <View
              style={[
                tw`flex-row items-center px-1.5 py-0.5 rounded-md border`,
                isCreator
                  ? tw`bg-sky-50 border-sky-100/50`
                  : tw`bg-slate-50 border-slate-200/50`
              ]}
            >
              <Text style={[tw`text-[8px] font-bold`, isCreator ? tw`text-sky-600` : tw`text-slate-500`]}>
                {isCreator ? "👑 Chủ chi" : "👥 Tham gia"}
              </Text>
            </View>
          </View>
          <Text style={tw`text-slate-400 text-[10px] mt-1`}>
            {expense.date} • {expense.memberCount} người
          </Text>
        </View>
      </View>

      {/* Right side: Amount & Status Badge */}
      <View style={tw`items-end`}>
        <Text style={tw`text-slate-800 font-extrabold text-sm`}>
          {expense.totalAmount.toLocaleString("vi-VN")} đ
        </Text>
        <View
          style={[
            tw`mt-1.5 px-2 py-0.5 rounded-full border`,
            isCompleted
              ? tw`bg-emerald-50 border-emerald-100/50`
              : isCreator
                ? tw`bg-amber-50 border-amber-100/50`
                : tw`bg-rose-50 border-rose-100/50`
          ]}
        >
          <Text
            style={[
              tw`text-[9px] font-extrabold`,
              isCompleted
                ? tw`text-emerald-600`
                : isCreator
                  ? tw`text-amber-600`
                  : tw`text-rose-600`
            ]}
          >
            {isCompleted ? "Đã xong" : isCreator ? "Chờ thu" : "Chờ trả"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ExpenseCard;
