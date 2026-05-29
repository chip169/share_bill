import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';

const InfoItem = ({ label, value, isLast }) => (
  <View style={tw`flex-row justify-between items-center py-3.5 ${!isLast ? 'border-b border-slate-100' : ''}`}>
    <Text style={tw`text-slate-500 text-sm`}>{label}</Text>
    <Text style={tw`text-slate-800 font-medium text-sm`}>{value}</Text>
  </View>
);

const PersonalInfo = ({ user }) => (
  <View style={tw`px-4 -mt-10 z-10`}>
    <View style={tw`bg-white rounded-2xl p-5 shadow-sm border border-slate-100`}>
      <Text style={tw`text-slate-800 font-bold text-base mb-2`}>Thông tin cá nhân</Text>
      <InfoItem label="Số điện thoại" value={user?.phone} />
      <InfoItem label="Ngân hàng" value={user?.bankName} />
      <InfoItem label="Số tài khoản" value={user?.bankAccount} isLast />
    </View>
  </View>
);

export default PersonalInfo;