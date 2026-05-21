import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { CreditCard, QrCode, Bell, Settings, HelpCircle, LogOut, Home, FileText, User } from 'lucide-react-native';
import tw from 'twrnc';

import Header from '../components/profile/Header';
import PersonalInfo from '../components/profile/PersonalInfo';
import MenuItem from '../components/profile/MenuItem';
import { fetchUserProfile } from '../services/api';

const ProfileScreen = ({ onNavigate }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await fetchUserProfile('u1');
        setUser(profileData);
      } catch (error) {
        console.log("Lỗi kết nối API profile.");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 justify-center items-center bg-[#f8fafc]`}>
        <ActivityIndicator size="large" color="#00b894" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-[#f8fafc]`}>
      <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
        <Header user={user} />
        <PersonalInfo user={user} />
        <View style={tw`px-4 mt-4`}>
          <View style={tw`bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100`}>
            <MenuItem icon={CreditCard} label="Tài khoản ngân hàng" />
            <MenuItem icon={QrCode} label="Mã QR của tôi" />
            <MenuItem icon={Bell} label="Thông báo" />
            <MenuItem icon={Settings} label="Cài đặt" />
            <MenuItem icon={HelpCircle} label="Trợ giúp & Hỗ trợ" isLast />
          </View>
        </View>
        <View style={tw`px-4 mt-5`}>
          <TouchableOpacity style={tw`w-full bg-white py-4 rounded-2xl shadow-sm flex-row items-center justify-center gap-2 border border-slate-100`}>
            <LogOut size={18} color="#ef4444" />
            <Text style={tw`text-red-500 font-bold text-sm`}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
        <Text style={tw`text-center text-xs text-slate-400 mt-6 mb-24`}>ChiaBill v1.0.0</Text>
      </ScrollView>

      {/* Navigation bottom bar */}
      <View style={tw`absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-2 px-4 flex-row justify-around items-center shadow-lg`}>
        <TouchableOpacity style={tw`items-center flex-1 py-1`}>
          <Home size={22} color="#94a3b8" />
          <Text style={tw`text-[10px] text-slate-400 mt-0.5`}>Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tw`items-center flex-1 py-1`} onPress={() => onNavigate('history')}>
          <FileText size={22} color="#94a3b8" />
          <Text style={tw`text-[10px] text-slate-400 mt-0.5`}>Lịch sử</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tw`items-center flex-1 py-1`}>
          <User size={22} color="#00b894" />
          <Text style={tw`text-[10px] text-[#00b894] font-bold mt-0.5`}>Cá nhân</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;