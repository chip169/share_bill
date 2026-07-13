import React, { useEffect, useState } from "react";
import { ScrollView, ActivityIndicator, View, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import tw from "twrnc";
import HomeHeader from "../components/home/HomeHeader";
import ExpenseCard from "../components/history/ExpenseCard";
import { fetchUserProfile, fetchHistoryExpenses, joinExpenseByCode, fetchNotifications, markNotificationRead } from "../services/api";
import { sendLocalNotification, scheduleLocalNotification, cancelScheduledNotification } from "../services/notifications";
import * as Speech from "expo-speech";
import BottomNav from "../components/navigation/BottomNav";

import { Text, FAB, Card, TextInput, Button } from "react-native-paper";
import { Home, FileText, User, Plus, Camera, Dices, PlusCircle } from "lucide-react-native";

let lastRemindedUserId = null;

export default function HomeScreen({ onNavigate, currentUser }) {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [showAllExpenses, setShowAllExpenses] = useState(false);

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
      const [profile, history, notifs] = await Promise.all([
        fetchUserProfile(currentUser.id),
        fetchHistoryExpenses(currentUser.id),
        fetchNotifications(currentUser.id).catch(() => []),
      ]);

      setUser(profile);
      setExpenses(history);

      // Tự động phát giọng đọc văn khấn đòi nợ nếu có thông báo văn khấn chưa đọc khi vào app
      const unreadPrayer = notifs.find((n) => !n.isRead && n.content && n.content.includes("Nam mô"));
      if (unreadPrayer) {
        // Đánh dấu đã đọc ngay lập tức để không bị phát lặp lại lần sau
        await markNotificationRead(unreadPrayer.id).catch(() => {});

        setTimeout(() => {
          Speech.stop();
          Speech.speak(unreadPrayer.content, {
            language: "vi-VN",
            pitch: 0.8,
            rate: 0.8,
          });
          Alert.alert(
            "CẢNH BÁO ĐÒI NỢ 🙏🚨",
            unreadPrayer.content,
            [{ text: "Tắt giọng đọc", onPress: () => Speech.stop() }]
          );
        }, 1200);
      }

      // Nhắc nhở thanh toán nếu có hóa đơn chưa trả khi vào app
      if (profile.totalToPay > 0) {
        if (lastRemindedUserId !== currentUser.id) {
          lastRemindedUserId = currentUser.id;
          setTimeout(() => {
            Alert.alert(
              "Nhắc nhở thanh toán ⚠️",
              `Bạn đang có các khoản hóa đơn chưa thanh toán với tổng số tiền nợ là ${profile.totalToPay.toLocaleString("vi-VN")} đ. Vui lòng thanh toán sớm!`,
              [{ text: "Đồng ý" }]
            );
            sendLocalNotification(
              "Nhắc nhở thanh toán! 💵",
              `Bạn đang có các khoản nợ chưa trả trị giá ${profile.totalToPay.toLocaleString("vi-VN")} đ.`
            );
          }, 800);
        }

        // LÊN LỊCH THÔNG BÁO TỪ XA KHI ĐÓNG APP:
        // Hẹn lịch nhắc nhở sau 15 giây (để dễ demo/kiểm thử). Trong thực tế có thể thay bằng 24h (24 * 3600).
        scheduleLocalNotification(
          "unpaid_bill_reminder",
          "Nhắc nhở hóa đơn chưa trả! ⏰",
          `Bạn vẫn chưa thanh toán khoản nợ trị giá ${profile.totalToPay.toLocaleString("vi-VN")} đ. Hãy mở ứng dụng để trả nợ nhé!`,
          24 * 3600
        );
      } else {
        // Nếu đã trả hết nợ, hủy lịch nhắc nhở
        cancelScheduledNotification("unpaid_bill_reminder");
      }
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
    { id: "ALL", name: "Tất cả ", icon: "📁" },
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
          collectCount={expenses.filter(e => e.createdBy === currentUser?.id && e.status === "PARTIAL").length}
          payCount={expenses.filter(e => e.createdBy !== currentUser?.id && e.status === "PARTIAL").length}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Quick Actions Row */}
        <View style={tw`mx-4 mt-6`}>
          <Text style={tw`text-xs font-bold text-slate-400 mb-3`}>HÀNH ĐỘNG NHANH</Text>
          <View style={tw`flex-row gap-3`}>
            {/* Create Bill Action */}
            <TouchableOpacity
              onPress={() => onNavigate("createbill")}
              style={tw`flex-1 bg-white border border-slate-100 rounded-3xl p-4 items-center justify-center shadow-sm`}
            >
              <View style={tw`w-10 h-10 rounded-2xl bg-sky-50 items-center justify-center mb-2`}>
                <PlusCircle size={20} color="#0284c7" />
              </View>
              <Text style={tw`text-slate-700 font-bold text-[11px] text-center`}>Tạo Bill Mới</Text>
            </TouchableOpacity>

            {/* Scan Bill Action */}
            <TouchableOpacity
              onPress={() => onNavigate("createbill", { autoScan: true })}
              style={tw`flex-1 bg-white border border-slate-100 rounded-3xl p-4 items-center justify-center shadow-sm`}
            >
              <View style={tw`w-10 h-10 rounded-2xl bg-emerald-50 items-center justify-center mb-2`}>
                <Camera size={20} color="#059669" />
              </View>
              <Text style={tw`text-slate-700 font-bold text-[11px] text-center`}>Quét Bill</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Card style={tw`mx-4 mt-6 bg-white rounded-3xl p-4 shadow-sm border border-slate-100`}>
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
                  style={tw`flex-row items-center border rounded-full px-4 py-2 ${isSelected ? "bg-sky-500 border-sky-500" : "bg-white border-slate-200"
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
              <TouchableOpacity onPress={() => setShowAllExpenses(!showAllExpenses)}>
                <Text style={tw`text-sky-600 text-xs font-bold`}>
                  {showAllExpenses ? "Thu gọn" : `Xem tất cả (${filteredExpenses.length})`}
                </Text>
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
            (showAllExpenses ? filteredExpenses : filteredExpenses.slice(0, 3)).map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                currentUserId={currentUser?.id}
                onPress={() => onNavigate("billdetail", { billId: expense.id })}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Plus button */}
      <FAB
        icon={() => <Plus size={24} color="white" />}
        style={[tw`absolute right-5 bg-sky-500 rounded-full shadow-lg shadow-sky-500/30`, { bottom: 56 + insets.bottom + 16 }]}
        onPress={() => onNavigate("createbill")}
      />

      {/* BOTTOM NAV */}
      <BottomNav onNavigate={onNavigate} currentScreen="home" />
    </SafeAreaView>
  );
}