import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopBar from "../../components/TopBar";
import StatusCard from "../../components/StatusCard";
import { COLORS } from "../../constants/colors";
import { PATROL_ROUNDS, RoundStatus } from "../../types/patrol";

const statusText: Record<RoundStatus, string> = {
  pending: "ยังไม่ได้ตรวจ",
  active: "กำลังตรวจ",
  complete: "ตรวจครบแล้ว",
  late: "ล่าช้า"
};

export default function PatrolTabScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
      showsVerticalScrollIndicator={false}
    >
      <TopBar title="ตรวจจุดตรวจ" />
      <View style={styles.heading}>
        <Text style={styles.headingTitle}>เลือกรอบเวลาตรวจ</Text>
        <Text style={styles.headingSub}>เลือกช่วงเวลาเพื่อเริ่มตรวจจุด</Text>
      </View>

      {PATROL_ROUNDS.map((round) => (
        <Pressable
          key={round.id}
          style={styles.card}
          onPress={() => router.push({ pathname: "/checkpoint", params: { round: round.id } })}
        >
          <View style={styles.main}>
            <Text style={styles.title}>{round.title}</Text>
            <Text style={styles.time}>{round.time}</Text>
          </View>
          <View style={styles.right}>
            <Text style={[styles.count, round.status === "late" && { color: COLORS.orange }]}>
              {round.completed}/{round.points} จุด
            </Text>
            <Text style={styles.status}>{statusText[round.status]}</Text>
          </View>
          <Ionicons name="chevron-forward" size={25} color={COLORS.muted} />
        </Pressable>
      ))}

      <StatusCard
        tone="blue"
        icon="location-outline"
        title="ใช้ GPS ตรวจสอบตำแหน่ง"
        text="กรุณาเปิด GPS ก่อนเริ่มตรวจจุด"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  heading: { padding: 18, paddingBottom: 10 },
  headingTitle: { fontSize: 20, fontWeight: "900", color: COLORS.text },
  headingSub: { color: COLORS.muted, marginTop: 4 },
  card: { marginHorizontal: 14, marginVertical: 5, padding: 13, borderRadius: 15, borderWidth: 1, borderColor: COLORS.border, backgroundColor: "white", flexDirection: "row", alignItems: "center", gap: 10 },
  main: { flex: 1 },
  title: { fontSize: 17, fontWeight: "900", color: COLORS.text },
  time: { color: COLORS.muted, marginTop: 4 },
  right: { alignItems: "flex-end" },
  count: { fontWeight: "900", color: COLORS.green },
  status: { color: COLORS.muted, fontSize: 11, marginTop: 2 }
});
