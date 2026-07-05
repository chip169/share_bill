import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text, Avatar } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import tw from "twrnc";

export default function HomeHeader({ user, totalToPay = 0, totalToCollect = 0, collectCount = 0, payCount = 0, activeTab, setActiveTab }) {
  const formatAmount = (amt) => {
    if (!amt) return "0 đ";
    if (amt >= 1000000) {
      return `${(amt / 1000000).toFixed(1).replace('.0', '')}M đ`;
    }
    return `${amt.toLocaleString('vi-VN')} đ`;
  };

  return (
    <LinearGradient
      colors={["#0369a1", "#0ea5e9"]} // Unified premium Sky Blue gradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={tw`rounded-b-[40px] pb-6 pt-6`}
    >
      <View style={tw`mt-8 px-6`}>
        <Text style={tw`text-white/40 text-[10px] font-black tracking-widest uppercase`}>
          CHÀO MỪNG QUAY TRỞ LẠI
        </Text>
        <Text style={tw`text-white text-2xl font-black mt-1 tracking-tight`}>
          Xin chào, {user?.fullName || "Bạn"}
        </Text>
        <Text style={tw`text-sky-300/80 text-xs font-semibold mt-1`}>
          Mã tài khoản: @{user?.username}
        </Text>
      </View>

      {/* Financial Summary Cards (Glassmorphism) */}
      <View style={tw`flex-row px-6 mt-6`}>
        {/* To Collect (Cần thu) */}
        <TouchableOpacity
          onPress={() => setActiveTab(activeTab === "NEED_TO_COLLECT" ? "ALL" : "NEED_TO_COLLECT")}
          style={[
            tw`flex-1 rounded-3xl p-5 mr-3 border`,
            activeTab === "NEED_TO_COLLECT" 
              ? tw`bg-emerald-500/25 border-emerald-400 shadow-lg shadow-emerald-500/20` 
              : tw`bg-white/10 border-white/10`
          ]}
        >
          <View style={tw`flex-row items-center justify-between`}>
            <View style={tw`flex-row items-center gap-1.5`}>
              <View style={tw`w-2 h-2 rounded-full bg-emerald-400`} />
              <Text style={tw`text-white/70 text-xs font-bold`}>Cần thu</Text>
            </View>
            {collectCount > 0 && (
              <View style={tw`bg-emerald-500 px-1.5 py-0.5 rounded-full`}>
                <Text style={tw`text-white text-[8px] font-black`}>{collectCount}</Text>
              </View>
            )}
          </View>
          <Text style={tw`text-white text-2xl font-black mt-4`} numberOfLines={1}>
            {formatAmount(totalToCollect)}
          </Text>
        </TouchableOpacity>

        {/* To Pay (Cần trả) */}
        <TouchableOpacity
          onPress={() => setActiveTab(activeTab === "NEED_TO_PAY" ? "ALL" : "NEED_TO_PAY")}
          style={[
            tw`flex-1 rounded-3xl p-5 border`,
            activeTab === "NEED_TO_PAY" 
              ? tw`bg-rose-500/25 border-rose-400 shadow-lg shadow-rose-500/20` 
              : tw`bg-white/10 border-white/10`
          ]}
        >
          <View style={tw`flex-row items-center justify-between`}>
            <View style={tw`flex-row items-center gap-1.5`}>
              <View style={tw`w-2 h-2 rounded-full bg-rose-400`} />
              <Text style={tw`text-white/70 text-xs font-bold`}>Cần trả</Text>
            </View>
            {payCount > 0 && (
              <View style={tw`bg-rose-500 px-1.5 py-0.5 rounded-full`}>
                <Text style={tw`text-white text-[8px] font-black`}>{payCount}</Text>
              </View>
            )}
          </View>
          <Text style={tw`text-white text-2xl font-black mt-4`} numberOfLines={1}>
            {formatAmount(totalToPay)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs Filter */}
      <View style={tw`bg-white/10 mx-6 mt-6 rounded-2xl flex-row p-1 border border-white/5`}>
        {["ALL", "CREATED", "JOINED"].map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[
                tw`flex-1 py-2.5 rounded-xl`,
                isSelected ? tw`bg-white shadow-sm` : null
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={tw`text-center font-bold text-xs ${
                  isSelected ? "text-slate-900" : "text-white/80"
                }`}
              >
                {tab === "ALL"
                  ? "Tất cả"
                  : tab === "CREATED"
                    ? "Đã tạo"
                    : "Đã tham gia"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </LinearGradient>
  );
}
