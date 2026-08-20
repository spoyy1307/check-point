import React from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopBar from "../../components/TopBar";
import EmergencyOption from "../../components/EmergencyOption";
import EmergencyCallButton from "../../components/EmergencyCallButton";
import { COLORS } from "../../constants/colors";

const options = [
  { type: "fire", icon: "flame-outline" as const, tone: "red" as const, title: "ไฟไหม้", subtitle: "เหตุเพลิงไหม้ / ควัน / กลิ่นไหม้" },
  { type: "suspicious-object", icon: "cube-outline" as const, tone: "orange" as const, title: "วัตถุต้องสงสัย", subtitle: "พบวัตถุต้องสงสัย / สิ่งแปลกปลอม" },
  { type: "power", icon: "flash-outline" as const, tone: "yellow" as const, title: "ไฟฟ้าขัดข้อง", subtitle: "ไฟดับ / ระบบไฟฟ้ามีปัญหา" },
  { type: "equipment", icon: "construct-outline" as const, tone: "blue" as const, title: "อุปกรณ์ชำรุด", subtitle: "อุปกรณ์เสียหาย / ใช้งานไม่ได้" },
  { type: "person", icon: "person-remove-outline" as const, tone: "purple" as const, title: "บุคคลต้องสงสัย", subtitle: "พบบุคคลต้องสงสัย / พฤติกรรมน่าสงสัย" },
  { type: "other", icon: "ellipsis-horizontal-circle-outline" as const, tone: "gray" as const, title: "เหตุอื่นๆ", subtitle: "เหตุการณ์อื่นๆ ที่ไม่ได้ระบุข้างต้น" }
];

export default function EmergencyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
      showsVerticalScrollIndicator={false}
    >
      <TopBar title="แจ้งเหตุฉุกเฉิน" />
      <View style={styles.intro}>
        <Text style={styles.introTitle}>เลือกประเภทเหตุการณ์ที่ต้องการแจ้ง</Text>
        <Text style={styles.introSub}>ระบบจะบันทึกตำแหน่ง GPS และเวลาให้อัตโนมัติ</Text>
      </View>

      <View style={styles.list}>
        {options.map((item) => (
          <EmergencyOption
            key={item.type}
            icon={item.icon}
            tone={item.tone}
            title={item.title}
            subtitle={item.subtitle}
            onPress={() => router.push({ pathname: "/emergency-detail", params: { type: item.type, title: item.title } })}
          />
        ))}
      </View>

      <EmergencyCallButton />

      <View style={styles.footnote}>
        <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.muted} />
        <Text style={styles.footText}>ระบบจะบันทึกตำแหน่ง GPS และเวลาให้อัตโนมัติ</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  intro: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 8 },
  introTitle: { textAlign: "center", fontSize: 16, fontWeight: "900", color: COLORS.text },
  introSub: { textAlign: "center", color: COLORS.muted, marginTop: 4, fontSize: 12 },
  list: { paddingHorizontal: 14, gap: 8 },
  footnote: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, paddingTop: 6 },
  footText: { color: COLORS.muted, fontSize: 11 }
});
