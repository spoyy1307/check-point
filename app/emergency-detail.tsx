import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopBar from "../components/TopBar";
import StatusCard from "../components/StatusCard";
import { COLORS } from "../constants/colors";
import { useEmergencyStore } from "../lib/emergencyStore";
import { useUserStore } from "../lib/userStore";
import { useCheckpointMobileStore } from "../lib/checkpointMobileStore";

const MAX_PHOTOS = 50;

export default function EmergencyDetailScreen() {
  const insets = useSafeAreaInsets();
  const { title = "เหตุการณ์" } = useLocalSearchParams<{ title?: string }>();
  const emergencyStore = useEmergencyStore();
  const userStore = useUserStore();
  const profile = userStore.getProfile();
  const cpStore = useCheckpointMobileStore();
  const settings = cpStore.getSettings();

  // Real-time GPS of the incident scene
  const [incidentGps, setIncidentGps] = useState<{ latitude: number; longitude: number } | null>(null);

  // Multi-photo state (up to 50 photos)
  const [photos, setPhotos] = useState<string[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);
  const [detail, setDetail] = useState("");

  React.useEffect(() => {
    (async () => {
      try {
        const { granted } = await Location.requestForegroundPermissionsAsync();
        if (granted) {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High
          });
          setIncidentGps({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude
          });
        }
      } catch {}
    })();
  }, []);

  const addPhoto = (uri: string) => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert(
        "ถ่ายรูปครบจำนวนแล้ว",
        `สามารถถ่ายรูปหลักฐานได้สูงสุด ${MAX_PHOTOS} รูปต่อการแจ้งเหตุ`
      );
      return;
    }
    const nextPhotos = [...photos, uri];
    setPhotos(nextPhotos);
    setActivePhotoIndex(nextPhotos.length - 1);
  };

  const removePhoto = (index: number) => {
    Alert.alert("ลบรูปภาพ", "ต้องการลบรูปภาพนี้ใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบรูป",
        style: "destructive",
        onPress: () => {
          const nextPhotos = photos.filter((_, i) => i !== index);
          setPhotos(nextPhotos);
          setActivePhotoIndex(Math.max(0, index - 1));
        }
      }
    ]);
  };

  const openCamera = async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert(
        "ถ่ายรูปครบจำนวนแล้ว",
        `สามารถถ่ายรูปหลักฐานได้สูงสุด ${MAX_PHOTOS} รูปต่อการแจ้งเหตุ`
      );
      return;
    }

    Alert.alert(
      "ถ่ายรูปหลักฐาน",
      `เลือกวิธีการเพิ่มรูปภาพเหตุการณ์ (${photos.length}/${MAX_PHOTOS} รูป)`,
      [
        {
          text: "เปิดกล้องถ่ายรูป",
          onPress: async () => {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              Alert.alert("ต้องอนุญาตกล้อง", "กรุณาอนุญาตให้แอปใช้กล้องเพื่อถ่ายหลักฐาน");
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ["images"],
              quality: 0.85
            });
            if (!result.canceled && result.assets[0]?.uri) {
              addPhoto(result.assets[0].uri);
            }
          }
        },
        {
          text: "เลือกจากแกลเลอรี (เลือกได้หลายรูป)",
          onPress: async () => {
            const res = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              allowsMultipleSelection: true,
              selectionLimit: MAX_PHOTOS - photos.length,
              quality: 0.85
            });
            if (!res.canceled && res.assets.length > 0) {
              const newUris = res.assets.map((a) => a.uri);
              const combined = [...photos, ...newUris].slice(0, MAX_PHOTOS);
              setPhotos(combined);
              setActivePhotoIndex(combined.length - 1);
            }
          }
        },
        { text: "ยกเลิก", style: "cancel" }
      ]
    );
  };

  const submit = async () => {
    let lat = incidentGps?.latitude;
    let lng = incidentGps?.longitude;

    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      lat = loc.coords.latitude;
      lng = loc.coords.longitude;
    } catch {}

    const newInc = emergencyStore.createIncident({
      type: title,
      detail: detail,
      photos: photos,
      reporterName: profile.name,
      reporterId: profile.employeeId,
      latitude: lat || 16.8156,
      longitude: lng || 100.2620
    });

    router.push({
      pathname: "/emergency-summary",
      params: { id: newInc.id }
    });
  };

  const currentDisplayedPhoto = photos[activePhotoIndex] || photos[0];

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header */}
        <TopBar title="รายละเอียดเหตุ" back />

        {/* 2. Incident Type Card */}
        <View style={styles.eventCard}>
          <View style={styles.eventIconWrap}>
            <Ionicons name="warning" size={28} color={COLORS.red} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>ประเภทเหตุฉุกเฉิน</Text>
            <Text style={styles.eventTitle}>{title}</Text>
          </View>
        </View>

        {/* 3. GPS Ready Status Card */}
        <StatusCard
          tone="success"
          icon="location-outline"
          title="บันทึกตำแหน่ง GPS พร้อมแล้ว"
          text="ระบบจะบันทึกเวลาและตำแหน่งของผู้แจ้งอัตโนมัติ"
        />

        {/* 4. Incident Description Input */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.section}>รายละเอียดเหตุการณ์</Text>
        </View>
        <TextInput
          style={styles.input}
          multiline
          placeholder="อธิบายสถานที่และเหตุการณ์ที่พบอย่างละเอียด..."
          placeholderTextColor="#9AA4B3"
          value={detail}
          onChangeText={setDetail}
        />

        {/* 5. Photo Evidence Section (Multiple Photos up to 50) */}
        <View style={styles.photoSectionCard}>
          <View style={styles.photoHeaderRow}>
            <View style={styles.photoTitleWrap}>
              <Ionicons name="camera" size={18} color="#0C4A94" />
              <Text style={styles.photoSectionTitle}>ภาพหลักฐานเหตุการณ์</Text>
            </View>
            <View style={styles.photoCountPill}>
              <Text style={styles.photoCountPillText}>
                {photos.length} / {MAX_PHOTOS} รูป
              </Text>
            </View>
          </View>

          {photos.length > 0 ? (
            <View style={styles.photoContentWrap}>
              {/* Main Large Crisp Photo Preview */}
              <Pressable
                style={styles.mainPhotoBox}
                onPress={() => setFullscreenPhoto(currentDisplayedPhoto)}
              >
                <Image
                  source={{ uri: currentDisplayedPhoto }}
                  style={styles.mainPhotoImage}
                  resizeMode="cover"
                />

                {/* Top Floating Badge */}
                <View style={styles.photoTopBadge}>
                  <Ionicons name="images-outline" size={14} color="white" />
                  <Text style={styles.photoTopBadgeText}>
                    รูปที่ {activePhotoIndex + 1} จาก {photos.length}
                  </Text>
                </View>

                {/* Bottom Overlay Controls */}
                <View style={styles.photoBottomBar}>
                  <View style={styles.zoomHint}>
                    <Ionicons name="expand-outline" size={14} color="white" />
                    <Text style={styles.zoomHintText}>แตะเพื่อดูรูปขนาดเต็ม</Text>
                  </View>
                  <Pressable
                    style={styles.deletePhotoBtn}
                    onPress={() => removePhoto(activePhotoIndex)}
                  >
                    <Ionicons name="trash-outline" size={14} color="white" />
                    <Text style={styles.deletePhotoText}>ลบรูปนี้</Text>
                  </Pressable>
                </View>
              </Pressable>

              {/* Horizontal Scrollable Thumbnails Strip + Add Photo Button */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailStrip}
              >
                {/* Add Photo Button in Strip */}
                {photos.length < MAX_PHOTOS && (
                  <Pressable style={styles.addThumbnailBtn} onPress={openCamera}>
                    <Ionicons name="add-circle" size={24} color="#0C4A94" />
                    <Text style={styles.addThumbnailText}>+ ถ่ายเพิ่ม</Text>
                  </Pressable>
                )}

                {/* Photo Thumbnails */}
                {photos.map((uri, idx) => {
                  const isSelected = idx === activePhotoIndex;
                  return (
                    <Pressable
                      key={idx}
                      style={[styles.thumbWrap, isSelected && styles.thumbWrapActive]}
                      onPress={() => setActivePhotoIndex(idx)}
                    >
                      <Image source={{ uri }} style={styles.thumbImage} resizeMode="cover" />
                      <View style={styles.thumbBadge}>
                        <Text style={styles.thumbBadgeText}>{idx + 1}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : (
            /* Empty State - Large Dashed Box */
            <Pressable style={styles.cameraEmptyBox} onPress={openCamera}>
              <View style={styles.cameraIconCircle}>
                <Ionicons name="camera-outline" size={42} color="#0C4A94" />
              </View>
              <Text style={styles.cameraEmptyTitle}>กดเพื่อถ่ายรูปหลักฐาน</Text>
              <Text style={styles.cameraEmptySub}>
                ถ่ายภาพสถานที่เกิดเหตุและสภาพแวดล้อม (ถ่ายเพิ่มได้สูงสุด {MAX_PHOTOS} รูป)
              </Text>
            </Pressable>
          )}
        </View>

        {/* 6. Action Buttons */}
        <Pressable
          style={({ pressed }) => [styles.photoActionButton, pressed && styles.btnPressed]}
          onPress={openCamera}
        >
          <Ionicons name="camera-outline" size={22} color="white" />
          <Text style={styles.photoActionButtonText}>
            {photos.length > 0 ? `ถ่ายรูปเพิ่ม (${photos.length}/${MAX_PHOTOS})` : "ถ่ายรูปหลักฐาน"}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.submitButton, pressed && styles.btnPressed]}
          onPress={submit}
        >
          <Ionicons name="warning-outline" size={22} color="white" />
          <Text style={styles.submitButtonText}>ยืนยันการแจ้งเหตุ</Text>
        </Pressable>
      </ScrollView>

      {/* Fullscreen Photo Viewer Modal */}
      <Modal visible={!!fullscreenPhoto} transparent animationType="fade">
        <View style={styles.fullscreenModalBackdrop}>
          <View style={styles.fullscreenModalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fullscreenModalTitle}>ภาพหลักฐาน : {title}</Text>
              <Text style={styles.fullscreenModalSub}>
                รูปที่ {activePhotoIndex + 1} จาก {photos.length} รูป
              </Text>
            </View>
            <Pressable
              style={styles.fullscreenCloseBtn}
              onPress={() => setFullscreenPhoto(null)}
            >
              <Ionicons name="close" size={26} color="white" />
            </Pressable>
          </View>

          <View style={styles.fullscreenImageWrap}>
            {fullscreenPhoto && (
              <Image
                source={{ uri: fullscreenPhoto }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
            )}
          </View>

          {/* Bottom GPS & Incident Overlay Card (Controlled by Watermark Setting) */}
          {settings.watermarkEnabled && (
            <View style={styles.modalBottomCard}>
              <View style={styles.modalInfoRow}>
                <Ionicons name="warning" size={18} color="#EF4444" />
                <Text style={styles.modalInfoLabel}>เหตุการณ์:</Text>
                <Text style={[styles.modalInfoValue, { color: "#F87171", fontWeight: "900" }]}>
                  {title}
                </Text>
              </View>

              <View style={styles.modalInfoRow}>
                <Ionicons name="location" size={18} color="#10B981" />
                <Text style={styles.modalInfoLabel}>พิกัดจุดเกิดเหตุจริง:</Text>
                <Text style={styles.modalInfoValueGreen}>
                  {incidentGps?.latitude ? incidentGps.latitude.toFixed(4) : "16.8156"},{" "}
                  {incidentGps?.longitude ? incidentGps.longitude.toFixed(4) : "100.2620"}
                </Text>
              </View>

              <View style={styles.modalInfoRow}>
                <Ionicons name="time" size={18} color="#60A5FA" />
                <Text style={styles.modalInfoLabel}>เวลาบันทึก:</Text>
                <Text style={styles.modalInfoValue}>
                  {new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
                </Text>
              </View>

              <View style={styles.modalInfoRow}>
                <Ionicons name="person" size={18} color="#FBBF24" />
                <Text style={styles.modalInfoLabel}>ผู้แจ้งเหตุ:</Text>
                <Text style={styles.modalInfoValue}>
                  {profile.name} ({profile.employeeId})
                </Text>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background
  },

  // Event Card
  eventCard: {
    marginHorizontal: 14,
    marginTop: 14,
    marginBottom: 8,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  eventIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center"
  },
  label: {
    color: COLORS.muted,
    fontSize: 12.5,
    fontWeight: "600"
  },
  eventTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 2
  },

  // Section Headers
  sectionHeaderRow: {
    marginHorizontal: 14,
    marginTop: 14,
    marginBottom: 8
  },
  section: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 4
  },
  input: {
    marginHorizontal: 14,
    minHeight: 110,
    padding: 14,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    textAlignVertical: "top",
    fontSize: 15,
    color: COLORS.text,
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1
  },

  // Photo Section Card
  photoSectionCard: {
    marginHorizontal: 14,
    marginTop: 16,
    marginBottom: 10,
    borderRadius: 18,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  photoHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  photoTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  photoSectionTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: COLORS.text
  },
  photoCountPill: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10
  },
  photoCountPillText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#475569"
  },
  photoContentWrap: {
    gap: 12
  },
  mainPhotoBox: {
    width: "100%",
    height: 230,
    borderRadius: 16,
    backgroundColor: "#0F172A",
    overflow: "hidden",
    position: "relative"
  },
  mainPhotoImage: {
    width: "100%",
    height: "100%"
  },
  photoTopBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  photoTopBadgeText: {
    color: "white",
    fontSize: 11.5,
    fontWeight: "700"
  },
  photoBottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  zoomHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  zoomHintText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600"
  },
  deletePhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(220, 38, 38, 0.85)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8
  },
  deletePhotoText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700"
  },

  // Thumbnail Strip
  thumbnailStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4
  },
  addThumbnailBtn: {
    width: 68,
    height: 68,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#0C4A94",
    backgroundColor: "#F0F7FF",
    alignItems: "center",
    justifyContent: "center",
    gap: 3
  },
  addThumbnailText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0C4A94"
  },
  thumbWrap: {
    width: 68,
    height: 68,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    position: "relative"
  },
  thumbWrapActive: {
    borderColor: "#0C4A94",
    borderWidth: 2.5
  },
  thumbImage: {
    width: "100%",
    height: "100%"
  },
  thumbBadge: {
    position: "absolute",
    bottom: 3,
    right: 3,
    backgroundColor: "rgba(0,0,0,0.65)",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center"
  },
  thumbBadgeText: {
    color: "white",
    fontSize: 9.5,
    fontWeight: "800"
  },

  // Empty Box
  cameraEmptyBox: {
    minHeight: 180,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  cameraIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
  },
  cameraEmptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text
  },
  cameraEmptySub: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
    textAlign: "center"
  },

  // Action Buttons
  photoActionButton: {
    backgroundColor: "#0C4A94",
    minHeight: 54,
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 6,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#0C4A94",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3
  },
  photoActionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900"
  },
  submitButton: {
    backgroundColor: "#DC2626",
    minHeight: 54,
    marginHorizontal: 14,
    marginVertical: 6,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900"
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }]
  },

  // Fullscreen Photo Modal
  fullscreenModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.94)",
    justifyContent: "space-between",
    paddingVertical: 40
  },
  fullscreenModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20
  },
  fullscreenModalTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "800"
  },
  fullscreenModalSub: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    marginTop: 2
  },
  fullscreenCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10
  },
  fullscreenImageWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10
  },
  fullscreenImage: {
    width: "100%",
    height: "100%"
  },
  modalBottomCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    gap: 6
  },
  modalInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  modalInfoLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "600",
    minWidth: 120
  },
  modalInfoValue: {
    color: "white",
    fontSize: 13.5,
    fontWeight: "700",
    flex: 1
  },
  modalInfoValueGreen: {
    color: "#34D399",
    fontSize: 14,
    fontWeight: "900",
    flex: 1
  }
});
