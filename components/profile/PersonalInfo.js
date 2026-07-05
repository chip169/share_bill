import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import tw from 'twrnc';

const InfoItem = ({ label, value, isLast }) => {
  const handleCopy = async () => {
    if (!value) return;
    await Clipboard.setStringAsync(value);
    Alert.alert("Đã sao chép", `Đã sao chép ${label.toLowerCase()}: ${value}`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handleCopy}
      style={tw`flex-row justify-between items-center py-3.5 ${!isLast ? 'border-b border-slate-100' : ''}`}
    >
      <Text style={tw`text-slate-500 text-sm`}>{label}</Text>
      <View style={tw`flex-row items-center gap-1.5`}>
        <Text style={tw`text-slate-800 font-semibold text-sm`}>{value || "Chưa thiết lập"}</Text>
        {value ? <Copy size={13} color="#94a3b8" /> : null}
      </View>
    </TouchableOpacity>
  );
};

const PersonalInfo = ({ user }) => (
  <View style={tw`px-4 -mt-10 z-10`}>
    <View style={tw`bg-white rounded-3xl p-5 shadow-sm border border-slate-100`}>
      <Text style={tw`text-slate-800 font-bold text-base mb-2`}>Thông tin cá nhân</Text>
      <InfoItem label="Số điện thoại" value={user?.phone} />
      <InfoItem label="Ngân hàng" value={user?.bankName} />
      <InfoItem label="Số tài khoản" value={user?.bankAccount} isLast />
    </View>
  </View>
);

export default PersonalInfo;