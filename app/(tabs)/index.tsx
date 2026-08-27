import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../constants/colors";
import { useUserStore } from "../../lib/userStore";
import { useCheckpointMobileStore } from "../../lib/checkpointMobileStore";
import { useNotificationStore } from "../../lib/notificationStore";
import { usePatrolStore } from "../../lib/patrolStore";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const userStore = useUserStore();
  const profile = userStore.getProfile();
  const cpStore = useCheckpointMobileStore();
  const factory = cpStore.getFactory();
  const notifStore = useNotificationStore();
  const unreadCount = notifStore.getUnreadCount();
  const patrolStore = usePatrolStore();
  const stats = patrolStore.getOverallStats();

  const payload = cpStore.getFullPayload();
  const shift = payload["check-point-mobile"].shift;

  // Dynamic Thai Date (Real-time Today Date)
  const getTodayThaiDate = () => {
    const now = new Date();
    const dayNames = [
      "วันอาทิตย์ที่",
      "วันจันทร์ที่",
      "วันอังคารที่",
      "วันพุธที่",
      "วันพฤหัสบดีที่",
      "วันศุกร์ที่",
      "วันเสาร์ที่"
    ];
    const monthNames = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];
    const dayName = dayNames[now.getDay()];
    const date = now.getDate();
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear() + 543;
    return `${dayName} ${date} ${month} ${year}`;
  };

  // Dynamic Shift Status Calculation
  const isCheckedOut = shift.isCheckedOut;
  const isCheckedIn = shift.isCheckedIn && !shift.isCheckedOut;

  const shiftStatusConfig = isCheckedOut
    ? {
        label: "ออกกะแล้ว",
        timeText: `ออกกะเวลา ${shift.checkOutTime || "08:00"} น.`,
        badgeBg: "#FEE2E2",
        dotColor: "#DC2626",
        textColor: "#DC2626"
      }
    : isCheckedIn
    ? {
        label: "กำลังปฏิบัติงาน",
        timeText: `เข้ากะเวลา ${shift.checkInTime || "20:00"} น.`,
        badgeBg: COLORS.greenSoft,
        dotColor: COLORS.green,
        textColor: COLORS.green
      }
    : {
        label: "รอเข้ากะ",
        timeText: "ยังไม่ได้ลงเวลาเข้ากะ",
        badgeBg: "#FEF3C7",
        dotColor: "#D97706",
        textColor: "#B45309"
      };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {/* 1. Header Profile (Clickable to Edit Profile) */}
      <View
        style={[
          styles.profile,
          {
            paddingTop: insets.top > 0 ? insets.top + 10 : 18,
            paddingLeft: Math.max(insets.left, 16),
            paddingRight: Math.max(insets.right, 16)
          }
        ]}
      >
        <Pressable
          style={({ pressed }) => [styles.profileClickArea, pressed && { opacity: 0.85 }]}
          onPress={() => router.push("/profile")}
        >
          <View style={styles.avatar}>
            {profile.avatarUri ? (
              <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarEmoji}>{profile.avatarEmoji || "👮‍♂️"}</Text>
            )}
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileRole}>{profile.role}</Text>
          </View>
        </Pressable>
        <Pressable
          hitSlop={10}
          style={styles.notifBtn}
          onPress={() => router.push("/notifications")}
        >
          <Ionicons name="notifications-outline" size={26} color="white" />
          {unreadCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Main Container */}
      <View style={styles.body}>
        {/* Factory Banner */}
        <View style={styles.factoryCard}>
          <View style={styles.factoryIconWrap}>
            <Ionicons name="business" size={18} color="#0C4A94" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.factoryLabel}>โรงงานประจำการ</Text>
            <Text style={styles.factoryName} numberOfLines={1}>
              {factory.name}
            </Text>
          </View>
        </View>

        {/* 2. Dynamic Shift Info Card (Static Display) */}
        <View style={styles.shiftCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.shiftDate}>{getTodayThaiDate()}</Text>
            <Text style={styles.shiftTime}>{shiftStatusConfig.timeText}</Text>
          </View>
          <View
            style={[
              styles.shiftBadge,
              { backgroundColor: shiftStatusConfig.badgeBg }
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: shiftStatusConfig.dotColor }
              ]}
            />
            <Text
              style={[
                styles.shiftBadgeText,
                { color: shiftStatusConfig.textColor }
              ]}
            >
              {shiftStatusConfig.label}
            </Text>
          </View>
        </View>

        {/* 3. Primary Full-Width Action: ลงเวลากะ */}
        <Pressable
          style={({ pressed }) => [styles.shiftActionBtn, pressed && styles.btnPressed]}
          onPress={() => router.push("/shift")}
        >
          <View style={styles.clockCircle}>
            <Ionicons name="time-outline" size={30} color={COLORS.blue} />
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={12} color="white" />
            </View>
          </View>
          <View style={styles.shiftActionTextWrap}>
            <Text style={styles.shiftActionTitle}>ลงเวลากะ</Text>
            <Text style={styles.shiftActionSub}>เข้า / ออกกะประจำวัน</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
        </Pressable>

        {/* 4. Two-Column Action Grid: ตรวจจุด & แจ้งเหตุฉุกเฉิน */}
        <View style={styles.actionGrid}>
          {/* Left Card: ลงเวลา / ตรวจจุด */}
          <Pressable
            style={({ pressed }) => [styles.gridCard, styles.gridCardBlue, pressed && styles.btnPressed]}
            onPress={() => router.push("/rounds")}
          >
            <View style={styles.gridIconWrap}>
              <Ionicons name="location" size={38} color="white" />
            </View>
            <Text style={styles.gridTitle}>ลงเวลา / ตรวจจุด</Text>
            <Text style={styles.gridSub}>
              {stats.completedPoints}/{stats.totalPoints} จุด
            </Text>
          </Pressable>

          {/* Right Card: แจ้งเหตุฉุกเฉิน */}
          <Pressable
            style={({ pressed }) => [styles.gridCard, styles.gridCardRed, pressed && styles.btnPressed]}
            onPress={() => router.push("/emergency-report")}
          >
            <View style={styles.gridIconWrap}>
              <Ionicons name="warning" size={38} color="white" />
            </View>
            <Text style={styles.gridTitle}>แจ้งเหตุฉุกเฉิน</Text>
            <Text style={styles.gridSub}>ขอความช่วยเหลือ</Text>
          </Pressable>
        </View>

        {/* 5. Summary Stats Card (Static Display - ดึงข้อมูลตรงจากหน้าสรุปผล / patrolStore) */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            {/* Stat 1 */}
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>ตรวจแล้ว</Text>
              <Text style={styles.statValBlue}>{stats.completedPoints}</Text>
              <Text style={styles.statUnit}>จุด</Text>
            </View>

            <View style={styles.statDivider} />

            {/* Stat 2 */}
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>ตรวจล่าช้า</Text>
              <Text style={styles.statValRed}>{stats.lateCount}</Text>
              <Text style={styles.statUnit}>จุด</Text>
            </View>

            <View style={styles.statDivider} />

            {/* Stat 3 */}
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>คะแนนวันนี้</Text>
              <Text style={styles.statValDark}>{stats.score}</Text>
              <Text style={styles.statUnit}>คะแนน</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  content: {
    paddingBottom: 20
  },
  profile: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center"
  },
  profileClickArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#DCE8F7",
    overflow: "hidden"
  },
  avatarImage: {
    width: "100%",
    height: "100%"
  },
  avatarEmoji: {
    fontSize: 32
  },
  profileName: {
    color: "white",
    fontSize: 18,
    fontWeight: "900"
  },
  profileRole: {
    color: "white",
    opacity: 0.85,
    fontSize: 13,
    marginTop: 3
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  notifBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#EF4444",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#0C4A94"
  },
  notifBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "900"
  },
  body: {
    paddingHorizontal: 15,
    paddingTop: 16,
    gap: 14
  },
  factoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F6FF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#D0E2FF",
    gap: 10
  },
  factoryIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  factoryLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "700"
  },
  factoryName: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0C4A94",
    marginTop: 1
  },
  factoryCodeBadge: {
    backgroundColor: "#0C4A94",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  factoryCodeText: {
    color: "white",
    fontSize: 10.5,
    fontWeight: "800"
  },
  shiftCard: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  shiftDate: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900"
  },
  shiftTime: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 4,
    fontWeight: "600"
  },
  shiftBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: COLORS.greenSoft,
    borderRadius: 20
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.green
  },
  shiftBadgeText: {
    color: COLORS.green,
    fontWeight: "900",
    fontSize: 11
  },
  shiftActionBtn: {
    backgroundColor: "#0C4A94",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 86,
    shadowColor: "#0C4A94",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3
  },
  clockCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center"
  },
  checkBadge: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.green,
    borderWidth: 2,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center"
  },
  shiftActionTextWrap: {
    flex: 1
  },
  shiftActionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "900"
  },
  shiftActionSub: {
    color: "white",
    opacity: 0.85,
    fontSize: 13,
    marginTop: 3
  },
  actionGrid: {
    flexDirection: "row",
    gap: 14
  },
  gridCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 156,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3
  },
  gridCardBlue: {
    backgroundColor: "#0C4A94",
    shadowColor: "#0C4A94"
  },
  gridCardRed: {
    backgroundColor: COLORS.red,
    shadowColor: COLORS.red
  },
  gridIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8
  },
  gridTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center"
  },
  gridSub: {
    color: "white",
    opacity: 0.9,
    fontSize: 13,
    marginTop: 4,
    textAlign: "center"
  },
  summaryCard: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  statCol: {
    flex: 1,
    alignItems: "center"
  },
  statDivider: {
    width: 1,
    height: 48,
    backgroundColor: COLORS.border
  },
  statLabel: {
    color: "#5B687A",
    fontSize: 13,
    fontWeight: "700"
  },
  statValBlue: {
    color: "#0C4A94",
    fontSize: 30,
    fontWeight: "900",
    marginVertical: 3
  },
  statValRed: {
    color: COLORS.red,
    fontSize: 30,
    fontWeight: "900",
    marginVertical: 3
  },
  statValDark: {
    color: "#20314D",
    fontSize: 30,
    fontWeight: "900",
    marginVertical: 3
  },
  statUnit: {
    color: "#8390A2",
    fontSize: 12,
    fontWeight: "600"
  },
  updateTimeText: {
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 2,
    fontSize: 12
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }]
  }
});


