import React, { useState, useEffect } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scoreHistoryStore, ScoreLogItem, TrendPoint } from "../lib/scoreHistoryStore";
import { usePatrolStore } from "../lib/patrolStore";

interface ScoreCalendarModalProps {
  visible: boolean;
  selectedDate?: string;
  onSelectDate?: (point: TrendPoint) => void;
  onClose: () => void;
}

const MONTH_NAMES = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const MONTH_ABBR = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

const WEEKDAYS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
// Realistic complete years range: 2000 - 2040 (41 years)
const YEARS_LIST = Array.from({ length: 41 }, (_, i) => 2000 + i);

export default function ScoreCalendarModal({
  visible,
  selectedDate,
  onSelectDate,
  onClose
}: ScoreCalendarModalProps) {
  const insets = useSafeAreaInsets();
  const patrolStore = usePatrolStore();
  const currentStats = patrolStore.getOverallStats();

  // Current real-time Date (Real-time current date, month & year)
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<number>(() => new Date().getDate());

  // Modal States
  const [showDailyPopup, setShowDailyPopup] = useState<boolean>(false);
  const [showWheelPicker, setShowWheelPicker] = useState<boolean>(false);

  // Temporary Picker state for Wheel Date Picker Modal
  const [tempDay, setTempDay] = useState<number>(() => new Date().getDate());
  const [tempMonth, setTempMonth] = useState<number>(() => new Date().getMonth());
  const [tempYear, setTempYear] = useState<number>(() => new Date().getFullYear());

  // Reset to exact real-time current date, month & year whenever calendar opens
  useEffect(() => {
    if (visible) {
      const today = new Date();
      setSelectedDay(today.getDate());
      setCurrentMonth(today.getMonth());
      setCurrentYear(today.getFullYear());
      setTempDay(today.getDate());
      setTempMonth(today.getMonth());
      setTempYear(today.getFullYear());
    }
  }, [visible]);

  // Dynamic days in temporary selected month
  const maxDaysInTempMonth = new Date(tempYear, tempMonth + 1, 0).getDate();

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Open Wheel Picker
  const handleOpenWheelPicker = () => {
    setTempDay(selectedDay);
    setTempMonth(currentMonth);
    setTempYear(currentYear);
    setShowWheelPicker(true);
  };

  // Confirm Wheel Picker Selection
  const handleConfirmWheelPicker = () => {
    setSelectedDay(tempDay);
    setCurrentMonth(tempMonth);
    setCurrentYear(tempYear);
    setShowWheelPicker(false);
  };

  // Calculate calendar grid metrics for current month & year
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  const realToday = new Date();
  const isCurrentToday = (d: number) =>
    d === realToday.getDate() &&
    currentMonth === realToday.getMonth() &&
    currentYear === realToday.getFullYear();

  // Generate day items with scores (strictly real-time)
  const daysList = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const isToday = isCurrentToday(dayNum);
    const hasRecord = isToday;
    const score = isToday ? currentStats.score : 100;
    const onTime = isToday ? currentStats.onTimeCount : 0;
    const late = isToday ? currentStats.lateCount : 0;
    const miss = isToday ? currentStats.missCount : 0;

    const dayStr = `${dayNum} ${MONTH_ABBR[currentMonth]}`;
    const fullDate = `${dayNum} ${MONTH_NAMES[currentMonth]} ${currentYear}`;

    return {
      dayNum,
      dayStr,
      fullDate,
      hasRecord,
      score,
      onTime,
      late,
      miss
    };
  });

  const selectedDayItem = daysList.find((d) => d.dayNum === selectedDay) || daysList[0];

  // Daily audit logs for selected day
  const dailyLogs: ScoreLogItem[] = scoreHistoryStore.getAuditLogs(
    "all",
    selectedDayItem.fullDate
  );

  const handleOpenDailyDetail = () => {
    setShowDailyPopup(true);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="calendar" size={20} color="#0C4A94" />
              <Text style={styles.headerTitle}>ปฏิทินคะแนนความประพฤติ</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Interactive Month & Year Selector Bar (Matching Image 2) */}
            <View style={styles.monthBar}>
              <Pressable style={styles.monthNavBtn} onPress={handlePrevMonth}>
                <Ionicons name="chevron-back" size={20} color="#0C4A94" />
              </Pressable>

              {/* Center Button: Opens 3-Column Date Wheel Picker Popup */}
              <Pressable
                style={({ pressed }) => [styles.monthTitleWrap, pressed && styles.btnPressed]}
                onPress={handleOpenWheelPicker}
              >
                <Text style={styles.monthTitle}>
                  {selectedDay} {MONTH_NAMES[currentMonth]} {currentYear}
                </Text>
                <Ionicons name="calendar-outline" size={16} color="#0C4A94" style={{ marginLeft: 4 }} />
              </Pressable>

              <Pressable style={styles.monthNavBtn} onPress={handleNextMonth}>
                <Ionicons name="chevron-forward" size={20} color="#0C4A94" />
              </Pressable>
            </View>

            {/* Weekdays Header */}
            <View style={styles.weekdaysRow}>
              {WEEKDAYS.map((wd, i) => (
                <Text
                  key={wd}
                  style={[styles.weekdayText, (i === 0 || i === 6) && styles.weekendText]}
                >
                  {wd}
                </Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {/* Empty padding days offset */}
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.emptyDayCell} />
              ))}

              {daysList.map((item) => {
                const isSelected = item.dayNum === selectedDay;
                const isHigh = item.score >= 90;
                const isMedium = item.score >= 80 && item.score < 90;

                return (
                  <Pressable
                    key={item.dayNum}
                    style={[styles.dayCell, isSelected && styles.dayCellActive]}
                    onPress={() => setSelectedDay(item.dayNum)}
                  >
                    <Text
                      style={[styles.dayNumText, isSelected && styles.dayNumTextActive]}
                    >
                      {item.dayNum}
                    </Text>

                    {/* Score Dot Indicator (only if recorded) */}
                    {item.hasRecord && (
                      <View
                        style={[
                          styles.scoreDot,
                          isHigh
                            ? styles.dotGreen
                            : isMedium
                            ? styles.dotYellow
                            : styles.dotRed,
                          isSelected && styles.scoreDotActive
                        ]}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Legend Row */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.dotGreen]} />
                <Text style={styles.legendText}>ดีมาก (90-100)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.dotYellow]} />
                <Text style={styles.legendText}>ปานกลาง (80-89)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.dotRed]} />
                <Text style={styles.legendText}>ต้องปรับปรุง (&lt;80)</Text>
              </View>
            </View>

            {/* Selected Date Summary Card */}
            <View style={styles.selectedSummaryCard}>
              <View style={styles.selectedTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.selectedDateLabel}>ข้อมูลวันที่เลือก</Text>
                  <Text style={styles.selectedDateTitle}>{selectedDayItem.fullDate}</Text>
                </View>
                <View style={styles.selectedScoreBadge}>
                  <Text style={styles.selectedScoreVal}>
                    {selectedDayItem.hasRecord ? selectedDayItem.score : "-"}
                  </Text>
                  <Text style={styles.selectedScoreSub}>/100</Text>
                </View>
              </View>

              {/* Metrics mini row */}
              <View style={styles.metricsMiniRow}>
                <View style={styles.metricMiniItem}>
                  <Text style={styles.metricMiniValGreen}>{selectedDayItem.onTime} จุด</Text>
                  <Text style={styles.metricMiniLabel}>ตรงเวลา</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricMiniItem}>
                  <Text style={styles.metricMiniValOrange}>{selectedDayItem.late} จุด</Text>
                  <Text style={styles.metricMiniLabel}>ล่าช้า</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricMiniItem}>
                  <Text style={styles.metricMiniValRed}>{selectedDayItem.miss} จุด</Text>
                  <Text style={styles.metricMiniLabel}>ขาดตรวจ</Text>
                </View>
              </View>

              {/* View Daily Details Popup Button */}
              <Pressable
                style={({ pressed }) => [styles.btnConfirm, pressed && styles.btnPressed]}
                onPress={handleOpenDailyDetail}
              >
                <Ionicons name="document-text-outline" size={18} color="white" />
                <Text style={styles.btnConfirmText}>ดูรายละเอียดคะแนนของวันนี้</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* 3-Column Wheel Date Picker Modal (วัน • เดือน • ปี - Matching Image 2) */}
      <Modal visible={showWheelPicker} transparent animationType="fade">
        <View style={styles.wheelModalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowWheelPicker(false)} />

          <View style={styles.wheelCard}>
            {/* Header */}
            <View style={styles.wheelHeader}>
              <View style={styles.headerTitleRow}>
                <Ionicons name="calendar" size={18} color="#0C4A94" />
                <Text style={styles.wheelTitle}>ปฏิทินคะแนนความประพฤติ</Text>
              </View>
              <Pressable onPress={() => setShowWheelPicker(false)} hitSlop={10} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </Pressable>
            </View>

            <Text style={styles.wheelSubTitle}>เลือกวันที่</Text>

            {/* Quick Preview Pill */}
            <View style={styles.wheelPreviewRow}>
              <Pressable
                style={styles.wheelNavArrow}
                onPress={() => setTempDay((d) => Math.max(1, d - 1))}
              >
                <Ionicons name="chevron-back" size={16} color="#0C4A94" />
              </Pressable>

              <View style={styles.wheelPreviewPill}>
                <Text style={styles.wheelPreviewText}>
                  {tempDay} {MONTH_NAMES[tempMonth]} {tempYear}
                </Text>
                <Ionicons name="calendar-outline" size={16} color="#0C4A94" />
              </View>

              <Pressable
                style={styles.wheelNavArrow}
                onPress={() => setTempDay((d) => Math.min(maxDaysInTempMonth, d + 1))}
              >
                <Ionicons name="chevron-forward" size={16} color="#0C4A94" />
              </Pressable>
            </View>

            {/* 3 Columns Picker (Day, Month, Year) */}
            <View style={styles.wheelColumnsWrap}>
              {/* Column 1: Day (1 to maxDaysInTempMonth) */}
              <View style={styles.wheelCol}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.wheelColScroll}
                >
                  {Array.from({ length: maxDaysInTempMonth }, (_, i) => i + 1).map((d) => {
                    const isSelected = d === tempDay;
                    return (
                      <Pressable
                        key={d}
                        style={[styles.wheelItem, isSelected && styles.wheelItemSelected]}
                        onPress={() => setTempDay(d)}
                      >
                        <Text
                          style={[
                            styles.wheelItemText,
                            isSelected && styles.wheelItemTextSelected
                          ]}
                        >
                          {d}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.wheelColDivider} />

              {/* Column 2: Month (0-11) */}
              <View style={[styles.wheelCol, { flex: 1.4 }]}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.wheelColScroll}
                >
                  {MONTH_NAMES.map((mName, mIdx) => {
                    const isSelected = mIdx === tempMonth;
                    return (
                      <Pressable
                        key={mName}
                        style={[styles.wheelItem, isSelected && styles.wheelItemSelected]}
                        onPress={() => {
                          setTempMonth(mIdx);
                          const daysInNewMonth = new Date(tempYear, mIdx + 1, 0).getDate();
                          if (tempDay > daysInNewMonth) {
                            setTempDay(daysInNewMonth);
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.wheelItemText,
                            isSelected && styles.wheelItemTextSelected
                          ]}
                          numberOfLines={1}
                        >
                          {mName}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.wheelColDivider} />

              {/* Column 3: Year (2000 - 2040) */}
              <View style={styles.wheelCol}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.wheelColScroll}
                >
                  {YEARS_LIST.map((yr) => {
                    const isSelected = yr === tempYear;
                    return (
                      <Pressable
                        key={yr}
                        style={[styles.wheelItem, isSelected && styles.wheelItemSelected]}
                        onPress={() => setTempYear(yr)}
                      >
                        <Text
                          style={[
                            styles.wheelItemText,
                            isSelected && styles.wheelItemTextSelected
                          ]}
                        >
                          {yr}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            {/* Bottom Action Buttons: ยกเลิก / ตกลง (Matching Image 2) */}
            <View style={styles.wheelButtonsRow}>
              <Pressable
                style={({ pressed }) => [styles.btnWheelCancel, pressed && styles.btnPressed]}
                onPress={() => setShowWheelPicker(false)}
              >
                <Text style={styles.btnWheelCancelText}>ยกเลิก</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.btnWheelConfirm, pressed && styles.btnPressed]}
                onPress={handleConfirmWheelPicker}
              >
                <Text style={styles.btnWheelConfirmText}>ตกลง</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Pop-up Modal: สรุปผลคะแนนประจำวัน พร้อมตารางคำนวณคะแนนอย่างละเอียด */}
      <Modal visible={showDailyPopup} transparent animationType="fade">
        <View style={styles.popupBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowDailyPopup(false)} />

          <View style={styles.popupCard}>
            {/* Popup Header */}
            <View style={styles.popupHeader}>
              <View style={styles.popupHeaderLeft}>
                <View style={styles.popupIconCircle}>
                  <Ionicons name="ribbon" size={22} color="#0C4A94" />
                </View>
                <View>
                  <Text style={styles.popupHeaderTitle}>สรุปคะแนนประจำวัน</Text>
                  <Text style={styles.popupHeaderSub}>{selectedDayItem.fullDate}</Text>
                </View>
              </View>
              <Pressable onPress={() => setShowDailyPopup(false)} hitSlop={10} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.popupScroll}>
              {/* Daily Score Hero */}
              <View style={styles.popupScoreBanner}>
                <View style={styles.popupScoreLeft}>
                  <Text style={styles.popupScoreLabel}>คะแนนที่ได้รับ</Text>
                  <Text style={styles.popupScoreStatus}>
                    {selectedDayItem.score >= 90 ? "ระดับดีเยี่ยม 🟢" : "ระดับปานกลาง 🟡"}
                  </Text>
                </View>
                <View style={styles.popupScoreValBox}>
                  <Text style={styles.popupScoreVal}>{selectedDayItem.score}</Text>
                  <Text style={styles.popupScoreMax}>/100</Text>
                </View>
              </View>

              {/* Inspection Counts Breakdown */}
              <View style={styles.popupMetricsGrid}>
                <View style={styles.popupMetricCard}>
                  <Ionicons name="time" size={18} color="#16A34A" />
                  <Text style={styles.popupMetricNumGreen}>{selectedDayItem.onTime}</Text>
                  <Text style={styles.popupMetricSub}>ตรวจตรงเวลา</Text>
                </View>
                <View style={styles.popupMetricCard}>
                  <Ionicons name="alarm" size={18} color="#D97706" />
                  <Text style={styles.popupMetricNumOrange}>{selectedDayItem.late}</Text>
                  <Text style={styles.popupMetricSub}>ตรวจล่าช้า</Text>
                </View>
                <View style={styles.popupMetricCard}>
                  <Ionicons name="close-circle" size={18} color="#DC2626" />
                  <Text style={styles.popupMetricNumRed}>{selectedDayItem.miss}</Text>
                  <Text style={styles.popupMetricSub}>ขาดตรวจ</Text>
                </View>
              </View>

              {/* 1. สรุปรายการคิดคำนวณคะแนนประจำวัน (Daily Score Calculation Table) */}
              <View style={styles.popupCalcCard}>
                <Text style={styles.popupCalcTitle}>สรุปรายการคำนวณคะแนนของวันนี้</Text>

                {/* ตรวจตรงเวลา */}
                <View style={styles.popupCalcRow}>
                  <View style={styles.popupCalcLeft}>
                    <View style={[styles.popupCalcDot, { backgroundColor: "#16A34A" }]} />
                    <View>
                      <Text style={styles.popupCalcLabel}>ตรวจตรงเวลา</Text>
                      <Text style={styles.popupCalcSubLabel}>{selectedDayItem.onTime} จุดตรวจ</Text>
                    </View>
                  </View>
                  <Text style={styles.popupCalcValGreen}>+{Math.min(90, selectedDayItem.onTime * 5)} คะแนน</Text>
                </View>

                {/* ตรวจล่าช้า */}
                {selectedDayItem.late > 0 && (
                  <View style={styles.popupCalcRow}>
                    <View style={styles.popupCalcLeft}>
                      <View style={[styles.popupCalcDot, { backgroundColor: "#DC2626" }]} />
                      <View>
                        <Text style={styles.popupCalcLabel}>ตรวจล่าช้า</Text>
                        <Text style={styles.popupCalcSubLabel}>{selectedDayItem.late} จุดตรวจ (หัก 2.5 คะแนน/จุด)</Text>
                      </View>
                    </View>
                    <Text style={styles.popupCalcValRed}>-{(selectedDayItem.late * 2.5).toFixed(1)} คะแนน</Text>
                  </View>
                )}

                {/* ขาดการตรวจจุด */}
                {selectedDayItem.miss > 0 && (
                  <View style={styles.popupCalcRow}>
                    <View style={styles.popupCalcLeft}>
                      <View style={[styles.popupCalcDot, { backgroundColor: "#64748B" }]} />
                      <View>
                        <Text style={styles.popupCalcLabel}>ขาดการตรวจจุด</Text>
                        <Text style={styles.popupCalcSubLabel}>{selectedDayItem.miss} จุดตรวจ (หัก 10 คะแนน/จุด)</Text>
                      </View>
                    </View>
                    <Text style={styles.popupCalcValRed}>-{selectedDayItem.miss * 10} คะแนน</Text>
                  </View>
                )}

                {/* คะแนนความประพฤติและการลงเวลา */}
                <View style={styles.popupCalcRow}>
                  <View style={styles.popupCalcLeft}>
                    <View style={[styles.popupCalcDot, { backgroundColor: "#0C4A94" }]} />
                    <View>
                      <Text style={styles.popupCalcLabel}>คะแนนความประพฤติ & ลงเวลา</Text>
                      <Text style={styles.popupCalcSubLabel}>เข้าปฏิบัติงานตรงเวลา</Text>
                    </View>
                  </View>
                  <Text style={styles.popupCalcValGreen}>+10 คะแนน</Text>
                </View>

                {/* รวมคะแนนสุทธิ */}
                <View style={styles.popupCalcTotalRow}>
                  <Text style={styles.popupCalcTotalLabel}>คะแนนรวมสุทธิ</Text>
                  <Text style={styles.popupCalcTotalVal}>{selectedDayItem.score} / 100 คะแนน</Text>
                </View>
              </View>

              {/* 2. Daily Reasons for Score Increase / Decrease (รายการเหตุผลที่คะแนนเพิ่มหรือลด) */}
              <View style={styles.popupReasonsSection}>
                <Text style={styles.popupReasonsTitle}>รายการปรับคะแนนในวันนี้:</Text>

                {dailyLogs.length > 0 ? (
                  dailyLogs.map((log) => {
                    const isReward = log.type === "reward";
                    return (
                      <View key={log.id} style={styles.popupReasonCard}>
                        <View style={[styles.popupPointPill, isReward ? styles.pillGreen : styles.pillRed]}>
                          <Text style={[styles.popupPointText, isReward ? styles.textGreen : styles.textRed]}>
                            {isReward ? `+${log.points}` : `${log.points}`}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.popupReasonHeading}>{log.title}</Text>
                          <Text style={styles.popupReasonSub}>{log.detail}</Text>
                          <Text style={styles.popupReasonTime}>{log.time} • {log.officer}</Text>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.popupDefaultLog}>
                    <View style={styles.popupPointPillDefault}>
                      <Text style={styles.popupPointTextGreen}>+{selectedDayItem.score}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.popupReasonHeading}>ปฏิบัติหน้าที่ตรวจจุดครบตามรอบเวลา</Text>
                      <Text style={styles.popupReasonSub}>
                        ตรวจตรงเวลา {selectedDayItem.onTime} จุด (ล่าช้า {selectedDayItem.late} จุด)
                      </Text>
                      <Text style={styles.popupReasonTime}>ระบบตรวจสอบความประพฤติอัตโนมัติ</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Bottom Close Button (Clean full width button) */}
              <View style={styles.popupActions}>
                <Pressable
                  style={({ pressed }) => [styles.btnCloseFull, pressed && styles.btnPressed]}
                  onPress={() => setShowDailyPopup(false)}
                >
                  <Ionicons name="close-circle-outline" size={20} color="white" />
                  <Text style={styles.btnCloseFullText}>ปิดหน้าต่างสรุปคะแนน</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 20, 35, 0.65)",
    justifyContent: "flex-end"
  },
  sheet: {
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "92%",
    paddingTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0"
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A"
  },
  closeBtn: {
    padding: 4
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12
  },

  // Month Bar
  monthBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  monthTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#F0F6FF",
    borderWidth: 1,
    borderColor: "#D0E2FF"
  },
  monthTitle: {
    fontSize: 14.5,
    fontWeight: "900",
    color: "#0C4A94"
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F6FF",
    alignItems: "center",
    justifyContent: "center"
  },

  // Weekdays Row
  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 4
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    width: 40,
    textAlign: "center"
  },
  weekendText: {
    color: "#DC2626"
  },

  // Days Grid
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "white",
    borderRadius: 18,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  emptyDayCell: {
    width: "14.28%",
    height: 44
  },
  dayCell: {
    width: "14.28%",
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginVertical: 1
  },
  dayCellActive: {
    backgroundColor: "#0C4A94",
    shadowColor: "#0C4A94",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  dayNumText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B"
  },
  dayNumTextActive: {
    color: "white",
    fontWeight: "900"
  },
  scoreDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2
  },
  scoreDotActive: {
    backgroundColor: "#34D399"
  },
  dotGreen: {
    backgroundColor: "#10B981"
  },
  dotYellow: {
    backgroundColor: "#F59E0B"
  },
  dotRed: {
    backgroundColor: "#EF4444"
  },

  // Legend
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 8
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  legendText: {
    fontSize: 10.5,
    color: "#64748B",
    fontWeight: "700"
  },

  // Selected Date Summary Card
  selectedSummaryCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#D0E2FF",
    gap: 12,
    shadowColor: "#0C4A94",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2
  },
  selectedTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  selectedDateLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "700"
  },
  selectedDateTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 2
  },
  selectedScoreBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0"
  },
  selectedScoreVal: {
    fontSize: 20,
    fontWeight: "900",
    color: "#16A34A"
  },
  selectedScoreSub: {
    fontSize: 11,
    fontWeight: "700",
    color: "#15803D",
    marginLeft: 2
  },

  // Metrics Mini Row
  metricsMiniRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#F8FAFC",
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  metricMiniItem: {
    alignItems: "center"
  },
  metricMiniValGreen: {
    fontSize: 13.5,
    fontWeight: "900",
    color: "#16A34A"
  },
  metricMiniValOrange: {
    fontSize: 13.5,
    fontWeight: "900",
    color: "#D97706"
  },
  metricMiniValRed: {
    fontSize: 13.5,
    fontWeight: "900",
    color: "#DC2626"
  },
  metricMiniLabel: {
    fontSize: 10.5,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 1
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#CBD5E1"
  },

  // Confirm Button
  btnConfirm: {
    backgroundColor: "#0C4A94",
    borderRadius: 14,
    height: 46,
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
  btnConfirmText: {
    color: "white",
    fontSize: 14,
    fontWeight: "900"
  },

  // 3-Column Wheel Date Picker Modal Styles (Matching Image 2)
  wheelModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 20, 35, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20
  },
  wheelCard: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 24,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10
  },
  wheelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  wheelTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A"
  },
  wheelSubTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#475569",
    marginTop: 10,
    marginBottom: 6
  },
  wheelPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12
  },
  wheelNavArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center"
  },
  wheelPreviewPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D0E2FF"
  },
  wheelPreviewText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0C4A94"
  },
  wheelColumnsWrap: {
    flexDirection: "row",
    height: 190,
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 6,
    paddingHorizontal: 4,
    position: "relative"
  },
  wheelCol: {
    flex: 1,
    height: "100%"
  },
  wheelColDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#F1F5F9"
  },
  wheelColScroll: {
    paddingVertical: 8,
    alignItems: "center"
  },
  wheelItem: {
    width: "90%",
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginVertical: 2
  },
  wheelItemSelected: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE"
  },
  wheelItemText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B"
  },
  wheelItemTextSelected: {
    fontSize: 14.5,
    fontWeight: "900",
    color: "#0C4A94"
  },
  wheelButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16
  },
  btnWheelCancel: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center"
  },
  btnWheelCancelText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#475569"
  },
  btnWheelConfirm: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#0C4A94",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0C4A94",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  btnWheelConfirmText: {
    fontSize: 14,
    fontWeight: "900",
    color: "white"
  },

  // Daily Detail Popup Styles
  popupBackdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 20, 35, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16
  },
  popupCard: {
    width: "100%",
    maxHeight: "88%",
    backgroundColor: "white",
    borderRadius: 24,
    paddingTop: 18,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10
  },
  popupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  popupHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  popupIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center"
  },
  popupHeaderTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A"
  },
  popupHeaderSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1
  },
  popupScroll: {
    paddingHorizontal: 16,
    paddingTop: 12
  },
  popupScoreBanner: {
    backgroundColor: "#0C4A94",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  popupScoreLeft: {
    gap: 2
  },
  popupScoreLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600"
  },
  popupScoreStatus: {
    fontSize: 14,
    fontWeight: "900",
    color: "#34D399"
  },
  popupScoreValBox: {
    flexDirection: "row",
    alignItems: "baseline"
  },
  popupScoreVal: {
    fontSize: 28,
    fontWeight: "900",
    color: "white"
  },
  popupScoreMax: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginLeft: 2
  },
  popupMetricsGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10
  },
  popupMetricCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 3
  },
  popupMetricNumGreen: {
    fontSize: 15,
    fontWeight: "900",
    color: "#16A34A"
  },
  popupMetricNumOrange: {
    fontSize: 15,
    fontWeight: "900",
    color: "#D97706"
  },
  popupMetricNumRed: {
    fontSize: 15,
    fontWeight: "900",
    color: "#DC2626"
  },
  popupMetricSub: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "700"
  },

  // Daily Score Calculation Table Styles
  popupCalcCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8
  },
  popupCalcTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 4
  },
  popupCalcRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4
  },
  popupCalcLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1
  },
  popupCalcDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5
  },
  popupCalcLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B"
  },
  popupCalcSubLabel: {
    fontSize: 10.5,
    color: "#64748B"
  },
  popupCalcValGreen: {
    fontSize: 12.5,
    fontWeight: "900",
    color: "#16A34A"
  },
  popupCalcValRed: {
    fontSize: 12.5,
    fontWeight: "900",
    color: "#DC2626"
  },
  popupCalcTotalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0"
  },
  popupCalcTotalLabel: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0F172A"
  },
  popupCalcTotalVal: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0C4A94"
  },

  // Daily Reasons Section
  popupReasonsSection: {
    marginTop: 14,
    gap: 8
  },
  popupReasonsTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0F172A"
  },
  popupReasonCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  popupDefaultLog: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  popupPointPill: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  popupPointPillDefault: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center"
  },
  pillGreen: {
    backgroundColor: "#DCFCE7"
  },
  pillRed: {
    backgroundColor: "#FEE2E2"
  },
  popupPointText: {
    fontSize: 13,
    fontWeight: "900"
  },
  popupPointTextGreen: {
    fontSize: 13,
    fontWeight: "900",
    color: "#16A34A"
  },
  textGreen: {
    color: "#16A34A"
  },
  textRed: {
    color: "#DC2626"
  },
  popupReasonHeading: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0F172A"
  },
  popupReasonSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1
  },
  popupReasonTime: {
    fontSize: 10,
    color: "#0C4A94",
    fontWeight: "700",
    marginTop: 2
  },

  // Popup Actions
  popupActions: {
    marginTop: 16,
    marginBottom: 8
  },
  btnCloseFull: {
    backgroundColor: "#0C4A94",
    borderRadius: 14,
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#0C4A94",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  btnCloseFullText: {
    color: "white",
    fontSize: 14,
    fontWeight: "900"
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }]
  }
});
