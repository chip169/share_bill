import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text, Avatar } from "react-native-paper";
import tw from "twrnc";

export default function HomeHeader({ user, totalSpend, totalInvoices, activeTab, setActiveTab, }) {
  return (
    <View style={tw`bg-sky-500 rounded-b-[40px] pb-6 pt-6`}>
      <View style={tw`flex-row mt-8 justify-between items-center px-6`}>
        <View>
          <Text style={tw`text-white text-3xl font-bold`}>
            Xin chào, {user.fullName}!
          </Text>

          <Text style={tw`text-white text-base mt-1`}>
            Mã người dùng: {user.id}
          </Text>
        </View>


      </View>

      <View style={tw`flex-row px-6 mt-6`}>
        <View
          style={tw`flex-1 bg-white/10 rounded-3xl p-5 mr-3 border border-white/20`}
        >
          <Text style={tw`text-white`}>Tổng phải trả</Text>

          <Text style={tw`text-white text-3xl font-bold mt-6`}>
            {(totalSpend / 1000000).toFixed(1)}M đ
          </Text>
        </View>

        <View
          style={tw`flex-1 bg-white/10 rounded-3xl p-5 border border-white/20`}
        >
          <Text style={tw`text-white`}>Số hóa đơn</Text>

          <Text style={tw`text-white text-3xl font-bold mt-6`}>
            {totalInvoices}
          </Text>
        </View>
      </View>

      <View style={tw`bg-white mx-6 mt-6 rounded-2xl flex-row p-1`}>
        {["ALL", "CREATED", "JOINED"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={tw`flex-1 py-3 rounded-2xl ${activeTab === tab ? "bg-blue-600" : ""
              }`}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={tw`text-center font-bold ${activeTab === tab ? "text-white" : "text-slate-700"
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
