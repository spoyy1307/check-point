import React, { useState } from "react";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopBar from "../components/TopBar";
import PrimaryButton from "../components/PrimaryButton";
import { COLORS } from "../constants/colors";

const reasons = ["เหตุสุดวิสัย", "ติดธุระ / งานอื่น", "ปัญหาการจราจร", "อื่นๆ"];

export default function LateScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState("");

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
      showsVerticalScrollIndicator={false}
    >
      <TopBar title="ตรวจล่าช้า" back />

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>ตรวจล่าช้า</Text>
        <Text style={styles.bannerSub}>เกินเวลาที่กำหนด</Text>
      </View>

      <View style={styles.compare}>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.muted}>เวลาที่ควรตรวจ</Text>
          <Text style={styles.value}>22:00 น.</Text>
        </View>
        <View style={styles.line} />
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.muted}>เวลาที่ตรวจจริง</Text>
          <Text style={styles.value}>22:15 น.</Text>
        </View>
      </View>
      <Text style={styles.lateText}>ล่าช้า <Text style={{ fontWeight: "900" }}>15 นาที</Text></Text>

      <Text style={styles.section}>สาเหตุการล่าช้า (เลือก 1 ข้อ)</Text>
      {reasons.map((item) => (
        <Pressable key={item} style={styles.radioRow} onPress={() => setSelected(item)}>
          <View style={[styles.radio, selected === item && styles.radioSelected]} />
          <Text style={styles.radioLabel}>{item}</Text>
        </Pressable>
      ))}

      <TextInput style={styles.input} placeholder="โปรดระบุสาเหตุเพิ่มเติม" placeholderTextColor="#9AA4B3" multiline />
      <PrimaryButton
        title="บันทึกสาเหตุ"
        icon="save-outline"
        onPress={() => {
          Alert.alert("บันทึกเรียบร้อย", "บันทึกสาเหตุการตรวจล่าช้าแล้ว", [
            { text: "ตกลง", onPress: () => router.back() }
          ]);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  banner: { margin: 14, padding: 16, backgroundColor: COLORS.orangeSoft, borderRadius: 14, borderWidth: 1, borderColor: "#F4C65A" },
  bannerTitle: { color: "#B86C00", fontSize: 18, fontWeight: "900" },
  bannerSub: { color: "#B86C00", marginTop: 3 },
  compare: { marginHorizontal: 14, padding: 14, backgroundColor: "white", borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, flexDirection: "row" },
  line: { width: 1, backgroundColor: COLORS.border },
  muted: { color: COLORS.muted },
  value: { color: COLORS.text, fontWeight: "900", fontSize: 18, marginTop: 4 },
  lateText: { textAlign: "center", color: COLORS.red, paddingVertical: 12 },
  section: { marginHorizontal: 14, marginBottom: 8, fontWeight: "900", color: COLORS.text },
  radioRow: { marginHorizontal: 14, paddingVertical: 13, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#94A0AF" },
  radioSelected: { borderColor: COLORS.blue, backgroundColor: COLORS.blue },
  radioLabel: { color: COLORS.text, fontSize: 15, fontWeight: "700" },
  input: { margin: 14, height: 92, backgroundColor: "white", borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12, textAlignVertical: "top" }
});
