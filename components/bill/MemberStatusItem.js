import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CheckCircle, XCircle } from "lucide-react-native";
import tw from "twrnc";

export default function MemberStatusItem({ member, showSettleButton, onSettle, onRemind }) {
  return (
    <View
      style={tw`flex-col p-4 rounded-2xl mb-3 ${
        member.paid
          ? "bg-emerald-50 border border-emerald-100"
          : "bg-red-50 border border-red-100"
      }`}
    >
      {/* Top Part: User Info & Status badge */}
      <View style={tw`flex-row items-center justify-between`}>
        <View style={tw`flex-row items-center flex-1 mr-2`}>
          <View
            style={tw`w-12 h-12 rounded-full bg-sky-500 items-center justify-center mr-3`}
          >
            <Text style={tw`text-white text-base font-bold`}>
              {member.name ? member.name[0] : "?"}
            </Text>
          </View>

          <View style={tw`flex-1`}>
            <Text style={tw`text-slate-800 text-sm font-bold`} numberOfLines={1}>
              {member.name}
            </Text>

            <Text style={tw`text-slate-400 text-xs mt-0.5`}>
              ID: {member.code}
            </Text>

            {!!member.owedAmount && (
              <Text style={tw`text-slate-500 text-xs font-semibold mt-1`}>
                Cần trả: {member.owedAmount.toLocaleString("vi-VN")} đ
              </Text>
            )}
          </View>
        </View>

        {member.paid ? (
          <View style={tw`flex-row items-center gap-1`}>
            <Text style={tw`text-emerald-600 text-xs font-bold mr-1`}>Đã trả</Text>
            <CheckCircle size={24} color="#16a34a" />
          </View>
        ) : (!showSettleButton || !onSettle) ? (
          <View style={tw`flex-row items-center gap-1`}>
            <Text style={tw`text-red-500 text-xs font-bold mr-1`}>Chưa trả</Text>
            <XCircle size={24} color="#dc2626" />
          </View>
        ) : null}
      </View>

      {/* Bottom Part: Action buttons for owner when unpaid */}
      {!member.paid && showSettleButton && onSettle && (
        <View style={tw`flex-row gap-2 mt-3 pt-3 border-t border-red-200/40 justify-end`}>
          {onRemind && (
            <TouchableOpacity
              onPress={() => onRemind(member)}
              style={tw`border border-orange-400 bg-orange-50 px-3.5 py-2.5 rounded-xl shadow-sm flex-1 items-center`}
            >
              <Text style={tw`text-orange-600 text-xs font-bold`}>Nhắc nợ</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => onSettle(member)}
            style={tw`bg-emerald-500 px-3.5 py-2.5 rounded-xl shadow-sm flex-1 items-center`}
          >
            <Text style={tw`text-white text-xs font-bold`}>Xác nhận đã trả</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
