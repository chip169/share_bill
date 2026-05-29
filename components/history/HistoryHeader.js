import React from 'react';
import { View, Text } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import tw from 'twrnc';

const HistoryHeader = ({ totalSpend, totalInvoices }) => {
  const formatShortAmount = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1).replace('.0', '')}M đ`;
    }
    return `${amount.toLocaleString('vi-VN')} đ`;
  };

  return (
    <View style={tw`bg-[#0984e3] pt-12 pb-20 px-4 rounded-b-[32px]`}>
      <Text style={tw`text-white text-2xl font-bold mb-5`}>Lịch sử giao dịch</Text>
      <View style={tw`flex-row gap-3`}>
        <View style={tw`flex-1 bg-white/15 border border-white/10 rounded-2xl p-4`}>
          <View style={tw`flex-row items-center gap-1.5 mb-2`}>
            <TrendingUp size={14} color="white" />
            <Text style={tw`text-white/80 text-xs font-medium`}>Tổng chi tiêu</Text>
          </View>
          <Text style={tw`text-white text-xl font-bold`}>{formatShortAmount(totalSpend)}</Text>
        </View>
        <View style={tw`flex-1 bg-white/15 border border-white/10 rounded-2xl p-4`}>
          <Text style={tw`text-white/80 text-xs font-medium mb-2`}>Số hóa đơn</Text>
          <Text style={tw`text-white text-xl font-bold`}>{totalInvoices}</Text>
        </View>
      </View>
    </View>
  );
};

export default HistoryHeader;