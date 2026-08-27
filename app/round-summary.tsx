import React, { useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopBar from "../components/TopBar";
import { COLORS } from "../constants/colors";
import { usePatrolStore } from "../lib/patrolStore";
import { useUserStore } from "../lib/userStore";
import { useCheckpointMobileStore } from "../lib/checkpointMobileStore";
import { CheckpointItem } from "../types/patrol";

export default function RoundSummaryScreen() {
  const insets = useSafeAreaInsets();
  const searchParams = useLocalSearchParams<{ round?: string }>();
  const roundId = parseInt(searchParams.round || "1", 10);
  const patrolStore = usePatrolStore();
  const userStore = useUserStore();
  const profile = userStore.getProfile();
  const cpStore = useCheckpointMobileStore();
  const settings = cpStore.getSettings();

  const summary = patrolStore.getRoundSummary(roundId);

  // Photo viewer state
  const [showPhotosSection, setShowPhotosSection] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<{
    uri: string;
    pointName: string;
    pointId: number;
    photoIndex: number;
    totalInPoint: number;
    time: string;
    lat: number;
    lng: number;
  } | null>(null);

  const handleNextRound = () => {
    if (roundId < 4) {
      router.push({ pathname: "/checkpoint", params: { round: (roundId + 1).toString() } });
    } else {
      router.push("/(tabs)/patrol");
    }
  };

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Bar */}
        <TopBar title={`สรุปผลรอบที่ ${roundId}`} back />

        {/* 2. Top Donut Card */}
        <View style={styles.heroCard}>
          {/* Green Donut Progress Ring */}
          <View style={styles.donutRing}>
            <View style={styles.donutInner}>
              <Text style={styles.donutScore}>{summary.completedPoints}</Text>
              <Text style={styles.donutTotal}>/{summary.totalPoints} จุด</Text>
            </View>
          </View>

          {/* Right Info Section */}
          <View style={styles.heroInfo}>
            <Text style={styles.heroStatus}>
              {summary.isAllDone ? "ตรวจครบแล้ว" : "กำลังตรวจ"}
            </Text>
            <Text style={styles.heroTitle}>{summary.roundTitle}</Text>
            <Text style={styles.heroTime}>{summary.roundTime}</Text>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>
                {summary.isAllDone ? "ตรวจครบตามรอบ" : "อยู่ระหว่างตรวจ"}
              </Text>
            </View>
          </View>
        </View>

        {/* 3. Breakdown Stats Card */}
        <View style={styles.statsCard}>
          {/* On Time Row */}
          <View style={styles.statRow}>
            <View style={styles.statLeft}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.green} />
              <Text style={styles.statLabel}>ตรวจตรงเวลา</Text>
            </View>
            <Text style={[styles.statValue, { color: COLORS.green }]}>
              {summary.onTimeCount} จุด
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Late Row */}
          <View style={styles.statRow}>
            <View style={styles.statLeft}>
              <Ionicons name="time" size={24} color={COLORS.orange} />
              <Text style={styles.statLabel}>ตรวจล่าช้า</Text>
            </View>
            <Text style={[styles.statValue, { color: COLORS.orange }]}>
              {summary.lateCount} จุด
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Pending Row */}
          <View style={styles.statRow}>
            <View style={styles.statLeft}>
              <Ionicons name="help-circle" size={24} color={COLORS.muted} />
              <Text style={styles.statLabel}>ยังไม่ตรวจ</Text>
            </View>
            <Text style={[styles.statValue, { color: COLORS.text }]}>
              {summary.pendingCount} จุด
            </Text>
          </View>
        </View>

        {/* 4. Performance Card: ข้อมูลและประสิทธิภาพรอบนี้ (มีผู้ตรวจ & พิกัด GPS เหมือนฝั่งแจ้งเหตุ) */}
        <View style={styles.perfCard}>
          <Text style={styles.perfHeading}>ข้อมูลและประสิทธิภาพรอบนี้</Text>

          {/* ผู้ตรวจรอบ */}
          <View style={styles.perfRow}>
            <View style={styles.perfLabelWrap}>
              <Ionicons name="person-outline" size={16} color="#0C4A94" />
              <Text style={styles.perfLabel}>ผู้ตรวจรอบ</Text>
            </View>
            <Text style={styles.perfValueHighlight}>
              {profile.name} ({profile.employeeId})
            </Text>
          </View>

          {/* ตำแหน่ง GPS */}
          <View style={styles.perfRow}>
            <View style={styles.perfLabelWrap}>
              <Ionicons name="location-outline" size={16} color="#059669" />
              <Text style={styles.perfLabel}>ตำแหน่ง GPS</Text>
            </View>
            <Text style={styles.gpsValueText}>16.8156, 100.2620</Text>
          </View>

          <View style={styles.perfRowDivider} />

          {/* เวลาที่เริ่มรอบ */}
          <View style={styles.perfRow}>
            <View style={styles.perfLabelWrap}>
              <Ionicons name="play-outline" size={16} color={COLORS.muted} />
              <Text style={styles.perfLabel}>เวลาที่เริ่มรอบ</Text>
            </View>
            <Text style={styles.perfValue}>{summary.startTime}</Text>
          </View>

          {/* เวลาสิ้นสุดรอบ */}
          <View style={styles.perfRow}>
            <View style={styles.perfLabelWrap}>
              <Ionicons name="stop-outline" size={16} color={COLORS.muted} />
              <Text style={styles.perfLabel}>เวลาสิ้นสุดรอบ</Text>
            </View>
            <Text style={styles.perfValue}>{summary.endTime}</Text>
          </View>

          {/* รวมเวลาที่ตรวจ */}
          <View style={styles.perfRow}>
            <View style={styles.perfLabelWrap}>
              <Ionicons name="hourglass-outline" size={16} color={COLORS.muted} />
              <Text style={styles.perfLabel}>รวมเวลาที่ตรวจ</Text>
            </View>
            <Text style={styles.perfValue}>{summary.durationText}</Text>
          </View>
        </View>

        {/* 5. Evidence Photos Gallery Card (รูปภาพหลักฐานแต่ละจุดตรวจ พร้อมพิกัด GPS แต่ละจุด) */}
        <View style={styles.photoGalleryCard}>
          <Pressable
            style={styles.photoGalleryHeader}
            onPress={() => setShowPhotosSection(!showPhotosSection)}
          >
            <View style={styles.galleryHeaderLeft}>
              <Ionicons name="images" size={20} color="#0C4A94" />
              <View>
                <Text style={styles.galleryHeaderTitle}>รูปภาพหลักฐานการตรวจจุด</Text>
                <Text style={styles.galleryHeaderSub}>
                  รวมทั้งหมด {summary.totalPhotosCount} รูปภาพ
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
            <View style={styles.galleryListWrap}>
              {summary.checkpoints.map((point: CheckpointItem) => {
                const pointPhotos =
                  point.photos && point.photos.length > 0
                    ? point.photos
                    : point.photoUri
                    ? [point.photoUri]
                    : [];

                const lat = point.latitude || 16.8156;
                const lng = point.longitude || 100.2620;

                return (
                  <View key={point.id} style={styles.pointPhotoRow}>
                    {/* Point Header with GPS Tag */}
                    <View style={styles.pointPhotoHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.pointNameWrap}>
                          <Text style={styles.pointIndexTag}>จุดที่ {point.id}</Text>
                          <Text style={styles.pointNameText}>{point.name}</Text>
                        </View>
                        {/* Checkpoint GPS & Time Badge */}
                        <View style={styles.pointGpsRow}>
                          <Ionicons name="location" size={13} color="#059669" />
                          <Text style={styles.pointGpsText}>
                            {lat.toFixed(4)}, {lng.toFixed(4)} • ⏱️ {point.currentTime || "20:00 น."}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.pointPhotoCountTag}>
                        <Text style={styles.pointPhotoCountText}>
                          {pointPhotos.length > 0 ? `${pointPhotos.length} รูป` : "ไม่มีรูป"}
                        </Text>
                      </View>
                    </View>

                    {/* Horizontal Photo Thumbnails for this checkpoint */}
                    {pointPhotos.length > 0 ? (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.pointThumbnailStrip}
                      >
                        {pointPhotos.map((uri, pIdx) => (
                          <Pressable
                            key={pIdx}
                            style={styles.summaryThumbBox}
                            onPress={() =>
                              setSelectedPhoto({
                                uri,
                                pointName: point.name,
                                pointId: point.id,
                                photoIndex: pIdx,
                                totalInPoint: pointPhotos.length,
                                time: point.currentTime,
                                lat: lat,
                                lng: lng
                              })
                            }
                          >
                            <Image source={{ uri }} style={styles.summaryThumbImg} resizeMode="cover" />
                            <View style={styles.thumbIndexBadge}>
                              <Text style={styles.thumbIndexBadgeText}>{pIdx + 1}</Text>
                            </View>
                          </Pressable>
                        ))}
                      </ScrollView>
                    ) : (
                      <Text style={styles.noPhotoText}>- ยังไม่มีรูปภาพหลักฐานสำหรับจุดนี้ -</Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* 6. Bottom Action: ไปเลือกรอบถัดไป */}
        <Pressable
          style={({ pressed }) => [styles.nextButton, pressed && styles.btnPressed]}
          onPress={handleNextRound}
        >
          <Text style={styles.nextButtonText}>ไปเลือกรอบถัดไป</Text>
          <Ionicons name="arrow-forward" size={22} color="white" />
        </Pressable>
      </ScrollView>

      {/* Fullscreen Photo Modal from Summary with GPS & Inspector Info */}
      <Modal visible={!!selectedPhoto} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitleText}>
                จุดตรวจที่ {selectedPhoto?.pointId} : {selectedPhoto?.pointName}
              </Text>
              <Text style={styles.modalSubText}>
                รูปภาพที่ {(selectedPhoto?.photoIndex ?? 0) + 1} จาก {selectedPhoto?.totalInPoint} รูป
              </Text>
            </View>
            <Pressable style={styles.modalCloseBtn} onPress={() => setSelectedPhoto(null)}>
              <Ionicons name="close" size={26} color="white" />
            </Pressable>
          </View>

          {/* Large Image Box */}
          <View style={styles.modalImageBox}>
            {selectedPhoto?.uri && (
              <Image
                source={{ uri: selectedPhoto.uri }}
                style={styles.modalFullImage}
                resizeMode="contain"
              />
            )}
          </View>

          {/* Bottom GPS & Inspector Overlay Card (Controlled by Watermark Setting) */}
          {settings.watermarkEnabled && (
            <View style={styles.modalBottomCard}>
              <View style={styles.modalInfoRow}>
                <Ionicons name="location" size={18} color="#10B981" />
                <Text style={styles.modalInfoLabel}>พิกัด GPS:</Text>
                <Text style={styles.modalInfoValueGreen}>
                  {selectedPhoto?.lat.toFixed(4)}, {selectedPhoto?.lng.toFixed(4)}
                </Text>
              </View>

              <View style={styles.modalInfoRow}>
                <Ionicons name="time" size={18} color="#60A5FA" />
                <Text style={styles.modalInfoLabel}>เวลาบันทึก:</Text>
                <Text style={styles.modalInfoValue}>
                  {selectedPhoto?.time || "20:00 น."}
                </Text>
              </View>

              <View style={styles.modalInfoRow}>
                <Ionicons name="person" size={18} color="#FBBF24" />
                <Text style={styles.modalInfoLabel}>ผู้ตรวจ:</Text>
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
  content: {
    paddingBottom: 20
  },

  // 1. Top Donut Card
  heroCard: {
    marginHorizontal: 14,
    marginTop: 14,
    backgroundColor: "white",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  donutRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    borderColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FDF4"
  },
  donutInner: {
    alignItems: "center"
  },
  donutScore: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.text,
    lineHeight: 30
  },
  donutTotal: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: "700"
  },
  heroInfo: {
    flex: 1,
    justifyContent: "center"
  },
  heroStatus: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.green
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: 2
  },
  heroTime: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
    fontWeight: "600"
  },
  heroBadge: {
    backgroundColor: "#EAF2FF",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 6
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0C4A94"
  },

  // 2. Breakdown Stats Card
  statsCard: {
    marginHorizontal: 14,
    marginTop: 12,
    backgroundColor: "white",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14
  },
  statLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  statLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text
  },
  statValue: {
    fontSize: 16,
    fontWeight: "900"
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9"
  },

  // 3. Performance Card
  perfCard: {
    marginHorizontal: 14,
    marginTop: 12,
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
  perfHeading: {
    fontSize: 15.5,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 12
  },
  perfRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6
  },
  perfLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  perfLabel: {
    fontSize: 13.5,
    color: COLORS.muted,
    fontWeight: "700"
  },
  perfValue: {
    fontSize: 14.5,
    fontWeight: "800",
    color: COLORS.text
  },
  perfValueHighlight: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0C4A94"
  },
  gpsValueText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#059669"
  },
  perfRowDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 6
  },

  // 4. Photo Gallery Card
  photoGalleryCard: {
    marginHorizontal: 14,
    marginTop: 12,
    backgroundColor: "white",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1
  },
  photoGalleryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white"
  },
  galleryHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  galleryHeaderTitle: {
    fontSize: 14.5,
    fontWeight: "800",
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
    backgroundColor: "#F0F6FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0C4A94"
  },
  galleryListWrap: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FAFCFF"
  },
  pointPhotoRow: {
    marginBottom: 14,
    backgroundColor: "white",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  pointPhotoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  pointNameWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  pointIndexTag: {
    backgroundColor: "#0C4A94",
    color: "white",
    fontSize: 11,
    fontWeight: "800",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  pointNameText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text
  },
  pointGpsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3
  },
  pointGpsText: {
    fontSize: 11.5,
    color: "#059669",
    fontWeight: "700"
  },
  pointPhotoCountTag: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  pointPhotoCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B"
  },
  pointThumbnailStrip: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 4
  },
  summaryThumbBox: {
    width: 68,
    height: 68,
    borderRadius: 10,
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
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1
  },
  thumbIndexBadgeText: {
    color: "white",
    fontSize: 9.5,
    fontWeight: "800"
  },
  noPhotoText: {
    fontSize: 12,
    color: "#94A3B8",
    fontStyle: "italic",
    paddingVertical: 4
  },

  // 5. Next Round Button
  nextButton: {
    marginHorizontal: 14,
    marginTop: 16,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#0C4A94",
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
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900"
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }]
  },

  // Modal Fullscreen Photo Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.94)",
    justifyContent: "space-between",
    paddingTop: 48,
    paddingBottom: 28,
    paddingHorizontal: 16
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingBottom: 10
  },
  modalTitleText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800"
  },
  modalSubText: {
    color: "#94A3B8",
    fontSize: 12.5,
    marginTop: 2
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center"
  },
  modalImageBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10
  },
  modalFullImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12
  },
  modalBottomCard: {
    backgroundColor: "rgba(20, 30, 45, 0.88)",
    borderRadius: 16,
    padding: 14,
    gap: 8,
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
