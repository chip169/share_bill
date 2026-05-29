import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, ActivityIndicator, View, TouchableOpacity} from "react-native";
import tw from "twrnc";
import HomeHeader from "../components/home/HomeHeader";
import ExpenseHomeCard from "../components/home/ExpenseHomeCard";
import { fetchUserProfile, fetchHistoryExpenses,} from "../services/api";

import { Text } from "react-native-paper";
import { Home, FileText, User,} from "lucide-react-native";

export default function HomeScreen({
  onNavigate,
}) {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] =
    useState("ALL");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profile, history] =
        await Promise.all([
          fetchUserProfile("u2"),
          fetchHistoryExpenses("u2"),
        ]);

      setUser(profile);

      setExpenses(history);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={tw`flex-1 justify-center items-center`}
      >
        <ActivityIndicator
          size="large"
          color="#00b894"
        />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={tw`flex-1 bg-slate-100`}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader
          user={user}
          totalSpend={user.totalSpend}
          totalInvoices={user.totalInvoices}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <View style={tw`mt-6`}>
          {expenses.map((expense) => (
            <ExpenseHomeCard
              key={expense.id}
              expense={expense}
              onPress={() =>
                onNavigate("billdetail")
              }
            />
          ))}
        </View>
      </ScrollView>

      {/* BOTTOM NAV */}
      <View
        style={tw`absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-4 flex-row justify-around items-center`}
      >
        <TouchableOpacity
          style={tw`items-center flex-1 py-1`}
        >
          <Home size={22} color="#00b894" />

          <Text style={tw`text-[10px] text-[#00b894] text-slate-400 mt-1`}>
            Trang chủ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`items-center flex-1 py-1`}
          onPress={() => onNavigate("history")}
        >
          <FileText size={22} color="#94a3b8" />

          <Text
            style={tw`text-[10px] text-[#94a3b8] font-bold mt-1`}
          >
            Lịch sử
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`items-center flex-1 py-1`}
          onPress={() => onNavigate("profile")}
        >
          <User size={22} color="#94a3b8" />

          <Text style={tw`text-[10px] text-slate-400 mt-1`}>
            Cá nhân
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}