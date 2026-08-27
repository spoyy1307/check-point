import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import TopBar from "../components/TopBar";

export default function ScoreDetailScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"summary" | "criteria" | "guidelines">("summary");

  const currentScore = 95;
  const targetScore = 100;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header */}
      <TopBar title="รายละเอียดคะแนนการปฏิบัติงาน" back />

      {/* 2. Formal Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroRow}>
          {/* Circular Score Gauge */}
          <View style={styles.donutMeter}>
            <View style={styles.donutCircleOuter}>
              <View style={styles.donutCircleInner}>
                <Text style={styles.donutScore}>{currentScore}</Text>
                <Text style={styles.donutMax}>/100</Text>
              </View>
            </View>
          </View>

          {/* Level Info */}
          <View style={styles.heroLevelInfo}>
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
              <Text style={styles.statusBadgeText}>ระดับดีเยี่ยม</Text>
            </View>
            <Text style={styles.heroTitle}>คะแนนการปฏิบัติงาน</Text>
            <Text style={styles.heroSub}>
              ผลการตรวจจุดประจำกะปัจจุบัน อยู่ในเกณฑ์มาตรฐานระดับสูง
            </Text>
          </View>
        </View>

        {/* Linear Progress Bar */}
        <View style={styles.progressBarSection}>
          <View style={styles.progressBarTrack}>
            <View
              style={[styles.progressBarFill, { width: `${(currentScore / targetScore) * 100}%` }]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progLabel}>70 (ผ่านเกณฑ์)</Text>
            <Text style={styles.progLabel}>80 (ระดับดี)</Text>
            <Text style={[styles.progLabel, { color: "#059669", fontWeight: "700" }]}>
              95 (ปัจจุบัน)
            </Text>
            <Text style={[styles.progLabel, { color: "#0C4A94", fontWeight: "800" }]}>
              100 (เต็ม)
            </Text>
          </View>
        </View>
      </View>

      {/* 3. Navigation Tabs (Formal Design) */}
      <View style={styles.tabNav}>
        <Pressable
          style={[styles.tabItem, activeTab === "summary" && styles.tabItemActive]}
          onPress={() => setActiveTab("summary")}
        >
          <Ionicons
            name="calculator-outline"
            size={17}
            color={activeTab === "summary" ? "#0C4A94" : COLORS.muted}
          />
          <Text style={[styles.tabItemText, activeTab === "summary" && styles.tabItemTextActive]}>
            การคิดคะแนน
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tabItem, activeTab === "criteria" && styles.tabItemActive]}
          onPress={() => setActiveTab("criteria")}
        >
          <Ionicons
            name="ribbon-outline"
            size={17}
            color={activeTab === "criteria" ? "#0C4A94" : COLORS.muted}
          />
          <Text style={[styles.tabItemText, activeTab === "criteria" && styles.tabItemTextActive]}>
            เกณฑ์ระดับคะแนน
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tabItem, activeTab === "guidelines" && styles.tabItemActive]}
          onPress={() => setActiveTab("guidelines")}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={17}
            color={activeTab === "guidelines" ? "#0C4A94" : COLORS.muted}
          />
          <Text style={[styles.tabItemText, activeTab === "guidelines" && styles.tabItemTextActive]}>
            แนวทางปฏิบัติ
          </Text>
        </Pressable>
      </View>

      {/* 4. Tab 1: การคำนวณคะแนนปัจจุบัน และ บันทึกการเพิ่ม/หักคะแนน */}
      {activeTab === "summary" && (
        <View style={styles.sectionWrap}>
          {/* Breakdown Table Card (สรุปรายการคะแนนประจำกะปัจจุบัน) */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>สรุปรายการคะแนนประจำกะ</Text>

            <View style={styles.tableRow}>
              <View style={styles.tableRowLeft}>
                <View style={[styles.dotIndicator, { backgroundColor: COLORS.green }]} />
                <View>
                  <Text style={styles.tableLabel}>ตรวจตรงเวลา</Text>
                  <Text style={styles.tableSubLabel}>28 จาก 30 จุดตรวจ</Text>
                </View>
              </View>
              <Text style={[styles.tableVal, { color: COLORS.green }]}>+90 คะแนน</Text>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableRowLeft}>
                <View style={[styles.dotIndicator, { backgroundColor: COLORS.red }]} />
                <View>
                  <Text style={styles.tableLabel}>ตรวจล่าช้า</Text>
                  <Text style={styles.tableSubLabel}>2 จุดตรวจ (หัก 2.5 คะแนน/จุด)</Text>
                </View>
              </View>
              <Text style={[styles.tableVal, { color: COLORS.red }]}>-5 คะแนน</Text>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableRowLeft}>
                <View style={[styles.dotIndicator, { backgroundColor: COLORS.muted }]} />
                <View>
                  <Text style={styles.tableLabel}>ขาดการตรวจจุด</Text>
                  <Text style={styles.tableSubLabel}>0 จุดตรวจ</Text>
                </View>
              </View>
              <Text style={styles.tableVal}>0 คะแนน</Text>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableRowLeft}>
                <View style={[styles.dotIndicator, { backgroundColor: "#0C4A94" }]} />
                <View>
                  <Text style={styles.tableLabel}>คะแนนความประพฤติและการลงเวลา</Text>
                  <Text style={styles.tableSubLabel}>บันทึกเข้ากะตรงเวลาและส่งรายงาน</Text>
                </View>
              </View>
              <Text style={[styles.tableVal, { color: COLORS.green }]}>+10 คะแนน</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>คะแนนรวมสุทธิ</Text>
              <Text style={styles.totalVal}>95 / 100 คะแนน</Text>
            </View>
          </View>

          {/* Rules Summary */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>ระเบียบการให้และหักคะแนน</Text>

            <View style={styles.ruleRow}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#059669" />
              <View style={{ flex: 1 }}>
                <Text style={styles.ruleTitle}>ตรวจตรงตามรอบเวลา</Text>
                <Text style={styles.ruleDesc}>ได้รับคะแนนมาตรฐานตามจำนวนจุดตรวจที่กำหนด</Text>
              </View>
            </View>

            <View style={styles.ruleRow}>
              <Ionicons name="alert-circle-outline" size={20} color="#D97706" />
              <View style={{ flex: 1 }}>
                <Text style={styles.ruleTitle}>ตรวจล่าช้าเกิน 15 นาที</Text>
                <Text style={styles.ruleDesc}>หัก 2.5 คะแนนต่อจุดตรวจ (สามารถระบุสาเหตุประกอบได้)</Text>
              </View>
            </View>

            <View style={styles.ruleRow}>
              <Ionicons name="close-circle-outline" size={20} color="#DC2626" />
              <View style={{ flex: 1 }}>
                <Text style={styles.ruleTitle}>ขาดการตรวจจุดตรวจ</Text>
                <Text style={styles.ruleDesc}>หัก 10 คะแนนต่อจุดตรวจ และมีรายงานแจ้งเตือนหัวหน้างาน</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 5. Tab 2: เกณฑ์ระดับคะแนนการประเมิน */}
      {activeTab === "criteria" && (
        <View style={styles.sectionWrap}>
          {/* Level 1: ดีเยี่ยม */}
          <View style={[styles.levelCard, styles.levelCardCurrent]}>
            <View style={styles.levelHeader}>
              <View style={styles.levelBadgeGreen}>
                <Ionicons name="shield-checkmark" size={20} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.levelTitleRow}>
                  <Text style={styles.levelTitle}>ระดับดีเยี่ยม</Text>
                  <View style={styles.currentTag}>
                    <Text style={styles.currentTagText}>ระดับปัจจุบัน</Text>
                  </View>
                </View>
                <Text style={styles.levelRange}>90 - 100 คะแนน</Text>
              </View>
            </View>
            <Text style={styles.levelDescription}>
              ปฏิบัติหน้าที่ตรวจจุดครบถ้วนตามกำหนดเวลา มีภาพถ่ายหลักฐานชัดเจน และมีความตรงต่อเวลาสม่ำเสมอ ได้รับการพิจารณาเบี้ยขยันประจำเดือน
            </Text>
          </View>

          {/* Level 2: ดี */}
          <View style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <View style={styles.levelBadgeBlue}>
                <Ionicons name="checkmark-done" size={20} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.levelTitle}>ระดับดี</Text>
                <Text style={styles.levelRange}>80 - 89 คะแนน</Text>
              </View>
            </View>
            <Text style={styles.levelDescription}>
              ปฏิบัติหน้าที่ตรวจจุดครบตามรอบมาตรฐาน มีความล่าช้าบางจุดตรวจ ผลการปฏิบัติงานผ่านเกณฑ์มาตรฐานของหน่วยงาน
            </Text>
          </View>

          {/* Level 3: พอใช้ */}
          <View style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <View style={styles.levelBadgeYellow}>
                <Ionicons name="information-circle" size={20} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.levelTitle}>ระดับพอใช้</Text>
                <Text style={styles.levelRange}>70 - 79 คะแนน</Text>
              </View>
            </View>
            <Text style={styles.levelDescription}>
              ผ่านเกณฑ์มาตรฐานขั้นต่ำ มีจุดตรวจล่าช้าหลายจุด ควรเพิ่มความระมัดระวังเรื่องการตรงต่อเวลาในรอบถัดไป
            </Text>
          </View>

          {/* Level 4: ต้องปรับปรุง */}
          <View style={[styles.levelCard, { borderColor: "#FECACA" }]}>
            <View style={styles.levelHeader}>
              <View style={styles.levelBadgeRed}>
                <Ionicons name="alert-circle" size={20} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.levelTitle, { color: "#DC2626" }]}>ระดับต้องปรับปรุง</Text>
                <Text style={styles.levelRange}>ต่ำกว่า 70 คะแนน</Text>
              </View>
            </View>
            <Text style={styles.levelDescription}>
              ตรวจไม่ครบตามรอบที่กำหนด หรือขาดการตรวจจุดตรวจ หัวหน้างานจะติดตามและทบทวนขั้นตอนการปฏิบัติหน้าที่
            </Text>
          </View>
        </View>
      )}

      {/* 6. Tab 3: แนวทางการปฏิบัติงาน */}
      {activeTab === "guidelines" && (
        <View style={styles.sectionWrap}>
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>แนวทางรักษาคะแนนเต็ม 100</Text>

            <View style={styles.guideStep}>
              <View style={styles.guideStepNumber}>
                <Text style={styles.guideStepNumberText}>1</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.guideTitle}>เริ่มตรวจตามรอบเวลาที่กำหนด</Text>
                <Text style={styles.guideDesc}>
                  ตรวจสอบตารางเวลาของแต่ละรอบ และเริ่มตรวจจุดที่ 1 ภายในเวลาที่กำหนดเพื่อหลีกเลี่ยงการบันทึกล่าช้า
                </Text>
              </View>
            </View>

            <View style={styles.guideStep}>
              <View style={styles.guideStepNumber}>
                <Text style={styles.guideStepNumberText}>2</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.guideTitle}>ตรวจสอบพิกัด GPS ในพื้นที่</Text>
                <Text style={styles.guideDesc}>
                  ตรวจสอบสถานะ GPS ให้ขึ้นแถบสีเขียว "อยู่ในพื้นที่ตรวจสอบ" ก่อนกดยืนยันบันทึกผล
                </Text>
              </View>
            </View>

            <View style={styles.guideStep}>
              <View style={styles.guideStepNumber}>
                <Text style={styles.guideStepNumberText}>3</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.guideTitle}>ถ่ายภาพหลักฐานให้ชัดเจน</Text>
                <Text style={styles.guideDesc}>
                  ถ่ายภาพบริเวณจุดตรวจและทรัพย์สินให้อยู่ในมุมมองที่ชัดเจนและมีแสงสว่างเพียงพอ
                </Text>
              </View>
            </View>

            <View style={styles.guideStep}>
              <View style={styles.guideStepNumber}>
                <Text style={styles.guideStepNumberText}>4</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.guideTitle}>ระบุสาเหตุหากเกิดเหตุสุดวิสัย</Text>
                <Text style={styles.guideDesc}>
                  หากติดภารกิจระงับเหตุหรือมีเหตุจำเป็นที่ทำให้ตรวจล่าช้า ให้กดปุ่ม "ตรวจล่าช้า / ระบุสาเหตุ" เพื่อบันทึกข้อมูลเข้าระบบทันที
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  content: {
    paddingBottom: 24
  },

  // Hero Card
  heroCard: {
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16
  },
  donutMeter: {
    alignItems: "center",
    justifyContent: "center"
  },
  donutCircleOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 8,
    borderColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FDF4"
  },
  donutCircleInner: {
    alignItems: "center"
  },
  donutScore: {
    fontSize: 30,
    fontWeight: "900",
    color: "#0F172A",
    lineHeight: 32
  },
  donutMax: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
    marginTop: -2
  },
  heroLevelInfo: {
    flex: 1
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0"
  },
  statusBadgeText: {
    color: "#059669",
    fontSize: 12,
    fontWeight: "800"
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: 6
  },
  heroSub: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
    lineHeight: 17
  },
  progressBarSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9"
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
    overflow: "hidden"
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#10B981"
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6
  },
  progLabel: {
    fontSize: 10.5,
    color: "#94A3B8",
    fontWeight: "600"
  },

  // Navigation Tabs
  tabNav: {
    marginHorizontal: 14,
    marginTop: 14,
    flexDirection: "row",
    backgroundColor: "#E8EEF5",
    padding: 4,
    borderRadius: 14,
    gap: 4
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    borderRadius: 10
  },
  tabItemActive: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2
  },
  tabItemText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "700"
  },
  tabItemTextActive: {
    color: "#0C4A94",
    fontWeight: "900"
  },

  // Section Wrap
  sectionWrap: {
    paddingHorizontal: 14,
    marginTop: 14,
    gap: 12
  },

  // Card
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 14
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  tableRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  tableLabel: {
    color: COLORS.text,
    fontSize: 13.5,
    fontWeight: "700"
  },
  tableSubLabel: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2
  },
  tableVal: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    marginTop: 4
  },
  totalLabel: {
    fontSize: 14.5,
    fontWeight: "900",
    color: COLORS.text
  },
  totalVal: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0C4A94"
  },

  // Rule Row
  ruleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  ruleTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: COLORS.text
  },
  ruleDesc: {
    fontSize: 11.5,
    color: COLORS.muted,
    marginTop: 2,
    lineHeight: 16
  },

  // Levels
  levelCard: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 10,
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1
  },
  levelCardCurrent: {
    borderColor: "#10B981",
    borderWidth: 1.5,
    backgroundColor: "#FBFDFB"
  },
  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  levelBadgeGreen: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center"
  },
  levelBadgeBlue: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center"
  },
  levelBadgeYellow: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center"
  },
  levelBadgeRed: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center"
  },
  levelTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  levelTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text
  },
  currentTag: {
    backgroundColor: "#059669",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  currentTagText: {
    color: "white",
    fontSize: 10,
    fontWeight: "800"
  },
  levelRange: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
    fontWeight: "600"
  },
  levelDescription: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 10
  },

  // Guidelines Steps
  guideStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  guideStepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#0C4A94",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1
  },
  guideStepNumberText: {
    color: "white",
    fontSize: 12,
    fontWeight: "900"
  },
  guideTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: COLORS.text
  },
  guideDesc: {
    fontSize: 11.5,
    color: COLORS.muted,
    marginTop: 3,
    lineHeight: 16
  }
});
