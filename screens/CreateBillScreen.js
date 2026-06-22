import React, { useState, useEffect } from "react";
import { View, SafeAreaView, ScrollView, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { TextInput, Button, Text, Card, Checkbox, IconButton, Portal, Dialog, ActivityIndicator } from "react-native-paper";
import { ChevronLeft, Plus, Trash2, Search, UserPlus, Calendar, ChevronDown, ChevronUp, Camera } from "lucide-react-native";
import tw from "twrnc";
import { searchUserByUsername, createExpense, updateExpense, fetchBillDetail, scanReceiptOCR, parseOcrTextToItems } from "../services/api";
import { Audio } from "expo-av";
import { sendLocalNotification } from "../services/notifications";
import * as ImagePicker from "expo-image-picker";

const CATEGORIES = [
  { id: "c1", name: "Ăn uống", icon: "🍔" },
  { id: "c2", name: "Du lịch", icon: "✈️" },
  { id: "c3", name: "Mua sắm", icon: "🛍️" },
  { id: "c4", name: "Giải trí", icon: "🎉" },
];

export default function CreateBillScreen({ onNavigate, currentUser, routeParams }) {
  const isEditMode = !!routeParams?.editBillId;
  const [title, setTitle] = useState(routeParams?.title || "");
  const [expenseDate, setExpenseDate] = useState(routeParams?.expenseDate || "");
  const [categoryId, setCategoryId] = useState(routeParams?.categoryId || "c1");

  // Members list, prefilled with current logged-in user
  const [members, setMembers] = useState(routeParams?.members || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  // Items list: starts with one empty item
  const [items, setItems] = useState(routeParams?.items || [
    { id: "1", name: "", price: "", sharedWith: [] }
  ]);

  const [paidById, setPaidById] = useState(routeParams?.paidById || routeParams?.prevBillState?.paidById || currentUser?.id);
  const [expandedItemId, setExpandedItemId] = useState("1");
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("");

  // Load bill data in edit mode
  useEffect(() => {
    if (isEditMode && !routeParams?.winnerId) {
      const loadBillData = async () => {
        try {
          const { bill, members: billMembers } = await fetchBillDetail(routeParams.editBillId);
          setTitle(bill.title);
          if (bill.rawExpenseDate) {
            setExpenseDate(bill.rawExpenseDate.substring(0, 16));
          }
          setCategoryId(bill.categoryId || "c1");
          setPaidById(bill.creatorId);

          // Map members
          const mappedMembers = billMembers.map(m => ({
            id: m.id,
            fullName: m.name,
            username: m.code
          }));
          setMembers(mappedMembers);

          // Map items
          const mappedItems = bill.items.map((item, idx) => ({
            id: item.id || (idx + 1).toString(),
            name: item.name,
            price: item.price.toString(),
            sharedWith: item.sharedWith || []
          }));
          setItems(mappedItems);
        } catch (err) {
          console.error("Lỗi loadBillData:", err);
          Alert.alert("Lỗi", "Không thể tải thông tin hóa đơn để chỉnh sửa.");
        }
      };
      loadBillData();
    }
  }, [routeParams?.editBillId, isEditMode]);

  // Set current date on load and prefill creator as member
  useEffect(() => {
    if (isEditMode) return;
    if (!routeParams?.members) {
      const now = new Date();
      const isoString = now.toISOString().slice(0, 16); // e.g. "2026-06-17T16:32"
      setExpenseDate(isoString);

      if (currentUser) {
        setMembers([{
          id: currentUser.id,
          fullName: currentUser.fullName,
          username: currentUser.username || `USR${currentUser.id.toUpperCase()}`
        }]);
        // Auto tag current user in the first item
        setItems([{ id: "1", name: "", price: "", sharedWith: [currentUser.id] }]);
        setPaidById(currentUser.id);
      }
    }
  }, [currentUser, routeParams, isEditMode]);

  // Handle game winner pre-population (from routeParams if redirected from minigames)
  useEffect(() => {
    if (routeParams?.winnerId && routeParams?.winnerName) {
      // Determine all winners: gameWinners array or fallback to winnerId
      const winnersList = routeParams.gameWinners && routeParams.gameWinners.length > 0
        ? routeParams.gameWinners
        : [routeParams.winnerId];

      // Auto add all winners to members if not present
      setMembers(prev => {
        let updated = [...prev];
        winnersList.forEach(winnerId => {
          if (!updated.some((m) => m.id === winnerId)) {
            const name = winnerId === routeParams.winnerId ? routeParams.winnerName : `Thành viên (${winnerId})`;
            const username = winnerId === routeParams.winnerId ? routeParams.winnerUsername : `USR_${winnerId.toUpperCase()}`;
            updated.push({
              id: winnerId,
              fullName: name,
              username: username
            });
          }
        });
        return updated;
      });

      // Update ALL items to be shared ONLY by these winners
      setItems(prevItems => {
        return prevItems.map(item => ({
          ...item,
          sharedWith: winnersList
        }));
      });

      Alert.alert(
        "Đã phân chia hóa đơn từ game 🎲",
        `Hóa đơn đã được gán hoàn toàn cho: ${winnersList.length === 1
          ? routeParams.winnerName
          : `${winnersList.length} thành viên trúng cược`
        }!`,
        [{ text: "Đồng ý" }]
      );
    }
  }, [routeParams]);

  // Search & Add member by Username/ID
  const handleAddMember = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const foundUser = await searchUserByUsername(searchQuery);
      if (foundUser) {
        // Check if already in list
        if (members.some((m) => m.id === foundUser.id)) {
          Alert.alert("Thông báo", "Người dùng này đã có trong danh sách thành viên!");
        } else {
          const newMember = {
            id: foundUser.id,
            fullName: foundUser.fullName,
            username: foundUser.username || `USR${foundUser.id.toUpperCase()}`
          };
          setMembers([...members, newMember]);
          setSearchQuery("");
        }
      } else {
        Alert.alert("Không tìm thấy", "Không tìm thấy người dùng có mã ID / Username này!");
      }
    } catch (e) {
      Alert.alert("Lỗi", "Lỗi tìm kiếm thành viên.");
    } finally {
      setSearching(false);
    }
  };

  // Add new item row
  const handleAddItem = () => {
    const newId = (items.length + 1).toString();
    // Default tag: everyone in members
    const allIds = members.map((m) => m.id);
    setItems([
      ...items,
      { id: newId, name: "", price: "", sharedWith: allIds }
    ]);
    setExpandedItemId(newId);
  };

  // Remove item row
  const handleRemoveItem = (id) => {
    if (items.length === 1) {
      Alert.alert("Thông báo", "Hóa đơn phải có ít nhất 1 món ăn/dịch vụ!");
      return;
    }
    setItems(items.filter((item) => item.id !== id));
  };

  // Update item field
  const handleUpdateItem = (id, field, value) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Toggle member share for specific item
  const handleToggleShare = (itemId, userId) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const shared = item.sharedWith.includes(userId)
            ? item.sharedWith.filter((id) => id !== userId)
            : [...item.sharedWith, userId];
          return { ...item, sharedWith: shared };
        }
        return item;
      })
    );
  };

  // Trình chọn ảnh và quét hóa đơn OCR
  const handleScanBill = () => {
    Alert.alert(
      "Quét hóa đơn Bằng AI 📸",
      "Chọn nguồn hình ảnh hóa đơn để phân tích món ăn & giá:",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Chụp ảnh từ Camera", onPress: () => processImagePicker("camera") },
        { text: "Chọn từ thư viện ảnh", onPress: () => processImagePicker("library") }
      ]
    );
  };

  const processImagePicker = async (type) => {
    try {
      let permissionResult;
      if (type === "camera") {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      if (!permissionResult.granted) {
        Alert.alert("Quyền truy cập", "Bạn cần cấp quyền truy cập để sử dụng tính năng này!");
        return;
      }

      let result;
      const pickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true, // Yêu cầu chuỗi base64 để gửi qua API OCR
      };

      if (type === "camera") {
        result = await ImagePicker.launchCameraAsync(pickerOptions);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
      }

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset.base64) {
        Alert.alert("Lỗi", "Không thể lấy dữ liệu hình ảnh dạng base64.");
        return;
      }

      setScanning(true);
      setScanStatus("Đang gửi ảnh lên máy chủ OCR...");

      // Gọi API bóc tách text
      const parsedText = await scanReceiptOCR(asset.base64);

      setScanStatus("AI đang phân tích tên món & giá tiền...");
      const extractedItems = parseOcrTextToItems(parsedText);

      if (extractedItems.length === 0) {
        Alert.alert(
          "Kết quả quét ⚠️", 
          "Không nhận diện được tên món ăn / giá tiền cụ thể nào từ ảnh. Vui lòng chụp ảnh cận cảnh hóa đơn rõ nét hơn!"
        );
      } else {
        // Tag toàn bộ thành viên hiện tại vào các món mới
        const allMemberIds = members.map((m) => m.id);
        const mappedExtractedItems = extractedItems.map(item => ({
          ...item,
          sharedWith: allMemberIds
        }));

        Alert.alert(
          "Quét hóa đơn thành công 🎉",
          `Nhận diện được ${extractedItems.length} món ăn.\n\nBạn muốn làm gì với danh sách này?`,
          [
            {
              text: "Thêm tiếp vào hóa đơn",
              onPress: () => {
                setItems(prev => {
                  const startId = prev.length + 1;
                  const adjusted = mappedExtractedItems.map((item, idx) => ({
                    ...item,
                    id: (startId + idx).toString()
                  }));
                  // Lọc bỏ món mặc định nếu nó trống
                  const filteredPrev = prev.filter(item => item.name.trim() !== "" || item.price !== "");
                  return [...filteredPrev, ...adjusted];
                });
              }
            },
            {
              text: "Ghi đè mới hoàn toàn",
              onPress: () => {
                setItems(mappedExtractedItems);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error("Lỗi khi quét bill:", error);
      Alert.alert(
        "Lỗi quét hóa đơn ❌",
        error.message || "Không thể kết nối tới dịch vụ nhận diện hóa đơn. Vui lòng kiểm tra lại mạng!"
      );
    } finally {
      setScanning(false);
      setScanStatus("");
    }
  };

  // Live calculation: calculate share per member
  const calculateShares = () => {
    const memberShares = {};
    members.forEach((m) => {
      memberShares[m.id] = 0;
    });

    let totalAmount = 0;

    items.forEach((item) => {
      const price = parseFloat(item.price) || 0;
      totalAmount += price;

      const count = item.sharedWith.length;
      if (count > 0) {
        const share = price / count;
        item.sharedWith.forEach((userId) => {
          if (memberShares[userId] !== undefined) {
            memberShares[userId] += share;
          }
        });
      }
    });

    return { totalAmount, memberShares };
  };

  const { totalAmount, memberShares } = calculateShares();

  // Handle Save Bill
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên hóa đơn!");
      return;
    }

    // Validate items
    const invalidItem = items.find((item) => !item.name.trim() || !item.price || parseFloat(item.price) <= 0);
    if (invalidItem) {
      Alert.alert("Thông tin không hợp lệ", "Tất cả các món ăn phải có tên và giá tiền hợp lệ!");
      return;
    }

    const noPayerItem = items.find((item) => item.sharedWith.length === 0);
    if (noPayerItem) {
      Alert.alert("Thiếu thành viên ăn", `Món "${noPayerItem.name}" chưa gắn thẻ người ăn nào!`);
      return;
    }

    try {
      // Prepare participants data
      const participants = members.map((m) => {
        const owed = Math.round(memberShares[m.id]);
        return {
          userId: m.id,
          owedAmount: owed,
        };
      });

      // Format items database representation
      const dbItems = items.map((item, idx) => ({
        id: `item_${idx + 1}`,
        name: item.name.trim(),
        price: parseFloat(item.price),
        sharedWith: item.sharedWith
      }));

      if (isEditMode) {
        await updateExpense(routeParams.editBillId, {
          title: title.trim(),
          totalAmount: totalAmount,
          paidBy: paidById,
          expenseDate: expenseDate,
          items: dbItems,
          participants: participants,
          categoryId: categoryId,
        });

        sendLocalNotification(
          "Cập nhật hóa đơn thành công! 📝",
          `Hóa đơn "${title.trim()}" đã được cập nhật thành công.`
        );

        Alert.alert("Thành công", "Đã cập nhật hóa đơn thành công!", [
          { text: "Tuyệt vời", onPress: () => onNavigate("billdetail", { billId: routeParams.editBillId }) }
        ]);
      } else {
        // Call API
        await createExpense({
          title: title.trim(),
          totalAmount: totalAmount,
          paidBy: paidById, // Người thanh toán trước
          createdBy: currentUser?.id,
          expenseDate: expenseDate,
          items: dbItems,
          participants: participants,
          categoryId: categoryId,
        });

        sendLocalNotification(
          "Tạo hóa đơn thành công! 💵",
          `Hóa đơn "${title.trim()}" trị giá ${totalAmount.toLocaleString("vi-VN")} đ đã được tạo.`
        );

        Alert.alert("Thành công", "Đã tạo và phân chia hóa đơn thành công!", [
          { text: "Tuyệt vời", onPress: () => onNavigate("home") }
        ]);
      }
    } catch (e) {
      console.error("Lỗi khi lưu hóa đơn:", e);
      Alert.alert("Lỗi", "Không thể lưu hóa đơn. Vui lòng kiểm tra kết nối!");
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      {/* Top Header */}
      <View style={tw`flex-row items-center justify-between px-4 py-3 border-b border-slate-100 bg-white`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={() => onNavigate(isEditMode ? "billdetail" : "home", isEditMode ? { billId: routeParams.editBillId } : undefined)} style={tw`p-1 mr-2`}>
            <ChevronLeft size={24} color="#334155" />
          </TouchableOpacity>
          <Text style={tw`text-lg font-bold text-slate-800`}>{isEditMode ? "Chỉnh sửa hóa đơn" : "Tạo hóa đơn chia tiền"}</Text>
        </View>
        <TouchableOpacity
          onPress={async () => {
            try {
              const { sound } = await Audio.Sound.createAsync(
                { uri: "https://www.soundjay.com/buttons/sounds/button-3.mp3" },
                { shouldPlay: true }
              );
              sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                  sound.unloadAsync();
                }
              });
            } catch (e) {
              console.log("Lỗi âm thanh:", e);
            }

            Alert.alert(
              "⚠️ CẢNH BÁO ĐẶT CƯỢC",
              "Đặt cược có thể dẫn đến việc gánh toàn bộ hóa đơn! Bạn hãy suy nghĩ thật kỹ trước khi chơi minigame.",
              [
                { text: "Để tôi xem lại", style: "cancel" },
                {
                  text: "Tôi hiểu rồi, chơi luôn!",
                  onPress: () => {
                    onNavigate("minigames", {
                      billMembers: members,
                      prevBillState: { title, expenseDate, categoryId, members, items, paidById, editBillId: routeParams?.editBillId }
                    });
                  }
                }
              ]
            );
          }}
          style={tw`bg-orange-100 px-3 py-1.5 rounded-full`}
        >
          <Text style={tw`text-orange-600 text-xs font-bold`}>🎲 Chọn người trả</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-32`}>
        {/* Info Card */}
        <Card style={tw`m-4 bg-white rounded-3xl p-4 shadow-sm border border-slate-100`}>
          <Text style={tw`text-base font-bold text-slate-800 mb-3`}>Thông tin chung</Text>
          <TextInput
            label="Tên hóa đơn (ví dụ: Ăn lẩu gà, Cà phê...)"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            outlineColor="#e2e8f0"
            activeOutlineColor="#0ea5e9"
            style={tw`bg-white text-slate-700 mb-4`}
          />

          {/* Category Selector */}
          <Text style={tw`text-xs font-bold text-slate-400 mb-2`}>DANH MỤC HÓA ĐƠN</Text>
          <View style={tw`flex-row gap-2 mb-4`}>
            {CATEGORIES.map((cat) => {
              const isSelected = categoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setCategoryId(cat.id)}
                  style={tw`flex-1 flex-row items-center justify-center border rounded-xl py-2 px-1 ${isSelected ? "bg-sky-500 border-sky-500" : "bg-white border-slate-200"
                    }`}
                >
                  <Text style={tw`text-sm mr-1`}>{cat.icon}</Text>
                  <Text style={tw`text-[10px] font-bold ${isSelected ? "text-white" : "text-slate-600"}`}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            label="Ngày tạo hóa đơn (Định dạng YYYY-MM-DDTHH:MM)"
            value={expenseDate}
            onChangeText={setExpenseDate}
            mode="outlined"
            outlineColor="#e2e8f0"
            activeOutlineColor="#0ea5e9"
            style={tw`bg-white text-slate-700`}
            left={<TextInput.Icon icon={() => <Calendar size={18} color="#94a3b8" />} />}
          />
        </Card>

        {/* Member Section */}
        <Card style={tw`mx-4 mb-4 bg-white rounded-3xl p-4 shadow-sm border border-slate-100`}>
          <Text style={tw`text-base font-bold text-slate-800 mb-1`}>Thành viên gánh bill</Text>
          <Text style={tw`text-xs text-slate-400 mb-4`}>Nhập Username/Mã ID để thêm bạn bè vào bill</Text>

          <View style={tw`flex-row gap-2 mb-4`}>
            <TextInput
              label="Nhập ID (Ví dụ: HIEX123)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              mode="outlined"
              outlineColor="#e2e8f0"
              activeOutlineColor="#0ea5e9"
              style={tw`flex-1 bg-white text-slate-700 h-12`}
              left={<TextInput.Icon icon={() => <Search size={18} color="#94a3b8" />} />}
            />
            <Button
              mode="contained"
              onPress={handleAddMember}
              loading={searching}
              disabled={searching}
              style={tw`bg-sky-500 rounded-xl justify-center px-4`}
            >
              Thêm
            </Button>
          </View>

          {/* Members chips list */}
          <View style={tw`flex-row flex-wrap gap-2 mb-4`}>
            {members.map((m) => (
              <View key={m.id} style={tw`bg-sky-50 border border-sky-100 rounded-full px-3 py-1.5 flex-row items-center`}>
                <View style={tw`w-5 h-5 bg-sky-500 rounded-full items-center justify-center mr-1.5`}>
                  <Text style={tw`text-white text-[10px] font-bold`}>{m.fullName[0]}</Text>
                </View>
                <Text style={tw`text-sky-700 text-xs font-semibold mr-1`}>{m.fullName}</Text>
                <Text style={tw`text-sky-400 text-[10px]`}>({m.username})</Text>
              </View>
            ))}
          </View>

          {/* Selector người trả tiền */}
          <View style={tw`border-t border-slate-100 pt-4 mt-2`}>
            <Text style={tw`text-xs font-bold text-slate-400 mb-2`}>AI ĐÃ THANH TOÁN TRƯỚC?</Text>
            <View style={tw`flex-row flex-wrap gap-2`}>
              {members.map((m) => {
                const isPayer = m.id === paidById;
                return (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => setPaidById(m.id)}
                    style={tw`flex-row items-center border rounded-full px-3 py-1.5 ${isPayer
                        ? "bg-sky-500 border-sky-500"
                        : "bg-white border-slate-200"
                      }`}
                  >
                    <View style={tw`w-4 h-4 rounded-full items-center justify-center mr-1.5 ${isPayer ? "bg-white" : "bg-sky-500"}`}>
                      <Text style={tw`text-[9px] font-bold ${isPayer ? "text-sky-500" : "text-white"}`}>{m.fullName[0]}</Text>
                    </View>
                    <Text style={tw`text-xs font-semibold ${isPayer ? "text-white" : "text-slate-700"}`}>
                      {m.fullName} {m.id === currentUser?.id ? "(Tôi)" : ""}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Card>

        {/* Items Section */}
        <View style={tw`mx-4`}>
          <View style={tw`flex-row justify-between items-center mb-3`}>
            <Text style={tw`text-base font-bold text-slate-800`}>Chi tiết món ăn & Tag người dùng</Text>
            <View style={tw`flex-row gap-2`}>
              <TouchableOpacity onPress={handleScanBill} style={tw`flex-row items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-full`}>
                <Camera size={14} color="#059669" />
                <Text style={tw`text-emerald-700 text-xs font-bold`}>Quét bill</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddItem} style={tw`flex-row items-center gap-1 bg-sky-50 px-3 py-1.5 rounded-full`}>
                <Plus size={14} color="#0284c7" />
                <Text style={tw`text-sky-700 text-xs font-bold`}>Thêm món</Text>
              </TouchableOpacity>
            </View>
          </View>

          {items.map((item, index) => {
            const isExpanded = item.id === expandedItemId;
            if (!isExpanded) {
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setExpandedItemId(item.id)}
                  style={tw`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-3 flex-row justify-between items-center`}
                >
                  <View style={tw`flex-row items-center flex-1 mr-2`}>
                    <View style={tw`w-8 h-8 rounded-full bg-sky-100 items-center justify-center mr-3`}>
                      <Text style={tw`text-sky-600 font-bold text-xs`}>#{index + 1}</Text>
                    </View>
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-slate-800 font-semibold text-sm`} numberOfLines={1}>
                        {item.name.trim() || `Món ăn chưa đặt tên`}
                      </Text>
                      <Text style={tw`text-slate-400 text-xs mt-0.5`}>
                        {item.sharedWith.length} người ăn • {(parseFloat(item.price) || 0).toLocaleString("vi-VN")} đ
                      </Text>
                    </View>
                  </View>
                  <View style={tw`flex-row items-center gap-2`}>
                    {items.length > 1 && (
                      <TouchableOpacity
                        onPress={() => handleRemoveItem(item.id)}
                        style={tw`p-1 mr-1`}
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                    <ChevronDown size={18} color="#94a3b8" />
                  </View>
                </TouchableOpacity>
              );
            }

            return (
              <Card key={item.id} style={tw`bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-4`}>
                <TouchableOpacity
                  onPress={() => setExpandedItemId(null)}
                  style={tw`flex-row justify-between items-center mb-3 border-b border-slate-50 pb-2`}
                >
                  <View style={tw`flex-row items-center`}>
                    <View style={tw`w-6 h-6 rounded-full bg-sky-500 items-center justify-center mr-2`}>
                      <Text style={tw`text-white font-bold text-xs`}>{index + 1}</Text>
                    </View>
                    <Text style={tw`text-slate-800 font-bold text-sm`}>Đang chỉnh sửa món</Text>
                  </View>
                  <View style={tw`flex-row items-center gap-3`}>
                    {items.length > 1 && (
                      <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                        <Trash2 size={16} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                    <ChevronUp size={18} color="#0ea5e9" />
                  </View>
                </TouchableOpacity>

                <View style={tw`flex-row gap-2 mb-3`}>
                  <TextInput
                    label="Tên món"
                    value={item.name}
                    onChangeText={(val) => handleUpdateItem(item.id, "name", val)}
                    mode="outlined"
                    outlineColor="#e2e8f0"
                    activeOutlineColor="#0ea5e9"
                    style={tw`flex-2 bg-white text-slate-700`}
                  />
                  <TextInput
                    label="Giá (đ)"
                    value={item.price}
                    onChangeText={(val) => handleUpdateItem(item.id, "price", val)}
                    keyboardType="numeric"
                    mode="outlined"
                    outlineColor="#e2e8f0"
                    activeOutlineColor="#0ea5e9"
                    style={tw`flex-1.3 bg-white text-slate-700`}
                  />
                </View>

                <Text style={tw`text-xs font-bold text-slate-400 mb-2`}>NHỮNG AI ĂN MÓN NÀY?</Text>
                <View style={tw`flex-row flex-wrap gap-2`}>
                  {members.map((m) => {
                    const isChecked = item.sharedWith.includes(m.id);
                    return (
                      <TouchableOpacity
                        key={m.id}
                        onPress={() => handleToggleShare(item.id, m.id)}
                        style={tw`flex-row items-center border rounded-full px-3 py-1 ${isChecked
                            ? "bg-emerald-50 border-emerald-300"
                            : "bg-slate-50 border-slate-200"
                          }`}
                      >
                        <Checkbox.Android
                          status={isChecked ? "checked" : "unchecked"}
                          color="#10b981"
                        />
                        <Text style={tw`text-xs ${isChecked ? "text-emerald-700 font-semibold" : "text-slate-600"}`}>
                          {m.fullName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Card>
            );
          })}
        </View>

        {/* Live Shares summary */}
        <Card style={tw`m-4 bg-slate-900 rounded-3xl p-5 shadow-lg`}>
          <View style={tw`flex-row justify-between items-center mb-4`}>
            <Text style={tw`text-white/60 text-sm font-semibold`}>TỔNG CỘNG HÓA ĐƠN</Text>
            <Text style={tw`text-emerald-400 text-2xl font-bold`}>
              {totalAmount.toLocaleString("vi-VN")} đ
            </Text>
          </View>
          <View style={tw`h-[1px] bg-white/10 mb-4`} />
          <Text style={tw`text-white/40 text-xs font-bold mb-3`}>PHẦN CHIA CHI TIẾT TẠM TÍNH</Text>
          {members.map((m) => (
            <View key={m.id} style={tw`flex-row justify-between items-center mb-2`}>
              <Text style={tw`text-white text-sm`}>{m.fullName}</Text>
              <Text style={tw`text-white font-bold text-sm`}>
                {(memberShares[m.id] || 0).toLocaleString("vi-VN")} đ
              </Text>
            </View>
          ))}
        </Card>
      </ScrollView>

      {/* Floating Save Button */}
      <View style={tw`absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100`}>
        <Button
          mode="contained"
          onPress={handleSave}
          contentStyle={tw`h-13`}
          style={tw`rounded-2xl bg-sky-500`}
          labelStyle={tw`text-base font-bold text-white`}
        >
          Lưu hóa đơn & Phân chia nợ
        </Button>
      </View>

      {/* Modal báo trạng thái quét hóa đơn */}
      <Portal>
        <Dialog visible={scanning} dismissable={false} style={tw`bg-white rounded-3xl`}>
          <Dialog.Title style={tw`text-center font-bold text-slate-800`}>Quét hóa đơn bằng AI</Dialog.Title>
          <Dialog.Content style={tw`items-center py-6`}>
            <ActivityIndicator size="large" color="#10b981" style={tw`mb-4`} />
            <Text style={tw`text-slate-600 text-sm font-semibold text-center`}>
              {scanStatus}
            </Text>
            <Text style={tw`text-slate-400 text-xs text-center mt-2`}>
              Vui lòng giữ kết nối internet ổn định...
            </Text>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}
