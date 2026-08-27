import React, { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
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
import { useEmergencyStore } from "../lib/emergencyStore";
import { useCheckpointMobileStore } from "../lib/checkpointMobileStore";

export default function EmergencySummaryScreen() {
  const insets = useSafeAreaInsets();
  const searchParams = useLocalSearchParams<{ id?: string }>();
  const emergencyStore = useEmergencyStore();
  const cpStore = useCheckpointMobileStore();
  const settings = cpStore.getSettings();

  const incident =
    (searchParams.id ? emergencyStore.getIncidentById(searchParams.id) : null) ||
    emergencyStore.getLatestIncident() || {
      id: "EMG-001",
      type: "ไฟไหม้",
      detail: "เกิดเหตุเพลิงไหม้บริเวณด้านหลังอาคาร",
      time: "11:53 น.",
      date: "14 พ.ค. 2567",
      photos: [],
      reporterName: "พงษ์พล อุทกานต์ภัทรกุล",
      reporterId: "00123",
      latitude: 16.8156,
      longitude: 100.262,
      status: "transmitted" as const
    };

  const [showPhotosSection, setShowPhotosSection] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const handleCallSOC = () => {
    Linking.openURL("tel:191").catch(() => {
      Alert.alert("โทรออก", "เบอร์โทรศูนย์ควบคุม 24 ชม.: 191");
    });
  };

  const handleBackToEmergency = () => {
    router.replace("/(tabs)/emergency");
  };

  const selectedPhotoUri =
    selectedPhotoIndex !== null && incident.photos[selectedPhotoIndex]
      ? incident.photos[selectedPhotoIndex]
      : null;

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. TopBar */}
        <TopBar title="สรุปผลการแจ้งเหตุ" back />

        {/* 2. Hero Status Card (Red & Deep Tone Matching Round Summary) */}
        <View style={styles.heroCard}>
          {/* Warning Icon Ring */}
          <View style={styles.donutRing}>
            <View style={styles.donutInner}>
              <Ionicons name="warning" size={38} color="#DC2626" />
            </View>
          </View>

          {/* Right Info Section */}
          <View style={styles.heroInfo}>
            <Text style={styles.heroStatus}>บันทึกแจ้งเหตุสำเร็จ</Text>
            <Text style={styles.heroTitle}>{incident.type}</Text>
            <Text style={styles.heroTime}>เวลาที่แจ้ง: {incident.time}</Text>
            <View style={styles.heroBadge}>
              <Ionicons name="cloud-done-outline" size={14} color="#10B981" />
              <Text style={styles.heroBadgeText}>ส่งไปยังศูนย์ควบคุมแล้ว</Text>
            </View>
          </View>
        </View>

        {/* 3. Incident Details Breakdown Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardHeading}>ข้อมูลการแจ้งเหตุ</Text>

          {/* Row 1: ประเภทเหตุ */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
              <Text style={styles.detailLabel}>ประเภทเหตุ</Text>
            </View>
            <Text style={[styles.detailValue, { color: "#DC2626" }]}>{incident.type}</Text>
          </View>

          <View style={styles.divider} />

          {/* Row 2: วันและเวลา */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons name="time-outline" size={20} color="#0C4A94" />
              <Text style={styles.detailLabel}>วันและเวลาที่แจ้ง</Text>
            </View>
            <Text style={styles.detailValue}>
              {incident.date} {incident.time}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Row 3: ผู้แจ้งเหตุ */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons name="person-outline" size={20} color="#0C4A94" />
              <Text style={styles.detailLabel}>ผู้แจ้งเหตุ</Text>
            </View>
            <Text style={styles.detailValue}>
              {incident.reporterName} ({incident.reporterId})
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Row 4: พิกัด GPS จุดเกิดเหตุ */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons name="location-outline" size={20} color="#10B981" />
              <Text style={styles.detailLabel}>ตำแหน่ง GPS จุดเกิดเหตุ</Text>
            </View>
            <Text style={[styles.detailValue, { color: "#10B981", fontWeight: "900" }]}>
              {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
            </Text>
          </View>
        </View>

        {/* 4. Incident Note Card (รายละเอียดที่พิมพ์) */}
        <View style={styles.noteCard}>
          <View style={styles.noteHeader}>
            <Ionicons name="document-text-outline" size={20} color="#0C4A94" />
            <Text style={styles.noteHeaderTitle}>รายละเอียดเหตุการณ์ที่บันทึก</Text>
          </View>
          <Text style={styles.noteBodyText}>
            {incident.detail && incident.detail.trim().length > 0
              ? incident.detail
              : "ไม่ได้ระบุรายละเอียดเพิ่มเติม"}
          </Text>
        </View>

        {/* 5. Evidence Photos Gallery Card (เหมือนหน้าสรุปผลตรวจจุด) */}
        <View style={styles.photoGalleryCard}>
          <Pressable
            style={styles.photoGalleryHeader}
            onPress={() => setShowPhotosSection(!showPhotosSection)}
          >
            <View style={styles.galleryHeaderLeft}>
              <Ionicons name="images" size={20} color="#0C4A94" />
              <View>
                <Text style={styles.galleryHeaderTitle}>รูปภาพหลักฐานเหตุการณ์</Text>
                <Text style={styles.galleryHeaderSub}>
                  รวมทั้งหมด {incident.photos.length} รูปภาพ
                </Text>
              </View>
            </View>
            <View style={styles.toggleBtn}>
              <Text style={styles.toggleBtnText}>
                {showPhotosSection ? "ซ่อนรูปภาพ" : "กดดูรูปภาพ"}
              </Text>
              <Ionicons
                name={showPhotosSection ? "chevron-up" : "chevron-down"}
                size={18}
                color="#0C4A94"
              />
            </View>
          </Pressable>

          {showPhotosSection && (
            <View style={styles.galleryContentWrap}>
              {incident.photos.length > 0 ? (
                <View style={styles.photoGrid}>
                  {incident.photos.map((uri, idx) => (
                    <Pressable
                      key={idx}
                      style={styles.summaryThumbBox}
                      onPress={() => setSelectedPhotoIndex(idx)}
                    >
                      <Image source={{ uri }} style={styles.summaryThumbImg} resizeMode="cover" />
                      <View style={styles.thumbIndexBadge}>
                        <Text style={styles.thumbIndexBadgeText}>{idx + 1}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View style={styles.noPhotoBox}>
                  <Ionicons name="image-outline" size={32} color="#94A3B8" />
                  <Text style={styles.noPhotoText}>ไม่มีรูปภาพหลักฐานแนบในรายการนี้</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* 6. Action Buttons */}
        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.btnPressed]}
          onPress={handleBackToEmergency}
        >
          <Ionicons name="arrow-back-outline" size={22} color="white" />
          <Text style={styles.primaryButtonText}>กลับหน้าฉุกเฉิน</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.socCallButton, pressed && styles.btnPressed]}
          onPress={handleCallSOC}
        >
          <Ionicons name="call" size={20} color="#DC2626" />
          <Text style={styles.socCallButtonText}>โทรด่วนศูนย์ควบคุมความปลอดภัย 24 ชม.</Text>
        </Pressable>
      </ScrollView>

      {/* Fullscreen Photo Viewer Modal */}
      <Modal visible={selectedPhotoUri !== null} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitleText}>ภาพหลักฐาน : {incident.type}</Text>
              <Text style={styles.modalSubText}>
                รูปภาพที่ {(selectedPhotoIndex ?? 0) + 1} จาก {incident.photos.length} รูป
              </Text>
            </View>
            <Pressable style={styles.modalCloseBtn} onPress={() => setSelectedPhotoIndex(null)}>
              <Ionicons name="close" size={26} color="white" />
            </Pressable>
          </View>

          <View style={styles.modalImageContainer}>
            {selectedPhotoUri && (
              <Image
                source={{ uri: selectedPhotoUri }}
                style={styles.modalFullImage}
                resizeMode="contain"
              />
            )}
          </View>

          {/* Bottom GPS & Incident Overlay Card (Controlled by Watermark Setting) */}
          {settings.watermarkEnabled && (
            <View style={styles.modalBottomCard}>
              <View style={styles.modalInfoRow}>
                <Ionicons name="location" size={18} color="#10B981" />
                <Text style={styles.modalInfoLabel}>พิกัดจุดเกิดเหตุจริง:</Text>
                <Text style={styles.modalInfoValueGreen}>
                  {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                </Text>
              </View>

              <View style={styles.modalInfoRow}>
                <Ionicons name="time" size={18} color="#60A5FA" />
                <Text style={styles.modalInfoLabel}>เวลาบันทึก:</Text>
                <Text style={styles.modalInfoValue}>
                  {incident.date} {incident.time}
                </Text>
              </View>

              <View style={styles.modalInfoRow}>
                <Ionicons name="person" size={18} color="#FBBF24" />
                <Text style={styles.modalInfoLabel}>ผู้แจ้งเหตุ:</Text>
                <Text style={styles.modalInfoValue}>
                  {incident.reporterName} ({incident.reporterId})
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
  content: {
    paddingBottom: 24
  },

  // Hero Card
  heroCard: {
    marginHorizontal: 14,
    marginTop: 14,
    marginBottom: 10,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  donutRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 8,
    borderColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F5"
  },
  donutInner: {
    alignItems: "center",
    justifyContent: "center"
  },
  heroInfo: {
    flex: 1
  },
  heroStatus: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "900"
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 2
  },
  heroTime: {
    color: COLORS.muted,
    fontSize: 12.5,
    marginTop: 2
  },
  heroBadge: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#E7F7EE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  heroBadgeText: {
    color: "#109B55",
    fontSize: 11,
    fontWeight: "800"
  },

  // Details Card
  detailsCard: {
    marginHorizontal: 14,
    marginVertical: 6,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.border,
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
    marginBottom: 8
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  detailLabel: {
    color: COLORS.muted,
    fontSize: 13.5,
    fontWeight: "700"
  },
  detailSubLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "500",
    marginTop: 1
  },
  detailValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800"
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9"
  },

  // Note Card
  noteCard: {
    marginHorizontal: 14,
    marginVertical: 6,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8
  },
  noteHeaderTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text
  },
  noteBodyText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },

  // Photo Gallery Card
  photoGalleryCard: {
    marginHorizontal: 14,
    marginVertical: 6,
    borderRadius: 18,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  photoGalleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  galleryHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1
  },
  galleryHeaderTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text
  },
  galleryHeaderSub: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EAF2FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0C4A94"
  },
  galleryContentWrap: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9"
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  summaryThumbBox: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    position: "relative"
  },
  summaryThumbImg: {
    width: "100%",
    height: "100%"
  },
  thumbIndexBadge: {
    position: "absolute",
    bottom: 3,
    right: 3,
    backgroundColor: "rgba(0,0,0,0.65)",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  thumbIndexBadgeText: {
    color: "white",
    fontSize: 10.5,
    fontWeight: "800"
  },
  noPhotoBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 6
  },
  noPhotoText: {
    fontSize: 12.5,
    color: "#94A3B8"
  },

  // Primary Button
  primaryButton: {
    backgroundColor: "#0C4A94",
    minHeight: 54,
    marginHorizontal: 14,
    marginTop: 14,
    marginBottom: 6,
    borderRadius: 14,
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
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900"
  },
  socCallButton: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1.5,
    borderColor: "#DC2626",
    minHeight: 52,
    marginHorizontal: 14,
    marginVertical: 6,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  socCallButtonText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "800"
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }]
  },

  // Fullscreen Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.94)",
    justifyContent: "space-between",
    paddingVertical: 40
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20
  },
  modalTitleText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900"
  },
  modalSubText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    marginTop: 2
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10
  },
  modalImageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10
  },
  modalFullImage: {
    width: "100%",
    height: "100%"
  },
  modalBottomCard: {
    backgroundColor: "rgba(20, 30, 45, 0.88)",
    borderRadius: 16,
    padding: 14,
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)"
  },
  modalInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  modalInfoLabel: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "700"
  },
  modalInfoValue: {
    color: "white",
    fontSize: 13,
    fontWeight: "800"
  },
  modalInfoValueGreen: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "900"
  }
});
