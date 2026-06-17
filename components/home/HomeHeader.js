import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text, Avatar } from "react-native-paper";
import tw from "twrnc";

export default function HomeHeader({ user, totalToPay = 0, totalToCollect = 0, activeTab, setActiveTab }) {
  const formatAmount = (amt) => {
    if (!amt) return "0 đ";
    if (amt >= 1000000) {
      return `${(amt / 1000000).toFixed(1).replace('.0', '')}M đ`;
    }
    return `${amt.toLocaleString('vi-VN')} đ`;
  };

  return (
    <View style={tw`bg-sky-500 rounded-b-[40px] pb-6 pt-6`}>
      <View style={tw`flex-row mt-8 justify-between items-center px-6`}>
        <View>
          <Text style={tw`text-white text-3xl font-bold`}>
            Xin chào, {user.fullName}! 👋
          </Text>

          <Text style={tw`text-white/80 text-sm mt-1`}>
            ID: {user.username}
          </Text>
        </View>

        <Avatar.Text size={56} label={user.fullName[0]} style={tw`bg-white`} labelStyle={tw`text-sky-500 font-bold`} />
      </View>

      {/* Financial Summary Cards */}
      <View style={tw`flex-row px-6 mt-6`}>
        {/* To Collect (Được nhận) */}
        <TouchableOpacity
          onPress={() => setActiveTab(activeTab === "NEED_TO_COLLECT" ? "ALL" : "NEED_TO_COLLECT")}
          style={tw`flex-1 rounded-3xl p-5 mr-3 border ${
            activeTab === "NEED_TO_COLLECT" 
              ? "bg-white/35 border-emerald-400" 
              : "bg-white/15 border-emerald-400/30"
          }`}
        >
          <View style={tw`flex-row items-center gap-1.5`}>
            <View style={tw`w-2 h-2 rounded-full bg-emerald-400`} />
            <Text style={tw`text-white/80 text-xs font-semibold`}>Cần thu</Text>
          </View>
          <Text style={tw`text-white text-2xl font-black mt-4`}>
            {formatAmount(totalToCollect)}
          </Text>
        </TouchableOpacity>

        {/* To Pay (Cần trả) */}
        <TouchableOpacity
          onPress={() => setActiveTab(activeTab === "NEED_TO_PAY" ? "ALL" : "NEED_TO_PAY")}
          style={tw`flex-1 rounded-3xl p-5 border ${
            activeTab === "NEED_TO_PAY" 
              ? "bg-white/35 border-rose-400" 
              : "bg-white/15 border-rose-400/30"
          }`}
        >
          <View style={tw`flex-row items-center gap-1.5`}>
            <View style={tw`w-2 h-2 rounded-full bg-rose-400`} />
            <Text style={tw`text-white/80 text-xs font-semibold`}>Cần trả</Text>
          </View>
          <Text style={tw`text-white text-2xl font-black mt-4`}>
            {formatAmount(totalToPay)}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={tw`bg-white mx-6 mt-6 rounded-2xl flex-row p-1`}>
        {["ALL", "CREATED", "JOINED"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={tw`flex-1 py-3 rounded-2xl ${
              activeTab === tab ? "bg-blue-600" : ""
            }`}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={tw`text-center font-bold ${
                activeTab === tab ? "text-white" : "text-slate-700"
              }`}
            >
              {tab === "ALL"
                ? "Tất cả"
                : tab === "CREATED"
                  ? "Đã tạo"
                  : "Đã tham gia"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
