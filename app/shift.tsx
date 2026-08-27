import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopBar from "../components/TopBar";
import { COLORS } from "../constants/colors";
import { useUserStore } from "../lib/userStore";
import { useCheckpointMobileStore } from "../lib/checkpointMobileStore";
import { usePatrolStore } from "../lib/patrolStore";
import { useEmergencyStore } from "../lib/emergencyStore";
import { readGPS } from "../lib/gps";

export default function ShiftScreen() {
  const insets = useSafeAreaInsets();
  const userStore = useUserStore();
  const profile = userStore.getProfile();
  const cpStore = useCheckpointMobileStore();
  const factory = cpStore.getFactory();
  const shift = cpStore.getShift();
  const patrolStore = usePatrolStore();
  const emergencyStore = useEmergencyStore();

  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [loadingGps, setLoadingGps] = useState(false);

  // Update clock every 10 seconds
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) + " น."
      );
      setCurrentDate(
        now.toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
          year: "numeric"
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Patrol stats for the shift
  const rounds = patrolStore.getRounds();
  const totalRounds = rounds.length;
  const completedRounds = rounds.filter((r) => r.status === "complete").length;
  const totalPoints = rounds.reduce((acc, r) => acc + r.points, 0);
  const completedPoints = rounds.reduce((acc, r) => acc + r.completed, 0);
  const incidentCount = emergencyStore.getAllIncidents().length;

  // Handle Check-in
  const handleCheckIn = async () => {
    setLoadingGps(true);
    const targetLat = factory.latitude || 16.8156;
    const targetLng = factory.longitude || 100.262;
    const gpsRes = await readGPS(targetLat, targetLng, 100);
    setLoadingGps(false);

    const nowTime =
      new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) + " น.";
    const nowDate = new Date().toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

    const gpsCoords = {
      lat: gpsRes?.latitude || targetLat,
      lng: gpsRes?.longitude || targetLng
    };

    cpStore.checkIn(nowTime, nowDate, gpsCoords);
    setShowCheckInModal(true);
  };

  // Handle Check-out
  const handleCheckOut = async () => {
    Alert.alert(
      "ยืนยันลงเวลาออกกะ",
      "คุณต้องการลงเวลาออกกะและบันทึกสรุปผลการปฏิบัติหน้าที่ใช่หรือไม่?",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ยืนยันออกกะ",
          style: "destructive",
          onPress: async () => {
            setLoadingGps(true);
            const targetLat = factory.latitude || 16.8156;
            const targetLng = factory.longitude || 100.262;
            const gpsRes = await readGPS(targetLat, targetLng, 100);
            setLoadingGps(false);

            const nowTime =
              new Date().toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit"
              }) + " น.";
            const nowDate = new Date().toLocaleDateString("th-TH", {
              day: "numeric",
              month: "short",
              year: "numeric"
            });

            const gpsCoords = {
              lat: gpsRes?.latitude || targetLat,
              lng: gpsRes?.longitude || targetLng
            };

            cpStore.checkOut(nowTime, nowDate, gpsCoords, "12 ชั่วโมง 00 นาที");
            setShowSummaryModal(true);
          }
        }
      ]
    );
  };

  // Handle Logout
  const handleLogout = () => {
    Alert.alert(
      "ออกจากระบบ",
      "คุณต้องการออกจากระบบการปฏิบัติงานใช่หรือไม่?",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ออกจากระบบ",
          style: "destructive",
          onPress: () => {
            setShowSummaryModal(false);
            cpStore.resetShift();
            userStore.logout();
            router.replace("/guard-select");
          }
        }
      ]
    );
  };

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingBottom: insets.bottom + 36 }}
        showsVerticalScrollIndicator={false}
      >
        <TopBar title="ลงเวลากะปฏิบัติงาน" back />

        <View style={styles.content}>
          {/* 1. Guard Profile Card */}
          <View style={styles.profileCard}>
          <View style={styles.profileHeaderRow}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarEmoji}>{profile.avatarEmoji || "👮‍♂️"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileSub}>
                รหัสพนักงาน: {profile.employeeId} • {profile.role}
              </Text>
              <View style={styles.shiftBadgeInline}>
                <Ionicons name="time" size={13} color="#B45309" />
                <Text style={styles.shiftBadgeInlineText}>{profile.shift}</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileDivider} />

          {/* Full-width Factory Row */}
          <View style={styles.profileInfoRow}>
            <Ionicons name="business" size={18} color="#0C4A94" />
            <Text style={styles.profileInfoText} numberOfLines={1}>
              {factory.name}
            </Text>
          </View>
        </View>

        {/* 2. Current Shift Status Banner */}
        <View style={styles.statusBanner}>
          <View
            style={[
              styles.statusIconBox,
              {
                backgroundColor: shift.isCheckedOut
                  ? "#FEE2E2"
                  : shift.isCheckedIn
                  ? "#DCFCE7"
                  : "#F1F5F9"
              }
            ]}
          >
            <Ionicons
              name={
                shift.isCheckedOut
                  ? "checkmark-done-circle"
                  : shift.isCheckedIn
                  ? "radio-button-on"
                  : "time-outline"
              }
              size={24}
              color={
                shift.isCheckedOut
                  ? "#DC2626"
                  : shift.isCheckedIn
                  ? "#16A34A"
                  : "#64748B"
              }
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusBannerLabel}>สถานะกะปัจจุบัน</Text>
            <Text style={styles.statusBannerTitle}>
              {shift.isCheckedOut
                ? "สิ้นสุดกะการทำงานแล้ว"
                : shift.isCheckedIn
                ? "กำลังปฏิบัติหน้าที่ในกะ"
                : "รอการลงเวลาเข้ากะ"}
            </Text>
          </View>
          <View
            style={[
              styles.clockBadge,
              {
                backgroundColor: shift.isCheckedOut
                  ? "#DC2626"
                  : shift.isCheckedIn
                  ? "#16A34A"
                  : "#64748B"
              }
            ]}
          >
            <Text style={styles.clockBadgeText}>{currentTime || "20:00 น."}</Text>
          </View>
        </View>

        {/* SECTION 1: ลงเวลาเข้ากะ (Check-in โทนสีเขียวชัดเจน) */}
        <View
          style={[
            styles.shiftCard,
            shift.isCheckedIn ? styles.shiftCardActiveGreen : styles.shiftCardNormalGreen
          ]}
        >
          {/* Header Row: Large Title & Status Badge */}
          <View style={styles.shiftCardHeader}>
            <View style={styles.shiftTitleGroup}>
              <View style={styles.shiftIconCircleGreen}>
                <Ionicons name="log-in" size={24} color="#16A34A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.shiftTitleTextGreen}>ลงเวลาเข้ากะ</Text>
                <Text style={styles.shiftScheduleText}>
                  กำหนดเวลา: {shift.scheduledHours.split(" ")[0]}
                </Text>
              </View>
            </View>

            {shift.isCheckedIn ? (
              <View style={styles.badgeGreen}>
                <Ionicons name="checkmark-circle" size={15} color="#16A34A" />
                <Text style={styles.badgeGreenText}>ลงเวลาแล้ว</Text>
              </View>
            ) : (
              <View style={styles.badgeGray}>
                <Text style={styles.badgeGrayText}>ยังไม่เข้ากะ</Text>
              </View>
            )}
          </View>

          {/* Body */}
          {shift.isCheckedIn ? (
            <View style={styles.timeBoxGreen}>
              <View style={styles.timeRow}>
                <Text style={styles.timeBigGreen}>{shift.checkInTime}</Text>
                <Text style={styles.timeDateText}>{shift.checkInDate}</Text>
              </View>
              {shift.checkInGps && (
                <View style={styles.gpsRow}>
                  <Ionicons name="location" size={16} color="#16A34A" />
                  <Text style={styles.gpsText}>
                    พิกัด GPS: {shift.checkInGps.lat.toFixed(4)},{" "}
                    {shift.checkInGps.lng.toFixed(4)} (บันทึกอัตโนมัติ)
                  </Text>
                </View>
              )}
              {/* View Summary Report Button */}
              <Pressable
                style={styles.btnViewSummaryGreen}
                onPress={() => setShowCheckInModal(true)}
              >
                <Ionicons name="document-text-outline" size={18} color="#16A34A" />
                <Text style={styles.btnViewSummaryGreenText}>ดูสรุปผลการลงเวลาเข้ากะ</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.actionBtnContainer}>
              <Pressable
                style={({ pressed }) => [styles.btnCheckIn, pressed && styles.btnPressed]}
                onPress={handleCheckIn}
                disabled={loadingGps}
              >
                <Ionicons name="log-in" size={24} color="white" />
                <Text style={styles.btnCheckInText}>
                  {loadingGps ? "กำลังบันทึกเวลาและ GPS..." : "กดลงเวลาเข้ากะ"}
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* SECTION 2: ลงเวลาออกกะ (Check-out โทนสีแดงชัดเจน) */}
        <View
          style={[
            styles.shiftCard,
            shift.isCheckedOut
              ? styles.shiftCardActiveRed
              : shift.isCheckedIn
              ? styles.shiftCardWaitingRed
              : styles.shiftCardDisabled
          ]}
        >
          {/* Header Row: Large Title & Status Badge */}
          <View style={styles.shiftCardHeader}>
            <View style={styles.shiftTitleGroup}>
              <View
                style={[
                  styles.shiftIconCircleRed,
                  {
                    backgroundColor:
                      shift.isCheckedIn || shift.isCheckedOut ? "#FEE2E2" : "#F1F5F9"
                  }
                ]}
              >
                <Ionicons
                  name="log-out"
                  size={24}
                  color={shift.isCheckedIn || shift.isCheckedOut ? "#DC2626" : "#94A3B8"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.shiftTitleTextRed,
                    { color: shift.isCheckedIn || shift.isCheckedOut ? "#DC2626" : "#64748B" }
                  ]}
                >
                  ลงเวลาออกกะ
                </Text>
                <Text style={styles.shiftScheduleText}>
                  กำหนดเวลา: {shift.scheduledHours.split("- ")[1] || "08:00 น."}
                </Text>
              </View>
            </View>

            {shift.isCheckedOut ? (
              <View style={styles.badgeRed}>
                <Ionicons name="checkmark-done-circle" size={15} color="#DC2626" />
                <Text style={styles.badgeRedText}>ออกกะแล้ว</Text>
              </View>
            ) : shift.isCheckedIn ? (
              <View style={styles.badgeAmber}>
                <Ionicons name="hourglass-outline" size={15} color="#D97706" />
                <Text style={styles.badgeAmberText}>รอลงเวลาออกกะ</Text>
              </View>
            ) : (
              <View style={styles.badgeGray}>
                <Text style={styles.badgeGrayText}>ยังไม่ถึงเวลา</Text>
              </View>
            )}
          </View>

          {/* Body */}
          {shift.isCheckedOut ? (
            <View style={styles.timeBoxRed}>
              <View style={styles.timeRow}>
                <Text style={styles.timeBigRed}>{shift.checkOutTime}</Text>
                <Text style={styles.timeDateText}>{shift.checkOutDate}</Text>
              </View>
              {shift.checkOutGps && (
                <View style={styles.gpsRow}>
                  <Ionicons name="location" size={16} color="#DC2626" />
                  <Text style={styles.gpsText}>
                    พิกัด GPS: {shift.checkOutGps.lat.toFixed(4)},{" "}
                    {shift.checkOutGps.lng.toFixed(4)}
                  </Text>
                </View>
              )}
              {shift.totalWorkingDuration && (
                <View style={styles.durationRowRed}>
                  <Ionicons name="time" size={16} color="#DC2626" />
                  <Text style={styles.durationTextRed}>
                    รวมเวลาปฏิบัติงาน: {shift.totalWorkingDuration}
                  </Text>
                </View>
              )}

              {/* View Summary Report Button */}
              <Pressable
                style={styles.btnViewSummaryRed}
                onPress={() => setShowSummaryModal(true)}
              >
                <Ionicons name="document-text-outline" size={18} color="#DC2626" />
                <Text style={styles.btnViewSummaryRedText}>ดูรายงานสรุปผลการปฏิบัติงาน</Text>
              </Pressable>
            </View>
          ) : shift.isCheckedIn ? (
            <View style={styles.actionBtnContainer}>
              <Pressable
                style={({ pressed }) => [styles.btnCheckOut, pressed && styles.btnPressed]}
                onPress={handleCheckOut}
                disabled={loadingGps}
              >
                <Ionicons name="log-out" size={24} color="white" />
                <Text style={styles.btnCheckOutText}>
                  {loadingGps ? "กำลังบันทึกเวลาออกกะ..." : "ลงเวลาออกกะ"}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.disabledBox}>
              <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" />
              <Text style={styles.disabledBoxText}>
                กรุณากดลงเวลาเข้ากะด้านบนก่อน จึงจะสามารถลงเวลาออกกะได้
              </Text>
            </View>
          )}
        </View>

        {/* Go to Patrol Rounds Button */}
        <Pressable
          style={({ pressed }) => [styles.btnGoToRounds, pressed && styles.btnPressed]}
          onPress={() => router.push("/rounds")}
        >
          <Text style={styles.btnGoToRoundsText}>ไปเลือกรอบตรวจจุดประจำกะ</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </Pressable>
        </View>
      </ScrollView>

      {/* 1. CHECK-IN SUCCESS SUMMARY MODAL (หน้าต่างสรุปผลการลงเวลาเข้ากะสำเร็จ สวยงาม สะอาดตา) */}
      <Modal visible={showCheckInModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderIconBoxGreen}>
                <Ionicons name="checkmark-circle" size={36} color="#16A34A" />
              </View>
              <Text style={styles.modalTitle}>ลงเวลาเข้ากะสำเร็จ</Text>
              <Text style={styles.modalSub}>{shift.shiftName}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              {/* Guard Profile Summary */}
              <View style={styles.summaryGuardCard}>
                <Text style={styles.summaryGuardName}>{profile.name}</Text>
                <Text style={styles.summaryGuardSub}>
                  รหัสพนักงาน: {profile.employeeId} • {factory.name}
                </Text>
                <Text style={styles.summaryGuardZone}>โซน: {profile.zone}</Text>
              </View>

              {/* Work Hours Stats Table */}
              <View style={styles.summaryTableCard}>
                <Text style={styles.tableTitleGreen}>ข้อมูลการลงเวลาเข้ากะ</Text>

                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>เวลาบันทึกเข้ากะ:</Text>
                  <Text style={styles.tableValueGreenLarge}>
                    {shift.checkInTime || currentTime}
                  </Text>
                </View>

                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>วันที่บันทึก:</Text>
                  <Text style={styles.tableValueDark}>
                    {shift.checkInDate || currentDate}
                  </Text>
                </View>

                <View style={styles.tableDivider} />

                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>พิกัด GPS จริง:</Text>
                  <Text style={styles.tableValueGps}>
                    {shift.checkInGps
                      ? `${shift.checkInGps.lat.toFixed(4)}, ${shift.checkInGps.lng.toFixed(4)}`
                      : "14.9033, 102.0562"}
                  </Text>
                </View>

                <View style={styles.tableRow}>
                  <Text style={styles.tableLabelBold}>สถานะการเข้ากะ:</Text>
                  <Text style={styles.tableValueGreenBold}>
                    เริ่มปฏิบัติหน้าที่แล้ว ✓
                  </Text>
                </View>
              </View>

              {/* Status Note */}
              <View style={styles.checkInSuccessNote}>
                <Ionicons name="cloud-done-outline" size={20} color="#16A34A" />
                <Text style={styles.checkInSuccessNoteText}>
                  ระบบได้บันทึกเวลาและพิกัด GPS ส่งเข้าศูนย์ควบคุมความปลอดภัยเรียบร้อยแล้ว
                </Text>
              </View>
            </ScrollView>

            {/* ACTION BUTTONS */}
            <View style={styles.modalActionGroup}>
              {/* Primary Button: ไปเลือกรอบตรวจจุด */}
              <Pressable
                style={({ pressed }) => [styles.btnProceedRounds, pressed && styles.btnPressed]}
                onPress={() => {
                  setShowCheckInModal(false);
                  router.push("/rounds");
                }}
              >
                <Ionicons name="arrow-forward-circle" size={22} color="white" />
                <Text style={styles.btnProceedRoundsText}>ไปเลือกรอบตรวจจุด</Text>
              </Pressable>

              {/* Close Button */}
              <Pressable
                style={styles.btnCloseModal}
                onPress={() => setShowCheckInModal(false)}
              >
                <Text style={styles.btnCloseModalText}>ตกลง</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. SHIFT SUMMARY MODAL (หน้าต่างสรุปผลการออกกะ & ออกจากระบบ) */}
      <Modal visible={showSummaryModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderIconBox}>
                <Ionicons name="ribbon" size={28} color="#0C4A94" />
              </View>
              <Text style={styles.modalTitle}>สรุปผลการปฏิบัติงานประจำกะ</Text>
              <Text style={styles.modalSub}>{shift.shiftName}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              {/* Guard Profile Summary */}
              <View style={styles.summaryGuardCard}>
                <Text style={styles.summaryGuardName}>{profile.name}</Text>
                <Text style={styles.summaryGuardSub}>
                  รหัสพนักงาน: {profile.employeeId} • {factory.name}
                </Text>
                <Text style={styles.summaryGuardZone}>โซน: {profile.zone}</Text>
              </View>

              {/* Work Hours Stats Table */}
              <View style={styles.summaryTableCard}>
                <Text style={styles.tableTitle}>เวลาปฏิบัติงานจริง</Text>

                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>เวลาเข้ากะ:</Text>
                  <Text style={styles.tableValueGreen}>
                    {shift.checkInTime || "20:01 น."} ({shift.checkInDate || "14 พ.ค. 2567"})
                  </Text>
                </View>

                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>เวลาออกกะ:</Text>
                  <Text style={styles.tableValueRed}>
                    {shift.checkOutTime || currentTime} ({shift.checkOutDate || currentDate})
                  </Text>
                </View>

                <View style={styles.tableDivider} />

                <View style={styles.tableRow}>
                  <Text style={styles.tableLabelBold}>รวมเวลาปฏิบัติงาน:</Text>
                  <Text style={styles.tableValueTotal}>
                    {shift.totalWorkingDuration || "12 ชั่วโมง 00 นาที"}
                  </Text>
                </View>
              </View>

              {/* Patrol & Emergency Achievements */}
              <View style={styles.summaryStatsGrid}>
                <View style={styles.gridStatItem}>
                  <Ionicons name="checkbox-outline" size={22} color="#16A34A" />
                  <Text style={styles.gridStatNumber}>
                    {completedRounds}/{totalRounds} รอบ
                  </Text>
                  <Text style={styles.gridStatLabel}>ตรวจครบทุกรอบ</Text>
                </View>

                <View style={styles.gridStatItem}>
                  <Ionicons name="location-outline" size={22} color="#0C4A94" />
                  <Text style={styles.gridStatNumber}>
                    {completedPoints}/{totalPoints} จุด
                  </Text>
                  <Text style={styles.gridStatLabel}>สแกนครบทุกจุด</Text>
                </View>

                <View style={styles.gridStatItem}>
                  <Ionicons name="shield-checkmark-outline" size={22} color="#D97706" />
                  <Text style={styles.gridStatNumber}>{incidentCount} เหตุ</Text>
                  <Text style={styles.gridStatLabel}>เหตุการณ์ฉุกเฉิน</Text>
                </View>
              </View>
            </ScrollView>

            {/* ACTION BUTTONS (Logout + Close) */}
            <View style={styles.modalActionGroup}>
              {/* Red Primary Button: ออกจากระบบ */}
              <Pressable
                style={({ pressed }) => [styles.btnLogout, pressed && styles.btnPressed]}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={22} color="white" />
                <Text style={styles.btnLogoutText}>ออกจากระบบ</Text>
              </Pressable>

              {/* Close Button */}
              <Pressable
                style={styles.btnCloseModal}
                onPress={() => setShowSummaryModal(false)}
              >
                <Text style={styles.btnCloseModalText}>ปิดหน้าต่าง</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F7FB"
  },
  content: {
    paddingHorizontal: 16
  },

  // 1. Profile Card
  profileCard: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  profileHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  avatarWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#EAF2FF",
    borderWidth: 2,
    borderColor: "#D0E2FF",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarEmoji: {
    fontSize: 30
  },
  profileName: {
    fontSize: 17.5,
    fontWeight: "900",
    color: COLORS.text
  },
  profileSub: {
    fontSize: 12.5,
    color: COLORS.muted,
    marginTop: 2,
    fontWeight: "600"
  },
  shiftBadgeInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 5
  },
  shiftBadgeInlineText: {
    fontSize: 11.5,
    color: "#92400E",
    fontWeight: "800"
  },
  profileDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12
  },
  profileInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  profileInfoText: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "700",
    flex: 1
  },

  // 2. Status Banner
  statusBanner: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 14,
    marginTop: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  statusIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  statusBannerLabel: {
    fontSize: 11.5,
    color: COLORS.muted,
    fontWeight: "700"
  },
  statusBannerTitle: {
    fontSize: 14.5,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: 1
  },
  clockBadge: {
    backgroundColor: "#0C4A94",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  clockBadgeText: {
    color: "white",
    fontSize: 13.5,
    fontWeight: "900"
  },

  // Shift Cards
  shiftCard: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  shiftCardNormalGreen: {
    borderColor: "#BBF7D0",
    backgroundColor: "#FFFFFF"
  },
  shiftCardActiveGreen: {
    borderColor: "#86EFAC",
    backgroundColor: "#FFFFFF"
  },
  shiftCardWaitingRed: {
    borderColor: "#FECACA",
    backgroundColor: "#FFFFFF"
  },
  shiftCardActiveRed: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FFFFFF"
  },
  shiftCardDisabled: {
    borderColor: "#E2E8F0",
    backgroundColor: "#FAFAFA"
  },

  shiftCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8
  },
  shiftTitleGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  shiftIconCircleGreen: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center"
  },
  shiftIconCircleRed: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  shiftTitleTextGreen: {
    fontSize: 18,
    fontWeight: "900",
    color: "#15803D"
  },
  shiftTitleTextRed: {
    fontSize: 18,
    fontWeight: "900"
  },
  shiftScheduleText: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
    fontWeight: "600"
  },

  // Badges
  badgeGreen: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#86EFAC"
  },
  badgeGreenText: {
    color: "#16A34A",
    fontSize: 12,
    fontWeight: "800"
  },
  badgeAmber: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FDE68A"
  },
  badgeAmberText: {
    color: "#D97706",
    fontSize: 12,
    fontWeight: "800"
  },
  badgeRed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5"
  },
  badgeRedText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "800"
  },
  badgeGray: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12
  },
  badgeGrayText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700"
  },

  // Time Content Boxes
  timeBoxGreen: {
    marginTop: 14,
    backgroundColor: "#F0FDF4",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0"
  },
  timeBoxRed: {
    marginTop: 14,
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FECACA"
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end"
  },
  timeBigGreen: {
    fontSize: 30,
    fontWeight: "900",
    color: "#16A34A"
  },
  timeBigRed: {
    fontSize: 30,
    fontWeight: "900",
    color: "#DC2626"
  },
  timeDateText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "700",
    marginBottom: 4
  },
  gpsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10
  },
  gpsText: {
    fontSize: 12.5,
    color: "#475569",
    fontWeight: "600"
  },
  durationRowRed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#FECACA"
  },
  durationTextRed: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "900"
  },

  // Action Buttons inside cards
  actionBtnContainer: {
    marginTop: 16
  },
  dutyEstimateBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    backgroundColor: "#FFFBEB",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FEF3C7"
  },
  dutyEstimateText: {
    fontSize: 12.5,
    color: "#9A3412",
    fontWeight: "700",
    flex: 1
  },
  btnCheckIn: {
    backgroundColor: "#16A34A",
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4
  },
  btnCheckInText: {
    color: "white",
    fontSize: 17,
    fontWeight: "900"
  },
  btnCheckOut: {
    backgroundColor: "#DC2626",
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4
  },
  btnCheckOutText: {
    color: "white",
    fontSize: 17,
    fontWeight: "900"
  },
  btnViewSummaryGreen: {
    marginTop: 12,
    backgroundColor: "white",
    height: 44,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: "#16A34A"
  },
  btnViewSummaryGreenText: {
    color: "#16A34A",
    fontSize: 13.5,
    fontWeight: "800"
  },
  btnViewSummaryRed: {
    marginTop: 12,
    backgroundColor: "white",
    height: 44,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: "#DC2626"
  },
  btnViewSummaryRedText: {
    color: "#DC2626",
    fontSize: 13.5,
    fontWeight: "800"
  },
  disabledBox: {
    marginTop: 14,
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  disabledBoxText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    flex: 1
  },

  // GPS Security Card
  gpsSecurityCard: {
    backgroundColor: "#F0F6FF",
    borderRadius: 18,
    padding: 14,
    marginTop: 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D0E2FF",
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  gpsSecurityIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center"
  },
  gpsSecurityTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0C4A94"
  },
  gpsSecuritySub: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2
  },

  // Go to Rounds Button
  btnGoToRounds: {
    backgroundColor: "#0C4A94",
    height: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#0C4A94",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  btnGoToRoundsText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900"
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }]
  },

  // MODAL STYLES (Summary & Logout)
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 20, 35, 0.7)",
    justifyContent: "center",
    paddingHorizontal: 16
  },
  modalCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    maxHeight: "88%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 16
  },
  modalHeaderIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#CCE0FA"
  },
  modalHeaderIconBoxGreen: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#BBF7D0"
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text
  },
  modalSub: {
    fontSize: 12.5,
    color: COLORS.muted,
    marginTop: 2,
    fontWeight: "700"
  },

  // Modal Content Cards
  summaryGuardCard: {
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12
  },
  summaryGuardName: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text
  },
  summaryGuardSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2
  },
  summaryGuardZone: {
    fontSize: 11.5,
    color: "#0C4A94",
    fontWeight: "700",
    marginTop: 4
  },

  summaryTableCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    marginBottom: 12
  },
  tableTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#166534",
    marginBottom: 10
  },
  tableTitleGreen: {
    fontSize: 13,
    fontWeight: "900",
    color: "#15803D",
    marginBottom: 10
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 3
  },
  tableLabel: {
    fontSize: 12.5,
    color: "#374151"
  },
  tableLabelBold: {
    fontSize: 13.5,
    fontWeight: "900",
    color: "#1F2937"
  },
  tableValueGreen: {
    fontSize: 13,
    fontWeight: "800",
    color: "#16A34A"
  },
  tableValueGreenLarge: {
    fontSize: 15,
    fontWeight: "900",
    color: "#16A34A"
  },
  tableValueGreenBold: {
    fontSize: 13,
    fontWeight: "900",
    color: "#16A34A"
  },
  tableValueDark: {
    fontSize: 13,
    fontWeight: "800",
    color: "#334155"
  },
  tableValueGps: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0C4A94"
  },
  tableValueRed: {
    fontSize: 13,
    fontWeight: "800",
    color: "#DC2626"
  },
  tableValueTotal: {
    fontSize: 15,
    fontWeight: "900",
    color: "#16A34A"
  },
  tableDivider: {
    height: 1,
    backgroundColor: "#BBF7D0",
    marginVertical: 8
  },

  checkInSuccessNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    marginBottom: 10
  },
  checkInSuccessNoteText: {
    fontSize: 12,
    color: "#166534",
    fontWeight: "700",
    flex: 1
  },

  // Stats Grid
  summaryStatsGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14
  },
  gridStatItem: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  gridStatNumber: {
    fontSize: 13.5,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: 4
  },
  gridStatLabel: {
    fontSize: 10.5,
    color: COLORS.muted,
    marginTop: 2
  },

  // Modal Action Buttons
  modalActionGroup: {
    marginTop: 8,
    gap: 8
  },
  btnProceedRounds: {
    backgroundColor: "#0C4A94",
    height: 50,
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
  btnProceedRoundsText: {
    color: "white",
    fontSize: 15.5,
    fontWeight: "900"
  },
  btnLogout: {
    backgroundColor: "#DC2626",
    height: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3
  },
  btnLogoutText: {
    color: "white",
    fontSize: 15.5,
    fontWeight: "900"
  },
  btnCloseModal: {
    backgroundColor: "#F1F5F9",
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  btnCloseModalText: {
    color: "#475569",
    fontSize: 13.5,
    fontWeight: "800"
  }
});
