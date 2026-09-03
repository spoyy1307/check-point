import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopBar from "../components/TopBar";
import PrimaryButton from "../components/PrimaryButton";
import { COLORS } from "../constants/colors";
import { usePatrolStore } from "../lib/patrolStore";

const reasons = ["เหตุสุดวิสัย", "ติดธุระ / งานอื่น", "ปัญหาการจราจร", "อื่นๆ"];

export default function LateScreen() {
  const insets = useSafeAreaInsets();
  const searchParams = useLocalSearchParams<{ round?: string; point?: string }>();
  const roundId = parseInt(searchParams.round || "1", 10);
  const pointIndex = parseInt(searchParams.point || "0", 10);

  const patrolStore = usePatrolStore();
  const round = patrolStore.getRound(roundId) || patrolStore.getRounds()[0];
  const checkpoint = round.checkpoints[pointIndex] || round.checkpoints[0];

  const [selectedReason, setSelectedReason] = useState(reasons[0]);
  const [extraDetail, setExtraDetail] = useState("");

  const handleSaveLate = () => {
    const finalReason = extraDetail ? `${selectedReason}: ${extraDetail}` : selectedReason;
    const result = patrolStore.completeCheckpoint(
      roundId,
      checkpoint.id,
      "late",
      checkpoint.photoUri || "",
      finalReason
    );

    Alert.alert("บันทึกเรียบร้อย", `บันทึกสาเหตุการตรวจล่าช้าสำหรับจุดที่ ${checkpoint.id} แล้ว`, [
      {
        text: "ตกลง",
        onPress: () => {
          if (result?.isRoundCompleted) {
            router.replace({
              pathname: "/checkpoint",
              params: { round: roundId.toString(), point: (round.checkpoints.length - 1).toString() }
            });
          } else {
            const nextIdx = Math.min(pointIndex + 1, round.checkpoints.length - 1);
            router.replace({
              pathname: "/checkpoint",
              params: { round: roundId.toString(), point: nextIdx.toString() }
            });
          }
        }
      }
    ]);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
      showsVerticalScrollIndicator={false}
    >
      <TopBar title={`ตรวจล่าช้า : จุดที่ ${checkpoint.id}`} back />

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>ตรวจล่าช้า</Text>
        <Text style={styles.bannerSub}>
          จุดที่ {checkpoint.id} - {checkpoint.name}
        </Text>
      </View>

      <View style={styles.compare}>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.muted}>เวลาที่ควรตรวจ</Text>
          <Text style={styles.value}>{checkpoint.scheduledTime}</Text>
        </View>
        <View style={styles.line} />
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.muted}>เวลาที่ตรวจจริง</Text>
          <Text style={styles.value}>{checkpoint.currentTime}</Text>
        </View>
      </View>
      <Text style={styles.lateText}>
        สถานะ: <Text style={{ fontWeight: "900" }}>บันทึกเป็นตรวจล่าช้า</Text>
      </Text>

      <Text style={styles.section}>สาเหตุการล่าช้า (เลือก 1 ข้อ)</Text>
      {reasons.map((item) => (
        <Pressable key={item} style={styles.radioRow} onPress={() => setSelectedReason(item)}>
          <View style={[styles.radio, selectedReason === item && styles.radioSelected]} />
          <Text style={styles.radioLabel}>{item}</Text>
        </Pressable>
      ))}

      <TextInput
        style={styles.input}
        placeholder="โปรดระบุสาเหตุเพิ่มเติม (ถ้ามี)"
        placeholderTextColor="#9AA4B3"
        value={extraDetail}
        onChangeText={setExtraDetail}
        multiline
      />

      <PrimaryButton
        title="บันทึกสาเหตุ"
        icon="save-outline"
        onPress={handleSaveLate}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  banner: {
    margin: 14,
    padding: 16,
    backgroundColor: COLORS.orangeSoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F4C65A"
  },
  bannerTitle: { color: "#B86C00", fontSize: 18, fontWeight: "900" },
  bannerSub: { color: "#B86C00", marginTop: 3 },
  compare: {
    marginHorizontal: 14,
    padding: 14,
    backgroundColor: "white",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row"
  },
  line: { width: 1, backgroundColor: COLORS.border },
  muted: { color: COLORS.muted },
  value: { color: COLORS.text, fontWeight: "900", fontSize: 18, marginTop: 4 },
  lateText: { textAlign: "center", color: COLORS.red, paddingVertical: 12 },
  section: { marginHorizontal: 14, marginBottom: 8, fontWeight: "900", color: COLORS.text },
  radioRow: {
    marginHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#94A0AF" },
  radioSelected: { borderColor: COLORS.blue, backgroundColor: COLORS.blue },
  radioLabel: { color: COLORS.text, fontSize: 15, fontWeight: "700" },
  input: {
    margin: 14,
    height: 92,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top"
  }
});
