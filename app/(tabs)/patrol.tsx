import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopBar from "../../components/TopBar";
import StatusCard from "../../components/StatusCard";
import { COLORS } from "../../constants/colors";
import { RoundStatus } from "../../types/patrol";
import { usePatrolStore } from "../../lib/patrolStore";
import { useCheckpointMobileStore } from "../../lib/checkpointMobileStore";
import { useUserStore } from "../../lib/userStore";

const statusText: Record<RoundStatus, string> = {
  pending: "ยังไม่ได้ตรวจ",
  active: "กำลังตรวจ",
  complete: "ตรวจครบแล้ว",
  late: "ตรวจแล้ว (มีล่าช้า)"
};

export default function PatrolTabScreen() {
  const insets = useSafeAreaInsets();
  const patrolStore = usePatrolStore();
  const cpStore = useCheckpointMobileStore();
  const userStore = useUserStore();
  const profile = userStore.getProfile();
  const factory = cpStore.getFactory();
  const guard = cpStore.getGuardAccount();
  const guardName = profile.name || guard.name;
  const guardRole = profile.role || guard.role;
  const guardZone = profile.zone || guard.assignedZone;
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
      <TopBar title="ตรวจจุดตรวจ" />

      {/* Factory Context Banner (Smart Visitor Scoped) */}
      <View style={styles.factoryBanner}>
        <View style={styles.factoryBannerLeft}>
          <View style={styles.factoryIconBox}>
            <Ionicons name="business" size={20} color="#0C4A94" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.factoryBannerTitle} numberOfLines={1}>
              {factory.name}
            </Text>
            <Text style={styles.factoryBannerSub}>
              ผู้ตรวจ: {guardName} ({guardRole}) • โซน: {guardZone}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.heading}>
        <Text style={styles.headingTitle}>เลือกรอบเวลาตรวจ</Text>
        <Text style={styles.headingSub}>
          รอบตรวจความปลอดภัยประจำ {factory.branchName}
        </Text>
      </View>

      {rounds.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="shield-outline" size={40} color="#0C4A94" />
          </View>
          <Text style={styles.emptyTitle}>ยังไม่มีรอบการเดินตรวจ</Text>
          <Text style={styles.emptySub}>
            ผู้ดูแลระบบ (Admin) ยังไม่ได้กำหนดจุดตรวจหรือรอบเวลาสำหรับ {factory.name}
          </Text>
          <View style={styles.emptyInfoBox}>
            <Ionicons name="information-circle-outline" size={18} color="#0369A1" />
            <Text style={styles.emptyInfoText}>
              เมื่อแอดมินสร้างจุดตรวจในระบบหลังบ้าน ข้อมูลจะแสดงที่นี่โดยอัตโนมัติ
            </Text>
          </View>
        </View>
      ) : (
        rounds.map((round) => {
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
        })
      )}

      <StatusCard
        tone="blue"
        icon="location-outline"
        title="ใช้ GPS ตรวจสอบตำแหน่ง"
        text={`ระบบจะบันทึกพิกัดและรูปภาพหลักฐานทุกจุดตรวจในพื้นที่ ${factory.branchName}`}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  emptyCard: {
    marginHorizontal: 14,
    marginVertical: 10,
    padding: 24,
    backgroundColor: "white",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 6
  },
  emptySub: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16
  },
  emptyInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#BAE6FD"
  },
  emptyInfoText: {
    flex: 1,
    fontSize: 12,
    color: "#0369A1",
    lineHeight: 16
  },
  factoryBanner: {
    marginHorizontal: 14,
    marginTop: 14,
    backgroundColor: "#F0F6FF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D0E2FF"
  },
  factoryBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  factoryIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  factoryBannerTitle: {
    fontSize: 13.5,
    fontWeight: "900",
    color: "#0C4A94",
    flex: 1
  },
  factoryTag: {
    backgroundColor: "#0C4A94",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  factoryTagText: {
    color: "white",
    fontSize: 10,
    fontWeight: "800"
  },
  factoryBannerSub: {
    color: "#64748B",
    fontSize: 11.5,
    marginTop: 3,
    fontWeight: "600"
  },
  heading: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 8 },
  headingTitle: { fontSize: 19, fontWeight: "900", color: COLORS.text },
  headingSub: { color: COLORS.muted, marginTop: 3, fontSize: 13 },
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
