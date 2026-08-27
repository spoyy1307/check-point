import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopBar from "../components/TopBar";
import StatusCard from "../components/StatusCard";
import { COLORS } from "../constants/colors";
import { RoundStatus } from "../types/patrol";
import { usePatrolStore } from "../lib/patrolStore";

const statusText: Record<RoundStatus, string> = {
  pending: "ยังไม่ได้ตรวจ",
  active: "กำลังตรวจ",
  complete: "ตรวจครบแล้ว",
  late: "ตรวจแล้ว (มีล่าช้า)"
};

export default function RoundsScreen() {
  const insets = useSafeAreaInsets();
  const patrolStore = usePatrolStore();
  const rounds = patrolStore.getRounds();

  const handleRoundPress = (roundId: number, isComplete: boolean) => {
    if (isComplete) {
      router.push({ pathname: "/round-summary", params: { round: roundId.toString() } });
    } else {
      router.push({ pathname: "/checkpoint", params: { round: roundId.toString() } });
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
      showsVerticalScrollIndicator={false}
    >
      <TopBar title="เลือกรอบการตรวจ" back />
      <View style={styles.heading}>
        <Text style={styles.headingTitle}>เลือกรอบเวลาตรวจ</Text>
        <Text style={styles.headingSub}>เลือกช่วงเวลาเพื่อเริ่มตรวจจุด</Text>
      </View>

      {rounds.map((round) => {
        const isComplete = round.completed === round.points;

        return (
          <Pressable
            key={round.id}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => handleRoundPress(round.id, isComplete)}
          >
            <View style={styles.main}>
              <Text style={styles.title}>{round.title}</Text>
              <Text style={styles.time}>{round.time}</Text>
            </View>
            <View style={styles.right}>
              <Text
                style={[
                  styles.count,
                  round.status === "late" && { color: COLORS.orange },
                  isComplete && { color: COLORS.green }
                ]}
              >
                {round.completed}/{round.points} จุด
              </Text>
              <Text style={styles.status}>{statusText[round.status]}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.muted} />
          </Pressable>
        );
      })}

      <StatusCard
        tone="blue"
        icon="location-outline"
        title="ใช้ GPS ตรวจสอบตำแหน่ง"
        text="ระบบจะบันทึกพิกัดและรูปภาพหลักฐานทุกจุดตรวจ"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  heading: { padding: 18, paddingBottom: 10 },
  headingTitle: { fontSize: 20, fontWeight: "900", color: COLORS.text },
  headingSub: { color: COLORS.muted, marginTop: 4 },
  card: {
    marginHorizontal: 14,
    marginVertical: 5,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }]
  },
  main: { flex: 1 },
  title: { fontSize: 17, fontWeight: "900", color: COLORS.text },
  time: { color: COLORS.muted, marginTop: 4, fontSize: 13 },
  right: { alignItems: "flex-end" },
  count: { fontWeight: "900", color: COLORS.blue, fontSize: 15 },
  status: { color: COLORS.muted, fontSize: 11, marginTop: 3 }
});
