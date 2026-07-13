import React, { useState, useRef, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, Animated, Easing, StyleSheet, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text, Card, ActivityIndicator } from "react-native-paper";
import { ChevronLeft, RotateCw, Award } from "lucide-react-native";
import tw from "twrnc";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import Svg, { Path, G, Text as SvgText } from "react-native-svg";

const SLICE_COLORS = [
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#6366f1"  // Indigo
];

export default function MiniGamesScreen({ onNavigate, currentUser, routeParams }) {
  const [activeGame, setActiveGame] = useState("wheel"); // "wheel" or "dice"
  
  // Tự động đọc danh sách thành viên từ màn tạo hóa đơn gửi qua, hoặc dùng default mock list
  const [participants, setParticipants] = useState(() => {
    if (routeParams?.billMembers && routeParams.billMembers.length > 0) {
      return routeParams.billMembers;
    }
    return [
      { id: currentUser?.id || "u2", fullName: currentUser?.fullName || "Tôi", username: currentUser?.username || "ME" },
      { id: "u1", fullName: "Nguyen Van A", username: "NGUYENA" },
      { id: "guest1", fullName: "Thành viên A", username: "USR_A" }
    ];
  });
  
  // Game states
  const [spinning, setSpinning] = useState(false);
  const [winners, setWinners] = useState([]);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  
  // Dice states
  const [rolling, setRolling] = useState(false);
  const [diceResults, setDiceResults] = useState({});

  // Animated values
  const spinValue = useRef(new Animated.Value(0)).current;

  // Audio References
  const bgSoundRef = useRef(null);
  const sfxSoundRef = useRef(null);

  useEffect(() => {
    // Tự động phát nhạc nền khi vừa vào màn hình chọn trò chơi
    loadBgMusic();

    return () => {
      // Dọn dẹp, tắt hết âm thanh khi thoát màn hình
      unloadAllSounds();
    };
  }, []);

  const loadBgMusic = async () => {
    try {
      // Dừng nhạc nền cũ nếu có
      if (bgSoundRef.current) {
        await bgSoundRef.current.unloadAsync();
      }
      // Tải và phát nhạc nền vip.mp3 (chỉ phát một lần duy nhất, không lặp lại)
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/vip.mp3"),
        { shouldPlay: true, isLooping: false, volume: 0.4 }
      );
      bgSoundRef.current = sound;
    } catch (e) {
      console.log("Lỗi tải nhạc nền:", e);
    }
  };

  const stopBgMusic = async () => {
    if (bgSoundRef.current) {
      try {
        await bgSoundRef.current.stopAsync();
        await bgSoundRef.current.unloadAsync();
        bgSoundRef.current = null;
      } catch (e) {
        console.log("Lỗi dừng nhạc nền:", e);
      }
    }
  };

  const playSfx = async (url) => {
    try {
      // Dừng âm thanh hiệu ứng cũ nếu đang chạy
      if (sfxSoundRef.current) {
        await sfxSoundRef.current.stopAsync();
        await sfxSoundRef.current.unloadAsync();
        sfxSoundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );
      sfxSoundRef.current = sound;
    } catch (e) {
      console.log("Lỗi phát hiệu ứng âm thanh:", e);
    }
  };

  const unloadAllSounds = async () => {
    if (bgSoundRef.current) {
      try { await bgSoundRef.current.unloadAsync(); } catch (e) {}
      bgSoundRef.current = null;
    }
    if (sfxSoundRef.current) {
      try { await sfxSoundRef.current.unloadAsync(); } catch (e) {}
      sfxSoundRef.current = null;
    }
  };

  const handleSpinWheel = () => {
    if (spinning) return;
    setSpinning(true);
    setWinners([]);
    spinValue.setValue(0);
    
    // Tắt nhạc nền và phát tiếng vòng quay
    stopBgMusic();
    playSfx("https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav");

    // Shuffle and pick unique winners
    const shuffled = [...participants].sort(() => 0.5 - Math.random());
    const selectedWinners = shuffled.slice(0, 1);
    
    // Choose the first selected winner to be the wheel target pointer
    const mainWinner = selectedWinners[0];
    const mainWinnerIndex = participants.findIndex(p => p.id === mainWinner.id);

    // Each segment has angle 360 / length
    const segmentAngle = 360 / participants.length;
    // Target angle: spin 5 full rotations + segment center
    const randomShift = (mainWinnerIndex * segmentAngle) + (segmentAngle / 2);
    const targetAngle = 360 * 5 - randomShift; // Negative rotation direction

    Animated.timing(spinValue, {
      toValue: targetAngle,
      duration: 3500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setWinners(selectedWinners);
      setSpinning(false);
      setShowWinnerModal(true);
      
      // Phát tiếng chiến thắng khi hiển thị kết quả
      playSfx("https://raw.githubusercontent.com/Piyushiitk24/EduLadder/master/audio/correct.mp3");
    });
  };

  // Rotate styling
  const rotateWheel = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  const handleRollDice = () => {
    if (rolling) return;
    setRolling(true);
    setDiceResults({});
    
    // Tắt nhạc nền và phát tiếng đổ xúc sắc
    stopBgMusic();
    playSfx("https://raw.githubusercontent.com/Piyushiitk24/EduLadder/master/audio/dice.mp3");

    let rollCount = 0;
    const interval = setInterval(() => {
      // Simulate fake live rolling rolls
      const tempResults = {};
      participants.forEach((p) => {
        tempResults[p.id] = Math.floor(Math.random() * 6) + 1;
      });
      setDiceResults(tempResults);
      
      rollCount++;
      if (rollCount > 10) {
        clearInterval(interval);
        
        // Compute final results
        const finalResults = {};
        const tempScoreArray = [];
        
        participants.forEach((p) => {
          const score = Math.floor(Math.random() * 6) + 1;
          finalResults[p.id] = score;
          tempScoreArray.push({ member: p, score });
        });
        
        // Sort lowest score first
        tempScoreArray.sort((a, b) => a.score - b.score);
        
        // Pick the top 1 member with lowest score as loser
        const selectedWinners = tempScoreArray.slice(0, 1).map(item => item.member);
        
        setDiceResults(finalResults);
        setWinners(selectedWinners);
        setRolling(false);
        setShowWinnerModal(true);
        
        // Phát tiếng chiến thắng khi tìm thấy người thua
        playSfx("https://raw.githubusercontent.com/Piyushiitk24/EduLadder/master/audio/correct.mp3");
      }
    }, 120);
  };

  // Redirect winner to bill creation
  const handleAssignPayer = () => {
    if (winners.length === 0) return;
    setShowWinnerModal(false);
    onNavigate("createbill", {
      gameWinners: winners.map(w => w.id), // pass list of winner IDs
      winnerId: winners[0].id, // first winner is paidBy
      winnerName: winners[0].fullName,
      winnerUsername: winners[0].username,
      ...routeParams?.prevBillState // Khôi phục lại trạng thái form nhập dở
    });
  };

  // Quay lại màn hình tạo bill cũ
  const handleGoBack = () => {
    if (routeParams?.prevBillState) {
      onNavigate("createbill", {
        ...routeParams.prevBillState
      });
    } else {
      onNavigate("home");
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      {/* Header */}
      <LinearGradient
        colors={["#0369a1", "#0ea5e9"]} // Unified premium Sky Blue gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={tw`flex-row items-center px-4 py-4 shadow-sm rounded-b-2xl`}
      >
        <TouchableOpacity onPress={handleGoBack} style={tw`p-2 bg-white/10 rounded-full mr-3`}>
          <ChevronLeft size={20} color="white" />
        </TouchableOpacity>
        <Text style={tw`text-base font-black text-white`}>Chọn người trả bill 🎲</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={tw`pb-10`}>
        {/* Toggle Game Tabs */}
        <View style={tw`flex-row mx-4 mt-6 bg-white p-1 rounded-2xl border border-slate-100`}>
          <TouchableOpacity
            style={tw`flex-1 py-3 rounded-xl items-center ${activeGame === "wheel" ? "bg-orange-500" : ""}`}
            onPress={() => {
              setActiveGame("wheel");
              setWinners([]);
            }}
          >
            <Text style={tw`font-bold ${activeGame === "wheel" ? "text-white" : "text-slate-600"}`}>
              🎡 Vòng quay kì diệu
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`flex-1 py-3 rounded-xl items-center ${activeGame === "dice" ? "bg-orange-500" : ""}`}
            onPress={() => {
              setActiveGame("dice");
              setWinners([]);
            }}
          >
            <Text style={tw`font-bold ${activeGame === "dice" ? "text-white" : "text-slate-600"}`}>
              🎲 Đổ xúc sắc đặt cược
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add participants list */}
        <Card style={tw`m-4 bg-white rounded-3xl p-5 shadow-sm border border-slate-100`}>
          <Text style={tw`text-base font-bold text-slate-800 mb-3`}>Thành viên tham gia game</Text>

          {/* Chips grid */}
          <View style={tw`flex-row flex-wrap gap-2 mb-4`}>
            {participants.map((p, index) => (
              <View
                key={p.id || index}
                style={tw`bg-orange-50 border border-orange-100 rounded-full px-3.5 py-1.5 flex-row items-center`}
              >
                <Text style={tw`text-orange-700 text-xs font-semibold`}>{p.fullName}</Text>
              </View>
            ))}
          </View>

          <View style={tw`border-t border-slate-100 pt-3 flex-row justify-between items-center`}>
            <Text style={tw`text-slate-500 text-xs font-semibold`}>Tổng số người chơi:</Text>
            <Text style={tw`text-orange-600 text-sm font-bold`}>{participants.length} người</Text>
          </View>
        </Card>

        {/* GAME PLAY AREA */}
        {activeGame === "wheel" ? (
          <View style={tw`items-center mt-6`}>
            {/* Visual Wheel pointer */}
            <View style={tw`z-10 -mb-4 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-rose-600`} />

             {/* Rotatable Wheel circle wrapped to separate native shadow animation */}
            <View style={tw`w-64 h-64 rounded-full border-4 border-slate-800 shadow-lg overflow-hidden bg-white`}>
              <Animated.View
                style={[
                  tw`w-full h-full items-center justify-center`,
                  { transform: [{ rotate: rotateWheel }] },
                ]}
              >
                <Svg width="256" height="256" viewBox="0 0 256 256">
                  <G>
                    {participants.map((p, idx) => {
                      const segmentAngle = 360 / participants.length;
                      const startAngle = segmentAngle * idx - 90;
                      const endAngle = segmentAngle * (idx + 1) - 90;
                      const radStart = (startAngle * Math.PI) / 180;
                      const radEnd = (endAngle * Math.PI) / 180;
                      const cx = 128;
                      const cy = 128;
                      const R = 128;
                      
                      const x1 = cx + R * Math.cos(radStart);
                      const y1 = cy + R * Math.sin(radStart);
                      const x2 = cx + R * Math.cos(radEnd);
                      const y2 = cy + R * Math.sin(radEnd);
                      
                      const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`;
                      const sliceColor = SLICE_COLORS[idx % SLICE_COLORS.length];
                      
                      // Calculate text label positioning
                      const midAngle = segmentAngle * idx + segmentAngle / 2;
                      const rText = R * 0.65;
                      const radText = ((midAngle - 90) * Math.PI) / 180;
                      const tx = cx + rText * Math.cos(radText);
                      const ty = cy + rText * Math.sin(radText);
                      
                      // Text rotation: base polar angle is midAngle - 90 (theta)
                      const theta = midAngle - 90;
                      const textRot = (theta > 90 || theta < -90) ? (theta + 180) : theta;

                      return (
                        <G key={`slice_${p.id || idx}`}>
                          <Path d={pathData} fill={sliceColor} stroke="#ffffff" strokeWidth="1" />
                          <SvgText
                            x={tx}
                            y={ty}
                            fill="#ffffff"
                            fontSize="9"
                            fontWeight="bold"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            transform={`rotate(${textRot}, ${tx}, ${ty})`}
                          >
                            {p.fullName}
                          </SvgText>
                        </G>
                      );
                    })}
                  </G>
                </Svg>
              </Animated.View>
            </View>

            <Button
              mode="contained"
              onPress={handleSpinWheel}
              loading={spinning}
              disabled={spinning}
              icon={() => <RotateCw size={18} color="white" />}
              contentStyle={tw`h-13 px-6`}
              style={tw`mt-8 rounded-2xl bg-orange-500 shadow-md shadow-orange-500/20`}
              labelStyle={tw`text-base font-bold text-white`}
            >
              Quay ngay!
            </Button>
          </View>
        ) : (
          /* Dice Roll Area */
          <View style={tw`px-4 mt-6`}>
            <Card style={tw`bg-white rounded-3xl p-5 shadow-sm border border-slate-100`}>
              <Text style={tw`text-sm font-bold text-slate-400 mb-4 text-center`}>
                AI ĐỔ ĐIỂM THẤP NHẤT SẼ GÁNH BILL
              </Text>
              
              {participants.map((p) => {
                const score = diceResults[p.id] || "-";
                return (
                  <View key={p.id} style={tw`flex-row justify-between items-center py-3 border-b border-slate-100`}>
                    <Text style={tw`text-slate-700 font-bold text-base`}>{p.fullName}</Text>
                    <View style={tw`w-10 h-10 bg-orange-100 rounded-xl items-center justify-center border border-orange-200`}>
                      <Text style={tw`text-orange-600 text-lg font-black`}>{score}</Text>
                    </View>
                  </View>
                );
              })}

              <Button
                mode="contained"
                onPress={handleRollDice}
                loading={rolling}
                disabled={rolling}
                contentStyle={tw`h-13`}
                style={tw`mt-6 rounded-2xl bg-orange-500`}
                labelStyle={tw`text-base font-bold text-white`}
              >
                Đổ xúc sắc
              </Button>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Winner PopUp Modal */}
      <Modal
        visible={showWinnerModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowWinnerModal(false);
        }}
      >
        <View style={tw`flex-1 justify-center items-center bg-black/60 px-6`}>
          <View style={tw`w-full max-w-[340px] bg-white rounded-3xl p-6 items-center shadow-2xl`}>
            <View style={tw`w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4`}>
              <Award size={36} color="#ef4444" />
            </View>
            
            <Text style={tw`text-xl font-bold text-slate-800 text-center mb-1`}>
              Đã tìm ra người gánh bill!
            </Text>
            
            <Text style={tw`text-slate-500 text-xs text-center mb-5 px-2`}>
              Hãy chuẩn bị thanh toán 100% hóa đơn này nhé!
            </Text>

            <View style={tw`bg-red-50 border border-red-100 px-6 py-4 rounded-2xl mb-6 w-full items-center justify-center`}>
              <Text style={tw`text-red-600 text-2xl font-black text-center`} numberOfLines={1}>
                {winners[0]?.fullName || "Đang chọn..."}
              </Text>
              {winners[0]?.username ? (
                <Text style={tw`text-red-400 text-[10px] font-semibold mt-1`}>
                  @{winners[0]?.username}
                </Text>
              ) : null}
            </View>

            <View style={tw`flex-col w-full gap-2`}>
              <Button
                mode="contained"
                onPress={handleAssignPayer}
                style={tw`bg-red-500 rounded-2xl`}
                contentStyle={tw`h-12`}
                labelStyle={tw`font-bold text-white text-sm`}
              >
                Gán gánh hóa đơn
              </Button>
              <Button
                mode="text"
                onPress={() => {
                  setShowWinnerModal(false);
                }}
                style={tw`rounded-2xl`}
                labelStyle={tw`text-slate-400 font-semibold text-xs`}
              >
                Chơi lại
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  segmentLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: 2,
    marginLeft: -1,
  },
  wheelTextContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    alignItems: "center",
    paddingTop: 12,
  },
});
