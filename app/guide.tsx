import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import TopBar from "../components/TopBar";

const guides = [
  {
    step: "1",
    icon: "time-outline" as const,
    color: "#0C4A94",
    title: "การลงเวลากะเข้า - ออก",
    desc: "เมื่อเริ่มปฏิบัติงาน ให้กดปุ่ม 'ลงเวลากะ' ที่หน้าหลัก ระบบจะบันทึกพิกัด GPS และเวลาเข้างาน เมื่อหมดกะให้กดยืนยันออกกะอีกครั้ง"
  },
  {
    step: "2",
    icon: "location-outline" as const,
    color: "#059669",
    title: "การตรวจจุดตรวจตามรอบ (8 จุด)",
    desc: "เลือกช่วงเวลาการตรวจในแต่ละรอบ เช่น รอบที่ 1 (20:00 - 22:00 น.) เดินไปยังจุดตรวจตามลำดับ 1 ถึง 8 และตรวจสอบพิกัด GPS ให้อยู่ในรัศมีที่กำหนด"
  },
  {
    step: "3",
    icon: "camera-outline" as const,
    color: "#D97706",
    title: "การถ่ายรูปภาพหลักฐาน",
    desc: "แตะที่กรอบกล้องเพื่อถ่ายภาพจุดตรวจหรือสภาพแวดล้อมให้เห็นชัดเจน โดยระบบจะแนบภาพถ่ายพร้อมเวลาและพิกัดลงในบันทึกผล"
  },
  {
    step: "4",
    icon: "warning-outline" as const,
    color: "#DC2626",
    title: "กรณีตรวจล่าช้า หรือติดภารกิจ",
    desc: "หากเกิดเหตุสุดวิสัยที่ทำให้ไม่สามารถตรวจตรงเวลาได้ ให้กดปุ่มสีแดง 'ตรวจล่าช้า / ระบุสาเหตุ' และเลือกเหตุผลเพื่อบันทึกเข้าระบบ"
  },
  {
    step: "5",
    icon: "alert-circle-outline" as const,
    color: "#DC2626",
    title: "การแจ้งเหตุฉุกเฉิน",
    desc: "หากพบเหตุร้าย อัคคีภัย หรืออุบัติเหตุ ให้ไปที่แท็บ 'แจ้งเหตุฉุกเฉิน' เพื่อโทรติดต่อศูนย์ควบคุม 24 ชม. และกดส่งพิกัดฉุกเฉินทันที"
  }
];

export default function GuideScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      <TopBar title="คู่มือการใช้งาน" back />

      <View style={styles.introCard}>
        <Ionicons name="book-outline" size={28} color="#0C4A94" />
        <View style={{ flex: 1 }}>
          <Text style={styles.introTitle}>คู่มือปฏิบัติหน้าที่ประจำวัน</Text>
          <Text style={styles.introSub}>
            ขั้นตอนและข้อปฏิบัติมาตรฐานสำหรับเจ้าหน้าที่รักษาความปลอดภัย
          </Text>
        </View>
      </View>

      <View style={styles.list}>
        {guides.map((item) => (
          <View key={item.step} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrap, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTag}>ขั้นตอนที่ {item.step}</Text>
                <Text style={styles.title}>{item.title}</Text>
              </View>
            </View>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
        ))}
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
    paddingBottom: 24
  },
  introCard: {
    marginHorizontal: 14,
    marginTop: 14,
    backgroundColor: "#EAF2FF",
    borderWidth: 1,
    borderColor: "#CCE0FA",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  introTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0C4A94"
  },
  introSub: {
    fontSize: 12,
    color: "#475569",
    marginTop: 2,
    lineHeight: 16
  },
  list: {
    paddingHorizontal: 14,
    marginTop: 14,
    gap: 12
  },
  card: {
    backgroundColor: "white",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  stepTag: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B"
  },
  title: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: 1
  },
  desc: {
    fontSize: 12.5,
    color: "#475569",
    lineHeight: 18
  }
});
