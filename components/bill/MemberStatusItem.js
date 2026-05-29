import React from "react";

import { View, Text } from "react-native";

import { CheckCircle, XCircle } from "lucide-react-native";

import tw from "twrnc";

export default function MemberStatusItem({ member }) {
  return (
    <View
      style={tw`flex-row items-center justify-between p-4 rounded-2xl mb-3 ${
        member.paid
          ? "bg-emerald-50 border border-emerald-100"
          : "bg-red-50 border border-red-100"
      }`}
    >
      <View style={tw`flex-row items-center`}>
        <View
          style={tw`w-13 h-13 rounded-full bg-sky-500 items-center justify-center mr-4`}
        >
          <Text style={tw`text-white text-lg font-bold`}>{member.name[0]}</Text>
        </View>

        <View>
          <Text style={tw`text-slate-800 text-base font-bold`}>
            {member.name}
          </Text>

          <Text style={tw`text-slate-400 text-sm mt-1`}>{member.code}</Text>
        </View>
      </View>

      {member.paid ? (
        <CheckCircle size={28} color="#16a34a" />
      ) : (
        <XCircle size={28} color="#dc2626" />
      )}
    </View>
  );
}
