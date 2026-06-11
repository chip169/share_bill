import React from "react";

import { View, Text } from "react-native";

import tw from "twrnc";

export default function BillItemsCard({ bill }) {
  return (
    <View
      style={tw`bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100`}
    >
      <Text style={tw`text-2xl font-bold text-slate-800 mb-5`}>
        Chi tiết món
      </Text>

      {bill.items.map((item) => (
        <View
          key={item.id}
          style={tw`flex-row justify-between items-center mb-4`}
        >
          <Text style={tw`text-slate-700 text-base`}>{item.name}</Text>

          <Text style={tw`text-slate-800 font-semibold text-base`}>
            {item.price.toLocaleString("vi-VN")} đ
          </Text>
        </View>
      ))}

      <View
        style={tw`border-t border-slate-200 mt-3 pt-4 flex-row justify-between items-center`}
      >
        <Text style={tw`text-lg font-bold text-slate-800`}>Tổng cộng</Text>

        <Text style={tw`text-emerald-500 text-xl font-bold`}>
          {bill.total.toLocaleString("vi-VN")} đ
        </Text>
      </View>
    </View>
  );
}
