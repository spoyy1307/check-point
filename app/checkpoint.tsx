import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopBar from "../components/TopBar";
import PatrolRouteMap from "../components/PatrolRouteMap";
import { COLORS } from "../constants/colors";
import { CHECKPOINT } from "../types/patrol";
import { GPSResult, readGPS } from "../lib/gps";
import { usePatrolStore } from "../lib/patrolStore";
import { useUserStore } from "../lib/userStore";
import { useCheckpointMobileStore } from "../lib/checkpointMobileStore";
import { soundHelper } from "../lib/soundHelper";

const MAX_PHOTOS = 50;

export default function CheckpointScreen() {
  const insets = useSafeAreaInsets();
  const searchParams = useLocalSearchParams<{ round?: string; point?: string }>();
  const roundId = parseInt(searchParams.round || "1", 10);
  const patrolStore = usePatrolStore();
  const userStore = useUserStore();
  const profile = userStore.getProfile();
  const cpStore = useCheckpointMobileStore();
  const settings = cpStore.getSettings();

  const round = patrolStore.getRound(roundId) || patrolStore.getRounds()[0];
  const checkpoints = round.checkpoints;

  // Active checkpoint index (0-indexed)
  const initialPointParam = parseInt(searchParams.point || "0", 10);
  const [activePointIndex, setActivePointIndex] = useState(
    initialPointParam >= 0 && initialPointParam < checkpoints.length ? initialPointParam : 0
  );

  const currentPoint = checkpoints[activePointIndex] || checkpoints[0];

  // GPS & Map State
  const [showMapModal, setShowMapModal] = useState(false);
  const [gps, setGps] = useState<GPSResult | null>({
    granted: true,
    insideRadius: true,
    distanceMeters: 12,
    accuracy: 8,
    message: "อยู่ในพื้นที่ตรวจสอบ"
  });
  const [gpsStateIndex, setGpsStateIndex] = useState<number>(0);
  const [loadingGPS, setLoadingGPS] = useState(false);

  // Photos State (up to 50 photos)
  const [photos, setPhotos] = useState<string[]>(
    currentPoint.photos && currentPoint.photos.length > 0
      ? currentPoint.photos
      : currentPoint.photoUri
      ? [currentPoint.photoUri]
      : []
  );
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = React.useRef<CameraView | null>(null);

  // Completion Modal State
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Sync photos when active point changes
  useEffect(() => {
    const pointPhotos =
      currentPoint.photos && currentPoint.photos.length > 0
        ? currentPoint.photos
        : currentPoint.photoUri
        ? [currentPoint.photoUri]
        : [];
    setPhotos(pointPhotos);
    setActivePhotoIndex(0);
  }, [activePointIndex, currentPoint]);

  const refreshGPS = async () => {
    try {
      setLoadingGPS(true);
      const nextIndex = (gpsStateIndex + 1) % 3;
      setGpsStateIndex(nextIndex);

      try {
        const result = await readGPS(
          currentPoint.latitude || CHECKPOINT.latitude,
          currentPoint.longitude || CHECKPOINT.longitude,
          currentPoint.radiusMeters || CHECKPOINT.radiusMeters
        );
        if (result) {
          setGps(result);
        }
      } catch {
        if (nextIndex === 0) {
          setGps({
            granted: true,
            insideRadius: true,
            distanceMeters: 10,
            accuracy: 5,
            message: "อยู่ในพื้นที่ตรวจสอบ"
          });
        } else if (nextIndex === 1) {
          setGps({
            granted: true,
            insideRadius: false,
            distanceMeters: 25,
            accuracy: 12,
            message: "ยังไม่ถึงจุดตรวจ"
          });
        } else {
          setGps(null);
        }
      }
    } finally {
      setLoadingGPS(false);
    }
  };

  const addPhoto = (uri: string) => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert(
        "ถ่ายรูปครบจำนวนแล้ว",
        `สามารถถ่ายรูปหลักฐานได้สูงสุด ${MAX_PHOTOS} รูปต่อจุดตรวจ`
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
        `สามารถถ่ายรูปหลักฐานได้สูงสุด ${MAX_PHOTOS} รูปต่อจุดตรวจ`
      );
      return;
    }

    Alert.alert("ถ่ายรูปหลักฐาน", `เลือกวิธีการเพิ่มรูปภาพ (${photos.length}/${MAX_PHOTOS} รูป)`, [
      {
        text: "เปิดกล้องถ่ายรูป",
        onPress: async () => {
          if (!permission?.granted) {
            const result = await requestPermission();
            if (!result.granted) {
              Alert.alert("ต้องอนุญาตกล้อง", "กรุณาอนุญาตให้แอปใช้กล้องเพื่อถ่ายหลักฐาน");
              return;
            }
          }
          setCameraOpen(true);
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
      {
        text: "ใช้รูปจำลอง (ทดสอบ)",
        onPress: () => {
          const demoUrls = [
            "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80"
          ];
          const demoPick = demoUrls[photos.length % demoUrls.length];
          addPhoto(demoPick);
        }
      },
      { text: "ยกเลิก", style: "cancel" }
    ]);
  };

  const takePhoto = async () => {
    const result = await cameraRef.current?.takePictureAsync({ quality: 0.85 });
    if (result?.uri) {
      addPhoto(result.uri);
      setCameraOpen(false);
    }
  };

  const handleSaveCheckpoint = () => {
    // Complete checkpoint in store with all photos
    const savePhotos =
      photos.length > 0
        ? photos
        : ["https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80"];

    const result = patrolStore.completeCheckpoint(
      roundId,
      currentPoint.id,
      "on_time",
      savePhotos
    );

    if (!result) return;

    // Play scan confirmation sound + haptic feedback
    soundHelper.playSound("beep");

    if (result.isRoundCompleted) {
      setShowCompletionModal(true);
    } else {
      const nextIndex = Math.min(activePointIndex + 1, checkpoints.length - 1);
      setActivePointIndex(nextIndex);
      Alert.alert(
        "✓ ตรวจจุดสำเร็จ",
        `บันทึกจุดที่ ${currentPoint.id} (${currentPoint.name}) พร้อมรูป ${savePhotos.length} รูปแล้ว กำลังไปยังจุดที่ ${nextIndex + 1}`
      );
    }
  };

  const handleLatePress = () => {
    router.push({
      pathname: "/late",
      params: { round: roundId.toString(), point: activePointIndex.toString() }
    });
  };

  const summary = patrolStore.getRoundSummary(roundId);
  const currentDisplayedPhoto = photos[activePhotoIndex] || photos[0];

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Bar */}
        <TopBar title={`ตรวจจุด : รอบที่ ${roundId}`} back />

        {/* 2. Top Checkpoint Card with Stepper */}
        <View style={styles.pointCard}>
          <View style={styles.pointCardHeader}>
            <View style={styles.pointTitleRow}>
              <Ionicons name="location" size={26} color={COLORS.blue} style={{ marginTop: 2 }} />
              <View>
                <Text style={styles.pointTitle}>จุดตรวจที่ {currentPoint.id}</Text>
                <Text style={styles.pointSub}>{currentPoint.name}</Text>
              </View>
            </View>
            <View style={styles.pointBadge}>
              <Text style={styles.pointBadgeText}>
                {currentPoint.id}/{checkpoints.length} จุด
              </Text>
            </View>
          </View>

          {/* Stepper Progress Circles with Connecting Line (1 to 8) */}
          <View style={styles.stepperWrapper}>
            <View style={styles.stepTrackLine} />
            <View style={styles.stepperContainer}>
              {checkpoints.map((pt, idx) => {
                const isCurrent = idx === activePointIndex;
                const isCompleted = pt.status === "on_time" || pt.status === "late";

                return (
                  <Pressable
                    key={pt.id}
                    style={[
                      styles.stepCircle,
                      isCompleted && styles.stepCircleCompleted,
                      isCurrent && styles.stepCircleActive
                    ]}
                    onPress={() => setActivePointIndex(idx)}
                  >
                    {isCompleted && !isCurrent ? (
                      <Ionicons name="checkmark" size={16} color="white" />
                    ) : (
                      <Text
                        style={[
                          styles.stepNumber,
                          isCurrent && styles.stepNumberActive,
                          isCompleted && !isCurrent && styles.stepNumberCompleted
                        ]}
                      >
                        {pt.id}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* 3. Scheduled & Current Time Card */}
        <View style={styles.timeCard}>
          <View style={styles.timeCol}>
            <Text style={styles.timeLabel}>เวลาที่ควรตรวจ</Text>
            <Text style={styles.timeVal}>{currentPoint.scheduledTime}</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.timeCol}>
            <Text style={styles.timeLabel}>เวลาปัจจุบัน</Text>
            <Text style={styles.timeVal}>{currentPoint.currentTime}</Text>
          </View>
        </View>

        {/* 4. Large Crisp Photo Evidence Section (Multiple Photos up to 50) */}
        <View style={styles.photoSectionCard}>
          <View style={styles.photoHeaderRow}>
            <View style={styles.photoTitleWrap}>
              <Ionicons name="camera" size={18} color="#0C4A94" />
              <Text style={styles.photoSectionTitle}>รูปภาพหลักฐานจุดตรวจ</Text>
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
                ถ่ายภาพสภาพพื้นที่รอบจุดตรวจ (ถ่ายเพิ่มได้สูงสุด {MAX_PHOTOS} รูป)
              </Text>
            </Pressable>
          )}
        </View>

        {/* 5. Primary Blue Button: บันทึกการตรวจจุด */}
        <Pressable
          style={({ pressed }) => [styles.saveButton, pressed && styles.buttonPressed]}
          onPress={handleSaveCheckpoint}
        >
          <Ionicons name="checkbox-outline" size={24} color="white" />
          <Text style={styles.saveButtonText}>บันทึกการตรวจจุด</Text>
        </Pressable>

        {/* 6. Secondary Red Button: ตรวจล่าช้า / ระบุสาเหตุ */}
        <Pressable
          style={({ pressed }) => [styles.lateButton, pressed && styles.buttonPressed]}
          onPress={handleLatePress}
        >
          <Ionicons name="time-outline" size={24} color="white" />
          <Text style={styles.lateButtonText}>ตรวจล่าช้า / ระบุสาเหตุ</Text>
        </Pressable>

        {/* 7. Bottom GPS Status Card */}
        {gps?.insideRadius ? (
          <Pressable style={styles.gpsSuccessCard} onPress={refreshGPS}>
            <View style={styles.gpsIconCircleSuccess}>
              <Ionicons name="checkmark-circle" size={26} color={COLORS.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.gpsSuccessTitle}>อยู่ในพื้นที่ตรวจสอบ</Text>
              <Text style={styles.gpsSuccessSub}>สัญญาณ GPS ดี</Text>
            </View>
            <Ionicons name="sync-outline" size={22} color={COLORS.text} />
          </Pressable>
        ) : gps ? (
          <Pressable style={styles.gpsWarningCard} onPress={refreshGPS}>
            <View style={styles.gpsIconCircleWarning}>
              <Ionicons name="alert-circle" size={26} color={COLORS.orange} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.gpsWarningTitle}>ยังไม่ถึงจุดตรวจ</Text>
              <Text style={styles.gpsWarningSub}>กรุณาเข้าใกล้จุดตรวจอีก 25 เมตร</Text>
            </View>
            <Ionicons name="sync-outline" size={22} color={COLORS.text} />
          </Pressable>
        ) : (
          <Pressable style={styles.gpsDefaultCard} onPress={refreshGPS}>
            <View style={styles.gpsIconCircleDefault}>
              <Ionicons name="location-outline" size={24} color={COLORS.blue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.gpsDefaultTitle}>ตรวจสอบ GPS</Text>
              <Text style={styles.gpsDefaultSub}>แตะเพื่อตรวจสอบ</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={COLORS.muted} />
          </Pressable>
        )}
      </ScrollView>

      {/* Floating Action Button (FAB): ปุ่มลอยแผนที่นำทาง GPS (ตำแหน่งพอดีมุมขวาล่าง) */}
      <Pressable
        style={({ pressed }) => [
          styles.floatingMapFab,
          { bottom: insets.bottom > 0 ? insets.bottom + 14 : 22 },
          pressed && styles.fabPressed
        ]}
        onPress={() => setShowMapModal(true)}
      >
        <View style={styles.fabPulseDot} />
        <Ionicons name="map" size={18} color="white" />
        <Text style={styles.fabText}>แผนที่นำทาง</Text>
        <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.8)" />
      </Pressable>

      {/* Fullscreen Photo Viewer Modal */}
      <Modal visible={!!fullscreenPhoto} transparent animationType="fade">
        <View style={styles.fullscreenModalBackdrop}>
          <View style={styles.fullscreenModalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fullscreenModalTitle}>
                จุดตรวจที่ {currentPoint.id} : {currentPoint.name}
              </Text>
              <Text style={styles.fullscreenModalSub}>
                รูปภาพที่ {activePhotoIndex + 1} จาก {photos.length} รูป
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

          {/* Bottom GPS & Inspector Overlay Card (Controlled by Watermark Setting) */}
          {settings.watermarkEnabled && (
            <View style={styles.modalBottomCard}>
              <View style={styles.modalInfoRow}>
                <Ionicons name="location" size={18} color="#10B981" />
                <Text style={styles.modalInfoLabel}>พิกัด GPS:</Text>
                <Text style={styles.modalInfoValueGreen}>
                  {currentPoint.latitude.toFixed(4)}, {currentPoint.longitude.toFixed(4)}
                </Text>
              </View>

              <View style={styles.modalInfoRow}>
                <Ionicons name="time" size={18} color="#60A5FA" />
                <Text style={styles.modalInfoLabel}>เวลาบันทึก:</Text>
                <Text style={styles.modalInfoValue}>
                  {currentPoint.currentTime || new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) + " น."}
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

      {/* Camera View Modal */}
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

      {/* Interactive Patrol Route Map Modal (ตามแบบ Image 2) */}
      <Modal visible={showMapModal} transparent animationType="slide">
        <View style={styles.mapModalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowMapModal(false)}
          />
          <PatrolRouteMap
            round={round}
            currentPointIndex={activePointIndex}
            onSelectPoint={(newIdx) => {
              setActivePointIndex(newIdx);
            }}
            onClose={() => setShowMapModal(false)}
          />
        </View>
      </Modal>

      {/* 8. Completion Modal ("ตรวจครบแล้ว!") */}
      <Modal visible={showCompletionModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {/* Top Green Icon */}
            <View style={styles.modalIconWrap}>
              <Ionicons name="checkmark" size={36} color="white" />
            </View>

            {/* Modal Heading */}
            <Text style={styles.modalTitle}>ตรวจครบแล้ว!</Text>
            <Text style={styles.modalSub}>
              รอบที่ {roundId} ครบ {summary.totalPoints} จุด
            </Text>

            {/* Modal Stats List */}
            <View style={styles.modalStatsCard}>
              <View style={styles.modalStatRow}>
                <View style={styles.modalStatLeft}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.green} />
                  <Text style={styles.modalStatLabel}>ตรวจตรงเวลา</Text>
                </View>
                <Text style={styles.modalStatVal}>{summary.onTimeCount} จุด</Text>
              </View>

              <View style={styles.modalStatRow}>
                <View style={styles.modalStatLeft}>
                  <Ionicons name="time" size={18} color={COLORS.orange} />
                  <Text style={styles.modalStatLabel}>ตรวจล่าช้า</Text>
                </View>
                <Text style={styles.modalStatVal}>{summary.lateCount} จุด</Text>
              </View>

              <View style={styles.modalStatRow}>
                <View style={styles.modalStatLeft}>
                  <Ionicons name="ellipse-outline" size={18} color={COLORS.muted} />
                  <Text style={styles.modalStatLabel}>ยังไม่ตรวจ</Text>
                </View>
                <Text style={styles.modalStatVal}>{summary.pendingCount} จุด</Text>
              </View>
            </View>

            {/* Round Timing Info */}
            <View style={styles.modalTimeSection}>
              <View style={styles.modalTimeRow}>
                <Text style={styles.modalTimeLabel}>เวลาที่เริ่มรอบ</Text>
                <Text style={styles.modalTimeVal}>{summary.startTime}</Text>
              </View>
              <View style={styles.modalTimeRow}>
                <Text style={styles.modalTimeLabel}>เวลาสิ้นสุดรอบ</Text>
                <Text style={styles.modalTimeVal}>{summary.endTime}</Text>
              </View>
            </View>

            {/* Action Button: ดูสรุปผลรอบนี้ */}
            <Pressable
              style={styles.modalSummaryBtn}
              onPress={() => {
                setShowCompletionModal(false);
                router.push({ pathname: "/round-summary", params: { round: roundId.toString() } });
              }}
            >
              <Text style={styles.modalSummaryBtnText}>ดูสรุปผลรอบนี้</Text>
            </Pressable>
          </View>

          {/* Floating Close (X) Button */}
          <Pressable style={styles.modalCloseBtn} onPress={() => setShowCompletionModal(false)}>
            <Ionicons name="close" size={24} color="white" />
          </Pressable>
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

  // Point Card
  pointCard: {
    marginHorizontal: 14,
    marginTop: 14,
    marginBottom: 8,
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
  pointCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16
  },
  pointTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    flex: 1
  },
  pointTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text
  },
  pointSub: {
    color: COLORS.muted,
    marginTop: 3,
    fontSize: 13
  },
  pointBadge: {
    backgroundColor: "#EAF2FF",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16
  },
  pointBadgeText: {
    color: "#0C4A94",
    fontWeight: "900",
    fontSize: 12
  },

  // Stepper Circles
  stepperWrapper: {
    position: "relative",
    justifyContent: "center",
    paddingTop: 4,
    paddingBottom: 2
  },
  stepTrackLine: {
    position: "absolute",
    left: 16,
    right: 16,
    top: "50%",
    marginTop: 1,
    height: 2,
    backgroundColor: "#DCE5F0",
    zIndex: 0
  },
  stepperContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#D8DFE8",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    elevation: 2
  },
  stepCircleActive: {
    backgroundColor: "#0C4A94",
    borderColor: "#0C4A94"
  },
  stepCircleCompleted: {
    backgroundColor: "#109B55",
    borderColor: "#109B55"
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: "800",
    color: "#7C8797"
  },
  stepNumberActive: {
    color: "white",
    fontWeight: "900"
  },
  stepNumberCompleted: {
    color: "white"
  },

  // Time Card
  timeCard: {
    marginHorizontal: 14,
    marginVertical: 8,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1
  },
  timeCol: {
    flex: 1,
    alignItems: "center"
  },
  timeLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600"
  },
  timeVal: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 20,
    marginTop: 4
  },
  verticalDivider: {
    width: 1,
    height: 38,
    backgroundColor: COLORS.border
  },

  // Photo Evidence Card Section
  photoSectionCard: {
    marginHorizontal: 14,
    marginVertical: 8,
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
    backgroundColor: "rgba(220, 38, 38, 0.8)",
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
  saveButton: {
    backgroundColor: "#0C4A94",
    minHeight: 56,
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
  saveButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "900"
  },
  lateButton: {
    backgroundColor: "#D7262D",
    minHeight: 56,
    marginHorizontal: 14,
    marginVertical: 6,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#D7262D",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3
  },
  lateButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "900"
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }]
  },

  // GPS Status Cards
  gpsSuccessCard: {
    marginHorizontal: 14,
    marginTop: 8,
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#E7F7EE",
    borderWidth: 1,
    borderColor: "#109B5540",
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  gpsIconCircleSuccess: {
    alignItems: "center",
    justifyContent: "center"
  },
  gpsSuccessTitle: {
    color: "#109B55",
    fontWeight: "900",
    fontSize: 15
  },
  gpsSuccessSub: {
    color: COLORS.text,
    fontSize: 12,
    marginTop: 2
  },

  gpsWarningCard: {
    marginHorizontal: 14,
    marginTop: 8,
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#FFF4DF",
    borderWidth: 1,
    borderColor: "#F59B1340",
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  gpsIconCircleWarning: {
    alignItems: "center",
    justifyContent: "center"
  },
  gpsWarningTitle: {
    color: "#F59B13",
    fontWeight: "900",
    fontSize: 15
  },
  gpsWarningSub: {
    color: COLORS.text,
    fontSize: 12,
    marginTop: 2
  },

  gpsDefaultCard: {
    marginHorizontal: 14,
    marginTop: 8,
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  gpsIconCircleDefault: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.blueSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  gpsDefaultTitle: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 15
  },
  gpsDefaultSub: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2
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
    fontWeight: "800",
    flex: 1,
    marginRight: 10
  },
  fullscreenCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center"
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
  fullscreenFooter: {
    alignItems: "center",
    paddingBottom: 10
  },
  fullscreenFooterText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontWeight: "600"
  },

  // Camera Screen
  cameraScreen: {
    flex: 1,
    backgroundColor: "black"
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 40
  },
  closeCamera: {
    alignSelf: "flex-end",
    marginRight: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center"
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#0C4A94"
  },

  // Completion Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 20, 35, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  modalCard: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#109B55",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center"
  },
  modalSub: {
    fontSize: 15,
    color: COLORS.muted,
    marginTop: 4,
    textAlign: "center",
    marginBottom: 18
  },
  modalStatsCard: {
    width: "100%",
    backgroundColor: "#F7F9FC",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 16
  },
  modalStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7
  },
  modalStatLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  modalStatLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600"
  },
  modalStatVal: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800"
  },
  modalTimeSection: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    marginBottom: 20,
    gap: 6
  },
  modalTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  modalTimeLabel: {
    color: COLORS.muted,
    fontSize: 13
  },
  modalTimeVal: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 14
  },
  modalSummaryBtn: {
    width: "100%",
    backgroundColor: "#0C4A94",
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  modalSummaryBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900"
  },
  modalCloseBtn: {
    marginTop: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 1.5,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center"
  },
  fullscreenModalSub: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    marginTop: 2
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
    minWidth: 100
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
  },

  // Location & Map Navigation Card
  locationCard: {
    backgroundColor: "white",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
    marginBottom: 8,
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1
  },
  locationIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D0E2FF"
  },
  locationTitle: {
    fontSize: 14.5,
    fontWeight: "900",
    color: "#0F172A"
  },
  locationSub: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2
  },
  btnViewMapPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0F6FF",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D0E2FF"
  },
  btnViewMapText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0C4A94"
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }]
  },

  // Map Modal Overlay
  mapModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(10, 20, 35, 0.65)",
    justifyContent: "flex-end"
  },

  // Middle Floating Map Panel Styles
  midMapPanel: {
    backgroundColor: "#F0F6FF",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#D0E2FF",
    padding: 12,
    marginBottom: 12,
    shadowColor: "#0C4A94",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  midMapHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  midMapHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1
  },
  midMapIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D0E2FF"
  },
  midMapHeaderTitle: {
    fontSize: 13.5,
    fontWeight: "900",
    color: "#0F172A"
  },
  midMapHeaderSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1
  },
  midMapExpandPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D0E2FF"
  },
  midMapExpandText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0C4A94"
  },
  miniMapCanvas: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  miniMapBg: {
    height: 40,
    backgroundColor: "#EBF3E8",
    borderRadius: 8,
    position: "relative",
    justifyContent: "center",
    paddingHorizontal: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#CBD5E1"
  },
  miniRoadH: {
    position: "absolute",
    top: "42%",
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: "#CBD5E1"
  },
  miniRoadV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: 10,
    backgroundColor: "#CBD5E1"
  },
  miniPinsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 5
  },
  miniPinCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#475569",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "white"
  },
  miniPinCircleActive: {
    backgroundColor: "#0C4A94",
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#93C5FD"
  },
  miniPinCircleDone: {
    backgroundColor: "#16A34A"
  },
  miniPinText: {
    fontSize: 9,
    fontWeight: "900",
    color: "white"
  },
  miniPinTextActive: {
    fontSize: 10
  },
  midMapFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    paddingHorizontal: 4
  },
  midMapTargetInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1
  },
  pulseGreenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#10B981"
  },
  midMapTargetText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#059669"
  },
  midMapNextText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#64748B"
  },

  // Floating Action Button (FAB)
  floatingMapFab: {
    position: "absolute",
    right: 16,
    backgroundColor: "#0C4A94",
    height: 44,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 6,
    shadowColor: "#0C4A94",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)"
  },
  fabPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#34D399"
  },
  fabText: {
    color: "white",
    fontSize: 13,
    fontWeight: "900"
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }]
  }
});
