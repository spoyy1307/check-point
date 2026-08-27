import React from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopBar from "../components/TopBar";
import { COLORS } from "../constants/colors";
import { useUserStore } from "../lib/userStore";
import { useCheckpointMobileStore } from "../lib/checkpointMobileStore";

export default function SupportSummaryScreen() {
  const insets = useSafeAreaInsets();
  const searchParams = useLocalSearchParams<{
    type?: string;
    detail?: string;
    ticketId?: string;
    time?: string;
    date?: string;
  }>();

  const userStore = useUserStore();
  const profile = userStore.getProfile();
  const cpStore = useCheckpointMobileStore();
  const factory = cpStore.getFactory();

  const ticketType = searchParams.type || "ปัญหาการสแกน QR Code";
  const ticketDetail =
    searchParams.detail || "สแกนแล้วไม่ติด ขึ้นข้อความแจ้งเตือนสีแดงในจุดตรวจที่ 3";
  const ticketId = searchParams.ticketId || "TKT-849201";
  const ticketTime =
    searchParams.time ||
    new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) + " น.";
  const ticketDate =
    searchParams.date ||
    new Date().toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

  const handleCallTechSupport = () => {
    Alert.alert(
      "ติดต่อทีมเทคนิคเร่งด่วน",
      "ต้องการโทรติดต่อฝ่ายเทคนิคและดูแลระบบ Check Point ที่หมายเลข 089-111-2233 ใช่หรือไม่?",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "โทรออก",
          onPress: () => {
            Linking.openURL("tel:0891112233").catch(() => {});
          }
        }
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <TopBar title="สรุปผลการแจ้งปัญหา" back onBack={() => router.replace("/(tabs)/menu")} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 36 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Hero Status Card (Matching Round & Emergency Summary Aesthetics) */}
        <View style={styles.heroCard}>
          {/* Glowing Green Donut Ring with Checkmark */}
          <View style={styles.donutRing}>
            <View style={styles.donutInner}>
              <Ionicons name="checkmark" size={36} color="#10B981" />
            </View>
          </View>

          {/* Right Info Section */}
          <View style={styles.heroInfo}>
            <Text style={styles.heroStatus}>ส่งรายงานปัญหาสำเร็จ</Text>
            <Text style={styles.heroTitle}>{ticketType}</Text>
            <Text style={styles.heroTicketText}>รหัสคำแจ้ง: #{ticketId}</Text>
            <View style={styles.heroBadge}>
              <Ionicons name="cloud-done-outline" size={14} color="#10B981" />
              <Text style={styles.heroBadgeText}>ส่งไปยังทีมเทคนิคแล้ว</Text>
            </View>
          </View>
        </View>

        {/* 2. Issue Details Breakdown Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardHeading}>ข้อมูลการแจ้งปัญหาการใช้งาน</Text>

          {/* Row 1: ประเภทปัญหา */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons name="alert-circle-outline" size={20} color="#0C4A94" />
              <Text style={styles.detailLabel}>ประเภทปัญหา</Text>
            </View>
            <Text style={[styles.detailValue, { color: "#0C4A94" }]}>{ticketType}</Text>
          </View>

          <View style={styles.divider} />

          {/* Row 2: วันและเวลา */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons name="time-outline" size={20} color="#64748B" />
              <Text style={styles.detailLabel}>วันและเวลาที่ส่ง</Text>
            </View>
            <Text style={styles.detailValue}>
              {ticketDate} • {ticketTime}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Row 3: ผู้แจ้งรายงาน */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons name="person-outline" size={20} color="#64748B" />
              <Text style={styles.detailLabel}>ผู้แจ้งรายงาน</Text>
            </View>
            <Text style={styles.detailValue}>
              {profile.name} (รหัส: {profile.employeeId})
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Row 4: สังกัดโรงงาน */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons name="business-outline" size={20} color="#64748B" />
              <Text style={styles.detailLabel}>สังกัดโรงงาน</Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={1}>
              {factory.name}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Row 5: รายละเอียดปัญหาที่ระบุ */}
          <View style={styles.detailTextSection}>
            <View style={styles.detailLeft}>
              <Ionicons name="document-text-outline" size={20} color="#0C4A94" />
              <Text style={styles.detailLabel}>รายละเอียดที่ท่านระบุ:</Text>
            </View>
            <View style={styles.detailTextBox}>
              <Text style={styles.detailTextContent}>{ticketDetail}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Row 6: สถานะการประมวลผล */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons name="shield-checkmark" size={20} color="#16A34A" />
              <Text style={styles.detailLabel}>สถานะระบบ</Text>
            </View>
            <View style={styles.statusPillGreen}>
              <Text style={styles.statusPillGreenText}>บันทึกเข้าระบบ SOC แล้ว ✓</Text>
            </View>
          </View>
        </View>

        {/* 3. Follow-up / Next Steps Card (ขั้นตอนการดำเนินงานของทีมงาน) */}
        <View style={styles.nextStepsCard}>
          <View style={styles.nextStepsHeader}>
            <Ionicons name="information-circle" size={22} color="#0C4A94" />
            <Text style={styles.nextStepsTitle}>ขั้นตอนการดำเนินงานของทีมงาน</Text>
          </View>

          <View style={styles.stepItemRow}>
            <View style={styles.stepNumberCircle}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepHeading}>รับเรื่องและบันทึก Log</Text>
              <Text style={styles.stepDesc}>
                ทีมเทคนิคได้รับข้อมูลปัญหาและ Log การทำงานของเครื่องเรียบร้อยแล้ว
              </Text>
            </View>
          </View>

          <View style={styles.stepItemRow}>
            <View style={styles.stepNumberCircle}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepHeading}>ตรวจสอบและแก้ไขปัญหา</Text>
              <Text style={styles.stepDesc}>
                เจ้าหน้าที่ไอทีจะดำเนินการตรวจสอบระบบและประสานงานกลับผ่านหัวหน้าชุด รปภ.
              </Text>
            </View>
          </View>

          <View style={styles.stepItemRow}>
            <View style={styles.stepNumberCircle}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepHeading}>แจ้งเตือนผลการแก้ไข</Text>
              <Text style={styles.stepDesc}>
                การอัปเดตสถานะจะส่งตรงถึงท่านผ่านระบบศูนย์การแจ้งเตือน (🔔)
              </Text>
            </View>
          </View>
        </View>

        {/* 4. Action Buttons */}
        <View style={styles.actionContainer}>
          {/* Primary Button: กลับสู่หน้าหลัก */}
          <Pressable
            style={({ pressed }) => [styles.btnPrimaryHome, pressed && styles.btnPressed]}
            onPress={() => router.replace("/(tabs)")}
          >
            <Ionicons name="home" size={20} color="white" />
            <Text style={styles.btnPrimaryHomeText}>กลับสู่หน้าหลัก</Text>
          </Pressable>

          {/* Secondary Button: ติดต่อทีมเทคนิคเพิ่มเติม */}
          <Pressable
            style={({ pressed }) => [styles.btnSecondaryContact, pressed && styles.btnPressed]}
            onPress={handleCallTechSupport}
          >
            <Ionicons name="call-outline" size={18} color="#0C4A94" />
            <Text style={styles.btnSecondaryContactText}>โทรติดต่อทีมเทคนิคเร่งด่วน</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F7FB"
  },
  scroll: {
    flex: 1
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14
  },

  // 1. Hero Card
  heroCard: {
    backgroundColor: "#0C4A94",
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#0C4A94",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16
  },
  donutRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(16, 185, 129, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#10B981"
  },
  donutInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  heroInfo: {
    flex: 1
  },
  heroStatus: {
    color: "#93C5FD",
    fontSize: 12.5,
    fontWeight: "700"
  },
  heroTitle: {
    color: "white",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 2,
    marginBottom: 2
  },
  heroTicketText: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "600"
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 6,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.4)"
  },
  heroBadgeText: {
    color: "#A7F3D0",
    fontSize: 11,
    fontWeight: "800"
  },

  // 2. Details Card
  detailsCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 14
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1
  },
  detailLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "700"
  },
  detailValue: {
    fontSize: 13.5,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "right",
    flex: 1
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9"
  },
  detailTextSection: {
    paddingVertical: 10
  },
  detailTextBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 8
  },
  detailTextContent: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 20,
    fontWeight: "600"
  },
  statusPillGreen: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#86EFAC"
  },
  statusPillGreenText: {
    color: "#16A34A",
    fontSize: 11.5,
    fontWeight: "800"
  },

  // 3. Next Steps Card
  nextStepsCard: {
    backgroundColor: "#F0F6FF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D0E2FF",
    marginBottom: 20,
    gap: 12
  },
  nextStepsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4
  },
  nextStepsTitle: {
    fontSize: 14.5,
    fontWeight: "900",
    color: "#0C4A94"
  },
  stepItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10
  },
  stepNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0C4A94",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1
  },
  stepNumberText: {
    color: "white",
    fontSize: 12,
    fontWeight: "900"
  },
  stepHeading: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A"
  },
  stepDesc: {
    fontSize: 11.5,
    color: "#475569",
    marginTop: 1,
    lineHeight: 16
  },

  // 4. Action Buttons
  actionContainer: {
    gap: 10
  },
  btnPrimaryHome: {
    backgroundColor: "#0C4A94",
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#0C4A94",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3
  },
  btnPrimaryHomeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900"
  },
  btnSecondaryContact: {
    backgroundColor: "white",
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#0C4A94",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  btnSecondaryContactText: {
    color: "#0C4A94",
    fontSize: 14,
    fontWeight: "800"
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }]
  }
});
