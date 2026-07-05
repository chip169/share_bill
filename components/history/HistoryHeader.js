import React from 'react';
import { View, Text } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';

const HistoryHeader = ({ totalSpend, totalInvoices }) => {
  const formatShortAmount = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1).replace('.0', '')}M đ`;
    }
    return `${amount.toLocaleString('vi-VN')} đ`;
  };

  return (
    <LinearGradient
      colors={["#0369a1", "#0ea5e9"]} // Unified premium Sky Blue gradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={tw`rounded-b-[40px] pt-14 pb-12 px-6`}
    >
      <Text style={tw`text-white/40 text-[10px] font-black tracking-widest uppercase`}>
        DANH SÁCH CHI TIÊU
      </Text>
      <Text style={tw`text-white text-2xl font-black mt-1 tracking-tight mb-5`}>
        Lịch sử giao dịch
      </Text>
      <View style={tw`flex-row gap-3`}>
        <View style={tw`flex-1 bg-white/10 border border-white/10 rounded-3xl p-4`}>
          <View style={tw`flex-row items-center gap-1.5 mb-2`}>
            <TrendingUp size={14} color="#34d399" />
            <Text style={tw`text-white/70 text-xs font-bold`}>Tổng chi tiêu</Text>
          </View>
          <Text style={tw`text-white text-xl font-black`}>{formatShortAmount(totalSpend)}</Text>
        </View>
        <View style={tw`flex-1 bg-white/10 border border-white/10 rounded-3xl p-4`}>
          <Text style={tw`text-white/70 text-xs font-bold mb-2`}>Số hóa đơn</Text>
          <Text style={tw`text-white text-xl font-black`}>{totalInvoices}</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

export default HistoryHeader;