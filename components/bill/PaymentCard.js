import React from "react";
import { View } from "react-native";
import { Card, Text } from "react-native-paper";
import tw from "twrnc";

export default function PaymentCard({ amount = 0, members, isOwner }) {
  return (
    <Card style={tw`rounded-3xl mb-5 mt-8 ${isOwner ? "bg-emerald-600" : "bg-sky-600"} overflow-hidden shadow-md`}>
      <Card.Content style={tw`py-6`}>
        <View style={tw`items-center`}>
          <Text style={tw`text-white text-xs font-bold uppercase tracking-wider`}>
            {isOwner ? "Tổng số tiền cần thu hồi" : "Số tiền bạn cần thanh toán"}
          </Text>

          <Text
            style={tw`text-white text-3xl font-black mt-3`}
          >
            {amount.toLocaleString("vi-VN")} đ
          </Text>

          <Text style={tw`text-white/80 text-xs mt-2.5 font-semibold`}>
            {isOwner 
              ? `Hóa đơn gồm ${members} thành viên` 
              : amount === 0 
                ? "Bạn đã hoàn thành thanh toán! 🎉" 
                : "Vui lòng chuyển khoản cho trưởng nhóm"
            }
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}