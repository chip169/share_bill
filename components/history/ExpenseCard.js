import React from 'react';
import { View, Text } from 'react-native';
import { Users } from 'lucide-react-native';
import tw from 'twrnc';

const ExpenseCard = ({ expense }) => {
  const isCompleted = expense.status === 'COMPLETED' || expense.status === 'ACTIVE'; // Tùy logic data của bạn

  return (
    <View style={tw`bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-100 mx-4`}>
      <View style={tw`flex-row justify-between items-start mb-1`}>
        <Text style={tw`text-slate-800 font-bold text-base flex-1 mr-2`}>{expense.title}</Text>
        <View style={tw`px-2.5 py-1 rounded-full ${isCompleted ? 'bg-emerald-50' : 'bg-orange-50'}`}>
          <Text style={tw`text-xs font-semibold ${isCompleted ? 'text-emerald-500' : 'text-orange-500'}`}>
            {isCompleted ? 'Hoàn thành' : 'Một phần'}
          </Text>
        </View>
      </View>
      <Text style={tw`text-slate-400 text-xs mb-3`}>{expense.date}</Text>
      <View style={tw`border-b border-slate-100 mb-3`} />
      <View style={tw`flex-row justify-between mb-3`}>
        <View>
          <Text style={tw`text-slate-400 text-xs mb-1`}>Tổng hóa đơn</Text>
          <Text style={tw`text-slate-800 font-bold text-sm`}>{expense.totalAmount.toLocaleString('vi-VN')} đ</Text>
        </View>
        <View style={tw`items-end`}>
          <Text style={tw`text-slate-400 text-xs mb-1`}>Bạn đã trả</Text>
          <Text style={tw`text-emerald-500 font-bold text-sm`}>{expense.paidAmount.toLocaleString('vi-VN')} đ</Text>
        </View>
      </View>
      <View style={tw`flex-row items-center gap-1.5`}>
        <Users size={14} color="#64748b" />
        <Text style={tw`text-slate-500 text-xs`}>{expense.memberCount} người</Text>
      </View>
    </View>
  );
};

export default ExpenseCard;