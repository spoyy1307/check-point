import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../constants/colors";
import TopBar from "../../components/TopBar";
import TrendLineChart from "../../components/TrendLineChart";
import ScoreCalendarModal from "../../components/ScoreCalendarModal";
import { scoreHistoryStore } from "../../lib/scoreHistoryStore";
import { usePatrolStore } from "../../lib/patrolStore";

const FILTER_OPTIONS = [
  { id: "7", label: "7 วันล่าสุด", icon: "calendar-outline" },
  { id: "14", label: "14 วันล่าสุด", icon: "calendar-number-outline" },
  { id: "30", label: "30 วันล่าสุด", icon: "time-outline" },
  { id: "calendar", label: "เลือกตามปฏิทิน...", icon: "calendar" }
];

export default function SummaryScreen() {
  const insets = useSafeAreaInsets();
  const patrolStore = usePatrolStore();
  const stats = patrolStore.getOverallStats();

  // Filter & Selection State
  const [selectedFilter, setSelectedFilter] = useState<string>("7 วันล่าสุด");
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);

  // Chart data based on filter
  const trendData = scoreHistoryStore.getTrendData(selectedFilter);

  const currentScore = stats.score;
  const onTimeCount = stats.onTimeCount;
  const lateCount = stats.lateCount;
  const missCount = stats.missCount;

  const handleSelectFilterOption = (opt: typeof FILTER_OPTIONS[0]) => {
    setShowFilterDropdown(false);
    if (opt.id === "calendar") {
      setShowCalendarModal(true);
    } else {
      setSelectedFilter(opt.label);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 36 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Bar */}
        <TopBar title="สรุปผลคะแนน" />

        {/* 2. Hero Score Card (Deep Blue with Green Gauge & Status) */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            {/* Left: Glowing Green Donut Ring */}
            <View style={styles.donutContainer}>
              <View style={styles.donutRingOuter}>
                <View style={styles.donutRingInner}>
                  <Text style={styles.donutScoreText}>{currentScore}</Text>
                  <Text style={styles.donutSubText}>/100</Text>
                </View>
              </View>
            </View>

            {/* Right: Score Status */}
            <View style={styles.heroRightInfo}>
              <Text style={styles.heroLabel}>คะแนนความประพฤติรวม</Text>
              <View style={styles.statusRow}>
                <Text style={styles.heroStatusText}>
                  {currentScore >= 90 ? "ดีมาก" : currentScore >= 80 ? "ปานกลาง" : "ต้องปรับปรุง"}
                </Text>
                <Ionicons
                  name={currentScore >= 90 ? "checkmark-circle" : "alert-circle"}
                  size={28}
                  color={currentScore >= 90 ? "#10B981" : "#F59E0B"}
                />
              </View>
            </View>
          </View>

          {/* Bottom Banner inside Hero: Thumbs Up Motivation */}
          <View style={styles.heroBottomBanner}>
            <View style={styles.thumbIconCircle}>
              <Ionicons name="thumbs-up" size={16} color="white" />
            </View>
            <Text style={styles.bannerText}>
              {currentScore >= 90
                ? "ยอดเยี่ยม! คุณทำหน้าที่ได้อย่างมีประสิทธิภาพ\nรักษามาตรฐานนี้ไว้ให้ดีต่อไป"
                : "สู้ๆ ครับ! เพิ่มความระมัดระวังในการตรวจตรงเวลา\nเพื่อเพิ่มคะแนนให้เต็ม 100"}
            </Text>
          </View>
        </View>

        {/* 3. Trend Chart Card with Interactive Dropdown & Calendar Picker */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleRow}>
              <Ionicons name="trending-up" size={20} color="#0C4A94" />
              <Text style={styles.chartTitle}>แนวโน้มคะแนนความประพฤติ</Text>
            </View>

            {/* Interactive Dropdown Button */}
            <Pressable
              style={({ pressed }) => [styles.filterPill, pressed && styles.btnPressed]}
              onPress={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <Text style={styles.filterText}>{selectedFilter}</Text>
              <Ionicons name="chevron-down" size={14} color="#64748B" />
            </Pressable>
          </View>

          {/* Pixel-Perfect Dynamic Trend Line Chart */}
          <TrendLineChart data={trendData} />
        </View>

        {/* 4. 3-Column Inspection Metrics Card */}
        <View style={styles.metricsCard}>
          {/* Col 1: ตรวจตรงเวลา */}
          <View style={styles.metricCol}>
            <View style={styles.metricValRow}>
              <Ionicons name="time-outline" size={20} color="#0C4A94" />
              <Text style={[styles.metricVal, { color: "#0C4A94" }]}>{onTimeCount}</Text>
            </View>
            <Text style={styles.metricLabel}>ตรวจตรงเวลา</Text>
          </View>

          <View style={styles.metricDivider} />

          {/* Col 2: ตรวจล่าช้า */}
          <View style={styles.metricCol}>
            <View style={styles.metricValRow}>
              <Ionicons name="alarm-outline" size={20} color="#EF4444" />
              <Text style={[styles.metricVal, { color: "#EF4444" }]}>{lateCount}</Text>
            </View>
            <Text style={styles.metricLabel}>ตรวจล่าช้า</Text>
          </View>

          <View style={styles.metricDivider} />

          {/* Col 3: ขาดตรวจ */}
          <View style={styles.metricCol}>
            <View style={styles.metricValRow}>
              <Ionicons name="close-circle-outline" size={20} color="#334155" />
              <Text style={[styles.metricVal, { color: "#334155" }]}>{missCount}</Text>
            </View>
            <Text style={styles.metricLabel}>ขาดตรวจ</Text>
          </View>
        </View>

        {/* 5. Achievement / Motivation Card */}
        <View style={styles.achievementCard}>
          <View style={styles.trophyWrap}>
            <Text style={styles.trophyEmoji}>🏆</Text>
          </View>
          <View style={styles.achievementContent}>
            <Text style={styles.achievementTitle}>รักษาผลงานได้ยอดเยี่ยม!</Text>
            <Text style={styles.achievementSub}>
              คุณอยู่ในระดับ <Text style={styles.highlightGreen}>ดีมาก</Text>
            </Text>
            <Text style={styles.achievementTip}>
              ทำต่อเนื่องแบบนี้ คุณจะมีคะแนนเต็ม 100 ได้ไม่ยากเลย!
            </Text>
          </View>
        </View>

        {/* 6. Action Button: ดูรายละเอียดและเกณฑ์การประเมิน */}
        <Pressable
          style={({ pressed }) => [styles.detailButton, pressed && styles.btnPressed]}
          onPress={() => router.push("/score-detail")}
        >
          <View style={styles.detailButtonLeft}>
            <Ionicons name="document-text-outline" size={22} color="#0C4A94" />
            <Text style={styles.detailButtonText}>ดูรายละเอียดคะแนนและประวัติการประเมิน</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#0C4A94" />
        </Pressable>
      </ScrollView>

      {/* Filter Dropdown Modal */}
      <Modal visible={showFilterDropdown} transparent animationType="fade">
        <Pressable style={styles.dropdownOverlay} onPress={() => setShowFilterDropdown(false)}>
          <View style={styles.dropdownCard}>
            <Text style={styles.dropdownHeaderTitle}>เลือกช่วงเวลาที่ต้องการดู</Text>
            {FILTER_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                style={({ pressed }) => [
                  styles.dropdownOption,
                  selectedFilter === opt.label && styles.dropdownOptionSelected,
                  pressed && styles.btnPressed
                ]}
                onPress={() => handleSelectFilterOption(opt)}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={18}
                  color={selectedFilter === opt.label ? "#0C4A94" : "#64748B"}
                />
                <Text
                  style={[
                    styles.dropdownOptionText,
                    selectedFilter === opt.label && styles.dropdownOptionTextSelected
                  ]}
                >
                  {opt.label}
                </Text>
                {selectedFilter === opt.label && (
                  <Ionicons name="checkmark" size={18} color="#0C4A94" />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Monthly Interactive Calendar Modal */}
      <ScoreCalendarModal
        visible={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scroll: {
    flex: 1
  },
  content: {
    paddingBottom: 24
  },

  // Hero Card
  heroCard: {
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 20,
    backgroundColor: "#0A4893",
    padding: 18,
    shadowColor: "#0A4893",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18
  },
  donutContainer: {
    alignItems: "center",
    justifyContent: "center"
  },
  donutRingOuter: {
    width: 106,
    height: 106,
    borderRadius: 53,
    borderWidth: 10,
    borderColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#083B79"
  },
  donutRingInner: {
    alignItems: "center",
    justifyContent: "center"
  },
  donutScoreText: {
    fontSize: 34,
    fontWeight: "900",
    color: "white",
    lineHeight: 38
  },
  donutSubText: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.75)",
    marginTop: -2
  },
  heroRightInfo: {
    flex: 1
  },
  heroLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13.5,
    fontWeight: "600"
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4
  },
  heroStatusText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#10B981"
  },
  heroBottomBanner: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  thumbIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center"
  },
  bannerText: {
    flex: 1,
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18
  },

  // Chart Card
  chartCard: {
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  chartTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  filterText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "700"
  },

  // 3-Column Metrics Card
  metricsCard: {
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 16,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  metricCol: {
    flex: 1,
    alignItems: "center"
  },
  metricValRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  metricVal: {
    fontSize: 22,
    fontWeight: "900"
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
    fontWeight: "600"
  },
  metricDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border
  },

  // Achievement / Motivation Card
  achievementCard: {
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: "#F0F7FF",
    borderWidth: 1,
    borderColor: "#CCE3FD",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  trophyWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2
  },
  trophyEmoji: {
    fontSize: 28
  },
  achievementContent: {
    flex: 1
  },
  achievementTitle: {
    fontSize: 14.5,
    fontWeight: "900",
    color: "#0F2E5C"
  },
  achievementSub: {
    fontSize: 12.5,
    color: "#334155",
    marginTop: 2,
    fontWeight: "600"
  },
  highlightGreen: {
    color: "#10B981",
    fontWeight: "900"
  },
  achievementTip: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 15
  },

  // Detail Button
  detailButton: {
    marginHorizontal: 14,
    marginTop: 14,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#0C4A94",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16
  },
  detailButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1
  },
  detailButtonText: {
    color: "#0C4A94",
    fontSize: 14,
    fontWeight: "800",
    flex: 1
  },

  // Filter Dropdown Modal
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(10, 20, 35, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20
  },
  dropdownCard: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    gap: 8
  },
  dropdownHeaderTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 6,
    paddingHorizontal: 4
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#F1F5F9"
  },
  dropdownOptionSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#93C5FD"
  },
  dropdownOptionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    flex: 1
  },
  dropdownOptionTextSelected: {
    color: "#0C4A94",
    fontWeight: "900"
  },

  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }]
  }
});
