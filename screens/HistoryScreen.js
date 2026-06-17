import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { Home, FileText, User } from "lucide-react-native";
import tw from "twrnc";

import HistoryHeader from "../components/history/HistoryHeader";
import SearchBar from "../components/history/SearchBar";
import ExpenseCard from "../components/history/ExpenseCard";
import { fetchUserProfile, fetchHistoryExpenses } from "../services/api";

const HistoryScreen = ({ onNavigate, currentUser }) => {
  const [searchText, setSearchText] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [profileData, expensesData] = await Promise.all([
        fetchUserProfile(currentUser.id),
        fetchHistoryExpenses(currentUser.id),
      ]);
      setUserProfile(profileData);
      setExpenses(expensesData);
    } catch (error) {
      console.log("Lỗi kết nối API lịch sử:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter((item) =>
    item.title.toLowerCase().includes(searchText.toLowerCase()),
  );

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 justify-center items-center bg-[#f8fafc]`}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-[#f8fafc]`}>
      <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-24`}>
        <HistoryHeader
          totalSpend={userProfile?.totalSpend || 0}
          totalInvoices={userProfile?.totalInvoices || 0}
        />
        <SearchBar value={searchText} onChangeText={setSearchText} />
        
        <View style={tw`mt-6`}>
          {filteredExpenses.length === 0 ? (
            <View style={tw`items-center py-10 px-6`}>
              <Text style={tw`text-slate-400 text-sm text-center font-medium`}>
                Không tìm thấy hóa đơn nào trùng khớp!
              </Text>
            </View>
          ) : (
            filteredExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onPress={() => onNavigate("billdetail", { billId: expense.id })}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Navigation bottom bar */}
      <View
        style={tw`absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-4 flex-row justify-around items-center`}
      >
        <TouchableOpacity 
          style={tw`items-center flex-1 py-1`}
          onPress={() => onNavigate("home")}
        >
          <Home size={22} color="#94a3b8" />
          <Text style={tw`text-[10px] text-slate-400 mt-1`}>
            Trang chủ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={tw`items-center flex-1 py-1`}>
          <FileText size={22} color="#0ea5e9" />
          <Text style={tw`text-[10px] text-[#0ea5e9] font-bold mt-1`}>
            Lịch sử
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`items-center flex-1 py-1`}
          onPress={() => onNavigate("profile")}
        >
          <User size={22} color="#94a3b8" />
          <Text style={tw`text-[10px] text-slate-400 mt-1`}>Cá nhân</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HistoryScreen;
