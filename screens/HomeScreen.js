import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, ActivityIndicator, View, TouchableOpacity, Alert } from "react-native";
import tw from "twrnc";
import HomeHeader from "../components/home/HomeHeader";
import ExpenseCard from "../components/history/ExpenseCard";
import { fetchUserProfile, fetchHistoryExpenses, joinExpenseByCode } from "../services/api";
import { sendLocalNotification } from "../services/notifications";

import { Text, FAB, Card, TextInput, Button } from "react-native-paper";
import { Home, FileText, User, Plus } from "lucide-react-native";

export default function HomeScreen({ onNavigate, currentUser }) {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  const handleJoinBill = async () => {
    if (!joinCode.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập mã hóa đơn!");
      return;
    }
    setJoining(true);
    try {
      const expense = await joinExpenseByCode(currentUser.id, joinCode);
      setJoinCode("");
      
      // Gửi thông báo tham gia thành công
      sendLocalNotification(
        "Tham gia hóa đơn thành công! 📑",
        `Bạn đã tham gia thành công hóa đơn "${expense.title}"!`
      );

      Alert.alert(
        "Thành công 🎉",
        `Bạn đã tham gia thành công hóa đơn "${expense.title}"!`,
        [
          { 
            text: "Xem chi tiết", 
            onPress: () => onNavigate("billdetail", { billId: expense.id }) 
          }
        ]
      );
      loadData(); // Reload home details
    } catch (error) {
      Alert.alert("Lỗi tham gia", error.message || "Không thể tham gia hóa đơn này!");
    } finally {
      setJoining(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [profile, history] = await Promise.all([
        fetchUserProfile(currentUser.id),
        fetchHistoryExpenses(currentUser.id),
      ]);

      setUser(profile);
      setExpenses(history);
    } catch (error) {
      console.log("Lỗi tải dữ liệu màn hình chính:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter bills based on activeTab and selectedCategory
  const filteredExpenses = expenses.filter((expense) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "CREATED") return expense.createdBy === currentUser.id;
    if (activeTab === "JOINED") return expense.createdBy !== currentUser.id;
    if (activeTab === "NEED_TO_COLLECT") {
      return expense.createdBy === currentUser.id && expense.status === "PARTIAL";
    }
    if (activeTab === "NEED_TO_PAY") {
      return expense.createdBy !== currentUser.id && expense.status === "PARTIAL";
    }
    return true;
  }).filter((expense) => {
    if (selectedCategory === "ALL") return true;
    return expense.categoryId === selectedCategory;
  });

  const CATEGORY_FILTER_TABS = [
    { id: "ALL", name: "Tất cả", icon: "📁" },
    { id: "c1", name: "Ăn uống", icon: "🍔" },
    { id: "c2", name: "Du lịch", icon: "✈️" },
    { id: "c3", name: "Mua sắm", icon: "🛍️" },
    { id: "c4", name: "Giải trí", icon: "🎉" },
  ];

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-slate-50`}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-28`}>
        <HomeHeader
          user={user}
          totalToPay={user?.totalToPay || 0}
          totalToCollect={user?.totalToCollect || 0}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <Card style={tw`mx-4 mt-4 bg-white rounded-3xl p-4 shadow-sm border border-slate-100`}>
          <Text style={tw`text-xs font-bold text-slate-400 mb-2`}>THAM GIA HÓA ĐƠN BẰNG MÃ</Text>
          <View style={tw`flex-row gap-2`}>
            <TextInput
              placeholder="Nhập mã bill (Ví dụ: BILL-GOGI)"
              value={joinCode}
              onChangeText={setJoinCode}
              mode="outlined"
              outlineColor="#e2e8f0"
              activeOutlineColor="#0ea5e9"
              style={tw`flex-grow bg-white text-slate-700 h-11 text-xs`}
              dense
            />
            <Button
              mode="contained"
              onPress={handleJoinBill}
              loading={joining}
              disabled={joining}
              style={tw`bg-sky-500 rounded-xl justify-center px-4`}
              labelStyle={tw`text-white font-bold text-xs`}
            >
              Tham gia
            </Button>
          </View>
        </Card>

        {/* Category Horizontal Filter Tags */}
        <View style={tw`mx-4 mt-5`}>
          <Text style={tw`text-xs font-bold text-slate-400 mb-2.5`}>DANH MỤC HÓA ĐƠN</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`gap-2 pb-1`}>
            {CATEGORY_FILTER_TABS.map((tab) => {
              const isSelected = selectedCategory === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setSelectedCategory(tab.id)}
                  style={tw`flex-row items-center border rounded-full px-4 py-2 ${
                    isSelected ? "bg-sky-500 border-sky-500" : "bg-white border-slate-200"
                  }`}
                >
                  <Text style={tw`text-sm mr-1.5`}>{tab.icon}</Text>
                  <Text style={tw`text-xs font-bold ${isSelected ? "text-white" : "text-slate-600"}`}>
                    {tab.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={tw`mt-6`}>
          <View style={tw`flex-row justify-between items-center px-4 mb-3`}>
            <Text style={tw`text-base font-bold text-slate-800`}>Hóa đơn gần đây</Text>
            {filteredExpenses.length > 3 && (
              <TouchableOpacity onPress={() => onNavigate("history")}>
                <Text style={tw`text-sky-600 text-xs font-bold`}>Xem tất cả ({filteredExpenses.length})</Text>
              </TouchableOpacity>
            )}
          </View>

          {filteredExpenses.length === 0 ? (
            <View style={tw`items-center py-10 px-6`}>
              <Text style={tw`text-slate-400 text-sm text-center font-medium`}>
                Không tìm thấy hóa đơn nào trong danh mục này!
              </Text>
            </View>
          ) : (
            filteredExpenses.slice(0, 3).map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onPress={() => onNavigate("billdetail", { billId: expense.id })}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Plus button */}
      <FAB
        icon={() => <Plus size={24} color="white" />}
        style={tw`absolute right-5 bottom-20 bg-sky-500 rounded-full shadow-lg shadow-sky-500/30`}
        onPress={() => onNavigate("createbill")}
      />

      {/* BOTTOM NAV */}
      <View
        style={tw`absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-4 flex-row justify-around items-center`}
      >
        <TouchableOpacity style={tw`items-center flex-1 py-1`}>
          <Home size={22} color="#0ea5e9" />
          <Text style={tw`text-[10px] text-[#0ea5e9] font-bold mt-1`}>
            Trang chủ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`items-center flex-1 py-1`}
          onPress={() => onNavigate("history")}
        >
          <FileText size={22} color="#94a3b8" />
          <Text style={tw`text-[10px] text-slate-400 mt-1`}>
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