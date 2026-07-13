import React from "react";
import { View, Text } from "react-native";
import tw from "twrnc";
import MemberStatusItem from "./MemberStatusItem";

export default function MemberStatusList({ members, showSettleButton, onSettle, onRemind }) {
  const paidCount = members.filter((member) => member.paid).length;
  const unpaidCount = members.length - paidCount;

  return (
    <View
      style={tw`bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100`}
    >
      <View style={tw`flex-row justify-between items-start mb-5`}>
        <Text style={tw`text-xl font-bold text-slate-800`}>
          Trạng thái thanh toán
        </Text>

        <View style={tw`flex-col items-end`}>
          <Text style={tw`text-emerald-500 text-sm font-semibold mb-1`}>
            {paidCount} đã trả
          </Text>

          <Text style={tw`text-red-500 text-sm font-semibold`}>
            {unpaidCount} chưa trả
          </Text>
        </View>
      </View>

      {members.map((member) => (
        <MemberStatusItem 
          key={member.id} 
          member={member} 
          showSettleButton={showSettleButton}
          onSettle={onSettle}
          onRemind={onRemind}
        />
      ))}
    </View>
  );
}
