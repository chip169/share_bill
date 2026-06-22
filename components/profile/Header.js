import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Copy } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';

const Header = ({ user }) => {
  const firstLetter = user?.fullName ? user.fullName.charAt(0) : 'U';

  return (
    <LinearGradient
      colors={["#0f172a", "#1e293b", "#0ea5e9"]} // Navy slate gradient to sky blue
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={tw`rounded-b-[40px] pt-14 pb-16 px-6 items-center`}
    >
      <Text style={tw`text-white/40 text-[10px] font-black tracking-widest uppercase self-start mb-1`}>
        CÁ NHÂN
      </Text>
      <Text style={tw`text-white text-2xl font-black self-start mb-6 tracking-tight`}>
        Tài khoản của tôi
      </Text>
      
      {/* Avatar Container with Glassmorphism */}
      <View style={tw`w-24 h-24 bg-white/10 border border-white/10 rounded-full items-center justify-center shadow-lg mb-3`}>
        <Text style={tw`text-white text-3xl font-black`}>{firstLetter}</Text>
      </View>
      
      <Text style={tw`text-white text-xl font-black`}>{user?.fullName}</Text>
      
      <TouchableOpacity style={tw`flex-row items-center gap-1.5 mt-2.5 bg-white/10 border border-white/10 px-3.5 py-1.5 rounded-full`}>
        <Text style={tw`text-white text-xs font-bold`}>@{user?.username}</Text>
        <Copy size={12} color="white" />
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default Header;