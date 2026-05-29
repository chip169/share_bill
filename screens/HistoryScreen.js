import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Home, FileText, User } from "lucide-react-native";
import tw from "twrnc";

import HistoryHeader from "../components/history/HistoryHeader";
import SearchBar from "../components/history/SearchBar";
import ExpenseCard from "../components/history/ExpenseCard";
import { fetchUserProfile, fetchHistoryExpenses } from "../services/api";

const HistoryScreen = ({ onNavigate }) => {
  const [searchText, setSearchText] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, expensesData] = await Promise.all([
          fetchUserProfile("u1"),
          fetchHistoryExpenses("u1"),
        ]);
        setUserProfile(profileData);
        setExpenses(expensesData);
      } catch (error) {
        console.log("Lỗi kết nối API lịch sử.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredExpenses = expenses.filter((item) =>
    item.title.toLowerCase().includes(searchText.toLowerCase()),
  );

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
        <HistoryHeader
          totalSpend={userProfile?.totalSpend || 0}
          totalInvoices={userProfile?.totalInvoices || 0}
        />
        <SearchBar value={searchText} onChangeText={setSearchText} />
        <View style={tw`mt-6 mb-24`}>
          {filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onPress={() => onNavigate("billdetail")}
            />
          ))}
        </View>
      </ScrollView>

      {/* Navigation bottom bar */}
      <View
        style={tw`absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-2 px-4 flex-row justify-around items-center shadow-lg`}
      >
        <TouchableOpacity style={tw`items-center flex-1 py-1`}>
          <Home size={22} color="#94a3b8" />
          <Text
            style={tw`text-[10px] text-slate-400 mt-0.5`}
            onPress={() => onNavigate("home")}
          >
            Trang chủ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={tw`items-center flex-1 py-1`}>
          <FileText size={22} color="#00b894" />
          <Text style={tw`text-[10px] text-[#00b894] font-bold mt-0.5`}>
            Lịch sử
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`items-center flex-1 py-1`}
          onPress={() => onNavigate("profile")}
        >
          <User size={22} color="#94a3b8" />
          <Text style={tw`text-[10px] text-slate-400 mt-0.5`}>Cá nhân</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HistoryScreen;
