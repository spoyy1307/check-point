import React, { useEffect, useState } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopBar from "../components/TopBar";
import PrimaryButton from "../components/PrimaryButton";
import StatusCard from "../components/StatusCard";
import { COLORS } from "../constants/colors";
import { CHECKPOINT } from "../types/patrol";
import { GPSResult, readGPS } from "../lib/gps";

export default function CheckpointScreen() {
  const insets = useSafeAreaInsets();
  const { round = "1" } = useLocalSearchParams<{ round?: string }>();
  const [gps, setGps] = useState<GPSResult | null>(null);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = React.useRef<CameraView | null>(null);

  const refreshGPS = async () => {
    try {
      setLoadingGPS(true);
      const result = await readGPS(CHECKPOINT.latitude, CHECKPOINT.longitude, CHECKPOINT.radiusMeters);
      setGps(result);
    } catch (error) {
      Alert.alert("ไม่สามารถอ่าน GPS", "กรุณาเปิดตำแหน่งและลองใหม่อีกครั้ง");
    } finally {
      setLoadingGPS(false);
    }
  };

  useEffect(() => {
    refreshGPS();
  }, []);

  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert("ต้องอนุญาตกล้อง", "กรุณาอนุญาตให้แอปใช้กล้องเพื่อถ่ายหลักฐาน");
        return;
      }
    }
    setCameraOpen(true);
  };

  const takePhoto = async () => {
    const result = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
    if (result?.uri) {
      setPhoto(result.uri);
      setCameraOpen(false);
    }
  };

  const canSave = !!gps?.insideRadius && !!photo;

  const save = () => {
    if (!canSave) {
      Alert.alert(
        "ยังบันทึกไม่ได้",
        !gps?.insideRadius
          ? "กรุณาอยู่ในพื้นที่ตรวจสอบและตรวจ GPS ให้ผ่านก่อน"
          : "กรุณาถ่ายรูปหลักฐานก่อน"
      );
      return;
    }
    setSaved(true);
  };

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
      >
        <TopBar title={`ตรวจจุด : รอบที่ ${round}`} back />

        <View style={styles.pointCard}>
          <View style={styles.pointText}>
            <Ionicons name="location" size={28} color={COLORS.blue} />
            <View>
              <Text style={styles.title}>จุดตรวจที่ 1</Text>
              <Text style={styles.sub}>ประตูทางเข้าหลัก</Text>
            </View>
          </View>
          <View style={styles.badge}><Text style={styles.badgeText}>1/8 จุด</Text></View>
        </View>

        <StatusCard
          tone={gps?.insideRadius ? "success" : gps ? "warning" : "blue"}
          icon={gps?.insideRadius ? "checkmark-circle" : "locate-outline"}
          title={gps?.message ?? "กำลังตรวจ GPS..."}
          text={
            loadingGPS
              ? "กำลังอ่านตำแหน่งปัจจุบัน"
              : gps?.insideRadius
                ? `ความแม่นยำประมาณ ${Math.round(gps.accuracy ?? 0)} เมตร`
                : "ระบบจะเปิดปุ่มบันทึกเมื่อ GPS ผ่าน"
          }
        />

        <Pressable style={styles.gpsButton} onPress={refreshGPS} disabled={loadingGPS}>
          <Ionicons name="refresh" size={22} color={COLORS.blue} />
          <Text style={styles.gpsButtonText}>{loadingGPS ? "กำลังตรวจ..." : "ตรวจ GPS อีกครั้ง"}</Text>
        </Pressable>

        <View style={styles.timeCard}>
          <View><Text style={styles.muted}>เวลาที่ควรตรวจ</Text><Text style={styles.big}>20:00 น.</Text></View>
          <View style={styles.verticalLine} />
          <View><Text style={styles.muted}>เวลาปัจจุบัน</Text><Text style={styles.big}>20:02 น.</Text></View>
        </View>

        <Text style={styles.section}>ถ่ายรูปหลักฐาน</Text>
        <Pressable style={styles.cameraBox} onPress={openCamera}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photo} />
          ) : (
            <>
              <Ionicons name="camera-outline" size={52} color="#66768B" />
              <Text style={styles.cameraText}>แตะเพื่อถ่ายรูป</Text>
            </>
          )}
        </Pressable>

        <PrimaryButton
          title="บันทึกการตรวจจุด"
          icon="checkmark-circle-outline"
          onPress={save}
        />

        {saved && (
          <View style={styles.successPanel}>
            <Ionicons name="checkmark-circle" size={28} color={COLORS.green} />
            <View style={{ flex: 1 }}>
              <Text style={styles.successTitle}>✓ ตรวจจุดสำเร็จ</Text>
              <Text style={styles.successText}>บันทึกเวลา 20:02 น. • GPS ถูกต้อง • รูปหลักฐานบันทึกแล้ว</Text>
            </View>
          </View>
        )}

        <PrimaryButton
          tone="red"
          title="ทดสอบกรณีตรวจล่าช้า"
          icon="time-outline"
          onPress={() => router.push("/late")}
        />
      </ScrollView>

      <Modal visible={cameraOpen} animationType="slide">
        <View style={styles.cameraScreen}>
          <CameraView ref={cameraRef} facing="back" style={StyleSheet.absoluteFill} />
          <View
            style={[
              styles.cameraOverlay,
              {
                paddingTop: insets.top > 0 ? insets.top + 16 : 24,
                paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 32
              }
            ]}
          >
            <Pressable style={styles.closeCamera} onPress={() => setCameraOpen(false)}>
              <Ionicons name="close" size={30} color="white" />
            </Pressable>
            <Pressable style={styles.shutter} onPress={takePhoto}>
              <View style={styles.shutterInner} />
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  pointCard: { margin: 14, padding: 14, borderRadius: 15, backgroundColor: "white", borderWidth: 1, borderColor: COLORS.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pointText: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  title: { fontSize: 17, fontWeight: "900", color: COLORS.text },
  sub: { color: COLORS.muted, marginTop: 3 },
  badge: { backgroundColor: COLORS.blueSoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18 },
  badgeText: { color: COLORS.blue, fontWeight: "900", fontSize: 12 },
  gpsButton: { marginHorizontal: 14, marginBottom: 4, alignSelf: "flex-end", flexDirection: "row", alignItems: "center", gap: 6, padding: 8 },
  gpsButtonText: { color: COLORS.blue, fontWeight: "800" },
  timeCard: { marginHorizontal: 14, marginVertical: 8, padding: 14, borderRadius: 14, backgroundColor: "white", borderWidth: 1, borderColor: COLORS.border, flexDirection: "row", justifyContent: "space-around", textAlign: "center" },
  timeCardView: { alignItems: "center" },
  muted: { color: COLORS.muted, textAlign: "center" },
  big: { color: COLORS.text, fontWeight: "900", fontSize: 20, marginTop: 4, textAlign: "center" },
  verticalLine: { width: 1, backgroundColor: COLORS.border },
  section: { marginHorizontal: 14, marginTop: 12, marginBottom: 6, fontWeight: "900", color: COLORS.text },
  cameraBox: { height: 170, marginHorizontal: 14, borderRadius: 14, borderWidth: 2, borderStyle: "dashed", borderColor: "#AAB6C7", backgroundColor: "#ECF1F7", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  cameraText: { marginTop: 8, color: "#66768B", fontWeight: "800" },
  photo: { width: "100%", height: "100%" },
  successPanel: { margin: 14, padding: 14, borderRadius: 14, backgroundColor: COLORS.greenSoft, flexDirection: "row", gap: 10, alignItems: "flex-start" },
  successTitle: { color: COLORS.green, fontWeight: "900", fontSize: 16 },
  successText: { color: COLORS.text, marginTop: 4, fontSize: 12, lineHeight: 18 },
  cameraScreen: { flex: 1, backgroundColor: "black" },
  cameraOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "space-between", alignItems: "center", paddingVertical: 52 },
  closeCamera: { alignSelf: "flex-end", marginRight: 20, width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(0,0,0,.45)", alignItems: "center", justifyContent: "center" },
  shutter: { width: 76, height: 76, borderRadius: 38, backgroundColor: "white", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  shutterInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: COLORS.blue }
});
