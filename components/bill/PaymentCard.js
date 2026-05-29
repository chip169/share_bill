import React from "react";

import { View } from "react-native";

import { Card, Text } from "react-native-paper";

import tw from "twrnc";

export default function PaymentCard({ amount, members }) {
  return (
    <Card style={tw`rounded-3xl mb-5 mt-8 bg-sky-600 overflow-hidden`}>
      <Card.Content style={tw`py-6`}>
        <View style={tw`items-center`}>
          <Text style={tw`text-white text-base`}>
            Mỗi người phải trả
          </Text>

          <Text
            style={tw`text-white text-4xl font-bold mt-3`}
          >
            {amount.toLocaleString("vi-VN")} đ
          </Text>

          <Text style={tw`text-white/80 text-sm mt-2`}>
            Chia đều cho {members} người
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}