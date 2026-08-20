import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopBar from "../components/TopBar";
import PrimaryButton from "../components/PrimaryButton";
import StatusCard from "../components/StatusCard";
import { COLORS } from "../constants/colors";

export default function ShiftScreen() {
  const insets = useSafeAreaInsets();
  const [checkedIn, setCheckedIn] = useState(true);

  const handleShift = () => {
    setCheckedIn((v) => !v);
    Alert.alert(checkedIn ? "ลงเวลาออกกะแล้ว" : "ลงเวลาเข้ากะแล้ว");
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
      showsVerticalScrollIndicator={false}
    >
      <TopBar title="ลงเวลากะ" back />
      <Text style={styles.section}>ข้อมูลการลงกะ</Text>

      <View style={styles.card}>
        <Text style={styles.bold}>14 พ.ค. 2567</Text>
        <Text style={styles.muted}>กะดึก • 20:00 - 08:00 น.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.label}>เวลาเข้า</Text>
            <Text style={styles.time}>{checkedIn ? "20:01 น." : "ยังไม่ได้ลงเวลา"}</Text>
            <Text style={styles.muted}>14 พ.ค. 2567</Text>
          </View>
          {checkedIn && <View style={styles.badge}><Text style={styles.badgeText}>ลงเวลาแล้ว ✓</Text></View>}
        </View>
        <View style={styles.divider} />
        <View>
          <Text style={styles.label}>เวลาออก</Text>
          <Text style={styles.timeSmall}>{checkedIn ? "ยังไม่ได้ลงเวลาออก" : "-"}</Text>
        </View>
      </View>

      <PrimaryButton
        tone="green"
        icon={checkedIn ? "log-out-outline" : "time-outline"}
        title={checkedIn ? "ลงเวลาออกกะ" : "ลงเวลาเข้ากะ"}
        onPress={handleShift}
      />

      <StatusCard
        tone="blue"
        icon="location-outline"
        title="ระบบตรวจสอบ GPS และเวลา"
        text="บันทึกสถานที่และเวลาการลงกะอัตโนมัติ"
      />

      <PrimaryButton
        title="ไปเลือกรอบตรวจ"
        icon="arrow-forward-outline"
        onPress={() => router.push("/rounds")}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  section: { marginHorizontal: 16, marginTop: 16, marginBottom: 8, fontWeight: "900", color: COLORS.text, fontSize: 16 },
  card: { marginHorizontal: 14, marginVertical: 6, padding: 16, backgroundColor: "white", borderRadius: 15, borderWidth: 1, borderColor: COLORS.border },
  bold: { fontWeight: "900", color: COLORS.text },
  label: { color: COLORS.muted },
  time: { fontSize: 24, fontWeight: "900", color: COLORS.green, marginTop: 4 },
  timeSmall: { fontSize: 20, fontWeight: "900", color: COLORS.text, marginTop: 4 },
  muted: { color: COLORS.muted, marginTop: 4 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 14 },
  badge: { backgroundColor: COLORS.greenSoft, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 18 },
  badgeText: { color: COLORS.green, fontWeight: "900", fontSize: 12 }
});
