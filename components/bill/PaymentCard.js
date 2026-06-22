import React from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import tw from "twrnc";

export default function PaymentCard({ amount = 0, members, isOwner }) {
  return (
    <LinearGradient
      colors={isOwner ? ["#059669", "#10b981"] : ["#0284c7", "#0ea5e9"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={tw`rounded-3xl mb-5 mt-8 overflow-hidden shadow-lg py-6 px-5`}
    >
      <View style={tw`items-center`}>
        <Text style={tw`text-white/80 text-[10px] font-black uppercase tracking-widest`}>
          {isOwner ? "Tổng số tiền cần thu hồi" : "Số tiền bạn cần thanh toán"}
        </Text>

        <Text
          style={tw`text-white text-3xl font-black mt-3.5 tracking-tight`}
        >
          {amount.toLocaleString("vi-VN")} đ
        </Text>

        <Text style={tw`text-white/80 text-xs mt-3 font-semibold`}>
          {isOwner 
            ? `Hóa đơn gồm ${members} thành viên` 
            : amount === 0 
              ? "Bạn đã hoàn thành thanh toán! 🎉" 
              : "Vui lòng chuyển khoản cho trưởng nhóm"
          }
        </Text>
      </View>
    </LinearGradient>
  );
}