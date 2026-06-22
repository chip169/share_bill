import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import tw from 'twrnc';

const MenuItem = ({ icon: Icon, label, isLast, onPress, showBadge }) => (
  <TouchableOpacity 
    onPress={onPress}
    style={tw`flex-row items-center justify-between p-4 ${!isLast ? 'border-b border-slate-50' : ''}`}
  >
    <View style={tw`flex-row items-center gap-4`}>
      <Icon size={20} color="#64748b" />
      <Text style={tw`font-medium text-sm text-slate-700`}>{label}</Text>
      {showBadge && (
        <View style={tw`w-2.5 h-2.5 rounded-full bg-red-500`} />
      )}
    </View>
    <ChevronRight size={16} color="#cbd5e1" />
  </TouchableOpacity>
);

export default MenuItem;