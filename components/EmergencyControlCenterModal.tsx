import React from "react";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface EmergencyControlCenterModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ContactPerson {
  id: string;
  name: string;
  role: string;
  phone: string;
  phoneDisplay: string;
  badge: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const CONTACT_OFFICERS: ContactPerson[] = [
  {
    id: "chief",
    name: "ร.ต.อ. สมศักดิ์ มั่นคงดี",
    role: "หัวหน้าชุด รปภ. ประจำกะ",
    phone: "0812345678",
    phoneDisplay: "081-234-5678",
    badge: "🛡️ ประจำการกะนี้",
    icon: "shield-checkmark",
    color: "#16A34A"
  },
  {
    id: "manager",
    name: "คุณเกียรติศักดิ์ เจริญผล",
    role: "ผจก. ฝ่ายความปลอดภัยและอาคาร (HSE)",
    phone: "0898765432",
    phoneDisplay: "089-876-5432",
    badge: "🏢 สแตนด์บาย 24 ชม.",
    icon: "business",
    color: "#16A34A"
  },
  {
    id: "technician",
    name: "วิชัย รักษ์สถาน",
    role: "หัวหน้าทีมช่างเทคนิค & ระบบดับเพลิง",
    phone: "0865554321",
    phoneDisplay: "086-555-4321",
    badge: "🔧 ประจำห้องควบคุมอาคาร",
    icon: "construct",
    color: "#16A34A"
  }
];

const EXTERNAL_HOTLINES = [
  {
    name: "ดับเพลิง / กู้ภัย",
    number: "199",
    icon: "flame",
    color: "#DC2626",
    bg: "#FEF2F2"
  },
  {
    name: "กู้ชีพ / พยาบาล",
    number: "1669",
    icon: "medkit",
    color: "#059669",
    bg: "#ECFDF5"
  },
  {
    name: "ตำรวจ / เหตุด่วน",
    number: "191",
    icon: "shield",
    color: "#2563EB",
    bg: "#EFF6FF"
  }
];

export default function EmergencyControlCenterModal({
  visible,
  onClose
}: EmergencyControlCenterModalProps) {
  const insets = useSafeAreaInsets();

  const handleMakeCall = (number: string, title: string) => {
    Alert.alert(
      "ยืนยันการโทรออกฉุกเฉิน",
      `ต้องการโทรติดต่อ "${title}"\nเบอร์: ${number} หรือไม่?`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "โทรออกทันที",
          style: "destructive",
          onPress: () => {
            Linking.openURL(`tel:${number}`).catch(() => {
              Alert.alert("ไม่สามารถโทรออกได้", `กรุณาโทรตรงที่เบอร์ ${number}`);
            });
          }
        }
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconWrap}>
                <Ionicons name="radio" size={20} color="#DC2626" />
              </View>
              <View>
                <Text style={styles.headerTitle}>ศูนย์ควบคุมความปลอดภัย (SOC)</Text>
                <Text style={styles.headerSub}>ศูนย์บัญชาการเหตุฉุกเฉินและประสานงาน 24 ชม.</Text>
              </View>
            </View>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* 1. Main SOC Command Center Hero Card */}
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroBadge}>
                  <View style={styles.heroGreenDot} />
                  <Text style={styles.heroBadgeText}>เจ้าหน้าที่พร้อมรับสาย 24 ชม.</Text>
                </View>
                <Ionicons name="headset" size={26} color="rgba(255,255,255,0.85)" />
              </View>

              <Text style={styles.heroTitle}>ศูนย์ปฏิบัติการกลาง SOC 24/7</Text>
              <Text style={styles.heroSub}>
                สายด่วนขอกำลังเสริม, แจ้งอัคคีภัย, หรือประสานงานเหตุฉุกเฉินระดับสูง
              </Text>

              {/* Direct Main Call Button */}
              <Pressable
                style={({ pressed }) => [styles.btnHeroCall, pressed && styles.btnPressed]}
                onPress={() => handleMakeCall("029998888", "ศูนย์ควบคุมกลาง SOC 24/7")}
              >
                <Ionicons name="call" size={20} color="#B91C1C" />
                <Text style={styles.btnHeroCallText}>โทรสายตรง SOC: 02-999-8888</Text>
              </Pressable>
            </View>

            {/* 2. Key Personnel Officers Section */}
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="people" size={18} color="#0C4A94" />
              <Text style={styles.sectionTitle}>ผู้รับผิดชอบประจำกะ / หัวหน้างาน</Text>
            </View>

            <View style={styles.officersList}>
              {CONTACT_OFFICERS.map((officer) => (
                <View key={officer.id} style={styles.officerCard}>
                  {/* Left Avatar Icon */}
                  <View style={styles.officerIconWrap}>
                    <Ionicons name={officer.icon} size={22} color="#16A34A" />
                  </View>

                  {/* Center Details */}
                  <View style={styles.officerInfo}>
                    <View style={styles.officerNameRow}>
                      <Text style={styles.officerName}>{officer.name}</Text>
                    </View>
                    <Text style={styles.officerRole}>{officer.role}</Text>
                    <View style={styles.officerBadgeRow}>
                      <Text style={styles.officerBadgeText}>{officer.badge}</Text>
                      <Text style={styles.officerPhoneText}>{officer.phoneDisplay}</Text>
                    </View>
                  </View>

                  {/* Right Call Action */}
                  <Pressable
                    style={({ pressed }) => [styles.btnOfficerCall, pressed && styles.btnPressed]}
                    onPress={() => handleMakeCall(officer.phone, `${officer.name} (${officer.role})`)}
                  >
                    <Ionicons name="call" size={18} color="white" />
                  </Pressable>
                </View>
              ))}
            </View>

            {/* 3. External Emergency Hotlines (199 / 1669 / 191) */}
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" />
              <Text style={styles.sectionTitle}>สายด่วนหน่วยงานภายนอก</Text>
            </View>

            <View style={styles.hotlinesRow}>
              {EXTERNAL_HOTLINES.map((item) => (
                <Pressable
                  key={item.number}
                  style={({ pressed }) => [
                    styles.hotlineCard,
                    { backgroundColor: item.bg, borderColor: item.color + "30" },
                    pressed && styles.btnPressed
                  ]}
                  onPress={() => handleMakeCall(item.number, item.name)}
                >
                  <View style={[styles.hotlineIconWrap, { backgroundColor: item.color }]}>
                    <Ionicons name={item.icon as any} size={18} color="white" />
                  </View>
                  <Text style={[styles.hotlineNumber, { color: item.color }]}>{item.number}</Text>
                  <Text style={styles.hotlineName} numberOfLines={1}>
                    {item.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Safety & GPS Notice */}
            <View style={styles.safetyNotice}>
              <Ionicons name="shield-checkmark" size={16} color="#059669" />
              <Text style={styles.safetyNoticeText}>
                พิกัด GPS ปัจจุบันและเวลาโทรจะถูกบันทึกเข้าระบบ SOC โดยอัตโนมัติ
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 20, 35, 0.65)",
    justifyContent: "flex-end"
  },
  sheet: {
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "90%",
    paddingTop: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0"
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1
  },
  headerIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center"
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A"
  },
  headerSub: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 1
  },
  closeBtn: {
    padding: 4
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 14
  },

  // 1. Hero SOC Card
  heroCard: {
    backgroundColor: "#B91C1C",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#B91C1C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10
  },
  heroGreenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#34D399"
  },
  heroBadgeText: {
    color: "#A7F3D0",
    fontSize: 11,
    fontWeight: "800"
  },
  heroTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.2
  },
  heroSub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16
  },
  btnHeroCall: {
    marginTop: 12,
    backgroundColor: "white",
    borderRadius: 14,
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4
  },
  btnHeroCallText: {
    color: "#B91C1C",
    fontSize: 14.5,
    fontWeight: "900"
  },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#334155"
  },

  // 2. Officers List
  officersList: {
    gap: 8
  },
  officerCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1
  },
  officerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center"
  },
  officerInfo: {
    flex: 1
  },
  officerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  officerName: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A"
  },
  officerRole: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 1
  },
  officerBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 3
  },
  officerBadgeText: {
    fontSize: 10.5,
    color: "#166534",
    fontWeight: "700",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6
  },
  officerPhoneText: {
    fontSize: 11,
    color: "#15803D",
    fontWeight: "800"
  },
  btnOfficerCall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2
  },

  // 3. External Hotlines
  hotlinesRow: {
    flexDirection: "row",
    gap: 8
  },
  hotlineCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    gap: 4
  },
  hotlineIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2
  },
  hotlineNumber: {
    fontSize: 17,
    fontWeight: "900"
  },
  hotlineName: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#475569"
  },

  // Safety Notice
  safetyNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0FDF4",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    marginTop: 4
  },
  safetyNoticeText: {
    fontSize: 11,
    color: "#166534",
    fontWeight: "700",
    flex: 1
  },

  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }]
  }
});
