import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Copy } from 'lucide-react-native';
import tw from 'twrnc';

const Header = ({ user }) => {
  const firstLetter = user?.fullName ? user.fullName.charAt(0) : 'U';

  return (
    <View style={tw`bg-[#0984e3] pt-14 pb-20 px-6 rounded-b-[32px] items-center`}>
      <Text style={tw`text-white text-2xl font-bold align-self-start mb-5`}>Tài khoản</Text>
      <View style={tw`w-24 h-24 bg-white rounded-full items-center justify-center shadow-lg border-2 border-white/50 mb-3`}>
        <Text style={tw`text-[#00b894] text-3xl font-bold`}>{firstLetter}</Text>
      </View>
      <Text style={tw`text-white text-xl font-bold`}>{user?.fullName}</Text>
      <TouchableOpacity style={tw`flex-row items-center gap-1.5 mt-2 bg-black/15 px-3 py-1 rounded-full`}>
        <Text style={tw`text-white text-xs`}>{user?.id}</Text>
        <Copy size={12} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default Header;