import React, { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopBar from "../components/TopBar";
import PrimaryButton from "../components/PrimaryButton";
import StatusCard from "../components/StatusCard";
import { COLORS } from "../constants/colors";

export default function EmergencyDetailScreen() {
  const insets = useSafeAreaInsets();
  const { title = "เหตุการณ์" } = useLocalSearchParams<{ title?: string }>();
  const [photo, setPhoto] = useState<string | null>(null);
  const [detail, setDetail] = useState("");

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("ต้องอนุญาตกล้อง", "กรุณาอนุญาตให้แอปใช้กล้องเพื่อถ่ายหลักฐาน");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.7
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const submit = () => {
    Alert.alert("แจ้งเหตุสำเร็จ", `บันทึกเหตุ “${title}” พร้อมเวลาและตำแหน่ง GPS แล้ว`, [
      { text: "กลับหน้าฉุกเฉิน", onPress: () => router.replace("/(tabs)/emergency") }
    ]);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
      showsVerticalScrollIndicator={false}
    >
      <TopBar title="รายละเอียดเหตุ" back />

      <View style={styles.eventCard}>
        <Ionicons name="warning-outline" size={30} color={COLORS.red} />
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>ประเภทเหตุ</Text>
          <Text style={styles.eventTitle}>{title}</Text>
        </View>
      </View>

      <StatusCard
        tone="success"
        icon="location-outline"
        title="บันทึกตำแหน่ง GPS พร้อมแล้ว"
        text="ระบบจะบันทึกเวลาและตำแหน่งของผู้แจ้งอัตโนมัติ"
      />

      <Text style={styles.section}>รายละเอียดเหตุการณ์</Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="อธิบายสถานที่และเหตุการณ์ที่พบ"
        placeholderTextColor="#9AA4B3"
        value={detail}
        onChangeText={setDetail}
      />

      <Text style={styles.section}>ภาพหลักฐาน (ถ้ามี)</Text>
      <View style={styles.photoBox}>
        {photo ? <Image source={{ uri: photo }} style={styles.photo} /> : <Ionicons name="camera-outline" size={48} color="#68768B" />}
      </View>

      <PrimaryButton title={photo ? "ถ่ายรูปใหม่" : "ถ่ายรูปหลักฐาน"} icon="camera-outline" onPress={takePhoto} />
      <PrimaryButton tone="red" title="ยืนยันการแจ้งเหตุ" icon="warning-outline" onPress={submit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  eventCard: { margin: 14, padding: 15, borderRadius: 15, backgroundColor: "white", borderWidth: 1, borderColor: COLORS.border, flexDirection: "row", alignItems: "center", gap: 10 },
  label: { color: COLORS.muted, fontSize: 12 },
  eventTitle: { color: COLORS.text, fontSize: 21, fontWeight: "900", marginTop: 3 },
  section: { marginHorizontal: 14, marginTop: 12, marginBottom: 7, color: COLORS.text, fontWeight: "900" },
  input: { marginHorizontal: 14, height: 120, padding: 12, backgroundColor: "white", borderWidth: 1, borderColor: COLORS.border, borderRadius: 13, textAlignVertical: "top" },
  photoBox: { height: 160, marginHorizontal: 14, borderRadius: 14, backgroundColor: "#ECF1F7", borderWidth: 2, borderStyle: "dashed", borderColor: "#AAB6C7", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  photo: { width: "100%", height: "100%" }
});
